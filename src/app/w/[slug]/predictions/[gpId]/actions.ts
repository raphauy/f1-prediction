"use server"

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { 
  upsertUserPrediction, 
  getUserActiveWorkspaceSeasons,
  getGPQuestionsWithUserPredictions 
} from '@/services/prediction-service'
import { getGPQuestionById } from '@/services/question-service'
import { isGrandPrixLocked } from '@/services/grand-prix-service'

export async function savePredictionAction(gpQuestionId: string, answer: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  // Obtener la pregunta para verificar el GP
  const gpQuestion = await getGPQuestionById(gpQuestionId)
  if (!gpQuestion) {
    throw new Error('Pregunta no encontrada')
  }

  // Verificar que el deadline no haya pasado
  const isLocked = await isGrandPrixLocked(gpQuestion.grandPrixId)
  if (isLocked) {
    throw new Error('El deadline para predicciones ha pasado')
  }

  // Validar la respuesta según el tipo de pregunta
  if (!answer.trim()) {
    throw new Error('La respuesta no puede estar vacía')
  }

  try {
    // Guardar la predicción global del usuario
    await upsertUserPrediction({
      userId: session.user.id,
      grandPrixId: gpQuestion.grandPrixId,
      gpQuestionId,
      answer
    })

    // Revalidar todas las rutas de predicciones de los workspaces del usuario
    const userWorkspaceSeasons = await getUserActiveWorkspaceSeasons(session.user.id)
    
    for (const ws of userWorkspaceSeasons) {
      revalidatePath(`/w/${ws.workspace.slug}/predictions`)
      revalidatePath(`/w/${ws.workspace.slug}/predictions/${gpQuestion.grandPrixId}`)
      revalidatePath(`/w/${ws.workspace.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving prediction:', error)
    throw new Error('Error al guardar la predicción')
  }
}

export async function getPredictionTableData(gpId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  try {
    const questionsWithPredictions = await getGPQuestionsWithUserPredictions(
      gpId,
      session.user.id
    )
    
    const userWorkspaceSeasons = await getUserActiveWorkspaceSeasons(session.user.id)

    return {
      questions: questionsWithPredictions,
      userWorkspaceCount: userWorkspaceSeasons.length,
      workspaces: userWorkspaceSeasons.map(ws => ({
        id: ws.workspace.id,
        name: ws.workspace.name,
        slug: ws.workspace.slug
      }))
    }
  } catch (error) {
    console.error('Error fetching prediction data:', error)
    throw new Error('Error al cargar los datos de predicciones')
  }
}