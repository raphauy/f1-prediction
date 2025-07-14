# API Design

## Server Actions

### Season Management Actions
```typescript
// app/admin/seasons/actions.ts
export async function createSeason(data: {
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
}): Promise<{ success: boolean; season?: Season; error?: string }>;

export async function updateSeason(
  seasonId: string,
  data: Partial<Season>
): Promise<{ success: boolean; error?: string }>;

export async function toggleSeasonActive(
  seasonId: string
): Promise<{ success: boolean; error?: string }>;
```

### Grand Prix Management Actions
```typescript
// app/admin/grand-prix/actions.ts
export async function createGrandPrix(data: {
  seasonId: string;
  name: string;
  location: string;
  round: number;
  qualyDateTime: Date;
  raceDateTime: Date;
  sprintRace?: boolean;
}): Promise<{ success: boolean; grandPrix?: GrandPrix; error?: string }>;

export async function updateGrandPrixSchedule(
  gpId: string,
  data: {
    qualyDateTime?: Date;
    raceDateTime?: Date;
  }
): Promise<{ success: boolean; error?: string }>;

export async function extendDeadline(
  gpId: string,
  newDeadline: Date
): Promise<{ success: boolean; error?: string }>;
```

### Question Management Actions
```typescript
// app/admin/questions/actions.ts
export async function createQuestionTemplate(data: {
  text: string;
  type: 'driver' | 'team' | 'yes_no' | 'custom';
  category: 'podium' | 'qualifying' | 'race' | 'other';
  points: number;
  options?: string[];
}): Promise<{ success: boolean; question?: Question; error?: string }>;

export async function assignQuestionsToGP(
  gpId: string,
  questions: {
    questionId?: string;
    customText?: string;
    customOptions?: string[];
    points: number;
    order: number;
  }[]
): Promise<{ success: boolean; error?: string }>;
```

### Prediction Actions
```typescript
// app/w/[workspaceId]/f1/seasons/[seasonId]/gp/[gpId]/predict/actions.ts
export async function submitPredictions(
  predictions: {
    gpQuestionId: string;
    answer: string;
  }[]
): Promise<{ success: boolean; error?: string }>;

export async function saveDraftPredictions(
  gpId: string,
  predictions: Record<string, string>
): Promise<{ success: boolean; error?: string }>;

export async function getPredictionStatus(
  userId: string,
  gpId: string
): Promise<{
  submitted: boolean;
  deadline: Date;
  canSubmit: boolean;
}>;
```

### Results & Scoring Actions
```typescript
// app/w/[workspaceId]/f1/seasons/[seasonId]/gp/[gpId]/results/actions.ts
export async function submitResults(
  gpId: string,
  results: {
    gpQuestionId: string;
    correctAnswer: string;
  }[]
): Promise<{ success: boolean; error?: string }>;

export async function calculateScores(
  gpId: string,
  workspaceId: string
): Promise<{ 
  success: boolean; 
  processed: number;
  error?: string;
}>;

export async function recalculateSeasonStandings(
  seasonId: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }>;
```

### Workspace F1 Actions
```typescript
// app/w/[workspaceId]/settings/f1/actions.ts
export async function updateWorkspaceF1Settings(
  workspaceId: string,
  settings: {
    emailReminders: boolean;
    reminderHoursBefore: number;
    showPredictionsAfterDeadline: boolean;
  }
): Promise<{ success: boolean; error?: string }>;

export async function toggleUserDNF(
  userId: string,
  seasonId: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }>;
```

## Database Operations

### Season Queries
```typescript
// services/f1/seasons.ts
export async function getActiveSeasons(): Promise<Season[]>;

export async function getSeasonWithGPs(
  seasonId: string
): Promise<Season & { grandPrix: GrandPrix[] }>;

export async function getWorkspaceSeasons(
  workspaceId: string
): Promise<WorkspaceSeason[]>;
```

### Prediction Queries
```typescript
// services/f1/predictions.ts
export async function getUserPredictions(
  userId: string,
  gpId: string
): Promise<Prediction[]>;

export async function getGPPredictionStats(
  gpId: string,
  workspaceId: string
): Promise<{
  totalUsers: number;
  submittedCount: number;
  averageScore: number;
}>;

export async function checkDeadlineStatus(
  gpId: string
): Promise<boolean>;
```

### Leaderboard Queries
```typescript
// services/f1/scoring.ts
export async function getSeasonStandings(
  seasonId: string,
  workspaceId: string
): Promise<SeasonStanding[]>;

export async function getUserSeasonStats(
  userId: string,
  seasonId: string,
  workspaceId: string
): Promise<{
  totalPoints: number;
  position: number;
  correctPredictions: number;
  accuracy: number;
  gpResults: GPResult[];
}>;

export async function getGPLeaderboard(
  gpId: string,
  workspaceId: string
): Promise<{
  userId: string;
  points: number;
  correctCount: number;
}[]>;
```

## Integration with Existing APIs

### Authentication Integration
```typescript
// Extend existing auth checks
export async function requireF1Access(
  workspaceId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const member = await getWorkspaceMember(workspaceId, session.user.id);
  if (!member) redirect('/');
  
  // F1 features available to all workspace members
}

export async function requireF1Admin(
  workspaceId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const member = await getWorkspaceMember(workspaceId, session.user.id);
  if (!member || member.role !== 'admin') {
    redirect(`/w/${workspaceId}/f1`);
  }
}
```

### Workspace Integration
```typescript
// Extend workspace settings
interface WorkspaceSettings {
  // ... existing settings
  f1?: {
    emailReminders: boolean;
    reminderHoursBefore: number;
    showPredictionsAfterDeadline: boolean;
    customScoringRules?: Record<string, number>;
  };
}

// Hook into workspace creation
export async function onWorkspaceCreated(
  workspaceId: string
): Promise<void> {
  // Auto-enroll in active season
  const activeSeason = await getActiveSeason();
  if (activeSeason) {
    await createWorkspaceSeason({
      workspaceId,
      seasonId: activeSeason.id,
    });
  }
}
```

### Email Integration
```typescript
// services/f1/notifications.ts
export async function sendPredictionReminder(
  userId: string,
  gpName: string,
  deadline: Date,
  workspaceSlug: string
): Promise<void> {
  const user = await getUserById(userId);
  if (!user?.email) return;
  
  await resend.emails.send({
    from: 'F1 Predictions <noreply@...>',
    to: user.email,
    subject: `Predictions closing soon for ${gpName}`,
    react: PredictionReminderEmail({
      userName: user.name,
      gpName,
      deadline,
      predictionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/w/${workspaceSlug}/f1`,
    }),
  });
}

export async function sendResultsAnnouncement(
  workspaceId: string,
  gpId: string
): Promise<void> {
  const members = await getWorkspaceMembers(workspaceId);
  const gp = await getGrandPrix(gpId);
  
  // Batch send to all members
  const emails = members.map(member => ({
    from: 'F1 Predictions <noreply@...>',
    to: member.user.email,
    subject: `Results are in for ${gp.name}!`,
    react: ResultsAnnouncementEmail({
      userName: member.user.name,
      gpName: gp.name,
      resultsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/w/${workspaceId}/f1/seasons/${gp.seasonId}/gp/${gpId}/results`,
    }),
  }));
  
  await resend.batch.send(emails);
}
```

## External API Integration

### F1 Calendar API (Future)
```typescript
// lib/f1/external-apis.ts
interface F1CalendarAPI {
  getSeason(year: number): Promise<{
    races: {
      round: number;
      raceName: string;
      circuit: { circuitName: string; location: string };
      date: string;
      time: string;
      qualifying: { date: string; time: string };
      sprint?: { date: string; time: string };
    }[];
  }>;
}

// Sync official calendar
export async function syncOfficialCalendar(
  seasonId: string
): Promise<void> {
  const season = await getSeason(seasonId);
  const officialData = await f1Api.getSeason(season.year);
  
  // Update GP data with official times
  for (const race of officialData.races) {
    await updateOrCreateGrandPrix({
      seasonId,
      round: race.round,
      name: race.raceName,
      location: race.circuit.location,
      // Convert to UTC...
    });
  }
}
```

### Live Timing Integration (Future)
```typescript
// Real-time results during race
interface LiveTimingAPI {
  subscribeToRace(gpId: string): EventSource;
  getRaceResults(): Promise<RaceResult>;
}

export async function enableLiveTracking(
  gpId: string
): Promise<void> {
  const eventSource = liveApi.subscribeToRace(gpId);
  
  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    // Update live positions, notify users of changes
    await updateLiveStandings(gpId, data);
  };
}
```

## Performance Optimizations

### Caching Strategy
```typescript
// Use Next.js caching
export const getSeasonStandings = unstable_cache(
  async (seasonId: string, workspaceId: string) => {
    // Expensive calculation
    return calculateStandings(seasonId, workspaceId);
  },
  ['season-standings'],
  {
    revalidate: 300, // 5 minutes
    tags: [`season-${seasonId}`, `workspace-${workspaceId}`],
  }
);

// Invalidate on score update
export async function invalidateStandingsCache(
  seasonId: string,
  workspaceId: string
): Promise<void> {
  revalidateTag(`season-${seasonId}`);
  revalidateTag(`workspace-${workspaceId}`);
}
```

### Background Jobs
```typescript
// Queue system for heavy operations
export async function queueScoreCalculation(
  gpId: string
): Promise<void> {
  // Add to job queue (Vercel Cron or similar)
  await createJob({
    type: 'calculate-scores',
    data: { gpId },
    runAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min delay
  });
}
```