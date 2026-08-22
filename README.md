# 🚀 CareerGraph

A personalized, interactive IT career roadmap platform inspired by **roadmap.sh**. 

**CareerGraph** intelligently calculates a learner's skill gap based on their declared knowledge and lesson progress, guiding them through a structured learning hierarchy: **Career → Skills → Courses → Lessons → Progress**.

---

## ✨ Features & Highlights

### 🗺️ Interactive Roadmap Canvas
* **Structured Learning Phases**: Nodes are organized into distinct chronological learning tiers:
  * **Phase 1**: Foundations (Essential prerequisites)
  * **Phase 2**: Core Stack (Primary development tools)
  * **Phase 3**: Advanced & Ecosystem (Architecture & production tooling)
* **⚡ Quick Node Status Toggling**: Click directly on any roadmap badge to cycle node statuses in 1 second (`Not Started` ➔ `In Progress` ➔ `Completed`).
* **🖱️ Right-Click Context Menu**: Right-click any skill node on the canvas to set progress instantly.
* **🔒 Skill Prerequisites & Locked Nodes**: Advanced skills automatically lock with a 🔒 indicator until prerequisite skills are completed, preventing learners from skipping core fundamentals.
* **🎯 In-Place Career Switching**: Switch target career tracks on the fly via a modal selector without leaving the roadmap.
* **⚡ Topic Preview Drawer**: Click any node to slide open an in-canvas preview drawer with lessons, prerequisites, and resource links.

---

## 🛠️ Tech Stack

* **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router, Vanilla CSS with custom design tokens.
* **Backend**: Node.js, Express, JWT Authentication, bcrypt password hashing.
* **Database**: MongoDB + Mongoose ODM.

---

## 📁 Project Structure

```
careergraph/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Express route logic (users, progress, skills, careers)
│   │   ├── middleware/     # JWT Auth & error handling
│   │   ├── models/         # Mongoose Schemas (User, Skill, Career, Course, Progress)
│   │   ├── routes/         # API Route definitions
│   │   ├── seed/           # Seed data content & initial setup scripts
│   │   ├── services/       # skillGapService: roadmap phase & lock calculation logic
│   │   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, SkillPreviewDrawer, ProgressBar, SkillProgressChart
│   │   ├── views/          # Home, Dashboard, Roadmap, SkillDetail, Profile, Onboarding
│   │   ├── stores/         # Pinia Auth store
│   │   ├── services/       # Axios API client
│   │   ├── router/         # Vue Router configuration & guards
│   │   └── style.css       # Design tokens, variables & global button utilities
```

---

## 🚀 Quick Start & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster URI)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/careergraph
JWT_SECRET=your_super_secret_jwt_key
```

Seed the initial curriculum content (Careers, Skills, Courses, Lessons):
```bash
npm run seed
```

Start the API server:
```bash
npm run dev
```
*(Server runs at `http://localhost:5001`)*

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the Vite development server:
```bash
npm run dev
```
*(Application runs at `http://localhost:5173`)*

---

## 🔌 Core API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/roadmap` | Fetch structured roadmap for active career |
| `GET` | `/api/roadmap/:careerId` | Fetch roadmap for a specific career |
| `PUT` | `/api/progress/skill/:skillId/status` | Quick toggle skill status (`not_started`, `in_progress`, `completed`) |
| `PUT` | `/api/users/target-career` | Update target career track |
| `GET` | `/api/users/profile` | Fetch user profile and skill metrics |

---

## 📝 License
This project is open-source under the [MIT License](LICENSE).
