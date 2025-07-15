import { PrismaClient, Role, WorkspaceRole, QuestionType, QuestionCategory } from '@prisma/client'
import { DRIVER_NAMES } from '../src/lib/constants/drivers'
import { TEAM_NAMES } from '../src/lib/constants/teams'

const prisma = new PrismaClient()

async function main() {
  // Crear superadmin
  const superadmin = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {
      role: Role.superadmin,
    },
    create: {
      email: 'rapha.uy@rapha.uy',
      name: 'Super Admin',
      role: Role.superadmin,
    },
  })

  console.log('Superadmin created:', superadmin)

  // Crear workspace de ejemplo
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default',
      description: 'Workspace por defecto del sistema',
    },
  })

  console.log('Default workspace created:', workspace)

  // Agregar superadmin al workspace como admin
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: superadmin.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: superadmin.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.admin,
    },
  })

  console.log('Superadmin added to default workspace')

  // Crear usuario normal de ejemplo
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuario Normal',
      // Sin rol de sistema - es un usuario normal
    },
  })

  // Agregar usuario normal al workspace
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: normalUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: normalUser.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.member,
    },
  })

  console.log('Normal user created and added to workspace:', normalUser)

  // ========================================
  // SEED DATA F1 2025
  // ========================================

  // Crear temporada 2025
  const season2025 = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      name: 'F1 2025 Season',
      isActive: true,
      startDate: new Date('2025-03-14'),
      endDate: new Date('2025-12-07'),
    },
  })

  console.log('F1 2025 Season created:', season2025)

  // Crear WorkspaceSeason para el workspace default
  const workspaceSeason = await prisma.workspaceSeason.create({
    data: {
      workspaceId: workspace.id,
      seasonId: season2025.id,
      isActive: true,
    },
  })

  console.log('WorkspaceSeason created for default workspace')

  // Datos de los Grand Prix 2025
  const grandPrixData = [
    { round: 1, name: 'Australian Grand Prix', location: 'Melbourne', country: 'Australia', circuit: 'Albert Park', raceDate: '2025-03-16', qualifyingDate: '2025-03-15', isSprint: false, timezone: 'Australia/Melbourne' },
    { round: 2, name: 'Chinese Grand Prix', location: 'Shanghai', country: 'China', circuit: 'Shanghai International Circuit', raceDate: '2025-03-23', qualifyingDate: '2025-03-22', isSprint: true, timezone: 'Asia/Shanghai' },
    { round: 3, name: 'Japanese Grand Prix', location: 'Suzuka', country: 'Japan', circuit: 'Suzuka Circuit', raceDate: '2025-04-06', qualifyingDate: '2025-04-05', isSprint: false, timezone: 'Asia/Tokyo' },
    { round: 4, name: 'Bahrain Grand Prix', location: 'Sakhir', country: 'Bahrain', circuit: 'Bahrain International Circuit', raceDate: '2025-04-13', qualifyingDate: '2025-04-12', isSprint: false, timezone: 'Asia/Bahrain' },
    { round: 5, name: 'Saudi Arabian Grand Prix', location: 'Jeddah', country: 'Saudi Arabia', circuit: 'Jeddah Corniche Circuit', raceDate: '2025-04-20', qualifyingDate: '2025-04-19', isSprint: false, timezone: 'Asia/Riyadh' },
    { round: 6, name: 'Miami Grand Prix', location: 'Miami', country: 'United States', circuit: 'Miami International Autodrome', raceDate: '2025-05-04', qualifyingDate: '2025-05-03', isSprint: true, timezone: 'America/New_York' },
    { round: 7, name: 'Emilia-Romagna Grand Prix', location: 'Imola', country: 'Italy', circuit: 'Autodromo Enzo e Dino Ferrari', raceDate: '2025-05-18', qualifyingDate: '2025-05-17', isSprint: false, timezone: 'Europe/Rome' },
    { round: 8, name: 'Monaco Grand Prix', location: 'Monaco', country: 'Monaco', circuit: 'Circuit de Monaco', raceDate: '2025-05-25', qualifyingDate: '2025-05-24', isSprint: false, timezone: 'Europe/Monaco' },
    { round: 9, name: 'Spanish Grand Prix', location: 'Barcelona', country: 'Spain', circuit: 'Circuit de Barcelona-Catalunya', raceDate: '2025-06-01', qualifyingDate: '2025-05-31', isSprint: false, timezone: 'Europe/Madrid' },
    { round: 10, name: 'Canadian Grand Prix', location: 'Montreal', country: 'Canada', circuit: 'Circuit Gilles Villeneuve', raceDate: '2025-06-15', qualifyingDate: '2025-06-14', isSprint: false, timezone: 'America/Toronto' },
    { round: 11, name: 'Austrian Grand Prix', location: 'Spielberg', country: 'Austria', circuit: 'Red Bull Ring', raceDate: '2025-06-29', qualifyingDate: '2025-06-28', isSprint: false, timezone: 'Europe/Vienna' },
    { round: 12, name: 'British Grand Prix', location: 'Silverstone', country: 'Great Britain', circuit: 'Silverstone Circuit', raceDate: '2025-07-06', qualifyingDate: '2025-07-05', isSprint: false, timezone: 'Europe/London' },
    { round: 13, name: 'Belgian Grand Prix', location: 'Spa-Francorchamps', country: 'Belgium', circuit: 'Circuit de Spa-Francorchamps', raceDate: '2025-07-27', qualifyingDate: '2025-07-26', isSprint: true, timezone: 'Europe/Brussels' },
    { round: 14, name: 'Hungarian Grand Prix', location: 'Budapest', country: 'Hungary', circuit: 'Hungaroring', raceDate: '2025-08-03', qualifyingDate: '2025-08-02', isSprint: false, timezone: 'Europe/Budapest' },
    { round: 15, name: 'Dutch Grand Prix', location: 'Zandvoort', country: 'Netherlands', circuit: 'Circuit Zandvoort', raceDate: '2025-08-31', qualifyingDate: '2025-08-30', isSprint: false, timezone: 'Europe/Amsterdam' },
    { round: 16, name: 'Italian Grand Prix', location: 'Monza', country: 'Italy', circuit: 'Autodromo Nazionale Monza', raceDate: '2025-09-07', qualifyingDate: '2025-09-06', isSprint: false, timezone: 'Europe/Rome' },
    { round: 17, name: 'Azerbaijan Grand Prix', location: 'Baku', country: 'Azerbaijan', circuit: 'Baku City Circuit', raceDate: '2025-09-21', qualifyingDate: '2025-09-20', isSprint: false, timezone: 'Asia/Baku' },
    { round: 18, name: 'Singapore Grand Prix', location: 'Singapore', country: 'Singapore', circuit: 'Marina Bay Street Circuit', raceDate: '2025-10-05', qualifyingDate: '2025-10-04', isSprint: false, timezone: 'Asia/Singapore' },
    { round: 19, name: 'United States Grand Prix', location: 'Austin', country: 'United States', circuit: 'Circuit of the Americas', raceDate: '2025-10-19', qualifyingDate: '2025-10-18', isSprint: true, timezone: 'America/Chicago' },
    { round: 20, name: 'Mexican Grand Prix', location: 'Mexico City', country: 'Mexico', circuit: 'Autódromo Hermanos Rodríguez', raceDate: '2025-10-26', qualifyingDate: '2025-10-25', isSprint: false, timezone: 'America/Mexico_City' },
    { round: 21, name: 'Brazilian Grand Prix', location: 'São Paulo', country: 'Brazil', circuit: 'Autódromo José Carlos Pace', raceDate: '2025-11-09', qualifyingDate: '2025-11-08', isSprint: true, timezone: 'America/Sao_Paulo' },
    { round: 22, name: 'Las Vegas Grand Prix', location: 'Las Vegas', country: 'United States', circuit: 'Las Vegas Street Circuit', raceDate: '2025-11-22', qualifyingDate: '2025-11-21', isSprint: false, timezone: 'America/Los_Angeles' },
    { round: 23, name: 'Qatar Grand Prix', location: 'Lusail', country: 'Qatar', circuit: 'Lusail International Circuit', raceDate: '2025-11-30', qualifyingDate: '2025-11-29', isSprint: true, timezone: 'Asia/Qatar' },
    { round: 24, name: 'Abu Dhabi Grand Prix', location: 'Abu Dhabi', country: 'United Arab Emirates', circuit: 'Yas Marina Circuit', raceDate: '2025-12-07', qualifyingDate: '2025-12-06', isSprint: false, timezone: 'Asia/Dubai' },
  ]

  // Crear todos los Grand Prix
  const grandPrixList = []
  for (const gp of grandPrixData) {
    const grandPrix = await prisma.grandPrix.create({
      data: {
        seasonId: season2025.id,
        round: gp.round,
        name: gp.name,
        location: gp.location,
        country: gp.country,
        circuit: gp.circuit,
        raceDate: new Date(gp.raceDate),
        qualifyingDate: new Date(gp.qualifyingDate),
        isSprint: gp.isSprint,
        timezone: gp.timezone,
      },
    })
    grandPrixList.push(grandPrix)
  }

  console.log(`Created ${grandPrixList.length} Grand Prix for 2025 season`)

  // Crear preguntas clásicas
  const classicQuestions = [
    { 
      text: '¿Quién ganará la carrera?', 
      type: QuestionType.WINNER, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 25,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Quién conseguirá el segundo puesto?', 
      type: QuestionType.PODIUM, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 18,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Quién conseguirá el tercer puesto?', 
      type: QuestionType.PODIUM, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 15,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Quién terminará último en los puntos (P10)?', 
      type: QuestionType.POINTS_FINISH, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 10,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Cuántos abandonos habrá en la carrera?', 
      type: QuestionType.NUMERIC, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 8,
      options: { type: 'custom', values: ['0', '1', '2', '3', '4', '5', '6+'] }
    },
    { 
      text: '¿Quién hará la vuelta rápida?', 
      type: QuestionType.FASTEST_LAP, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Habrá Safety Car o Virtual Safety Car?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    { 
      text: '¿Quién ganará más posiciones respecto a la clasificación?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 10,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Quién perderá más posiciones respecto a la clasificación?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 10,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Qué equipo hará el pit stop más rápido?', 
      type: QuestionType.TEAM_WINNER, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'teams' }
    },
    { 
      text: '¿Algún piloto recibirá penalización durante la carrera?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    { 
      text: '¿Alguien hará un pit stop de más de 3 segundos?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 3,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    { 
      text: '¿Quién será el Driver of the Day?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 8,
      options: { type: 'drivers' }
    },
    { 
      text: '¿Algún equipo cometerá un error estratégico grave?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 8,
      options: { type: 'teams_with_none', values: [...TEAM_NAMES, 'Ninguno'] }
    },
    { 
      text: '¿Qué equipo logrará un undercut exitoso?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'teams_with_none', values: [...TEAM_NAMES, 'Ninguno'] }
    },
    { 
      text: '¿Cuántos pilotos terminarán la carrera?', 
      type: QuestionType.NUMERIC, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 5,
      options: { type: 'custom', values: ['<16', '16', '17', '18', '19', '20'] }
    },
    { 
      text: '¿Algún equipo tendrá un problema ridículo en boxes?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 8,
      options: { type: 'teams_with_none', values: [...TEAM_NAMES, 'Ninguno'] }
    },
    { 
      text: '¿Quién terminará la carrera por delante? (Head to Head)', 
      type: QuestionType.HEAD_TO_HEAD, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 6,
      options: { type: 'custom', values: ['Variable según GP'] }
    },
    { 
      text: '¿Qué equipo sumará más puntos en la carrera?', 
      type: QuestionType.TEAM_WINNER, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 8,
      options: { type: 'teams' }
    },
    { 
      text: '¿Quién conseguirá la pole position?', 
      type: QuestionType.POLE_POSITION, 
      category: QuestionCategory.CLASSIC,
      defaultPoints: 10,
      options: { type: 'drivers' }
    }
  ]

  // Crear preguntas del Strollómetro
  const strollometerQuestions = [
    { 
      text: '¿Hasta qué ronda llegará Stroll en la clasificación?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.STROLLOMETER,
      defaultPoints: 8,
      options: { type: 'custom', values: ['Q1 (16-20)', 'Q2 (11-15)', 'Q3 (1-10)'] }
    },
    { 
      text: '¿En qué posición terminará Stroll la carrera?', 
      type: QuestionType.MULTIPLE_CHOICE, 
      category: QuestionCategory.STROLLOMETER,
      defaultPoints: 10,
      options: { type: 'custom', values: ['P1-P5', 'P6-P10', 'P11-P15', 'P16-P20', 'DNF'] }
    },
    { 
      text: '¿Stroll se verá involucrado en algún incidente/accidente?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.STROLLOMETER,
      defaultPoints: 6,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    { 
      text: '¿Stroll terminará por delante de Alonso?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.STROLLOMETER,
      defaultPoints: 12,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    { 
      text: '¿Stroll sumará puntos en la carrera?', 
      type: QuestionType.BOOLEAN, 
      category: QuestionCategory.STROLLOMETER,
      defaultPoints: 8,
      options: { type: 'custom', values: ['Sí', 'No'] }
    }
  ]

  const allQuestions = [...classicQuestions, ...strollometerQuestions]

  const questionList = []
  for (const q of allQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        category: q.category,
        defaultPoints: q.defaultPoints,
        options: q.options,
      },
    })
    questionList.push(question)
  }

  console.log(`Created ${questionList.length} standard questions`)

  // Asignar preguntas a cada Grand Prix
  let gpQuestionCount = 0
  for (const gp of grandPrixList) {
    for (let i = 0; i < questionList.length; i++) {
      await prisma.gPQuestion.create({
        data: {
          grandPrixId: gp.id,
          questionId: questionList[i].id,
          points: questionList[i].defaultPoints,
          order: i + 1,
        },
      })
      gpQuestionCount++
    }
  }

  console.log(`Created ${gpQuestionCount} GP questions (${questionList.length} questions x ${grandPrixList.length} GPs)`)

  // Crear SeasonStanding inicial para los usuarios existentes
  await prisma.seasonStanding.create({
    data: {
      workspaceSeasonId: workspaceSeason.id,
      userId: superadmin.id,
      totalPoints: 0,
      predictionsCount: 0,
    },
  })

  await prisma.seasonStanding.create({
    data: {
      workspaceSeasonId: workspaceSeason.id,
      userId: normalUser.id,
      totalPoints: 0,
      predictionsCount: 0,
    },
  })

  console.log('Created initial season standings for existing users')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })