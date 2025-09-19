# PRP: Historial de Predicciones y Resultados

## Goal
Implementar una vista completa donde los usuarios puedan revisar sus predicciones pasadas con sus resultados, viendo qué preguntas acertaron y cuáles fallaron, incluyendo los puntos obtenidos. La funcionalidad debe estar integrada en la página de predicciones existente, mostrando por defecto el GP activo pero permitiendo navegar a GPs anteriores completados.

## Why
- **Transparencia y confianza**: Los usuarios actualmente no pueden verificar sus aciertos y errores después de cada carrera
- **Aprendizaje y mejora**: Ver el historial permite a los jugadores analizar sus patrones de predicción
- **Engagement continuo**: Mantiene a los usuarios involucrados revisando resultados pasados entre carreras
- **Cierre del ciclo**: Completa el flujo de juego (predecir → carrera → ver resultados → standings)

## What
Los usuarios podrán:
- Ver una lista de todos los GPs pasados donde hicieron predicciones
- Acceder a cada GP pasado para revisar sus predicciones vs resultados oficiales
- Visualizar claramente qué preguntas acertaron (verde) y cuáles fallaron (rojo/gris)
- Ver los puntos obtenidos por cada pregunta correcta
- Navegar fácilmente entre GP activo (para predicciones nuevas) y GPs pasados (solo lectura)

### Success Criteria
- [ ] La página de predicciones muestra selector/tabs para elegir entre GP activo y GPs pasados
- [ ] Los GPs pasados muestran predicciones en modo solo lectura con indicadores visuales de acierto/error
- [ ] Se muestran los puntos obtenidos por cada predicción correcta
- [ ] La navegación es intuitiva y mobile-first
- [ ] Los GPs sin predicciones del usuario no aparecen en el historial
- [ ] El GP activo sigue siendo el default al entrar a /predictions
- [ ] Tests unitarios para nuevas funciones de servicio
- [ ] La UI es consistente con el diseño existente

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/f1-prediction/CLAUDE.md
  why: CRÍTICO - Reglas arquitectónicas estrictas del proyecto, patrones RSC

- file: /home/raphael/desarrollo/f1-prediction/docs/features.md
  why: Contexto del proyecto y features existentes
  sections: "Features del Workspace", "Predicciones por GP"

- file: /home/raphael/desarrollo/f1-prediction/prisma/schema.prisma
  why: Modelos de datos actuales
  focus: Prediction, GrandPrix, OfficialResult, PredictionPoints, GPQuestion

# Archivos del sistema de predicciones actual
- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/page.tsx
  why: Página principal de predicciones - punto de entrada actual

- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/predictions-redirect.tsx
  why: Lógica actual de redirección al GP activo

- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/[gpId]/page.tsx
  why: Página de predicciones por GP - estructura RSC

- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/[gpId]/prediction-table.tsx
  why: RSC que fetchea datos de predicciones

- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/[gpId]/prediction-table-client.tsx
  why: Componente cliente para interacciones - donde agregar modo "historial"

- file: /home/raphael/desarrollo/f1-prediction/src/app/w/[slug]/predictions/[gpId]/prediction-row.tsx
  why: Componente de fila individual - modificar para mostrar resultados

# Servicios relevantes
- file: /home/raphael/desarrollo/f1-prediction/src/services/prediction-service.ts
  why: Servicio de predicciones - agregar métodos para historial

- file: /home/raphael/desarrollo/f1-prediction/src/services/grand-prix-service.ts
  why: Servicio de GPs - ya tiene getPastGrandPrix()
  focus: getPastGrandPrix, isGrandPrixLocked

- file: /home/raphael/desarrollo/f1-prediction/src/services/official-result-service.ts
  why: Servicio de resultados oficiales - para comparar con predicciones
```

### Current Codebase Tree
```bash
src/app/w/[slug]/predictions/
├── page.tsx                           # RSC con Suspense - redirección
├── predictions-redirect.tsx           # Lógica de redirección al GP activo
└── [gpId]/
    ├── page.tsx                       # RSC principal del GP
    ├── prediction-table.tsx           # RSC fetch datos
    ├── prediction-table-client.tsx    # Cliente principal
    ├── prediction-table-skeleton.tsx  # Loading state
    ├── prediction-row.tsx             # Fila individual
    ├── question-input.tsx             # Input de respuesta
    ├── driver-selector.tsx            # Selector pilotos
    ├── team-selector.tsx              # Selector equipos
    ├── prediction-modal.tsx           # Modal predicción
    └── actions.ts                     # Server actions

src/services/
├── prediction-service.ts              # CRUD predicciones
├── grand-prix-service.ts              # CRUD GPs + getPastGrandPrix
├── official-result-service.ts         # Resultados oficiales
└── workspace-season-service.ts        # Temporadas workspace
```

### Desired Codebase Tree
```bash
src/app/w/[slug]/predictions/
├── page.tsx                           # MODIFICAR: No redirigir, mostrar selector
├── predictions-list.tsx               # NUEVO: RSC lista de GPs (activo + pasados)
├── predictions-list-client.tsx        # NUEVO: Cliente con tabs/selector
├── predictions-list-skeleton.tsx      # NUEVO: Skeleton para lista
└── [gpId]/
    ├── page.tsx                       # Sin cambios
    ├── prediction-table.tsx           # MODIFICAR: Incluir resultados oficiales
    ├── prediction-table-client.tsx    # MODIFICAR: Modo view-only con resultados
    ├── prediction-row.tsx             # MODIFICAR: Mostrar acierto/error y puntos
    └── [sin cambios en resto]

src/services/
├── prediction-service.ts              # MODIFICAR: Agregar métodos historial
└── [sin cambios en resto]
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas estricta (CLAUDE.md)
// - SOLO services/ puede importar prisma
// - RSC fetchea datos → pasa props a cliente
// - Server Actions para operaciones, no API routes
// - Suspense boundaries con skeletons

// PATTERN: RSC + Suspense (actual)
// page.tsx
export default async function Page({ params }) {
  const { slug } = await params
  return (
    <Suspense fallback={<Skeleton />}>
      <DataComponent slug={slug} />
    </Suspense>
  )
}

// PATTERN: Validación de workspace/usuario
const session = await auth()
if (!session?.user) redirect('/login')
const workspace = await getWorkspaceBySlug(slug)
if (!workspace) redirect('/w')
const isUserMember = await isUserInWorkspace(session.user.id, workspace.id)
if (!isUserMember) redirect('/w')

// GOTCHA: Estados de GP
// CREATED: No lanzado, no visible
// ACTIVE: Lanzado, acepta predicciones hasta quali
// PAUSED: Pausado, no visible
// FINISHED: Terminado, solo lectura

// PATTERN: Mobile-first responsive
// Usar clases Tailwind: sm:hidden md:table-cell
// Componentes shadcn/ui para consistencia
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// Ya existen los modelos necesarios en Prisma
// Prediction, GrandPrix, OfficialResult, PredictionPoints

// Nuevos tipos TypeScript necesarios
export type PredictionWithResult = {
  id: string
  gpQuestionId: string
  answer: string
  isCorrect: boolean | null  // null si no hay resultado oficial
  pointsEarned: number
  officialAnswer: string | null
}

export type GrandPrixWithPredictions = {
  id: string
  name: string
  round: number
  raceDate: Date
  status: GPStatus
  hasPredictions: boolean
  predictionsCount: number
  correctPredictions: number
  totalPoints: number
}
```

### Task List (Orden de Implementación)

```yaml
Task 1: Extender Servicio de Predicciones
MODIFY src/services/prediction-service.ts:
  - ADD getUserGrandPrixWithPredictions(userId, seasonId) - Lista GPs con predicciones
  - ADD getUserPredictionsWithResults(userId, gpId) - Predicciones con resultados
  - ADD calculatePredictionStats(predictions) - Estadísticas de aciertos
  - REUSE getPastGrandPrix() de grand-prix-service.ts
  - JOIN con OfficialResult y PredictionPoints

Task 2: Crear Lista de GPs (RSC)
CREATE src/app/w/[slug]/predictions/predictions-list.tsx:
  - FETCH GP activo con getActiveGPForPredictions
  - FETCH GPs pasados con getPastGrandPrix
  - FETCH predicciones del usuario para cada GP
  - PASS datos al componente cliente
  - PATTERN RSC sin 'use client'

Task 3: Cliente Lista con Navegación
CREATE src/app/w/[slug]/predictions/predictions-list-client.tsx:
  - 'use client' al inicio
  - TABS o SELECT para navegar entre GPs
  - GP activo destacado con badge "ACTIVO"
  - GPs pasados con conteo predicciones/aciertos
  - Mobile-first con Tabs de shadcn/ui
  - Navigate con Link a /predictions/[gpId]

Task 4: Skeleton para Lista
CREATE src/app/w/[slug]/predictions/predictions-list-skeleton.tsx:
  - Skeleton consistente con diseño
  - Simular tabs y lista de GPs

Task 5: Modificar Página Principal
MODIFY src/app/w/[slug]/predictions/page.tsx:
  - REMOVE redirección automática
  - ADD Suspense con PredictionsList
  - KEEP validación usuario/workspace

Task 6: Extender Fetch de Datos del GP
MODIFY src/app/w/[slug]/predictions/[gpId]/prediction-table.tsx:
  - ADD fetch de OfficialResults para el GP
  - ADD fetch de PredictionPoints del usuario
  - CALCULATE isCorrect para cada predicción
  - PASS modo "view-only" si GP está FINISHED o locked

Task 7: Modo Historial en Cliente
MODIFY src/app/w/[slug]/predictions/[gpId]/prediction-table-client.tsx:
  - ADD prop isViewOnly basado en estado/deadline
  - DISABLE inputs cuando isViewOnly
  - SHOW indicadores visuales de acierto/error
  - DISPLAY puntos obtenidos por pregunta

Task 8: Actualizar Fila de Predicción
MODIFY src/app/w/[slug]/predictions/[gpId]/prediction-row.tsx:
  - ADD props: isCorrect, pointsEarned, officialAnswer, isViewOnly
  - STYLE verde para correcto, rojo/gris para incorrecto
  - SHOW respuesta oficial cuando existe
  - DISPLAY puntos ganados con badge

Task 9: Ajustar Componentes de Input
MODIFY question-input.tsx, driver-selector.tsx, team-selector.tsx:
  - ADD prop disabled cuando isViewOnly
  - STYLE apropiado para modo solo lectura
  - KEEP valor mostrado pero no editable

Task 10: Tests Unitarios
CREATE src/services/__tests__/prediction-history.test.ts:
  - TEST getUserGrandPrixWithPredictions
  - TEST getUserPredictionsWithResults
  - TEST cálculo de estadísticas
  - MOCK datos de Prisma
```

### Per-Task Pseudocode

```typescript
// Task 1: Servicio - Nuevos métodos
// src/services/prediction-service.ts

export async function getUserGrandPrixWithPredictions(
  userId: string,
  seasonId: string
): Promise<GrandPrixWithPredictions[]> {
  // Obtener todos los GPs de la temporada
  const grandPrix = await prisma.grandPrix.findMany({
    where: {
      seasonId,
      status: {
        in: ['ACTIVE', 'FINISHED']
      }
    },
    include: {
      predictions: {
        where: { userId },
        include: {
          earnedPoints: true,
          gpQuestion: {
            include: {
              officialResult: true
            }
          }
        }
      }
    },
    orderBy: { round: 'desc' }
  })

  // Mapear y calcular estadísticas
  return grandPrix.map(gp => {
    const predictions = gp.predictions
    const correctCount = predictions.filter(p =>
      p.gpQuestion.officialResult?.answer === p.answer
    ).length
    const totalPoints = predictions.reduce((sum, p) =>
      sum + (p.earnedPoints[0]?.points || 0), 0
    )

    return {
      ...gp,
      hasPredictions: predictions.length > 0,
      predictionsCount: predictions.length,
      correctPredictions: correctCount,
      totalPoints
    }
  })
}

// Task 2: RSC Lista
// src/app/w/[slug]/predictions/predictions-list.tsx

export async function PredictionsList({ slug }: { slug: string }) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)

  if (!activeSeason) {
    return <NoSeasonMessage />
  }

  // Obtener GP activo y pasados con predicciones
  const activeGP = await getActiveGPForPredictions(activeSeason.seasonId)
  const grandPrixWithPredictions = await getUserGrandPrixWithPredictions(
    session.user.id,
    activeSeason.seasonId
  )

  return (
    <PredictionsListClient
      activeGP={activeGP}
      pastGrandPrix={grandPrixWithPredictions}
      workspaceSlug={slug}
    />
  )
}

// Task 3: Cliente con Tabs
// src/app/w/[slug]/predictions/predictions-list-client.tsx

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export function PredictionsListClient({
  activeGP,
  pastGrandPrix,
  workspaceSlug
}) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">
            GP Activo {activeGP && <Badge className="ml-2">Nuevo</Badge>}
          </TabsTrigger>
          <TabsTrigger value="past">
            Historial ({pastGrandPrix.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeGP ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeGP.name}</CardTitle>
                <CardDescription>
                  Ronda {activeGP.round} • Cierra {formatDate(activeGP.qualifyingDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/w/${workspaceSlug}/predictions/${activeGP.id}`}>
                    Hacer Predicciones
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <NoActiveGPMessage />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastGrandPrix.map(gp => (
            <Card key={gp.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{gp.name}</CardTitle>
                    <CardDescription>
                      Ronda {gp.round} • {formatDate(gp.raceDate)}
                    </CardDescription>
                  </div>
                  {gp.hasPredictions && (
                    <div className="text-right">
                      <Badge variant="secondary">
                        {gp.correctPredictions}/{gp.predictionsCount} correctas
                      </Badge>
                      <p className="text-sm font-semibold mt-1">
                        {gp.totalPoints} pts
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              {gp.hasPredictions && (
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/w/${workspaceSlug}/predictions/${gp.id}`}>
                      Ver Resultados
                    </Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Task 8: Fila con Resultados
// src/app/w/[slug]/predictions/[gpId]/prediction-row.tsx

export function PredictionRow({
  question,
  prediction,
  isViewOnly,
  officialResult,
  pointsEarned
}) {
  const isCorrect = officialResult && prediction?.answer === officialResult.answer
  const showResult = isViewOnly && officialResult

  return (
    <div className={cn(
      "border rounded-lg p-4",
      showResult && isCorrect && "border-green-500 bg-green-50/50",
      showResult && !isCorrect && "border-red-500 bg-red-50/50"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium">{question.text}</h3>
          {question.badge && <Badge>{question.badge}</Badge>}
        </div>
        {showResult && (
          <div className="text-right">
            {isCorrect ? (
              <Badge className="bg-green-600">
                +{pointsEarned || question.points} pts
              </Badge>
            ) : (
              <Badge variant="destructive">0 pts</Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        {isViewOnly ? (
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Tu respuesta:</span>
              <p className="font-medium">{prediction?.answer || "No respondida"}</p>
            </div>
            {officialResult && (
              <div>
                <span className="text-sm text-muted-foreground">Respuesta correcta:</span>
                <p className="font-medium text-green-600">{officialResult.answer}</p>
              </div>
            )}
          </div>
        ) : (
          <QuestionInput
            question={question}
            value={prediction?.answer}
            onChange={handleChange}
            disabled={false}
          />
        )}
      </div>
    </div>
  )
}
```

### Integration Points
```yaml
DATABASE:
  - No requiere migraciones, usa modelos existentes
  - Joins complejos con OfficialResult y PredictionPoints

AUTH:
  - Mantener validación actual de usuario/workspace
  - Sin cambios en permisos

UI:
  - Tabs de shadcn/ui para navegación
  - Cards para lista de GPs
  - Badges para estados y puntos
  - Colores verde/rojo para aciertos/errores

PERFORMANCE:
  - Suspense boundaries para cada sección
  - Lazy loading de GPs pasados si son muchos
  - Cache de predicciones históricas (no cambian)
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Funcionalidad Base
```bash
# Dev server
pnpm run dev

# Navegar a /w/[slug]/predictions
# Verificar que aparecen tabs/selector
# Verificar GP activo funciona normal
# Verificar GPs pasados en modo solo lectura
```

### Level 3: Unit Tests
```typescript
// src/services/__tests__/prediction-history.test.ts
describe('Prediction History', () => {
  test('getUserGrandPrixWithPredictions returns correct stats', async () => {
    const result = await getUserGrandPrixWithPredictions('user1', 'season1')
    expect(result[0].correctPredictions).toBe(5)
    expect(result[0].totalPoints).toBe(25)
  })

  test('past GP shows in view-only mode', async () => {
    const gp = { status: 'FINISHED', qualifyingDate: pastDate }
    expect(isViewOnly(gp)).toBe(true)
  })
})
```

### Level 4: UI/UX Tests
- [ ] Navegación entre tabs es fluida
- [ ] Mobile: tabs son swipeables o compactos
- [ ] Desktop: layout aprovecha espacio
- [ ] Colores de acierto/error son visibles
- [ ] Puntos se muestran claramente

### Level 5: Production Build
```bash
pnpm run build
pnpm run start
# Test completo en localhost:3000
```

## Final Checklist

### Funcionalidad Core
- [ ] Lista de GPs muestra activo y pasados con predicciones
- [ ] GP activo permite hacer predicciones normalmente
- [ ] GPs pasados muestran en modo solo lectura
- [ ] Se visualizan aciertos vs errores claramente
- [ ] Puntos obtenidos visibles por pregunta
- [ ] Navegación intuitiva entre GPs

### Arquitectura
- [ ] Solo services/ importa Prisma
- [ ] RSC para fetch de datos
- [ ] Client components para interacciones
- [ ] Server Actions (no nuevas API routes)
- [ ] Suspense con skeletons apropiados

### UX/UI
- [ ] Mobile-first responsive
- [ ] Consistente con diseño existente
- [ ] Loading states suaves
- [ ] Mensajes claros cuando no hay datos
- [ ] Accesibilidad (ARIA labels, contraste)

### Calidad
- [ ] Tests unitarios pasando
- [ ] Sin errores de lint/types
- [ ] Build de producción exitoso
- [ ] Performance aceptable con muchos GPs

## Anti-Patterns to Avoid
- ❌ NO crear nuevas rutas API para esto
- ❌ NO importar Prisma fuera de services/
- ❌ NO modificar el flujo de predicciones activas
- ❌ NO permitir editar predicciones pasadas
- ❌ NO mostrar GPs con estado CREATED o PAUSED
- ❌ NO romper la navegación actual del workspace
- ❌ NO hacer fetch de todos los GPs de golpe (usar paginación si necesario)

## Score de Confianza: 9/10

Este PRP tiene alta probabilidad de éxito porque:
- Reutiliza la estructura existente sin cambios radicales
- Los patrones están bien establecidos en el codebase
- No requiere cambios en el modelo de datos
- La UI usa componentes ya existentes
- El alcance está bien definido y acotado