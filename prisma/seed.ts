import { PrismaClient, Role, WorkspaceRole } from '@prisma/client'

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