# CareerGraph (MVP)

A personalized IT career roadmap platform. A user declares their existing skills and a
target career; the backend calculates the gap and generates a personalized, interactive
roadmap: **Career → Skills → Courses → Lessons → Progress**.

This is a scoped MVP of the full CareerGraph vision — built to be genuinely working,
end‑to‑end, rather than a partial implementation of every feature. See **"What's in this
MVP vs. the full vision"** below for exactly what's included and what's intentionally cut.

## Stack

- **Frontend:** Vue 3 (Composition API), Vue Router, Pinia, Vite, plain CSS (design tokens)
- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing
- **Database:** MongoDB + Mongoose

## Project structure

```
careergraph/
  backend/
    src/
      config/         # DB connection
      models/         # User, Skill, Career, Course (Mongoose schemas)
      middleware/      # auth (JWT), error handling
      controllers/     # request handlers
      routes/          # Express routers
      services/        # skillGapService: the roadmap-generation logic
      seed/            # seedData.js (content) + seed.js (loader script)
      server.js
  frontend/
    src/
      views/           # Home, Login, Signup, Onboarding, Dashboard, Roadmap, SkillDetail, Profile
      components/       # Navbar, ProgressBar
      stores/           # Pinia auth store
      services/api.js   # Axios client
      router/           # Vue Router config + auth guard
      style.css          # design tokens (colors, type, shared classes)
```

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string — easiest is a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster, or a local `mongod` if you have MongoDB installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste your MONGO_URI, set a JWT_SECRET (any long random string)
npm run seed     # loads 10 skills, 2 careers (Frontend Developer, Backend Developer), and full curriculum
npm run dev      # starts API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, edit if your backend runs elsewhere
npm run dev             # starts app on http://localhost:5173
```

Open `http://localhost:5173`, sign up, complete the 4-step onboarding, and you'll land on
a dashboard and roadmap generated from your declared skills vs. your chosen career.

## How the core loop works

1. **Onboarding** — education, current status, existing skills (with proficiency 0–4), target career.
2. **Skill-gap engine** (`services/skillGapService.js`) — for the chosen career, compares each
   required skill's required proficiency against the user's declared level *and* their actual
   lesson-completion progress in that skill's course, and returns a status per skill: `completed`,
   `in_progress`, or `not_started`.
3. **Roadmap** — renders one node per required skill, colored by status, linking to that skill's
   detail page.
4. **Skill Intelligence page** — what the skill is, why it's needed for the chosen career (with
   your level vs. the required level), prerequisites, related skills, curriculum (Beginner /
   Intermediate / Advanced lessons you can check off), and curated learning resources
   (documentation, YouTube, practice, projects).
5. Checking off a lesson calls `PUT /api/progress/lesson/:id/complete`, which updates the user's
   `completedLessons`. The dashboard and roadmap re-fetch and reflect the new percentage —
   this is the "roadmap updates automatically" loop from the spec.

## Adding a new career or skill (no frontend code changes needed)

Everything the frontend renders — skills, careers, curriculum, resources — comes from the
database via `GET /api/skills`, `GET /api/careers`, `GET /api/skills/:slug`, `GET /api/roadmap`.
To add e.g. "Data Analyst":

1. Add skill entries to `backend/src/seed/seedData.js` (or insert directly into MongoDB) for any
   new skills it needs.
2. Add a career entry to `careersData` listing required skills and required proficiency levels.
3. Re-run `npm run seed` (or, in production, add the same records through direct DB writes /
   a future admin API — see below).

No Vue component needs to change. This was a core architectural requirement in the original spec
and is preserved here.

## What's in this MVP vs. the full original vision

The original spec (44 sections) describes a much larger system: admin CMS with full CRUD UI,
a pannable/zoomable D3.js graph with progressive node expansion, quizzes with scoring, projects,
career-switching logic, global search, AI-generated content, resume parsing, and 15+ careers.
Building all of that is realistically weeks of work, not a couple of days — so this MVP keeps the
**architecture** faithful to that vision (data-driven, no hardcoded career logic, same
Career→Skill→Course→Lesson→Progress hierarchy) while intentionally scoping the **content and
some UI polish**:

**Included, fully working:**
- Auth (JWT, bcrypt), 4-step onboarding, skill-gap calculation, personalized roadmap
- Interactive roadmap visualization (click-through to skill detail), colored by status
- Full "Skill Intelligence" pages: description, why-it-matters, resources, prerequisites,
  related skills, curriculum with checkable lessons
- Real progress tracking (lesson → course → skill → career, calculated, not hardcoded)
- 2 careers, 10 skills, 60 lessons of real seeded content
- Dashboard with next-best-step recommendation

**Cut from MVP (noted for the report/future work):**
- Admin CMS UI (content is managed via `seedData.js` / direct DB writes instead of a built UI)
- Full pan/zoom D3.js graph (this MVP uses a clean CSS/SVG tree visualization instead —
  same click-to-expand-to-detail interaction, simpler rendering)
- Quizzes, projects, and career-switching/transferable-skills logic
- Global search across all content types
- AI-generated explanations, resume parsing, job-description matching

If you need any of the cut items built out for submission, the architecture (Mongoose schemas,
service layer, route structure) is already set up to extend into them — ask and I can add the
admin CRUD routes or a quiz model next, whichever matters more for your deadline.
