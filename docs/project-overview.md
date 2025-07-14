# Project Overview

## Project Description

F1 Prediction Game is a modern web platform that transforms the traditional Excel-based Formula 1 prediction game into a professional, mobile-friendly digital experience. Groups of F1 enthusiasts can compete by making predictions for each Grand Prix throughout the season, with automated deadline management, real-time scoring, and collaborative features.

## Existing Starter Kit Features

- **OTP Authentication system** - Passwordless login via email with 6-digit codes
- **Workspace management with roles** - Multi-tenant architecture with admin/member permissions
- **Admin panel with user management** - Superadmin access to manage users and workspaces
- **Dark mode support** - Full theme switching with system preference detection
- **Email integration** - Resend + React Email for transactional emails
- **Responsive UI components** - shadcn/ui component library with Tailwind CSS v4
- **Role-based access control** - Middleware-protected routes and granular permissions
- **User profiles** - Profile management with image uploads via Vercel Blob
- **Onboarding flow** - New user onboarding process
- **Invitation system** - Email-based workspace invitations with expiring tokens

## New Features to Implement

### Core Game Features
- **Prediction System** - Mobile-friendly forms for 15-20 predictions per Grand Prix
- **Dynamic Points System** - Automated scoring based on prediction difficulty (25pts winner, 18pts pole, etc.)
- **Season Management** - Multiple F1 seasons per workspace with automatic user enrollment
- **Question Configuration** - Flexible question templates with GP-specific customizations
- **Automatic Deadlines** - Predictions lock at qualifying start time with manual extension option
- **Real-time Leaderboards** - Live standings, GP statistics, and historical progress tracking

### F1-Specific Features
- **Grand Prix Management** - Create/manage races with qualifying/race times
- **Question Library** - Pre-defined question templates for common predictions
- **Results Input System** - Superadmin interface for entering actual race results
- **DNF Option** - Users can opt-out of seasons while maintaining workspace membership
- **Prediction History** - View past predictions and results for all GPs

### Enhanced Collaboration
- **Email Notifications** - Automated reminders for prediction deadlines and result announcements
- **Season-specific Invitations** - New members join active season automatically
- **Workspace Statistics** - Participation rates, prediction accuracy analytics

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with OTP
- **UI**: shadcn/ui + Tailwind CSS v4
- **Email**: Resend + React Email
- **File Storage**: Vercel Blob (for future team/driver images)
- **Validation**: Zod schemas
- **Notifications**: Sonner toasts
- **Time Management**: date-fns for timezone handling
- **State Management**: Server Components + Server Actions

## Integration Points

### Leveraging Existing Features
1. **Authentication** - Use existing OTP system for user login
2. **Workspaces** - Extend workspace model for F1 competition groups
3. **Roles** - Build on admin/member roles for prediction management
4. **Email System** - Add prediction reminder and results notification templates
5. **Admin Panel** - Extend for season and GP management
6. **UI Components** - Reuse existing component library for consistency

### New Integrations
1. **Season-Workspace Relationship** - Link global seasons to individual workspaces
2. **Time-based Actions** - Automatic deadline enforcement and notifications
3. **Scoring Engine** - Background jobs for point calculations
4. **Prediction Forms** - Mobile-optimized dropdowns with F1 driver/team data

### Data Flow Integration
- Predictions flow: User → Workspace → Season → GP → Questions → Predictions
- Results flow: Superadmin → GP Results → Scoring Engine → User Points → Leaderboards
- Notification flow: GP Creation → Email Queue → User Notifications → Prediction Reminders