#!/bin/bash
set -e
echo "Applying CareerGraph frontend update..."

mkdir -p src/views src/components

cat > 'index.html' << 'FILEEOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CareerGraph — Your personalized IT career roadmap</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
FILEEOF
echo 'wrote index.html'

cat > 'src/style.css' << 'FILEEOF'
:root {
  /* Clean, light, roadmap.sh-inspired palette */
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface-2: #f1f5f9;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-dim: #64748b;

  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --accent-soft: #eef2ff;
  --done: #16a34a;
  --done-soft: #dcfce7;
  --progress: #d97706;
  --progress-soft: #fef3c7;
  --danger: #dc2626;

  --font-display: 'Sora', 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 28px rgba(15, 23, 42, 0.12);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

p { margin: 0 0 1rem 0; color: var(--text-dim); line-height: 1.65; }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

button, input, select, textarea { font-family: inherit; font-size: inherit; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); text-decoration: none; }
.btn:active { transform: translateY(0); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.btn-primary { background: var(--accent); color: #ffffff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
.btn-secondary:hover { border-color: var(--accent); }
.btn-ghost { background: transparent; color: var(--text-dim); box-shadow: none; }
.btn-ghost:hover { color: var(--text); transform: none; box-shadow: none; }

.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.input-field {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
.input-field:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }

.label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #7c6ff0);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-done { background: var(--done-soft); color: var(--done); }
.badge-progress { background: var(--progress-soft); color: var(--progress); }
.badge-notstarted { background: var(--surface-2); color: var(--text-dim); }

.error-text { color: var(--danger); font-size: 0.9rem; margin-top: 0.5rem; font-weight: 500; }
FILEEOF
echo 'wrote src/style.css'

cat > 'src/components/Navbar.vue' << 'FILEEOF'
<template>
  <header class="navbar">
    <div class="navbar-inner container">
      <router-link :to="auth.isAuthenticated ? '/dashboard' : '/'" class="brand">
        <span class="brand-mark">◆</span> CareerGraph
      </router-link>
      <nav v-if="auth.isAuthenticated" class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/roadmap">Roadmap</router-link>
        <router-link to="/profile">Profile</router-link>
        <button class="btn btn-ghost" @click="handleLogout">Log out</button>
      </nav>
      <nav v-else class="nav-links">
        <router-link to="/login">Log in</router-link>
        <router-link to="/signup" class="btn btn-primary btn-sm">Get started</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.navbar {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 20;
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.brand-mark { color: var(--accent); }
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a {
  color: var(--text-dim);
  font-weight: 500;
  font-size: 0.9rem;
}
.nav-links a.router-link-active { color: var(--accent); }
.btn-sm { padding: 0.5rem 1.1rem; font-size: 0.85rem; }
</style>
FILEEOF
echo 'wrote src/components/Navbar.vue'

cat > 'src/components/SkillProgressChart.vue' << 'FILEEOF'
<template>
  <div class="chart">
    <div v-for="row in data" :key="row.name" class="chart-row">
      <span class="chart-label">{{ row.name }}</span>
      <div class="chart-track">
        <div class="chart-fill" :class="fillClass(row.status)" :style="{ width: row.percent + '%' }"></div>
      </div>
      <span class="chart-value">{{ row.percent }}%</span>
    </div>
    <div class="chart-axis-row">
      <span class="chart-axis-spacer"></span>
      <div class="chart-axis">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
      <span class="chart-axis-spacer"></span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] } // [{ name, percent, status }]
});

function fillClass(status) {
  return { completed: 'fill-done', in_progress: 'fill-progress', not_started: 'fill-todo' }[status] || 'fill-todo';
}
</script>

<style scoped>
.chart { display: flex; flex-direction: column; gap: 0.6rem; }
.chart-row { display: grid; grid-template-columns: 110px 1fr 40px; align-items: center; gap: 0.75rem; }
.chart-label { font-size: 0.8rem; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chart-track { height: 14px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.chart-fill { height: 100%; }
.fill-done { background: var(--done); }
.fill-progress { background: var(--progress); }
.fill-todo { background: var(--border); }
.chart-value { font-size: 0.78rem; text-align: right; color: var(--text-dim); }

.chart-axis-row { display: grid; grid-template-columns: 110px 1fr 40px; margin-top: 0.15rem; }
.chart-axis-spacer { }
.chart-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-dim);
}
</style>
FILEEOF
echo 'wrote src/components/SkillProgressChart.vue'

cat > 'src/views/Home.vue' << 'FILEEOF'
<template>
  <main>
    <section class="hero container">
      <div class="hero-text">
        <span class="eyebrow">Personalized IT career roadmaps</span>
        <h1>Tell CareerGraph where you are.<br />It shows you exactly what to learn next.</h1>
        <p class="lead">
          Pick a target career. CareerGraph compares it against the skills you already have,
          then builds a step-by-step roadmap — no generic course lists, no guesswork.
        </p>
        <div class="hero-actions">
          <router-link to="/signup" class="btn btn-primary">Build my career roadmap</router-link>
          <router-link to="/login" class="btn btn-secondary">Log in</router-link>
        </div>
      </div>
      <div class="hero-graph card">
        <div class="graph-node graph-root">Frontend Developer</div>
        <div class="graph-branch">
          <div class="graph-node graph-done">HTML — 100%</div>
          <div class="graph-node graph-progress">CSS — 60%</div>
          <div class="graph-node graph-todo">JavaScript — 0%</div>
          <div class="graph-node graph-todo">Vue — 0%</div>
        </div>
      </div>
    </section>

    <section class="container how">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step card">
          <span class="step-num">01</span>
          <h3>Tell us your starting point</h3>
          <p>Education, current status, and the skills you already know — with proficiency, not just a checkbox.</p>
        </div>
        <div class="step card">
          <span class="step-num">02</span>
          <h3>Pick a target career</h3>
          <p>Frontend, Backend, and more careers are added over time without changing how the app works.</p>
        </div>
        <div class="step card">
          <span class="step-num">03</span>
          <h3>Get your gap-based roadmap</h3>
          <p>Skills you already have are marked complete. Everything else becomes a clear, ordered path.</p>
        </div>
        <div class="step card">
          <span class="step-num">04</span>
          <h3>Learn, track, and progress</h3>
          <p>Work through lessons, mark them complete, and watch your roadmap and dashboard update live.</p>
        </div>
      </div>
    </section>

    <footer class="container footer">
      <p>CareerGraph — a personalized IT career roadmap and learning platform.</p>
    </footer>
  </main>
</template>

<style scoped>
main { padding-bottom: 4rem; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
}
.eyebrow {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
h1 { font-size: 2.6rem; line-height: 1.15; margin: 0.75rem 0 1rem; }
.lead { font-size: 1.05rem; max-width: 46ch; }
.hero-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }

.hero-graph { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
.graph-node {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border);
}
.graph-root { background: var(--accent); color: #ffffff; font-family: var(--font-display); box-shadow: var(--shadow-md); border: none; }
.graph-branch { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }
.graph-done { background: var(--done-soft); color: var(--done); border-color: #bbf0ce; }
.graph-progress { background: var(--progress-soft); color: var(--progress); border-color: #fde3a3; }
.graph-todo { background: var(--surface-2); color: var(--text-dim); }

.how { padding: 3rem 0; }
.how h2 { text-align: center; margin-bottom: 2rem; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.step-num { display: block; font-family: var(--font-display); color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem; }
.step h3 { font-size: 1.05rem; }
.step p { font-size: 0.9rem; }

.footer { border-top: 1px solid var(--border); padding-top: 2rem; margin-top: 2rem; }
.footer p { font-size: 0.85rem; }

@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; padding-top: 2rem; }
  h1 { font-size: 2rem; }
  .steps { grid-template-columns: 1fr 1fr; }
}
</style>
FILEEOF
echo 'wrote src/views/Home.vue'

cat > 'src/views/Roadmap.vue' << 'FILEEOF'
<template>
  <main class="container roadmap-page">
    <div v-if="loading" class="loading">Building your roadmap…</div>

    <template v-else-if="data.career">
      <header class="roadmap-header">
        <h1>{{ data.career.name }} Roadmap</h1>
        <p>{{ data.overallProgress }}% complete — click any skill to see what it means and how to learn it.</p>
      </header>

      <div class="legend">
        <span class="legend-item"><i class="dot dot-done"></i> Completed</span>
        <span class="legend-item"><i class="dot dot-progress"></i> In progress</span>
        <span class="legend-item"><i class="dot dot-todo"></i> Not started</span>
      </div>

      <div class="graph-wrap">
        <div class="graph-tree">
          <div class="root-node">{{ data.career.name }}</div>
          <div class="connector-h"></div>
          <div class="branches">
            <div v-for="node in data.nodes" :key="node.skillId" class="branch">
              <div class="connector-v"></div>
              <router-link :to="`/skills/${node.slug}`" class="skill-node" :class="statusClass(node.status)">
                <span class="skill-node-name">{{ node.name }}</span>
                <span class="skill-node-pct">{{ node.percent }}%</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <p class="tree-hint">This roadmap grows with the database — new skills or careers added by an admin appear here automatically.</p>
    </template>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const loading = ref(true);
const data = ref({ career: null, nodes: [], overallProgress: 0 });

onMounted(async () => {
  try {
    const url = route.params.careerId ? `/roadmap/${route.params.careerId}` : '/roadmap';
    const { data: res } = await api.get(url);
    data.value = res;
  } finally {
    loading.value = false;
  }
});

function statusClass(status) {
  return { completed: 'node-done', in_progress: 'node-progress', not_started: 'node-todo' }[status];
}
</script>

<style scoped>
.roadmap-page { padding: 2.5rem 1.5rem 4rem; }
.loading { padding: 4rem 0; text-align: center; color: var(--text-dim); }
.roadmap-header h1 { font-size: 1.7rem; margin-bottom: 0.25rem; }

.legend { display: flex; gap: 1.25rem; margin: 1rem 0 2rem; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
.dot { width: 9px; height: 9px; border-radius: 999px; display: inline-block; }
.dot-done { background: var(--done); }
.dot-progress { background: var(--progress); }
.dot-todo { background: #cbd5e1; }

.graph-wrap { overflow-x: auto; padding: 1rem 0 2rem; }
.graph-tree { display: flex; flex-direction: column; align-items: center; min-width: 640px; }

.root-node {
  padding: 0.85rem 1.6rem;
  border-radius: 12px;
  background: var(--accent);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: var(--shadow-md);
}

.connector-h { width: 2px; height: 28px; background: var(--border); }

.branches {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  position: relative;
  padding-top: 0;
}
.branches::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: var(--border);
}

.branch { display: flex; flex-direction: column; align-items: center; }
.connector-v { width: 2px; height: 24px; background: var(--border); }

.skill-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.8rem 1.15rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  min-width: 120px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.skill-node:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); text-decoration: none; }
.skill-node-name { font-weight: 600; color: var(--text); font-size: 0.9rem; }
.skill-node-pct { font-size: 0.75rem; color: var(--text-dim); }

.node-done { background: var(--done-soft); border-color: #bbf0ce; }
.node-done .skill-node-name { color: var(--done); }
.node-progress { background: var(--progress-soft); border-color: #fde3a3; }
.node-progress .skill-node-name { color: var(--progress); }
.node-todo { background: var(--surface); }

.tree-hint { font-size: 0.8rem; color: var(--text-dim); text-align: center; }

@media (max-width: 700px) {
  .graph-tree { min-width: 100%; }
  .branches { flex-wrap: wrap; }
  .branches::before { display: none; }
}
</style>
FILEEOF
echo 'wrote src/views/Roadmap.vue'

cat > 'src/views/Onboarding.vue' << 'FILEEOF'
<template>
  <main class="container onboarding">
    <div class="onboarding-header">
      <span class="step-label">Step {{ step }} of 4</span>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: (step / 4) * 100 + '%' }"></div>
      </div>
    </div>

    <div class="card step-card">
      <!-- STEP 1: EDUCATION -->
      <section v-if="step === 1">
        <h2>Tell us about your education</h2>
        <p>This helps us understand your starting point.</p>

        <label class="label">Highest degree</label>
        <select v-model="education.degree" class="input-field">
          <option value="">Select…</option>
          <option>High School</option>
          <option>Diploma</option>
          <option>Bachelor's Degree</option>
          <option>Master's Degree</option>
          <option>Other</option>
        </select>

        <label class="label" style="margin-top: 1rem;">Field of study</label>
        <input v-model="education.field" type="text" class="input-field" placeholder="e.g. Computer Engineering" />

        <label class="label" style="margin-top: 1rem;">Graduation year</label>
        <input v-model.number="education.gradYear" type="number" class="input-field" placeholder="e.g. 2027" />

        <label class="checkbox-row" style="margin-top: 1rem;">
          <input type="checkbox" v-model="education.stillStudying" />
          I'm still studying
        </label>
      </section>

      <!-- STEP 2: CURRENT STATUS -->
      <section v-else-if="step === 2">
        <h2>What best describes you right now?</h2>
        <p>We'll tailor recommendations to your current stage.</p>

        <div class="option-grid">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            class="option-card"
            :class="{ active: status === opt.value }"
            @click="status = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-if="status === 'employed'" style="margin-top: 1rem;">
          <label class="label">Job title</label>
          <input v-model="jobTitle" type="text" class="input-field" placeholder="e.g. Frontend Developer Intern" />
        </div>
      </section>

      <!-- STEP 3: EXISTING SKILLS -->
      <section v-else-if="step === 3">
        <h2>What skills do you already have?</h2>
        <p>Search, add a skill, and set how confident you are with it.</p>

        <div class="skill-search">
          <input v-model="skillQuery" type="text" class="input-field" placeholder="Search skills… (e.g. JavaScript)" />
          <div v-if="filteredSkills.length" class="skill-suggestions">
            <button
              v-for="s in filteredSkills"
              :key="s._id"
              type="button"
              class="suggestion-item"
              @click="addSkill(s)"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <div class="selected-skills-box">
          <h3 class="selected-skills-heading">
            Your skills <span v-if="userSkills.length">({{ userSkills.length }})</span>
          </h3>
          <div v-if="userSkills.length" class="selected-skills">
            <div v-for="row in userSkills" :key="row.skill" class="selected-skill-row">
              <span class="selected-skill-name">{{ skillName(row.skill) }}</span>
              <select v-model.number="row.level" class="input-field level-select">
                <option :value="1">Beginner</option>
                <option :value="2">Intermediate</option>
                <option :value="3">Advanced</option>
                <option :value="4">Expert</option>
              </select>
              <button type="button" class="btn btn-ghost" @click="removeSkill(row.skill)">Remove</button>
            </div>
          </div>
          <p v-else class="empty-hint">Nothing added yet — search above and click a skill to add it here, or skip if you're starting fresh.</p>
        </div>
      </section>

      <!-- STEP 4: TARGET CAREER -->
      <section v-else-if="step === 4">
        <h2>What do you want to become?</h2>
        <p>We'll compare this career's required skills against what you already know.</p>

        <div class="option-grid">
          <button
            v-for="c in careers"
            :key="c._id"
            type="button"
            class="option-card career-card"
            :class="{ active: targetCareer === c._id }"
            @click="targetCareer = c._id"
          >
            <strong>{{ c.name }}</strong>
            <span>{{ c.description }}</span>
          </button>
        </div>
      </section>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="step-actions">
        <button v-if="step > 1" type="button" class="btn btn-secondary" @click="prevStep">Back</button>
        <div style="flex: 1;"></div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || !canProceed"
          @click="step < 4 ? nextStep() : finish()"
        >
          {{ loading ? 'Saving…' : step < 4 ? 'Next' : 'Finish → Generate My Roadmap' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const step = ref(1);
const loading = ref(false);
const error = ref('');

// Step 1
const education = ref({ degree: '', field: '', gradYear: null, stillStudying: false });

// Step 2
const status = ref('');
const jobTitle = ref('');
const statusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'fresher', label: 'Fresher / recently graduated' },
  { value: 'employed', label: 'Currently employed' }
];

// Step 3
const allSkills = ref([]);
const skillQuery = ref('');
const userSkills = ref([]); // [{ skill: id, level: n }]

const filteredSkills = computed(() => {
  if (!skillQuery.value.trim()) return [];
  const q = skillQuery.value.toLowerCase();
  const already = new Set(userSkills.value.map((r) => r.skill));
  return allSkills.value.filter((s) => s.name.toLowerCase().includes(q) && !already.has(s._id)).slice(0, 6);
});

function skillName(id) {
  const s = allSkills.value.find((sk) => sk._id === id);
  return s ? s.name : '';
}

function addSkill(skill) {
  userSkills.value.push({ skill: skill._id, level: 2 });
  skillQuery.value = '';
}

function removeSkill(id) {
  userSkills.value = userSkills.value.filter((r) => r.skill !== id);
}

// Step 4
const careers = ref([]);
const targetCareer = ref('');

onMounted(async () => {
  const [skillsRes, careersRes] = await Promise.all([api.get('/skills'), api.get('/careers')]);
  allSkills.value = skillsRes.data.skills;
  careers.value = careersRes.data.careers;
});

const canProceed = computed(() => {
  if (step.value === 1) return !!education.value.degree;
  if (step.value === 2) return !!status.value;
  if (step.value === 3) return true; // skills are optional
  if (step.value === 4) return !!targetCareer.value;
  return true;
});

async function saveStep(stepNum, data) {
  loading.value = true;
  error.value = '';
  try {
    await api.put('/users/onboarding', { step: stepNum, data });
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not save. Please try again.';
    throw err;
  } finally {
    loading.value = false;
  }
}

async function nextStep() {
  try {
    if (step.value === 1) await saveStep(1, education.value);
    if (step.value === 2) await saveStep(2, { status: status.value, jobTitle: jobTitle.value });
    if (step.value === 3) await saveStep(3, { skills: userSkills.value });
    step.value += 1;
  } catch (e) {
    /* error already set */
  }
}

function prevStep() {
  step.value -= 1;
}

async function finish() {
  try {
    await saveStep(4, { careerId: targetCareer.value });
    await auth.refreshUser();
    router.push('/dashboard');
  } catch (e) {
    /* error already set */
  }
}
</script>

<style scoped>
.onboarding { padding: 3rem 1.5rem; max-width: 640px; }
.onboarding-header { margin-bottom: 1.5rem; }
.step-label { font-size: 0.85rem; color: var(--text-dim); display: block; margin-bottom: 0.5rem; font-weight: 600; }
.step-card { min-height: 360px; display: flex; flex-direction: column; }
.step-card h2 { font-size: 1.4rem; }

.checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-dim); }

.option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; }
.option-card {
  text-align: left;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.option-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.option-card span { font-size: 0.8rem; color: var(--text-dim); }
.option-card.active { background: var(--accent); color: #ffffff; border-color: var(--accent); }
.option-card.active span { color: #e0e0fc; }
.career-card { grid-column: span 1; }

.skill-search { position: relative; margin-top: 1rem; }
.skill-suggestions {
  margin-top: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.suggestion-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.85rem;
  background: var(--surface-2);
  color: var(--text);
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--accent-soft); }

.selected-skills-box {
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.selected-skills-heading { font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text); }
.selected-skills-heading span { color: var(--accent); font-weight: 700; }
.selected-skills { display: flex; flex-direction: column; gap: 0.5rem; }
.selected-skill-row { display: flex; align-items: center; gap: 0.75rem; }
.selected-skill-name { flex: 1; font-weight: 500; }
.level-select { width: 150px; }
.empty-hint { font-size: 0.85rem; margin: 0; }

.step-actions { display: flex; align-items: center; margin-top: 2rem; }

@media (max-width: 600px) {
  .option-grid { grid-template-columns: 1fr; }
  .selected-skill-row { flex-wrap: wrap; }
}
</style>
FILEEOF
echo 'wrote src/views/Onboarding.vue'

cat > 'src/views/SkillDetail.vue' << 'FILEEOF'
<template>
  <main class="container skill-page" v-if="!loading && skill">
    <router-link to="/roadmap" class="back-link">← Back to roadmap</router-link>

    <header class="skill-header">
      <div>
        <span class="skill-category">{{ skill.category }}</span>
        <h1>{{ skill.name }}</h1>
      </div>
      <span v-if="personalization" class="badge" :class="levelBadgeClass">
        Your level: {{ levelLabel(personalization.userLevel) }}
      </span>
    </header>

    <section class="card">
      <h2>What is {{ skill.name }}?</h2>
      <p>{{ skill.description }}</p>
    </section>

    <section class="card">
      <h2>Why do you need it?</h2>
      <p>{{ skill.whyItMatters }}</p>
      <div v-if="personalization && personalization.requiredLevel" class="requirement-box">
        <div><span class="req-label">Required for {{ personalization.careerName }}</span><strong>{{ levelLabel(personalization.requiredLevel) }}</strong></div>
        <div><span class="req-label">Your level</span><strong>{{ levelLabel(personalization.userLevel) }}</strong></div>
        <div>
          <span class="req-label">Status</span>
          <strong :class="meetsRequirement ? 'status-good' : 'status-pending'">
            {{ meetsRequirement ? 'Requirement met' : 'Keep learning' }}
          </strong>
        </div>
      </div>
    </section>

    <section class="card" v-if="skill.useCases?.length">
      <h2>Where is it used?</h2>
      <ul class="chip-list">
        <li v-for="u in skill.useCases" :key="u" class="chip">{{ u }}</li>
      </ul>
    </section>

    <section class="card" v-if="course">
      <h2>What you'll learn</h2>
      <p>{{ course.description }}</p>

      <div class="progress-row">
        <span class="progress-row-label">Course progress</span>
        <div class="simple-bar-track">
          <div class="simple-bar-fill" :style="{ width: courseProgress + '%' }"></div>
        </div>
        <span class="progress-row-value">{{ courseProgress }}%</span>
      </div>

      <div class="levels">
        <div v-for="level in levels" :key="level._id" class="level-block">
          <h3>{{ level.name }}</h3>
          <div v-for="mod in level.modules" :key="mod.title" class="module-block">
            <ul class="lesson-list">
              <li v-for="lesson in mod.lessons" :key="lesson._id" class="lesson-item">
                <label class="lesson-check">
                  <input
                    type="checkbox"
                    :checked="completedIds.has(lesson._id)"
                    @change="toggleLesson(lesson._id, level._id, $event.target.checked)"
                  />
                  <span :class="{ 'lesson-done': completedIds.has(lesson._id) }">{{ lesson.title }}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="card" v-if="skill.prerequisites?.length || skill.relatedSkills?.length">
      <h2>Prerequisites &amp; related skills</h2>
      <div v-if="skill.prerequisites?.length" class="related-row">
        <span class="req-label">Before this:</span>
        <router-link v-for="p in skill.prerequisites" :key="p._id" :to="`/skills/${p.slug}`" class="chip chip-link">{{ p.name }}</router-link>
      </div>
      <div v-if="skill.relatedSkills?.length" class="related-row">
        <span class="req-label">Related:</span>
        <router-link v-for="r in skill.relatedSkills" :key="r._id" :to="`/skills/${r.slug}`" class="chip chip-link">{{ r.name }}</router-link>
      </div>
    </section>

    <section class="card" v-if="skill.resources?.length">
      <h2>Learning resources</h2>
      <p class="resource-note">YouTube resources open a search for that exact course, so the link never goes dead if a specific video is removed later — pick the video that looks best to you.</p>
      <div class="resource-list">
        <a v-for="(r, i) in skill.resources" :key="i" :href="r.url" target="_blank" rel="noopener" class="resource-item">
          <span class="resource-type">{{ r.type }}</span>
          <span class="resource-title">{{ r.title }}</span>
          <span class="resource-provider">{{ r.provider }}</span>
        </a>
      </div>
    </section>

    <section class="card" v-if="skill.futureScope">
      <h2>Future scope</h2>
      <p>{{ skill.futureScope }}</p>
    </section>
  </main>
  <main v-else class="container">
    <p class="loading">Loading skill…</p>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const loading = ref(true);
const skill = ref(null);
const course = ref(null);
const levels = ref([]);
const courseProgress = ref(0);
const personalization = ref(null);
const completedIds = ref(new Set());

async function load() {
  loading.value = true;
  const { data } = await api.get(`/skills/${route.params.slug}`);
  skill.value = data.skill;
  course.value = data.course;
  levels.value = data.levels || [];
  courseProgress.value = data.courseProgress || 0;
  personalization.value = data.personalization;
  completedIds.value = new Set(data.completedLessonIds || []);
  loading.value = false;
}

onMounted(load);
watch(() => route.params.slug, load);

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}

const meetsRequirement = computed(
  () => personalization.value && personalization.value.userLevel >= personalization.value.requiredLevel
);
const levelBadgeClass = computed(() => (meetsRequirement.value ? 'badge-done' : 'badge-progress'));

async function toggleLesson(lessonId, levelId, checked) {
  const action = checked ? 'complete' : 'uncomplete';
  const { data } = await api.put(`/progress/lesson/${lessonId}/${action}`, {
    levelId,
    courseId: course.value._id
  });
  const next = new Set(completedIds.value);
  if (checked) next.add(lessonId);
  else next.delete(lessonId);
  completedIds.value = next;
  courseProgress.value = data.courseProgress;
}
</script>

<style scoped>
.skill-page { padding: 2rem 1.5rem 4rem; max-width: 780px; display: flex; flex-direction: column; gap: 1.25rem; }
.back-link { font-size: 0.85rem; color: var(--text-dim); }
.loading { padding: 4rem 0; text-align: center; color: var(--text-dim); }

.skill-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.skill-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--accent); font-weight: 600; }
.skill-header h1 { font-size: 1.9rem; margin-top: 0.25rem; }

.requirement-box {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.requirement-box > div { display: flex; flex-direction: column; gap: 0.15rem; }
.req-label { font-size: 0.75rem; color: var(--text-dim); }
.status-good { color: var(--done); }
.status-pending { color: var(--progress); }

.chip-list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
}
.chip-link { color: var(--text); }
.chip-link:hover { border-color: var(--accent); text-decoration: none; }

.related-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }

.progress-row { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0 1.5rem; }
.progress-row-label { font-size: 0.85rem; color: var(--text-dim); white-space: nowrap; }
.simple-bar-track { flex: 1; height: 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
.simple-bar-fill { height: 100%; background: var(--accent); }
.progress-row-value { font-size: 0.85rem; font-weight: 600; min-width: 2.5rem; text-align: right; }

.levels { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.level-block h3 { font-size: 1rem; color: var(--accent); margin-bottom: 0.5rem; }
.lesson-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.lesson-item { padding: 0.55rem 0.8rem; background: var(--surface-2); border-radius: 10px; }
.lesson-check { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.9rem; }
.lesson-done { text-decoration: line-through; color: var(--text-dim); }

.resource-note { font-size: 0.8rem; margin-bottom: 0.75rem; }
.resource-list { display: flex; flex-direction: column; gap: 0.5rem; }
.resource-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: var(--surface-2);
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--text);
}
.resource-item:hover { border-color: var(--accent); text-decoration: none; }
.resource-type {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  min-width: 90px;
}
.resource-title { flex: 1; font-size: 0.9rem; }
.resource-provider { font-size: 0.8rem; color: var(--text-dim); }
</style>
FILEEOF
echo 'wrote src/views/SkillDetail.vue'

cat > 'src/views/Dashboard.vue' << 'FILEEOF'
<template>
  <main class="container dashboard">
    <div v-if="loading" class="loading">Loading your dashboard…</div>

    <template v-else-if="data.career">
      <header class="dash-header">
        <h1>Hello, {{ auth.user?.name?.split(' ')[0] }} 👋</h1>
        <p>Target career: <strong>{{ data.career.name }}</strong></p>
      </header>

      <div class="card overall-card">
        <div class="overall-top">
          <span class="overall-label">Overall progress</span>
          <span class="overall-pct">{{ data.overallProgress }}%</span>
        </div>
        <ProgressBar :percent="data.overallProgress" :show-label="false" />
      </div>

      <div class="stat-grid">
        <div class="card stat-card">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Skills completed</span>
        </div>
        <div class="card stat-card">
          <span class="stat-value">{{ inProgressCount }}</span>
          <span class="stat-label">In progress</span>
        </div>
        <div class="card stat-card">
          <span class="stat-value">{{ notStartedCount }}</span>
          <span class="stat-label">Not started</span>
        </div>
      </div>

      <section class="card chart-card">
        <h2>Skill progress</h2>
        <SkillProgressChart :data="chartData" />
      </section>

      <section class="card next-steps">
        <h2>Your next steps</h2>
        <ol v-if="orderedRemaining.length">
          <li v-for="n in orderedRemaining" :key="n.skillId">
            <router-link :to="`/skills/${n.slug}`">
              {{ n.status === 'in_progress' ? 'Continue' : 'Start' }} {{ n.name }}
            </router-link>
            <span class="badge" :class="badgeClass(n.status)">{{ statusLabel(n.status) }}</span>
          </li>
        </ol>
        <p v-else>You've completed every required skill for {{ data.career.name }}. 🎉</p>
      </section>

      <div class="dash-cta">
        <router-link to="/roadmap" class="btn btn-primary">View full roadmap</router-link>
      </div>
    </template>

    <template v-else>
      <div class="card empty-state">
        <h2>No target career set yet</h2>
        <p>Finish onboarding to generate your personalized roadmap.</p>
        <router-link to="/onboarding" class="btn btn-primary">Complete onboarding</router-link>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import ProgressBar from '../components/ProgressBar.vue';
import SkillProgressChart from '../components/SkillProgressChart.vue';

const auth = useAuthStore();
const loading = ref(true);
const data = ref({ career: null, nodes: [], overallProgress: 0 });

onMounted(async () => {
  try {
    const { data: res } = await api.get('/progress');
    data.value = res;
  } finally {
    loading.value = false;
  }
});

const completedCount = computed(() => data.value.nodes.filter((n) => n.status === 'completed').length);
const inProgressCount = computed(() => data.value.nodes.filter((n) => n.status === 'in_progress').length);
const notStartedCount = computed(() => data.value.nodes.filter((n) => n.status === 'not_started').length);

const orderedRemaining = computed(() =>
  data.value.nodes.filter((n) => n.status !== 'completed').slice(0, 4)
);

const chartData = computed(() =>
  data.value.nodes.map((n) => ({ name: n.name, percent: n.percent, status: n.status }))
);

function statusLabel(status) {
  return { completed: 'Done', in_progress: 'In progress', not_started: 'Not started' }[status];
}
function badgeClass(status) {
  return { completed: 'badge-done', in_progress: 'badge-progress', not_started: 'badge-notstarted' }[status];
}
</script>

<style scoped>
.dashboard { padding: 2.5rem 1.5rem; max-width: 800px; }
.loading { padding: 4rem 0; text-align: center; color: var(--text-dim); }
.dash-header h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
.dash-header p { margin-bottom: 2rem; }

.overall-card { margin-bottom: 1.5rem; }
.overall-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem; }
.overall-label { color: var(--text-dim); font-size: 0.9rem; }
.overall-pct { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; }

.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { text-align: center; }
.stat-value { display: block; font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 0.8rem; color: var(--text-dim); }

.chart-card { margin-bottom: 1.5rem; }
.chart-card h2 { font-size: 1.1rem; margin-bottom: 1rem; }
.next-steps h2 { font-size: 1.1rem; margin-bottom: 1rem; }
.next-steps ol { list-style: decimal; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
.next-steps li { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }

.dash-cta { margin-top: 2rem; }

.empty-state { text-align: center; padding: 3rem 1.5rem; }
.empty-state h2 { margin-bottom: 0.5rem; }

@media (max-width: 600px) {
  .stat-grid { grid-template-columns: 1fr 1fr; }
}
</style>
FILEEOF
echo 'wrote src/views/Dashboard.vue'

cat > 'src/views/Profile.vue' << 'FILEEOF'
<template>
  <main class="container profile-page">
    <h1>Profile</h1>

    <section class="card">
      <h2>{{ auth.user?.name }}</h2>
      <p>{{ auth.user?.email }}</p>
    </section>

    <section class="card" v-if="!loading">
      <h2>Education</h2>
      <p>
        {{ profileData.profile.education?.degree || 'Not set' }}
        <span v-if="profileData.profile.education?.field"> in {{ profileData.profile.education.field }}</span>
        <span v-if="profileData.profile.education?.gradYear"> · Class of {{ profileData.profile.education.gradYear }}</span>
      </p>

      <h2 style="margin-top: 1.5rem;">Current status</h2>
      <p>
        {{ statusLabel(profileData.profile.status) }}
        <span v-if="profileData.profile.jobTitle"> — {{ profileData.profile.jobTitle }}</span>
      </p>
    </section>

    <section class="card" v-if="!loading && profileData.targetCareer">
      <h2>Target career</h2>
      <p>{{ profileData.targetCareer.name }} — {{ roadmap.overallProgress }}% complete</p>

      <h3 style="margin-top: 1rem; font-size: 0.95rem;">Declared skills</h3>
      <ul class="skill-list" v-if="profileData.skills.length">
        <li v-for="s in profileData.skills" :key="s.skill._id">
          {{ s.skill.name }}: <strong>{{ levelLabel(s.level) }}</strong>
        </li>
      </ul>
      <p v-else>No skills declared yet.</p>
    </section>

    <router-link to="/onboarding" class="btn btn-secondary">Update onboarding info</router-link>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const auth = useAuthStore();
const loading = ref(true);
const profileData = ref({ profile: {}, skills: [], targetCareer: null });
const roadmap = ref({ overallProgress: 0 });

onMounted(async () => {
  try {
    const { data } = await api.get('/users/profile');
    profileData.value = data;
    if (data.targetCareer) {
      const { data: r } = await api.get('/progress');
      roadmap.value = r;
    }
  } finally {
    loading.value = false;
  }
});

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}
function statusLabel(status) {
  return { student: 'Student', fresher: 'Fresher / recently graduated', employed: 'Currently employed' }[status] || 'Not set';
}
</script>

<style scoped>
.profile-page { padding: 2.5rem 1.5rem 4rem; max-width: 680px; display: flex; flex-direction: column; gap: 1.25rem; }
.profile-page h1 { font-size: 1.6rem; }
.skill-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
</style>
FILEEOF
echo 'wrote src/views/Profile.vue'

echo "All frontend files updated. Restart your dev server (Ctrl+C then npm run dev) and hard-refresh the browser."
