# F1 Prediction Game - PRD (Product Requirements Document)

## Overview

**F1 Prediction Game** es una plataforma web que transforma el clásico juego de predicciones de Fórmula 1 (actualmente en Excel) en una experiencia digital moderna, mobile-friendly y colaborativa. 

**El Problema**: Los grupos de amigos fanáticos de F1 actualmente usan hojas de Excel compartidas para competir con predicciones de cada Gran Premio, pero esta solución presenta limitaciones en usabilidad móvil, gestión de deadlines, experiencia de usuario y escalabilidad.

**La Solución**: Una aplicación web responsive que mantiene la esencia del juego original pero añade profesionalismo, automatización de deadlines, mejor UX móvil, y funcionalidades colaborativas avanzadas.

**Público Objetivo**: Grupos de amigos fanáticos de la Fórmula 1 que quieren competir con predicciones de forma más organizada y profesional.

**Valor Único**: Combina la simplicidad del juego de predicciones tradicional con una experiencia digital moderna, manteniendo la flexibilidad de preguntas personalizadas y el sistema de puntos proven del Excel original.

## Core Features

### 🏎️ **Sistema de Predicciones por GP**
- **Qué hace**: Los usuarios hacen predicciones sobre 15-20 aspectos de cada Gran Premio (pole position, ganador, abandonos, etc.)
- **Por qué importa**: Es el corazón del juego - permite competir basado en conocimiento de F1
- **Cómo funciona**: Formularios dropdown mobile-friendly con deadline automático al inicio de la Qualy

### 🏆 **Sistema de Puntos Dinámico**
- **Qué hace**: Asigna puntos según dificultad de predicción (25 pts ganador, 18 pts pole, 1 pt team pit stop, etc.)
- **Por qué importa**: Balancea la competencia premiando tanto aciertos obvios como predicciones difíciles
- **Cómo funciona**: Motor de cálculo automático que actualiza puntos cuando el superadmin ingresa resultados reales

### 🏁 **Gestión de Temporadas y Competencias**
- **Qué hace**: Cada workspace contiene múltiples temporadas (2025, 2026), cada temporada tiene sus GPs y tabla de puntos
- **Por qué importa**: Permite competencias anuales organizadas como el campeonato real de F1
- **Cómo funciona**: Los usuarios se unen automáticamente a la temporada activa, pueden optar por DNF

### 📋 **Configuración Flexible de Preguntas**
- **Qué hace**: Combina preguntas fijas (pole, ganador) con preguntas variables específicas del GP (piloto de moda, situaciones actuales)
- **Por qué importa**: Mantiene el juego fresco y relevante a las noticias actuales de F1
- **Cómo funciona**: Biblioteca de preguntas predefinidas + capacidad de personalización por GP sin afectar templates

### 📱 **Experiencia Mobile-First**
- **Qué hace**: Interfaz responsive optimizada para hacer predicciones desde el móvil
- **Por qué importa**: La mayoría de usuarios harán predicciones on-the-go desde sus teléfonos
- **Cómo funciona**: Dropdowns táctiles, layouts adaptivos, navegación simple

### ⏰ **Deadlines Automáticos**
- **Qué hace**: Bloquea predicciones automáticamente al inicio de la Qualy, con opción de extensión manual
- **Por qué importa**: Mantiene la integridad del juego y evita predicciones post-facto
- **Cómo funciona**: Sistema de fechas/horarios por GP con bloqueo automático de formularios

### 👥 **Gestión Colaborativa de Workspaces**
- **Qué hace**: Sistema de invitaciones, roles (admin/miembro), gestión de participantes por temporada
- **Por qué importa**: Facilita la organización grupal y administración de competencias
- **Cómo funciona**: Integración con sistema de workspaces existente del RC Starter Kit

### 📊 **Tablas de Clasificación en Tiempo Real**
- **Qué hace**: Muestra rankings actualizados por temporada, estadísticas por GP, progreso histórico
- **Por qué importa**: Mantiene la competitividad y engagement durante toda la temporada
- **Cómo funciona**: Cálculos automáticos con visualización de datos responsive

## User Experience

### 👤 **Tipos de Usuario**

**Competidor (Miembro del Workspace)**
- Hace predicciones para cada GP antes del deadline
- Ve su progreso en la tabla de clasificación
- Recibe notificaciones por email sobre deadlines y resultados
- Puede optar por DNF en temporadas

**Administrador del Workspace (Superadmin)**  
- Configura preguntas variables para cada GP
- Ingresa resultados reales post-carrera
- Gestiona deadlines y puede extenderlos
- Invita nuevos miembros al workspace
- Ve métricas del workspace

**Administrador Global**
- Crea/gestiona temporadas que se propagan a todos los workspaces
- Gestiona biblioteca de preguntas predefinidas
- Acceso al panel de administración global

### 🔄 **Flujos Principales**

**Flujo de Predicción (Usuario Final)**
1. Recibe notificación por email: "Predicciones abiertas para GP de [País]"
2. Accede desde móvil a su workspace
3. Ve la lista de preguntas con dropdowns pre-poblados
4. Completa sus predicciones (15-20 preguntas en 2-3 minutos)
5. Confirma envío antes del deadline
6. Ve confirmación y countdown al inicio de Qualy

**Flujo de Configuración (Superadmin)**
1. Accede a panel de admin del workspace
2. Crea nuevo GP con fecha y hora de Qualy
3. Selecciona preguntas fijas + añade preguntas variables del GP
4. Personaliza preguntas variables sin modificar templates
5. Activa GP - notificaciones automáticas a miembros
6. Post-carrera: ingresa resultados reales
7. Sistema calcula y actualiza puntos automáticamente

**Flujo de Temporada (Workspace)**
1. Superadmin recibe nueva temporada creada por admin global
2. Miembros existentes se unen automáticamente
3. Se pueden invitar nuevos miembros (se unen a temporada activa)
4. Durante temporada: ciclo GP → predicciones → resultados → puntos
5. Al final: tabla final de clasificación y estadísticas

### 🎯 **Experiencia General Esperada**
- **Simple y familiar**: Mantiene la simplicidad del Excel original
- **Mobile-first**: Predicciones rápidas desde cualquier lugar
- **Competitiva**: Tablas en tiempo real mantienen el engagement
- **Flexible**: Preguntas personalizables mantienen el juego fresco
- **Confiable**: Deadlines automáticos garantizan fair play
- **Social**: Experiencia grupal mejorada vs Excel compartido

## Technical Requirements

### 🏗️ **Arquitectura Base**
- **Framework**: Next.js 15 con App Router (heredado del RC Starter Kit)
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5 con OTP por email
- **UI**: shadcn/ui + Tailwind CSS v4 (responsive/mobile-first)
- **Email**: React Email + Resend para notificaciones

### 📊 **Modelos de Datos Principales**

**Season (Temporada)**
- id, name, year, isActive, createdAt, updatedAt

**WorkspaceSeason (Participación en Temporada)**
- workspaceId, seasonId, isActive, createdAt

**GrandPrix**
- id, seasonId, name, location, qualyDateTime, raceDateTime, isActive, deadlinePassed

**Question (Biblioteca de Preguntas)**
- id, text, type, points, isTemplate, category, options (JSON)

**GPQuestion (Preguntas por GP)**
- id, grandPrixId, questionId, customText, customOptions (JSON), points, order

**Prediction (Predicciones)**
- id, userId, grandPrixId, gpQuestionId, answer, points, isCorrect

**SeasonStanding (Clasificación por Temporada)**
- id, userId, workspaceId, seasonId, totalPoints, position

### 🔧 **Integraciones Requeridas**
- **Sistema de Email**: Integración con Resend para notificaciones automáticas
- **Gestión de Tiempo**: Sistema de timezones para deadlines globales de F1
- **Almacenamiento**: Vercel Blob para logos de equipos, fotos de pilotos (futuro)

### ⚡ **Requerimientos de Performance**
- **Carga de páginas**: < 2 segundos en móvil 3G
- **Formularios de predicción**: Respuesta instantánea en dropdowns
- **Cálculo de puntos**: Procesamiento en background post-resultados
- **Tablas de clasificación**: Actualización real-time con Server Components

### 🔐 **Seguridad y Validaciones**
- **Validación de deadlines**: Server-side enforcement de fechas límite
- **Predicciones inmutables**: Una vez enviadas, no se pueden modificar
- **Roles granulares**: Permisos específicos por workspace y nivel global
- **Auditoría**: Log de cambios críticos (resultados, extensiones de deadline)

### 📱 **Responsive Requirements**
- **Mobile viewport**: 320px - 768px (priority)
- **Tablet viewport**: 768px - 1024px  
- **Desktop viewport**: 1024px+ 
- **Touch-friendly**: Dropdowns y botones mínimo 44px
- **Offline graceful**: Mensaje claro cuando no hay conexión

## Future Considerations

### 🚀 **Roadmap Inmediato (V2)**
- **Notificaciones push**: PWA con service workers para engagement
- **Stats avanzadas**: Porcentaje de aciertos por tipo de pregunta, streaks
- **Predicciones grupales**: Mini-leagues dentro de workspaces
- **API pública**: Integración con datos reales de F1 (resultados automáticos)

### 🎯 **Funcionalidades Futuras (V3+)**
- **Integración F1 API**: Resultados automáticos desde fuentes oficiales
- **Live tracking**: Predicciones en tiempo real durante carrera
- **Análisis de patrones**: ML para sugerir predicciones basadas en histórico
- **Gamificación**: Badges, achievements, challenges especiales
- **Multi-deportes**: Extensión a MotoGP, otros campeonatos

### 💼 **Consideraciones de Negocio**
- **Freemium model**: Workspaces gratuitos con límites, premium sin límites
- **Funcionalidades premium**: Stats avanzadas, más temporadas simultáneas, customización visual
- **Partnerships**: Posibles colaboraciones con medios de F1, influencers
- **Internacionalización**: Soporte multi-idioma para mercados globales

### 📊 **Métricas y Analytics**
- **KPIs principales**: DAU, predicciones completadas, retención por temporada
- **Engagement**: Tiempo promedio en predicciones, interacción con tablas
- **Crecimiento**: Invitaciones enviadas, conversión de invitados
- **Performance**: Tiempo de carga por región, éxito de notificaciones

---

*Este PRD establece las bases para transformar el juego de predicciones F1 de Excel en una plataforma digital moderna, manteniendo la esencia que lo hace divertido mientras añade el profesionalismo y usabilidad que merece.* 