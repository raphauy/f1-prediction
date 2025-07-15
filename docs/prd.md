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

### 🎯 **Secciones de Preguntas**
El sistema de predicciones se estructura en **3 secciones temáticas** que ofrecen diferentes tipos de desafíos y mantienen el juego dinámico:

#### **1. Preguntas Clásicas** 
- **Qué incluye**: Predicciones tradicionales del formato original (pole position, ganador de carrera, podio, fastest lap, primer abandono, etc.)
- **Características**: Preguntas estándar que aparecen en todos los GP con opciones consistentes
- **Propósito**: Mantener la base competitiva familiar del juego original
- **Puntos**: Sistema establecido (25 pts ganador, 18 pts pole, etc.)

#### **2. Piloto en el Foco**
- **Qué incluye**: Sección dedicada al piloto destacado elegido para ese GP específico
- **Características**: 
  - Un piloto diferente por GP (elegido por el superadmin)
  - Preguntas específicas sobre su desempeño: posición final, head-to-head vs compañero, performance en clasificación, etc.
  - Preguntas contextuales basadas en la situación actual del piloto
- **Propósito**: Añadir foco narrativo y seguimiento específico a pilotos relevantes
- **Puntos**: Escala ajustada según dificultad de predicción

#### **3. Strollómetro**
- **Qué incluye**: Sección dedicada exclusivamente a Lance Stroll
- **Características**: 
  - Preguntas recurrentes sobre Stroll que se mantienen consistentes GP a GP
  - Ejemplos: "¿Terminará la carrera?", "¿Superará a su compañero?", "¿Hará un spin?"
  - Elemento de humor y entretenimiento dentro del juego
- **Propósito**: Añadir un elemento divertido y predecible que genera engagement
- **Puntos**: Sistema específico para mantener balance competitivo

**Beneficios del sistema de 3 secciones**:
- **Variedad**: Cada GP ofrece experiencias diferentes manteniendo elementos familiares
- **Engagement**: El "Piloto en el Foco" mantiene conexión con narrativas actuales de F1
- **Humor**: El "Strollómetro" añade diversión sin comprometer la competitividad
- **Escalabilidad**: Permite añadir nuevas secciones temáticas en el futuro
- **Personalización**: Los superadmins pueden ajustar preguntas del "Piloto en el Foco" según contexto

### 🏆 **Sistema de Puntos Dinámico**
- **Qué hace**: Asigna puntos según dificultad de predicción (25 pts ganador, 18 pts pole, 1 pt team pit stop, etc.)
- **Por qué importa**: Balancea la competencia premiando tanto aciertos obvios como predicciones difíciles
- **Cómo funciona**: Motor de cálculo automático que actualiza puntos cuando el superadmin ingresa resultados reales

### 🏁 **Gestión de Temporadas y Competencias**
- **Qué hace**: Cada workspace contiene múltiples temporadas (2025, 2026), cada temporada tiene sus GPs y tabla de puntos
- **Por qué importa**: Permite competencias anuales organizadas como el campeonato real de F1
- **Cómo funciona**: Los usuarios se unen automáticamente a la temporada activa, pueden optar por DNF

### 📋 **Sistema de Plantillas de Preguntas**
- **Qué hace**: Biblioteca de plantillas reutilizables para categorías estandarizables (Clásicas y Strollómetro) que los admins pueden usar como base
- **Por qué importa**: Garantiza consistencia en preguntas recurrentes mientras permite personalización total sin afectar las plantillas originales
- **Cómo funciona**: 
  - **Biblioteca de Plantillas**: Conjunto predefinido de preguntas template para categorías "Clásicas" y "Strollómetro" únicamente
  - **Proceso de Copia**: Los admins seleccionan plantillas y crean copias editables para cada GP
  - **Independencia**: Las preguntas del GP son completamente independientes - modificar/personalizar no afecta las plantillas originales
  - **Flexibilidad Total**: Texto, opciones, puntos y orden pueden modificarse libremente en las preguntas del GP
  - **Reutilización**: Las plantillas permanecen disponibles para futuros GP, manteniendo estándares de calidad
- **Scope**: Solo para preguntas recurrentes y estandarizables, NO para "Piloto en el Foco" que requiere creación contextual única

### 📋 **Configuración Flexible de Preguntas por GP**
- **Qué hace**: Sistema híbrido que combina plantillas para preguntas recurrentes con creación libre para contenido contextual
- **Por qué importa**: Optimiza tiempo en preguntas estándar mientras maximiza creatividad en preguntas narrativas específicas
- **Cómo funciona**: 
  - **Preguntas Clásicas**: Admin selecciona plantillas estándar (pole, ganador, etc.) y puede personalizar texto/opciones según el circuito
  - **Piloto en el Foco**: Creación completamente libre de preguntas contextuales adaptadas al piloto seleccionado y su situación actual
  - **Strollómetro**: Plantillas consistentes sobre Stroll que pueden personalizarse manteniendo el humor característico
  - **Flexibilidad por Categoría**: Plantillas para eficiencia vs. creación libre para narrativa única
  - **Edición Sin Restricciones**: Preguntas copiadas de plantillas pueden modificarse completamente
  - **Orden Personalizable**: Los admins definen el orden de presentación de preguntas por GP

### 📱 **Experiencia Mobile-First**
- **Qué hace**: Interfaz responsive optimizada para hacer predicciones desde el móvil
- **Por qué importa**: La mayoría de usuarios harán predicciones on-the-go desde sus teléfonos
- **Cómo funciona**: Dropdowns táctiles, layouts adaptivos, navegación simple

### ⏰ **Deadlines Automáticos**
- **Qué hace**: Bloquea predicciones automáticamente al inicio de la Qualy, con opción de extensión manual
- **Por qué importa**: Mantiene la integridad del juego y evita predicciones post-facto
- **Cómo funciona**: Sistema de fechas/horarios por GP con bloqueo automático de formularios

### 🛠️ **Gestión de Plantillas de Preguntas**
- **Qué hace**: Interfaz administrativa para gestionar biblioteca de plantillas (solo Clásicas y Strollómetro) y crear preguntas específicas por GP
- **Por qué importa**: Optimiza el tiempo de configuración en preguntas recurrentes mientras permite creación libre para contenido contextual
- **Cómo funciona**:
  - **Biblioteca Central**: Admins globales mantienen colección curada de plantillas para categorías estandarizables
  - **Exploración por Categorías**: Interfaz organizada por secciones "Clásicas" y "Strollómetro" únicamente
  - **Vista Previa**: Los admins pueden previsualizar cómo se verá cada plantilla antes de copiarla
  - **Copia Inteligente**: Un clic crea una instancia editable de la plantilla para el GP específico
  - **Creación Libre**: Para "Piloto en el Foco" - editor completo para crear preguntas desde cero
  - **Edición Sin Límites**: Texto, opciones, puntos y orden totalmente personalizables post-copia
  - **Gestión de Versiones**: Las plantillas pueden evolucionar sin afectar preguntas de GP anteriores

### 👥 **Gestión Colaborativa de Workspaces**
- **Qué hace**: Sistema de invitaciones, roles (admin/miembro), gestión de participantes por temporada
- **Por qué importa**: Facilita la organización grupal y administración de competencias
- **Cómo funciona**: Integración con sistema de workspaces existente del starter kit

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
3. **Configura las 3 secciones (híbrido plantillas + creación libre)**:
   - **Preguntas Clásicas**: 
     * Explora biblioteca de plantillas clásicas (pole, ganador, podio, etc.)
     * Selecciona plantillas relevantes y crea copias para el GP
     * Personaliza texto, opciones y puntos según el circuito específico
   - **Piloto en el Foco**: 
     * Elige piloto destacado para este GP
     * Crea preguntas completamente nuevas adaptadas al contexto actual del piloto
     * Diseña preguntas narrativas únicas (performance, situación en campeonato, rivalidades, etc.)
   - **Strollómetro**: 
     * Revisa plantillas estándar de Stroll disponibles
     * Copia y personaliza preguntas manteniendo el tono humorístico
4. **Edita libremente las preguntas copiadas** sin afectar plantillas originales
5. Ajusta orden de presentación y distribución de puntos por sección
6. Previsualiza experiencia completa de predicción
7. Activa GP - notificaciones automáticas a miembros
8. Post-carrera: ingresa resultados reales para las 3 secciones
9. Sistema calcula y actualiza puntos automáticamente

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
- **Framework**: Next.js 15 con App Router (heredado del starter kit)
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
- **focusPilot**: Piloto seleccionado para la sección "Piloto en el Foco" de este GP
- **focusPilotContext**: Contexto/razón de la selección del piloto (texto libre)

**QuestionTemplate (Plantillas de Preguntas)**
- id, text, type, defaultPoints, category, defaultOptions (JSON), description, isActive
- **Categorías**: "classic" (preguntas clásicas), "strollometer" (strollómetro) - NO incluye "pilot_focus"
- **Tipos**: "single_choice", "multiple_choice", "numeric", "boolean"
- **Propósito**: Biblioteca master de plantillas reutilizables para preguntas estandarizables únicamente

**GPQuestion (Preguntas Instanciadas por GP)**
- id, grandPrixId, templateId (referencia opcional), text, type, points, options (JSON), order, isActive
- **Características**: 
  - Copias independientes de las plantillas que pueden modificarse libremente
  - templateId mantiene trazabilidad del origen pero no restricciones
  - Campos completamente editables sin afectar la plantilla original
  - Pueden crearse preguntas completamente nuevas sin plantilla base

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
- **Plantillas Colaborativas**: Sistema para que workspaces compartan plantillas exitosas de categorías "Clásicas" y "Strollómetro"
- **IA para Preguntas Contextuales**: Sugerencias automáticas de preguntas "Piloto en el Foco" basadas en contexto del GP y narrativas actuales

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