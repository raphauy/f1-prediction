import { PrismaClient, GPStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function updateGrandPrixStatus() {
  console.log('🏁 Actualizando estados de Grand Prix según fecha actual...')
  
  const now = new Date()
  console.log(`Fecha actual: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
  
  // Obtener todos los GPs
  const grandPrix = await prisma.grandPrix.findMany({
    orderBy: { round: 'asc' }
  })
  
  console.log(`Encontrados ${grandPrix.length} Grand Prix para actualizar`)
  
  let updatedCount = 0
  
  for (const gp of grandPrix) {
    let newStatus: GPStatus = gp.status
    
    if (gp.raceDate < now && gp.status !== 'FINISHED') {
      // Si la carrera ya pasó, marcar como FINISHED
      newStatus = 'FINISHED'
      
      await prisma.grandPrix.update({
        where: { id: gp.id },
        data: { status: newStatus }
      })
      
      console.log(`✅ ${gp.name} (Ronda ${gp.round}) - ${gp.raceDate.toLocaleDateString()} → FINISHED`)
      updatedCount++
    } else if (gp.round >= 11 && gp.round <= 13 && gp.status === 'CREATED') {
      // Austrian, British y Belgian GPs (julio) - marcar como ACTIVE si no lo están
      newStatus = 'ACTIVE'
      
      await prisma.grandPrix.update({
        where: { id: gp.id },
        data: { 
          status: newStatus,
          launchedAt: now,
          notificationsSent: true // Asumimos que ya se enviaron para no spamear
        }
      })
      
      console.log(`🚀 ${gp.name} (Ronda ${gp.round}) - ${gp.raceDate.toLocaleDateString()} → ACTIVE`)
      updatedCount++
    } else {
      console.log(`⏸️  ${gp.name} (Ronda ${gp.round}) - ${gp.raceDate.toLocaleDateString()} - Estado: ${gp.status}`)
    }
  }
  
  console.log(`\n✨ Actualizados ${updatedCount} Grand Prix`)
  
  // Mostrar resumen de estados
  const summary = await prisma.grandPrix.groupBy({
    by: ['status'],
    _count: true
  })
  
  console.log('\n📊 Resumen de estados:')
  summary.forEach(s => {
    console.log(`   ${s.status}: ${s._count} GPs`)
  })
}

updateGrandPrixStatus()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })