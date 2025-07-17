import { NextResponse } from 'next/server'
import { updateFinishedGrandPrix } from '@/services/grand-prix-service'

// Este endpoint puede ser llamado por un cron job para actualizar automáticamente
// los GPs que deberían estar finalizados
export async function GET(request: Request) {
  try {
    // Verificar un token secreto para seguridad (opcional)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.log("Updating finished GPs")
    
    // Actualizar GPs finalizados
    const result = await updateFinishedGrandPrix()
    
    const response = {
      success: true,
      message: `${result.count} Grand Prix actualizados a estado FINISHED`,
      updated: result.updated.map(gp => ({
        id: gp.id,
        name: gp.name,
        raceDate: gp.raceDate
      }))
    }
    console.log("Response", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error actualizando GPs finalizados:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar Grand Prix finalizados' },
      { status: 500 }
    )
  }
}

// También permitir llamadas POST para compatibilidad con algunos servicios de cron
export async function POST(request: Request) {
  return GET(request)
}