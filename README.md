# RC Starter Kit

Un starter kit completo para aplicaciones NextJS con autenticación OTP, gestión de workspaces y panel de administración.

## 🚀 Características

### Autenticación
- **Sistema OTP por email** - Sin contraseñas, solo códigos de 6 dígitos
- **NextAuth.js v5** - Autenticación moderna y segura
- **Onboarding** - Proceso de configuración inicial para nuevos usuarios
- **Perfil de usuario** - Gestión de perfil con subida de imágenes

### Gestión de Workspaces
- **Workspaces colaborativos** - Espacios de trabajo para equipos
- **Roles granulares** - Admin y Miembro por workspace
- **Sistema de invitaciones** - Invita usuarios existentes o nuevos por email
- **Gestión de miembros** - CRUD completo con cambio de roles

### Panel de Administración
- **Dashboard con métricas** - Usuarios, workspaces, invitaciones pendientes
- **Gestión de usuarios** - CRUD completo con roles del sistema
- **Gestión de workspaces** - Administración centralizada
- **Superadmin** - Acceso total al sistema

### UI/UX
- **Dark mode completo** - Soporte para temas claro, oscuro y sistema
- **shadcn/ui** - Componentes modernos y accesibles
- **Tailwind CSS v4** - Estilos utilitarios de última generación
- **Responsive design** - Funciona en desktop, tablet y móvil

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Base de datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS v4
- **Email**: React Email + Resend
- **Storage**: Vercel Blob (imágenes)
- **Validaciones**: Zod
- **Tipado**: TypeScript

## 🏗️ Arquitectura

### Patrones implementados
- **React Server Components (RSC)** - Renderizado del servidor optimizado
- **Server Actions** - Mutaciones sin API routes
- **Co-location** - Componentes junto a las páginas que los usan
- **Arquitectura en capas** - Servicios, lógica de negocio, presentación

### Estructura del proyecto
```
src/
├── app/                     # App Router (páginas y layouts)
│   ├── admin/              # Panel de administración
│   ├── w/                  # Workspaces
│   ├── login/              # Autenticación
│   └── onboarding/         # Proceso inicial
├── components/             # Componentes globales reutilizables
│   ├── ui/                 # shadcn/ui components
│   └── emails/             # Templates de email
├── services/               # Capa de servicios (acceso a datos)
├── lib/                    # Utilidades y configuración
└── types/                  # Tipos TypeScript
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado)
- Base de datos PostgreSQL

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/raphauy/rc-starter-v2.git
cd rc-starter-v2
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Configurar las siguientes variables:
```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-super-secreto"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="notifications@tudominio.com"

# App
APP_NAME="RC Starter Kit"
```

4. **Configurar la base de datos**
```bash
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📧 Configuración de Email

El proyecto usa **Resend** para el envío de emails:

1. Crear cuenta en [Resend](https://resend.com)
2. Verificar tu dominio
3. Obtener API key y configurar `RESEND_API_KEY`
4. Configurar `RESEND_FROM_EMAIL` con tu email verificado

## 🗄️ Base de Datos

### Modelos principales
- **User** - Usuarios del sistema
- **Workspace** - Espacios de trabajo
- **WorkspaceUser** - Relación usuario-workspace con rol
- **WorkspaceInvitation** - Invitaciones pendientes

### Comandos útiles
```bash
# Generar cliente Prisma
pnpm prisma generate

# Aplicar cambios al schema
pnpm prisma db push

# Ejecutar seed
pnpm prisma db seed

# Ver datos en Prisma Studio
pnpm prisma studio
```

## 🎨 Personalización

### Temas
El proyecto incluye soporte completo para dark mode:
- **Light mode** - Tema claro
- **Dark mode** - Tema oscuro  
- **System** - Sigue la preferencia del sistema

### Colores
Los colores se pueden personalizar en `src/app/globals.css` usando las variables CSS de shadcn/ui.

## 🧪 Testing

```bash
# Linting
pnpm run lint

# Type checking
pnpm run typecheck

# Build
pnpm run build
```

## 📱 Funcionalidades Principales

### Para Usuarios
1. **Login con OTP** - Recibir código por email
2. **Onboarding** - Configurar perfil inicial
3. **Workspaces** - Acceder a espacios de trabajo
4. **Perfil** - Actualizar información personal

### Para Admins de Workspace
1. **Gestión de miembros** - Invitar, cambiar roles, remover
2. **Configuración** - Personalizar workspace
3. **Dashboard** - Ver métricas del workspace

### Para Superadmins
1. **Panel de administración** - Acceso total
2. **Gestión de usuarios** - CRUD completo
3. **Gestión de workspaces** - Crear, editar, eliminar
4. **Métricas globales** - Dashboard del sistema

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de entorno para producción
- Configurar `NEXTAUTH_URL` con tu dominio
- Usar base de datos PostgreSQL de producción
- Configurar Resend para tu dominio

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

