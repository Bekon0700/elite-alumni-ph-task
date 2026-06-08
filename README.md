# TaskCollab — Smart Project & Task Collaboration System

A full-stack web application for managing projects, tasks, team members, and work progress with role-based access control, activity tracking, and analytics.

## Links

| Resource | URL |
|----------|-----|
| **Live Application** | [https://elite-task.netlify.app/](https://elite-task.netlify.app/) |
| **GitHub Repository** | [https://github.com/Bekon0700/elite-alumni-ph-task](https://github.com/Bekon0700/elite-alumni-ph-task) |

## Documentation

- [Project Setup](#project-setup) — clone, install, configure, seed, and run locally
- [Environment Variables](#environment-variables) — required and optional `.env.local` values with example
- [Demo Credentials](#demo-credentials) — seeded test accounts for each role
- [Features Overview](#features-overview) — what the application includes
- [Deployment Instructions](#deployment-instructions) — deploy to Netlify or Vercel

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** Auth.js v5 (credentials-based)
- **UI:** shadcn/ui, Tailwind CSS, Recharts
- **File Uploads:** Cloudinary (presigned URL flow)
- **Validation:** Zod v4

---

## Project Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (recommended for production) or local MongoDB
- Cloudinary account (for file attachments)

### 1. Clone the repository

```bash
git clone https://github.com/Bekon0700/elite-alumni-ph-task.git
cd elite-alumni-ph-task
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) below for details.

### 4. Seed the database

Populate demo users, projects, and tasks:

```bash
npm run seed
```

The script reads `MONGODB_URI` from `.env.local`. If demo collections already contain data, seeding is skipped. Clear those collections in MongoDB to re-seed.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Production build (optional)

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this file):

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. Atlas `mongodb+srv://...`) |
| `AUTH_SECRET` | Yes | Random secret for session encryption. Generate with `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | Yes (production) | Set to `true` on Netlify/Vercel so Auth.js trusts the host header |
| `NEXTAUTH_URL` | Local only | Use `http://localhost:3000` locally. **Remove or set to your live URL in production** |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `UPLOAD_MAX_SIZE_MB` | No | Max upload size in MB (default: `10`) |
| `UPLOAD_MAX_FILES_PER_TASK` | No | Max attachments per task (default: `5`) |

Example `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskcollab
AUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
UPLOAD_MAX_SIZE_MB=10
UPLOAD_MAX_FILES_PER_TASK=5
```

---

## Demo Credentials

After running `npm run seed`, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | demo123 |
| Project Manager | manager@example.com | demo123 |
| Team Member | john@example.com | demo123 |
| Demo (Admin) | demo@example.com | demo123 |

Use the **Demo Login** button on the login page for one-click access.

---

## Features Overview

### Authentication & RBAC
- Email/password signup and login
- Roles: Admin, Project Manager, Team Member
- Protected routes via middleware
- Permission checks on server actions

### Project Management
- Create, update, delete projects
- Status tracking (Active / Completed / On Hold)
- Add team members to projects
- Progress visualization and project detail views
- Search, filter, sort, and pagination

### Task Management
- Full CRUD with validation:
  - No duplicate titles within a project
  - Completed tasks cannot be reassigned
  - Deadlines cannot be in the past
- Priority levels (High / Medium / Low)
- Status workflow (Todo → In Progress → Completed)
- Task detail page with comments
- Bulk status updates on project detail
- Quick status update from task list

### Team Collaboration
- Member workload summary (total / completed / pending)
- Assign tasks to members
- Member search on team page

### Dashboard & Analytics
- KPI cards (Projects, Tasks, Completed, Pending, Overdue)
- Charts: Tasks by Priority, Status Distribution, Team Productivity
- Recent activity feed
- Upcoming deadlines and high-priority tasks
- Project progress summaries

### File Attachments
- Presigned upload to Cloudinary
- File type and size validation
- Up to 5 attachments per task

### Comments & Notifications
- Add comments on task detail pages
- Activity logging for comments and task changes
- In-app notifications for assignments, status changes, comments, and member additions

### Additional
- Dark / light mode toggle
- Settings page
- URL-driven search, filter, sort, pagination
- Responsive layout with mobile sidebar

---

## Deployment Instructions

The app requires a Node.js host with server-side rendering (Next.js App Router, server actions, and API routes). **Netlify** or **Vercel** are recommended.

### Before deploying

1. Create a **MongoDB Atlas** cluster and get a connection string.
2. Create a **Cloudinary** account for file uploads.
3. Generate an `AUTH_SECRET` (`openssl rand -base64 32`).
4. Push your latest code to GitHub.

### Option A — Deploy to Netlify (recommended in this repo)

1. Sign in at [netlify.com](https://www.netlify.com) and click **Add new site → Import an existing project**.
2. Connect GitHub and select `Bekon0700/elite-alumni-ph-task`.
3. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** handled by `@netlify/plugin-nextjs`
4. Add environment variables under **Site settings → Environment variables**:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas URI |
   | `AUTH_SECRET` | Your generated secret |
   | `AUTH_TRUST_HOST` | `true` |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

5. **Do not** leave `NEXTAUTH_URL` set to `http://localhost:3000` in production. Either remove it (recommended with `AUTH_TRUST_HOST=true`) or set it to your live URL: `https://elite-task.netlify.app`.
6. Deploy the site, then run the seed script **once** against your production database:

   ```bash
   MONGODB_URI="your-atlas-uri" npm run seed
   ```

**Live site:** [https://elite-task.netlify.app/](https://elite-task.netlify.app/)

### Option B — Deploy to Vercel

1. Sign in at [vercel.com](https://vercel.com) and **Import** the GitHub repository.
2. Add the same environment variables as in the Netlify table above.
3. Deploy and seed the production database.

### Post-deployment checklist

- [ ] Live site loads without errors — [https://elite-task.netlify.app/](https://elite-task.netlify.app/)
- [ ] Login works (try Demo Login)
- [ ] Dashboard, projects, tasks, and team pages load
- [ ] File upload and comments work (requires Cloudinary)

---

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

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server locally |
| `npm run seed` | Seed demo data into MongoDB |
| `npm run lint` | Run ESLint |
