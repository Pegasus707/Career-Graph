<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card">
        <header class="modal-header">
          <div>
            <h2>Select Career Track</h2>
            <p>Choose an IT career roadmap tailored to your educational stream.</p>
          </div>
          <button type="button" class="modal-close" @click="$emit('close')" aria-label="Close modal">&times;</button>
        </header>

        <div class="modal-filter-bar" v-if="userStream">
          <div class="filter-stream-info">
            <span v-if="!showAll">🎓 Recommended for: <strong>{{ userStream }}</strong></span>
            <span v-else>🌐 All Career Tracks ({{ careers.length }})</span>
          </div>
          <button
            type="button"
            class="btn-toggle-filter"
            @click="toggleShowAll"
          >
            {{ showAll ? `Filter by ${userStream}` : 'Browse all tracks →' }}
          </button>
        </div>

        <div v-if="loading" class="modal-loading">
          <span class="loading-spinner"></span>
          <p>Loading matching career tracks…</p>
        </div>

        <div v-else-if="careers.length === 0" class="modal-empty">
          <p>No career tracks found matching stream "<strong>{{ userStream }}</strong>".</p>
          <button type="button" class="btn btn-secondary btn-sm" @click="toggleShowAll">
            Browse All Available Tracks
          </button>
        </div>

        <div v-else class="career-selection-grid">
          <div
            v-for="c in careers"
            :key="c._id"
            class="career-selection-card"
            :class="{ active: currentCareerId === c._id }"
            @click="handleSelect(c._id)"
          >
            <div class="career-card-info">
              <div class="career-card-title-row">
                <h3>{{ c.name }}</h3>
                <span v-if="c.category" class="category-pill">{{ c.category }}</span>
              </div>
              <p>{{ c.description }}</p>
            </div>
            <div class="career-card-footer">
              <span v-if="currentCareerId === c._id" class="badge-active">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '../stores/user';
import { useRoadmapStore } from '../stores/roadmap';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentCareerId: { type: String, default: '' }
});

const emit = defineEmits(['close', 'select']);

const userStore = useUserStore();
const roadmapStore = useRoadmapStore();

const showAll = ref(false);
const userStream = computed(() => userStore.userStream);
const careers = computed(() => roadmapStore.careers);
const loading = computed(() => roadmapStore.loadingCareers);

async function loadCareers() {
  try {
    if (showAll.value) {
      await roadmapStore.fetchCareers({ all: true });
    } else {
      await roadmapStore.fetchCareers({
        stream: userStream.value || undefined,
        degree: userStore.userDegree || undefined
      });
    }
  } catch (err) {
    console.error('Failed to load careers:', err);
  }
}

function toggleShowAll() {
  showAll.value = !showAll.value;
  loadCareers();
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadCareers();
    }
  },
  { immediate: true }
);

function handleSelect(careerId) {
  emit('select', careerId);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h2 {
  font-size: 1.35rem;
  margin: 0 0 0.25rem 0;
  color: var(--text);
}

.modal-header p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  line-height: 1;
}

.modal-close:hover {
  color: var(--text);
}

.modal-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.75rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.filter-stream-info {
  color: var(--accent);
  font-weight: 500;
}

.modal-loading {
  padding: 3rem;
  text-align: center;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.modal-empty {
  padding: 3rem;
  text-align: center;
  color: var(--text-dim);
}

.career-selection-grid {
  padding: 1.5rem 1.75rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  overflow-y: auto;
}

.career-selection-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.15rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
}

.career-selection-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.career-selection-card.active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.08);
}

.career-card-info h3 {
  margin: 0 0 0.35rem 0;
  font-size: 1.05rem;
  color: var(--text);
}

.career-card-info p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-dim);
  line-height: 1.4;
}

.career-card-footer {
  display: flex;
  justify-content: flex-end;
}

.badge-active {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--done);
}

.badge-select {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
}

.btn-toggle-filter {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-toggle-filter:hover {
  background: var(--accent);
  color: #fff;
}

.career-card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.career-card-title-row h3 {
  margin: 0;
}

.category-pill {
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 999px;
  color: var(--accent);
  font-weight: 600;
  white-space: nowrap;
}
</style>
