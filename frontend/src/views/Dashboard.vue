<template>
  <main class="container dashboard">
    <div v-if="roadmapStore.loading && !data.career" class="loading">
      <span class="loading-spinner"></span>
      <p>Loading your dashboard…</p>
    </div>

    <div v-else-if="roadmapStore.error && !data.career" class="card error-card">
      <h2>Something went wrong</h2>
      <p>{{ roadmapStore.error }}</p>
      <button class="btn btn-secondary" @click="roadmapStore.fetchDashboardProgress()">Retry</button>
    </div>

    <template v-else-if="data.career">
      <header class="dash-header">
        <div class="dash-header-main">
          <div>
            <h1>Hello, {{ auth.user?.name?.split(' ')[0] }} 👋</h1>
            <div class="career-indicator-row">
              <span class="career-indicator-label">Target career:</span>
              <strong class="career-indicator-name">{{ data.career.name }}</strong>
              <span v-if="userStream" class="stream-pill">🎓 Stream: {{ userStream }}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-switch-track" @click="openCareerModal">
            Switch Career Track &rarr;
          </button>
        </div>
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
        <p>Choose a career track restricted to your stream or finish onboarding.</p>
        <div class="empty-actions">
          <button type="button" class="btn btn-primary" @click="openCareerModal">
            Select Career Track
          </button>
          <router-link to="/onboarding" class="btn btn-secondary">Complete Onboarding</router-link>
        </div>
      </div>
    </template>

    <!-- Career Track Selector Modal (Conditional Career Selection based on Stream) -->
    <Teleport to="body">
      <div v-if="isCareerModalOpen" class="modal-backdrop" @click.self="closeCareerModal">
        <div class="modal-card">
          <header class="modal-header">
            <div>
              <h2>Select Career Track</h2>
              <p>Choose a career track tailored for your profile.</p>
            </div>
            <button type="button" class="modal-close" @click="closeCareerModal" aria-label="Close modal">&times;</button>
          </header>

          <div class="modal-filter-bar">
            <div class="filter-stream-info">
              <span v-if="filterStreamActive && userStream">
                🎓 Restricted to your stream: <strong>{{ userStream }}</strong>
              </span>
              <span v-else>
                🌐 Showing all available career tracks
              </span>
            </div>
            <button
              v-if="userStream"
              type="button"
              class="btn-toggle-filter"
              @click="toggleStreamFilter"
            >
              {{ filterStreamActive ? 'Show all tracks' : `Filter by ${userStream}` }}
            </button>
          </div>

          <div v-if="loadingCareers" class="modal-loading">
            <span class="loading-spinner"></span>
            <p>Loading matching career tracks…</p>
          </div>

          <div v-else-if="filteredCareers.length === 0" class="modal-empty">
            <p>No career tracks specifically match "<strong>{{ userStream }}</strong>".</p>
            <button type="button" class="btn btn-secondary btn-sm" @click="toggleStreamFilter">
              Show all available tracks
            </button>
          </div>

          <div v-else class="career-selection-grid">
            <div
              v-for="c in filteredCareers"
              :key="c._id"
              class="career-selection-card"
              :class="{ active: data.career?.id === c._id || data.career?._id === c._id }"
              @click="selectCareerTrack(c._id)"
            >
              <div class="career-card-info">
                <h3>{{ c.name }}</h3>
                <p>{{ c.description }}</p>
              </div>
              <div class="career-card-footer">
                <span v-if="data.career?.id === c._id || data.career?._id === c._id" class="badge-active">
                  ✓ Active Track
                </span>
                <span v-else class="badge-select">
                  Select Track &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useRoadmapStore } from '../stores/roadmap';
import ProgressBar from '../components/ProgressBar.vue';
import SkillProgressChart from '../components/SkillProgressChart.vue';

const auth = useAuthStore();
const userStore = useUserStore();
const roadmapStore = useRoadmapStore();

const isCareerModalOpen = ref(false);
const filterStreamActive = ref(true);

const userStream = computed(() => userStore.userStream || auth.user?.profile?.education?.field || '');
const userDegree = computed(() => userStore.userDegree || auth.user?.profile?.education?.degree || '');

onMounted(async () => {
  try {
    await roadmapStore.fetchDashboardProgress();
  } catch (e) {
    // Handled in store
  }
});

const data = computed(() => roadmapStore.roadmap);
const loadingCareers = computed(() => roadmapStore.loadingCareers);
const filteredCareers = computed(() => roadmapStore.careers);

const completedCount = computed(() => (data.value.nodes || []).filter((n) => n.status === 'completed').length);
const inProgressCount = computed(() => (data.value.nodes || []).filter((n) => n.status === 'in_progress').length);
const notStartedCount = computed(() => (data.value.nodes || []).filter((n) => n.status === 'not_started').length);

const orderedRemaining = computed(() =>
  (data.value.nodes || []).filter((n) => n.status !== 'completed').slice(0, 4)
);

const chartData = computed(() =>
  (data.value.nodes || []).map((n) => ({ name: n.name, percent: n.percent, status: n.status }))
);

async function loadCareersList() {
  try {
    const filters = {};
    if (filterStreamActive.value && userStream.value) {
      filters.stream = userStream.value;
    }
    if (userDegree.value) {
      filters.degree = userDegree.value;
    }
    await roadmapStore.fetchCareers(filters);
  } catch (err) {
    console.error('Failed to load careers:', err);
  }
}

async function openCareerModal() {
  isCareerModalOpen.value = true;
  filterStreamActive.value = true;
  await loadCareersList();
}

function closeCareerModal() {
  isCareerModalOpen.value = false;
}

async function toggleStreamFilter() {
  filterStreamActive.value = !filterStreamActive.value;
  await loadCareersList();
}

async function selectCareerTrack(careerId) {
  if (careerId === data.value.career?.id || careerId === data.value.career?._id) {
    closeCareerModal();
    return;
  }
  try {
    await userStore.updateTargetCareer(careerId);
    await roadmapStore.fetchDashboardProgress();
    closeCareerModal();
  } catch (err) {
    console.error('Failed to switch career track:', err);
  }
}

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

.dash-header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.dash-header h1 { font-size: 1.6rem; margin-bottom: 0.4rem; }

.career-indicator-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.career-indicator-label { color: var(--text-dim); font-size: 0.95rem; }
.career-indicator-name { font-size: 1.05rem; color: var(--text); }
.stream-pill {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.btn-switch-track {
  white-space: nowrap;
  font-size: 0.85rem;
  padding: 0.55rem 1rem;
}

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
.empty-actions { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }

/* Career Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-size: 1.3rem; margin: 0 0 0.2rem; }
.modal-header p { font-size: 0.85rem; color: var(--text-dim); margin: 0; }
.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.82rem;
}
.filter-stream-info { color: var(--text); }
.btn-toggle-filter {
  background: transparent;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
  padding: 0;
}

.modal-loading { padding: 3rem 1.5rem; text-align: center; color: var(--text-dim); }
.modal-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.career-selection-grid {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.career-selection-card {
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.career-selection-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.career-selection-card.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.career-card-info h3 { font-size: 1rem; margin: 0 0 0.35rem; color: var(--text); }
.career-card-info p { font-size: 0.8rem; color: var(--text-dim); margin: 0; line-height: 1.35; }
.badge-active {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--surface);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  align-self: flex-start;
}
.badge-select {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
}
.career-selection-card:hover .badge-select { color: var(--accent); }

@media (max-width: 600px) {
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .career-selection-grid { grid-template-columns: 1fr; }
}
</style>
