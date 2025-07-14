# UI/UX Specifications

## Design System Integration

- **Use existing shadcn/ui components** as the foundation for all UI elements
- **Follow current dark mode implementation** using next-themes provider
- **Maintain responsive design patterns** with Tailwind's responsive utilities
- **Extend color palette** for F1-specific elements (team colors, status indicators)
- **Typography hierarchy** consistent with existing starter kit patterns
- **Component variants** using CVA (Class Variance Authority) for flexibility

## New Component Requirements

### Feature-Specific Components (Co-located with pages)

#### 1. Prediction Form Components
```typescript
// app/w/[workspaceId]/f1/seasons/[seasonId]/gp/[gpId]/predict/
├── page.tsx                    // RSC with Suspense
├── prediction-form.tsx         // RSC data fetching
├── prediction-client.tsx       // Client form interactions
├── prediction-skeleton.tsx     // Loading state
└── actions.ts                  // Submit predictions action

// Reusable components in components/f1/
├── driver-select.tsx           // Reusable driver dropdown
├── team-select.tsx             // Reusable team dropdown
└── countdown-timer.tsx         // Reusable deadline timer
```

#### 2. Leaderboard Components
```typescript
// app/w/[workspaceId]/f1/seasons/[seasonId]/standings/
├── page.tsx                    // RSC with Suspense
├── standings-table.tsx         // RSC data fetching
├── standings-client.tsx        // Client interactions (sorting, filtering)
├── standings-skeleton.tsx      // Loading state
└── standings-row-client.tsx    // Interactive row features

// Reusable component in components/f1/
└── position-badge.tsx          // Reusable position display
```

#### 3. Grand Prix Components
```typescript
// app/w/[workspaceId]/f1/
├── f1-dashboard.tsx            // RSC dashboard data
├── gp-card-client.tsx          // Interactive GP card
└── gp-grid-skeleton.tsx        // Loading state for GP grid

// Each GP detail page
// app/w/[workspaceId]/f1/seasons/[seasonId]/gp/[gpId]/
├── page.tsx                    // GP overview
├── gp-details.tsx              // RSC GP data
└── gp-status-client.tsx        // Client status updates
```

#### 4. Results Display Components
```typescript
// app/w/[workspaceId]/f1/seasons/[seasonId]/gp/[gpId]/results/
├── page.tsx                    // Results page
├── results-display.tsx         // RSC results data
├── results-input-client.tsx    // Admin input form (client)
├── prediction-comparison.tsx   // RSC comparison view
└── actions.ts                  // Submit results action
```

### Global Reusable Components (components/f1/)

Only truly reusable F1 components that are used across multiple features:

```typescript
// components/f1/
├── driver-select.tsx           // Dropdown with driver names + numbers
├── team-select.tsx             // Dropdown with team names + colors  
├── countdown-timer.tsx         // Real-time countdown component
├── position-badge.tsx          // Position display with change indicator
├── points-display.tsx          // Formatted points display
├── gp-status-badge.tsx         // Open/Locked/Results status badge
└── yes-no-toggle.tsx           // Binary choice component
```

## User Experience Flows

### Mobile-First Prediction Flow
1. **Dashboard Entry**
   - Clear CTA: "Make Predictions for [Next GP]"
   - Countdown timer showing time until deadline
   - Quick access to current standings

2. **Prediction Form**
   - Sticky header with GP name and deadline
   - Swipeable cards for each question (mobile)
   - Progress indicator (e.g., "Question 5 of 18")
   - Auto-save draft functionality
   - One-tap dropdowns with search capability

3. **Submission Confirmation**
   - Review all predictions before final submit
   - Clear warning about immutability
   - Success animation and points preview
   - Share predictions option (future feature)

### Results Viewing Flow
1. **Notification Trigger**
   - Push/Email: "Results are in for [GP Name]!"
   - In-app badge on GP card

2. **Results Dashboard**
   - Personal score highlight
   - Position change animation
   - Prediction accuracy breakdown
   - Comparison with top performers

3. **Deep Dive Analytics**
   - Question-by-question review
   - Points earned per prediction
   - Season trend visualization

## Responsive Design Requirements

### Mobile (320px - 768px) - PRIMARY
- **Touch targets**: Minimum 44px height for all interactive elements
- **Single column layouts** for forms and lists
- **Collapsible sections** for complex data
- **Bottom sheet modals** for better reachability
- **Sticky CTAs** at bottom of viewport
- **Swipe gestures** for navigation between questions
- **Condensed data tables** with horizontal scroll

### Tablet (768px - 1024px)
- **Two-column layouts** where beneficial
- **Expanded data tables** with more visible columns
- **Side-by-side comparisons** for predictions vs results
- **Modal dialogs** instead of full-screen sheets

### Desktop (1024px+)
- **Multi-column dashboards** with widget layouts
- **Inline editing** capabilities for admins
- **Hover states** for additional information
- **Keyboard shortcuts** for power users
- **Advanced filtering** and sorting options

## Component Specifications

### Form Controls
```tsx
// Driver Select Example
<Select>
  <SelectTrigger className="h-12 text-base">
    <SelectValue placeholder="Select driver" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="VER">
      <div className="flex items-center gap-2">
        <span className="font-mono">1</span>
        <span>Max Verstappen</span>
        <Badge variant="outline" className="ml-auto">
          Red Bull
        </Badge>
      </div>
    </SelectItem>
    {/* More drivers... */}
  </SelectContent>
</Select>
```

### Mobile-Optimized Tables
```tsx
// Standings Table (Mobile)
<div className="divide-y">
  {standings.map((user) => (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-muted-foreground">
          {user.position}
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">
            {user.points} pts
          </div>
        </div>
      </div>
      <PositionChange change={user.positionChange} />
    </div>
  ))}
</div>
```

### Status Indicators
```tsx
// GP Status Badge
<Badge 
  variant={
    status === 'open' ? 'default' : 
    status === 'locked' ? 'secondary' : 
    'outline'
  }
>
  {status === 'open' && <Clock className="mr-1 h-3 w-3" />}
  {status === 'locked' && <Lock className="mr-1 h-3 w-3" />}
  {status === 'results' && <CheckCircle className="mr-1 h-3 w-3" />}
  {statusText}
</Badge>
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: Visible focus rings on all interactive elements
- **Screen reader support**: Proper ARIA labels and landmarks
- **Keyboard navigation**: Full functionality without mouse
- **Error messages**: Clear, descriptive error text with suggestions
- **Loading states**: Announce dynamic content changes

### Mobile Accessibility
- **Touch target size**: 44x44px minimum
- **Gesture alternatives**: Provide button alternatives for swipe actions
- **Zoom support**: Allow up to 200% zoom without horizontal scroll
- **Motion preferences**: Respect prefers-reduced-motion

## Visual Design Guidelines

### F1 Branding Elements
- **Team colors**: Use official F1 team colors for badges/indicators
- **Racing aesthetics**: Checkered patterns for completion states
- **Speed indicators**: Progress bars with racing-inspired design
- **Trophy icons**: For winners and achievements

### Data Visualization
- **Charts**: Use Recharts or similar for responsive graphs
- **Color coding**: Green for gains, red for losses, neutral for unchanged
- **Animations**: Subtle transitions for state changes
- **Empty states**: Engaging illustrations for no-data scenarios

### Dark Mode Considerations
- **Contrast adjustments**: Ensure readability in both themes
- **Color shifts**: Muted colors in dark mode to reduce eye strain
- **Image handling**: Proper image filters for dark backgrounds
- **Status colors**: Adjusted for visibility in both modes