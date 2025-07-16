"use server"

import { auth } from "@/lib/auth"
import { 
  upsertOfficialResult,
  getQuestionsWithOfficialResults,
  hasCompleteOfficialResults
} from "@/services/official-result-service"
import { revalidatePath } from "next/cache"

export async function saveOfficialResultAction(
  grandPrixId: string,
  gpQuestionId: string,
  answer: string
) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    await upsertOfficialResult(
      { grandPrixId, gpQuestionId, answer },
      session.user.id
    )
    
    revalidatePath(`/admin/grand-prix/${grandPrixId}/official-results`)
    return { success: true }
  } catch (error) {
    console.error("Error al guardar resultado oficial:", error)
    throw new Error("Error al guardar el resultado")
  }
}

export async function getQuestionsWithResultsAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  return await getQuestionsWithOfficialResults(grandPrixId)
}

export async function checkResultsStatusAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  return await hasCompleteOfficialResults(grandPrixId)
}