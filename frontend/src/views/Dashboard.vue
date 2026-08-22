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
