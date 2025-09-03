# Arquitectura en Capas - F1 Prediction

F1 Prediction utiliza una arquitectura en capas estricta para mantener la separación de responsabilidades, facilitar el mantenimiento y permitir la escalabilidad del producto.

## **Estructura de Capas**

### **Capa de Servicios (`src/services/`)**
- **Responsabilidad:** Única capa que puede usar Prisma directamente
- **Contenido:** Operaciones CRUD, queries agregadas, lógica de negocio cercana a datos y cálculos intensivos de dominio (p. ej., scoring)
- **Archivos:** `*-service.ts` (ej: `user-service.ts`, `workspace-service.ts`, `grand-prix-service.ts`, `prediction-service.ts`, `scoring-service.ts`)
- **Funciones:** Exportar funciones específicas y bien tipadas
- **Importaciones permitidas:** `@/lib/prisma` y dependencias utilitarias puras

```typescript
// ✅ CORRECTO: En src/services/grand-prix-service.ts
import { prisma } from "@/lib/prisma"

export async function getGrandPrixById(id: string) {
  return prisma.grandPrix.findUnique({ where: { id } })
}
```

### **Capa de Lógica de Aplicación (`src/lib/`, `src/app/`, server actions)**
- **Responsabilidad:** Lógica de aplicación, validaciones de entrada/salida, Auth.js (NextAuth), utilidades de dominio (p. ej., deadlines)
- **Importaciones:** Solo servicios; nunca Prisma directamente
- **Prohibido:** `import { prisma }` o cualquier uso directo de Prisma

```typescript
// ✅ CORRECTO: En src/lib/auth.ts
import { getUserByEmail } from "@/services/user-service"

// ❌ INCORRECTO: Usar Prisma directamente
// import { prisma } from "@/lib/prisma"
```

### **Capa de Presentación (Componentes React)**
- **Responsabilidad:** UI, interacciones y estado del cliente
- **Importaciones:** Hooks, utilidades, y llamadas a servicios vía server actions
- **Prohibido:** Prisma directo, queries de base de datos o lógica de datos compleja

## **Organización Modular por Features**

F1 Prediction sigue un patrón de **co-ubicación modular** donde todo lo relacionado con una feature específica se mantiene junto.

### **Estructura Modular de Admin**

```
src/app/admin/
├── layout.tsx
├── page.tsx                      # Dashboard de admin
├── grand-prix/                   # Gestión de GPs (calendario, resultados oficiales)
│   ├── actions.ts
│   ├── page.tsx
│   ├── [id]/
│   │   ├── page.tsx
│   │   ├── edit/page.tsx
│   │   └── official-results/     # Carga y gestión de resultados oficiales
│   │       ├── actions.ts
│   │       ├── page.tsx
│   │       ├── official-result-modal.tsx
│   │       └── official-results-table.tsx
│   ├── grand-prix-form.tsx
│   ├── grand-prix-list.tsx
│   ├── grand-prix-table-client.tsx
│   ├── send-launch-notifications-button.tsx
│   └── send-reminders-section.tsx
├── seasons/                      # Temporadas (calendarios, estado)
│   ├── actions.ts
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
├── question-templates/           # Plantillas de preguntas por GP
│   ├── actions.ts
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/edit/page.tsx
├── scoring/                      # Reglas y ejecución de scoring
│   ├── actions.ts
│   └── page.tsx
├── users/                        # Gestión de usuarios
│   ├── actions.ts
│   ├── page.tsx
│   └── new/page.tsx
└── workspaces/                   # Gestión de espacios de trabajo
    ├── actions.ts
    ├── page.tsx
    ├── new/page.tsx
    └── [id]/edit/page.tsx
```

### **Estructura Modular del Workspace (cliente)**

```
src/app/w/[slug]/
├── layout.tsx
├── page.tsx                      # Dashboard del workspace
├── predictions/                  # Predicciones por GP
│   ├── page.tsx
│   └── [gpId]/
│       ├── page.tsx
│       ├── actions.ts
│       ├── prediction-table.tsx (RSC)
│       └── prediction-table-client.tsx
├── standings/                    # Clasificaciones del workspace
│   ├── page.tsx
│   ├── actions.ts
│   └── standings-table.tsx (RSC)
├── members/                      # Miembros e invitaciones
│   ├── page.tsx
│   ├── actions.ts
│   └── invite-user-dialog.tsx
├── settings/                     # Configuración del workspace
│   ├── page.tsx
│   └── actions.ts
├── next-gp-card.tsx
└── user-menu.tsx
```

### **Otras rutas relevantes**

```
src/app/
├── api/auth/[...nextauth]/route.ts     # Auth.js (NextAuth)
├── api/cron/finish-gps/route.ts        # Cron para cierre de GPs
├── invite/[token]/                     # Aceptación de invitaciones
├── login/                              # Inicio de sesión
├── onboarding/                         # Onboarding inicial
└── standings/                          # Clasificación global
```

## **Patrones de Co-ubicación**

### **1. Server Actions Co-ubicadas**

```typescript
// src/app/w/[slug]/predictions/[gpId]/actions.ts
"use server"

import { upsertPrediction } from "@/services/prediction-service"
import { revalidatePath } from "next/cache"

export async function savePredictionAction(input: FormData) {
  // 1) Parseo/transformación específica de la UI
  // 2) Llamada al servicio
  // 3) Revalidación de rutas relacionadas
}
```

### **2. Componentes Específicos de Feature**

```typescript
// src/app/admin/grand-prix/grand-prix-form.tsx
import { useTransition } from "react"
import { createGrandPrixAction } from "./actions"

export function GrandPrixForm() {
  // Lógica específica para crear/editar GPs
  // Usa actions co-ubicadas
}
```

## **Servicios + Validaciones Co-ubicadas**

### **Patrón de Servicio con Validaciones (Zod)**

```typescript
// src/services/scoring-service.ts
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export const runScoringSchema = z.object({
  grandPrixId: z.string().uuid(),
  seasonId: z.string().uuid(),
})

export type RunScoringInput = z.infer<typeof runScoringSchema>

export async function runScoring(input: RunScoringInput) {
  const data = runScoringSchema.parse(input)
  // Cálculo de puntuaciones basado en resultados oficiales y predicciones
}
```

## **Dominios y Servicios Principales**

- **Usuarios y Auth**: `user-service.ts`, `auth-service.ts` (Auth.js), `middleware.ts`
- **Workspaces**: `workspace-service.ts`, `workspace-season-service.ts`, invitaciones (`invitation-service.ts`)
- **Temporadas y Grandes Premios**: `season-service.ts`, `grand-prix-service.ts`, utilidades de deadlines en `src/lib/deadline-utils.ts`
- **Preguntas y Plantillas**: `question-service.ts`, `question-template-service.ts`
- **Predicciones**: `prediction-service.ts`
- **Resultados Oficiales**: `official-result-service.ts`
- **Scoring**: `scoring-service.ts` (cálculo de puntos), `standings-service.ts` (clasificaciones), `global-standings-service.ts`
- **Estadísticas y Dashboard**: `statistics-service.ts`, `dashboard-service.ts`
- **Notificaciones y Emails**: `notification-service.ts`, `email-service.ts` + componentes en `src/components/emails/`
- **Actividad**: `activity-service.ts`
- **Uploads**: `upload-service.ts`

## **Datos Compartidos y Constantes**

- `src/lib/constants/`: `drivers.ts`, `teams.ts`, `question-badges.ts`, `category-colors.ts`
- Uso centralizado de listas de pilotos/equipos y badges de preguntas en UI y servicios

## **Autenticación y Autorización**

- **Auth.js (NextAuth):** `src/app/api/auth/[...nextauth]/route.ts` y `src/lib/auth.ts`
- **Middleware:** `src/middleware.ts` para proteger rutas del App Router
- **Estrategia:** Validación server-side y paso de identidad a server actions y RSC

## **Jobs Programados / Cron**

- **Cierre de GPs:** `src/app/api/cron/finish-gps/route.ts` (ideal para Vercel Cron) 
- Responsable de marcar GPs como finalizados y disparar cálculos posteriores

## **Scripts de Mantenimiento (`/scripts`)**

- `update-gp-dates.ts`: Sincroniza fechas de GPs
- `update-gp-status.ts`: Actualiza estados de GPs
- `upload-and-update-drivers.ts`: Carga/actualiza pilotos

## **Reglas Estrictas**

### **✅ HACER:**
- Crear servicios específicos por dominio: `grand-prix-service.ts`, `prediction-service.ts`, `scoring-service.ts`, etc.
- Co-ubicar validaciones Zod al inicio de cada servicio
- Usar tipos explícitos en servicios (p. ej., `RunScoringInput`)
- Usar Server Actions co-ubicadas en features en lugar de API routes genéricas
- Mantener servicios enfocados en un solo dominio
- Organizar features en módulos auto-contenidos (Admin y Workspace)
- Centralizar constantes de dominio (pilotos, equipos, badges)

### **❌ NO HACER:**
- Importar `prisma` fuera de `src/services/`
- Crear queries de Prisma en componentes, `lib`, o `auth`
- Poner lógica de negocio compleja en componentes de UI
- Mezclar responsabilidades de múltiples dominios en un solo servicio
- Crear "reutilización" prematura de componentes

### **Estado actual y alineación**
- Existen algunas server actions que importan `prisma` directamente. Deben migrarse a usar funciones de `src/services/` para cumplir el patrón.

## **Beneficios de esta Arquitectura**

- **Mantenibilidad:** Cambios en BD solo afectan servicios
- **Modularidad:** Features auto-contenidas (Admin/Workspace) fáciles de mantener
- **Testabilidad:** Servicios se pueden mockear fácilmente
- **Tipado:** TypeScript fuerte y validaciones Zod en puntos críticos
- **Developer Experience:** Co-ubicación de acciones, vistas y servicios por feature
- **Consistencia:** Patrón repetible para nuevas features (p. ej., nueva métrica de estadísticas)
- **Escalabilidad:** Preparada para ampliar dominios y soportar múltiples workspaces