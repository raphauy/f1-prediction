# F1 Prediction - Features Implementadas

## Overview del Proyecto

### Propósito
Transformar el juego de predicciones de Fórmula 1 (antes en Excel) en una experiencia web moderna, mobile-first y colaborativa, manteniendo la esencia del juego original con mejoras en UX, automatización de deadlines y escalabilidad.

### Objetivos de Producto (V1)
- Predicciones por GP con formularios mobile-first y validación de deadlines.
- Gestión de temporadas, Grandes Premios, preguntas y resultados oficiales.
- Sistema de puntos dinámico y tablas de clasificación en tiempo real.
- Biblioteca de plantillas para preguntas recurrentes (Clásicas y Strollómetro).
- Sección "Piloto en el Foco" con preguntas contextuales libres por GP.
- Notificaciones por email: lanzamiento de GP y recordatorios (resultados: parcialmente pendiente).

### Audiencia
- Grupos de amigos fanáticos de F1 que compiten durante toda la temporada.
- Administradores de workspaces que organizan temporadas y GPs.
- Superadmins globales que gestionan plantillas y temporadas base.

## Features de Administrador (`/admin/*`)

### 1. Gestión de Temporadas (`/admin/seasons`)
- Crear/editar temporadas (año, fechas, estado activo) y propagación a workspaces.
- Enrolamiento automático de miembros en temporada activa del workspace.
- Validaciones de fechas y consistencia de calendario.

### 2. Gestión de Grandes Premios (`/admin/grand-prix`)
- CRUD de GPs: nombre, país, circuito, round, timezone, fechas de quali/carrera, sprint.
- Campos de contexto para "Piloto en el Foco" (piloto y descripción contextual).
- Lanzamiento de GP con envío de notificaciones a miembros del workspace.
- Bloqueo automático de predicciones al inicio de la Qualy (deadlines).
- Gestión visual del estado del GP (CREATED, ACTIVE, PAUSED, FINISHED).

### 3. Plantillas de Preguntas (`/admin/question-templates`)
- Biblioteca central de plantillas para categorías "CLASSIC" y "STROLLOMETER".
- Copia de plantillas a un GP concreto para edición total posterior.
- Filtros por categoría, vista previa y control de activación.

### 4. Configuración de Preguntas por GP (`/admin/grand-prix/[id]/questions`)
- Crear preguntas desde plantillas o como preguntas inline (sin plantilla).
- Edición completa: texto, tipo, categoría, opciones, puntos y orden.
- Drag & Drop para ordenar preguntas y control de visibilidad/actividad.

### 5. Resultados Oficiales (`/admin/grand-prix/[id]/official-results`)
- Carga del resultado oficial por pregunta de GP (una respuesta correcta por GPQuestion).
- Validaciones para evitar duplicados y asegurar integridad.
- Disparo del proceso de cálculo de puntos post-carga (manual/desde dashboard).

### 6. Scoring Dashboard (`/admin/scoring`)
- Ejecución del motor de scoring por GP/temporada.
- Recalcular puntuaciones y ver desglose por pregunta/predicción.
- Verificación de consistencia y herramientas de diagnóstico.

### 7. Usuarios y Workspaces (`/admin/users`, `/admin/workspaces`)
- Gestión de usuarios: creación, edición, rol global (superadmin).
- Gestión de workspaces: creación/edición, miembros, invitaciones y roles (admin/member).

## Features del Workspace (Usuarios) (`/w/[slug]/*`)

### 1. Predicciones por GP (`/w/[slug]/predictions/[gpId]`)
- Formulario mobile-first con dropdowns de pilotos/equipos, boolean, numeric y multiple-choice.
- Envío de predicciones con validación server-side del deadline.
- Revisión/visualización de predicciones enviadas e historial por GP.

### 2. Clasificaciones del Workspace (`/w/[slug]/standings`)
- Tabla de posiciones por temporada del workspace con cambios de posición.
- Vista de detalle por usuario y comparaciones básicas.

### 3. Dashboard del Workspace (`/w/[slug]`)
- Tarjeta del próximo GP con countdown.
- Actividad reciente del workspace y métricas resumidas.

### 4. Miembros e Invitaciones (`/w/[slug]/members`)
- Listado de miembros, roles, e invitaciones pendientes.
- Envío de invitaciones por email (aceptación vía token).

### 5. Configuración del Workspace (`/w/[slug]/settings`)
- Preferencias generales y (futuro) preferencias específicas de F1.

## Features Públicas

### 1. Clasificación Global (`/standings`)
- Ranking global entre workspaces con métricas agregadas.

### 2. Invitaciones (`/invite/[token]`)
- Aceptación de invitación con estados: válida, expirada, ya aceptada.

### 3. Autenticación y Onboarding (`/login`, `/onboarding`)
- OTP por email, flujo de onboarding inicial y perfil de usuario.

## Infraestructura Técnica

### Servicios Backend (Principales)
- `grand-prix-service.ts` - CRUD y consultas de GPs, estados y deadlines.
- `season-service.ts` - Temporadas y propagación a workspaces.
- `question-template-service.ts` - Biblioteca de plantillas (CLASSIC/STROLLOMETER).
- `question-service.ts` - Gestión de preguntas por GP (desde plantillas o inline).
- `prediction-service.ts` - Envío/lectura de predicciones y validaciones de deadline.
- `official-result-service.ts` - Ingreso de resultados oficiales por GPQuestion.
- `scoring-service.ts` - Cálculo de puntos por predicción y GP.
- `standings-service.ts` / `global-standings-service.ts` - Clasificaciones por temporada y globales.
- `workspace-service.ts` / `workspace-season-service.ts` / `invitation-service.ts` - Gestión de workspaces y temporadas.
- `user-service.ts`, `auth-service.ts` - Usuarios y Auth.js.
- `notification-service.ts`, `email-service.ts` - Notificaciones y envío de emails (lanzamiento GP, recordatorios).
- `statistics-service.ts`, `dashboard-service.ts`, `activity-service.ts` - Métricas, dashboards y logs de actividad.

### APIs y Jobs
- `api/auth/[...nextauth]` - NextAuth v5 (OTP), sesión y callbacks.
- `api/cron/finish-gps` - Cron para cierre de GPs y transición de estados.

### Modelos de Base de Datos (Resumen)
- `Season`, `GrandPrix`, `GPQuestion`, `Question`, `QuestionTemplate`.
- `Prediction`, `PredictionPoints`, `SeasonStanding`.
- `OfficialResult` para respuestas correctas por pregunta de GP.
- `Workspace`, `WorkspaceUser`, `WorkspaceSeason`, `WorkspaceInvitation`.

### Sistema de Diseño
- shadcn/ui + Tailwind v4, dark mode, componentes reutilizables.
- Componentes específicos: selectores de pilotos/equipos, badges de estado de GP, tablas responsive.

## 🚀 Siguientes Features a Implementar

<!-- Esta sección será actualizada dinámicamente como parte del proceso de desarrollo con agentes 
Template (no borrar):
<FEATURE number="1" status="PENDING" prp-file-path="">
...
</FEATURE>
-->

<FEATURE number="1" status="COMPLETED" prp-file-path="/docs/PRPs/timezone-handling-prp.md">
Modificar las fechas y horas de los GPS y clasificación para que se maneje timezone UTC en base de datos y en la UI el timezone del navegador, por ej el usuario admin de Uruguay verá las fechas y horas en horario de Uruguay (GMT-3 en este caso).
El objetivo es que el horario sea claro para el admin y para los jugadores mostrando su hora (la de su navegador)
</FEATURE>
