# TaskCollab — Smart Project & Task Collaboration System

A full-stack web application for managing projects, tasks, team members, and work progress with role-based access control, real-time activity tracking, and analytics.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** Auth.js v5 (credentials-based)
- **UI:** shadcn/ui, Tailwind CSS, Recharts
- **File Uploads:** Cloudinary (presigned URL flow)
- **Validation:** Zod v4

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `AUTH_SECRET` — Random secret for session encryption (generate with `openssl rand -base64 32`)
- `CLOUDINARY_*` — Cloudinary credentials (for file uploads)

### Seed Database

Populate the database with demo users, projects, and tasks:

```bash
npm run seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | demo123 |
| Project Manager | manager@example.com | demo123 |
| Team Member | john@example.com | demo123 |
| Demo (Admin) | demo@example.com | demo123 |

Use the **Demo Login** button on the login page for quick access.

## Features

### Authentication & RBAC
- Email/password signup and login
- Role-based access: Admin, Project Manager, Team Member
- Protected routes via middleware

### Project Management
- Create, update, delete projects
- Project status tracking (Active / Completed / On Hold)
- Add team members to projects
- Project progress visualization

### Task Management
- Full CRUD with validation rules:
  - No duplicate titles in the same project
  - Cannot reassign completed tasks
  - Cannot set past dates as deadlines
- Priority levels (High / Medium / Low)
- Status workflow (Todo → In Progress → Completed)
- Quick status update from task list

### Team Collaboration
- Member workload summary (total / completed / pending)
- Assign tasks to members
- Member search

### Dashboard & Analytics
- KPI cards (Projects, Tasks, Completed, Pending, Overdue)
- Charts: Tasks by Priority, Status Distribution, Team Productivity
- Recent activity feed
- Upcoming deadlines and high-priority tasks
- Project progress summaries

### File Attachments
- Presigned upload to Cloudinary (secure, validated)
- File type and size restrictions
- Max 5 attachments per task

### Comments
- Add comments on tasks
- Activity logging for comments

### Notifications
- In-app notification system
- Triggered on task assignment, status changes, comments, member additions

### Additional
- Dark/Light mode toggle
- URL-driven search, filter, sort, pagination
- Responsive design (mobile sidebar)

## Project Structure

```
src/
├── app/          — Routes (App Router)
├── components/   — UI primitives + shared components
├── features/     — Domain logic (service, actions, queries, components)
├── lib/          — Utilities (db, auth, rbac, cloudinary)
├── models/       — Mongoose schemas
├── schemas/      — Zod validation schemas
└── types/        — TypeScript types
```
