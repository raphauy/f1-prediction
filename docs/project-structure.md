# Project Structure

## Current Starter Kit Structure
```
src/
├── app/                     # App Router pages
│   ├── admin/              # Admin panel (existing)
│   ├── w/                  # Workspaces (existing)
│   ├── login/              # Auth (existing)
│   └── onboarding/         # User onboarding (existing)
├── components/             # Global reusable components
│   ├── ui/                 # shadcn/ui components
│   └── emails/             # Email templates
├── services/               # Data access layer
├── lib/                    # Utilities and config
└── types/                  # TypeScript types
```

## Proposed Structure for New Features

```
src/
├── app/
│   ├── admin/
│   │   ├── seasons/                    # Global season management (NEW)
│   │   │   ├── page.tsx               # RSC with Suspense
│   │   │   ├── seasons-list.tsx       # RSC data fetching
│   │   │   ├── season-form-client.tsx # Client interactions
│   │   │   ├── seasons-skeleton.tsx   # Loading state
│   │   │   └── actions.ts             # Server actions
│   │   ├── questions/                  # Question library (NEW)
│   │   │   ├── page.tsx
│   │   │   ├── questions-list.tsx
│   │   │   ├── question-builder-client.tsx
│   │   │   └── actions.ts
│   │   └── grand-prix/                 # GP templates (NEW)
│   │       ├── page.tsx
│   │       ├── gp-list.tsx
│   │       ├── gp-form-client.tsx
│   │       └── actions.ts
│   ├── w/
│   │   └── [workspaceId]/
│   │       ├── f1/                     # F1 prediction hub (NEW)
│   │       │   ├── page.tsx
│   │       │   ├── f1-dashboard.tsx   # RSC dashboard
│   │       │   ├── gp-card-client.tsx # Reusable GP card
│   │       │   ├── seasons/
│   │       │   │   └── [seasonId]/
│   │       │   │       ├── page.tsx
│   │       │   │       ├── season-overview.tsx
│   │       │   │       ├── standings/
│   │       │   │       │   ├── page.tsx
│   │       │   │       │   ├── standings-table.tsx
│   │       │   │       │   ├── standings-client.tsx
│   │       │   │       │   └── standings-skeleton.tsx
│   │       │   │       └── gp/
│   │       │   │           └── [gpId]/
│   │       │   │               ├── predict/
│   │       │   │               │   ├── page.tsx
│   │       │   │               │   ├── prediction-form.tsx
│   │       │   │               │   ├── prediction-client.tsx
│   │       │   │               │   └── actions.ts
│   │       │   │               ├── results/
│   │       │   │               │   ├── page.tsx
│   │       │   │               │   ├── results-display.tsx
│   │       │   │               │   ├── results-input-client.tsx
│   │       │   │               │   └── actions.ts
│   │       │   │               └── stats/
│   │       │   │                   ├── page.tsx
│   │       │   │                   └── stats-view.tsx
│   │       │   └── settings/
│   │       │       ├── page.tsx
│   │       │       └── f1-settings-client.tsx
│   │       └── settings/
│   │           └── f1/                 # F1-specific workspace settings (NEW)
│   │               ├── page.tsx
│   │               └── actions.ts
├── components/
│   ├── ui/                             # shadcn/ui components only
│   ├── emails/                         # Email templates
│   │   ├── prediction-reminder.tsx (NEW)
│   │   └── results-announcement.tsx (NEW)
│   └── f1/                             # ONLY truly reusable F1 components (NEW)
│       ├── driver-select.tsx           # Reusable dropdown
│       ├── team-select.tsx             # Reusable dropdown
│       ├── countdown-timer.tsx         # Reusable timer
│       └── position-badge.tsx          # Reusable position display
├── services/
│   └── f1/                             # F1 data layer - ONLY place using Prisma (NEW)
│       ├── season-service.ts           # Season CRUD operations
│       ├── grand-prix-service.ts       # GP CRUD operations
│       ├── prediction-service.ts       # Prediction operations
│       ├── scoring-service.ts          # Score calculations
│       ├── question-service.ts         # Question management
│       └── notification-service.ts     # Email notifications
├── lib/
│   └── f1/                             # F1 utilities (NEW)
│       ├── constants.ts                # Teams, drivers, point values
│       ├── scoring-engine.ts           # Score calculation logic
│       ├── deadline-manager.ts         # Deadline utilities
│       └── timezone-utils.ts           # Timezone helpers
└── types/
    └── f1.ts                           # F1-specific types (NEW)
```

## File Organization Patterns

Following the RSC pattern established in CLAUDE.md:

- **Co-location**: Feature-specific components stay with their pages, NOT in /components
- **Reusable components**: Only truly reusable components go in /components/f1/
- **RSC Pattern**: page.tsx → Suspense → data-list.tsx (RSC) → client.tsx (interactions)
- **Server/Client separation**: RSC for data fetching, client components for interactions
- **Service Layer**: ALL Prisma operations in /services, never in components or pages
- **Action files**: Server actions co-located with their pages (actions.ts)
- **Loading states**: Skeleton components with Suspense boundaries
- **Naming convention**: 
  - `*-list.tsx` for RSC data components
  - `*-client.tsx` for client interaction components
  - `*-skeleton.tsx` for loading states
  - `*-service.ts` for data layer with Prisma

## Database Schema Extensions

### New Prisma Models

```prisma
// Global season that propagates to all workspaces
model Season {
  id        String   @id @default(cuid())
  name      String   // e.g., "2025 Season"
  year      Int      @unique
  isActive  Boolean  @default(true)
  startDate DateTime
  endDate   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  grandPrix         GrandPrix[]
  workspaceSeasons  WorkspaceSeason[]
  
  @@index([year])
  @@index([isActive])
}

// Links workspaces to seasons
model WorkspaceSeason {
  id          String   @id @default(cuid())
  workspaceId String
  seasonId    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  season    Season    @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  standings SeasonStanding[]
  
  @@unique([workspaceId, seasonId])
  @@index([workspaceId])
  @@index([seasonId])
}

// Individual F1 races
model GrandPrix {
  id             String   @id @default(cuid())
  seasonId       String
  name           String   // e.g., "Australian Grand Prix"
  location       String   // e.g., "Melbourne"
  round          Int      // Race number in season
  qualyDateTime  DateTime // Qualifying start time (UTC)
  raceDateTime   DateTime // Race start time (UTC)
  sprintRace     Boolean  @default(false)
  isActive       Boolean  @default(true)
  deadlinePassed Boolean  @default(false)
  resultsEntered Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  season      Season       @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  questions   GPQuestion[]
  predictions Prediction[]
  
  @@unique([seasonId, round])
  @@index([seasonId])
  @@index([qualyDateTime])
}

// Question templates library
model Question {
  id         String   @id @default(cuid())
  text       String   // e.g., "Who will win the race?"
  type       String   // "driver", "team", "yes_no", "custom"
  category   String   // "podium", "qualifying", "race", "other"
  points     Int      @default(10)
  isTemplate Boolean  @default(true)
  options    Json?    // For custom options
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  gpQuestions GPQuestion[]
  
  @@index([type])
  @@index([category])
}

// Questions assigned to specific GPs
model GPQuestion {
  id            String   @id @default(cuid())
  grandPrixId   String
  questionId    String?  // Null if fully custom
  customText    String?  // Override template text
  customOptions Json?    // Override template options
  points        Int
  order         Int      // Display order
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  grandPrix   GrandPrix    @relation(fields: [grandPrixId], references: [id], onDelete: Cascade)
  question    Question?    @relation(fields: [questionId], references: [id])
  predictions Prediction[]
  
  @@unique([grandPrixId, order])
  @@index([grandPrixId])
}

// User predictions
model Prediction {
  id           String   @id @default(cuid())
  userId       String
  grandPrixId  String
  gpQuestionId String
  answer       String   // The prediction value
  isCorrect    Boolean? // Null until results entered
  pointsEarned Int      @default(0)
  createdAt    DateTime @default(now())
  
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  grandPrix  GrandPrix  @relation(fields: [grandPrixId], references: [id], onDelete: Cascade)
  gpQuestion GPQuestion @relation(fields: [gpQuestionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, gpQuestionId])
  @@index([userId, grandPrixId])
  @@index([grandPrixId])
}

// Season standings per workspace
model SeasonStanding {
  id               String   @id @default(cuid())
  userId           String
  workspaceSeasonId String
  totalPoints      Int      @default(0)
  predictionsCount Int      @default(0)
  correctCount     Int      @default(0)
  position         Int?     // Calculated field
  previousPosition Int?     // For tracking changes
  bestFinish       Int?     // Best position achieved
  didNotFinish     Boolean  @default(false) // DNF status
  updatedAt        DateTime @updatedAt
  
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspaceSeason WorkspaceSeason @relation(fields: [workspaceSeasonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, workspaceSeasonId])
  @@index([workspaceSeasonId, totalPoints])
  @@index([userId])
}

// Update existing models
model User {
  // ... existing fields ...
  predictions    Prediction[]
  seasonStandings SeasonStanding[]
}

model Workspace {
  // ... existing fields ...
  workspaceSeasons WorkspaceSeason[]
}
```

## Data Relationships

```
Season (1) ─── (N) GrandPrix
   │                    │
   └── (N) WorkspaceSeason   (N) GPQuestion ─── (1) Question
              │                     │
              └── (N) SeasonStanding    (N) Prediction ─── (1) User
```

## Key Design Decisions

1. **Global Seasons**: Seasons are created globally and automatically available to all workspaces
2. **Flexible Questions**: Combination of template questions and GP-specific customizations
3. **Immutable Predictions**: Once submitted, predictions cannot be changed
4. **Workspace Isolation**: All competition data is scoped to workspace level
5. **Performance Indexes**: Strategic indexes on frequently queried fields
6. **Soft Deletes**: Using isActive flags instead of hard deletes for data integrity