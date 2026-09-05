<template>
  <main class="container roadmap-page" @click="closeContextMenu">
    <div v-if="loading" class="loading">Building your structured roadmap…</div>

    <template v-else-if="data.career">
      <header class="roadmap-header">
        <div class="roadmap-header-content">
          <div>
            <h1>{{ data.career.name }} Roadmap</h1>
            <p>{{ data.overallProgress }}% complete — structured learning path with skill prerequisite locks.</p>
          </div>
          <button type="button" class="btn btn-secondary btn-switch" @click="openCareerModal">
            Switch / Choose Another Career &rarr;
          </button>
        </div>
      </header>

      <!-- Lock Alert Banner Toast -->
      <transition name="fade">
        <div v-if="toastMessage" class="toast-lock-banner">
          <span class="toast-icon">🔒</span>
          <span>{{ toastMessage }}</span>
          <button type="button" class="toast-close" @click="toastMessage = ''">&times;</button>
        </div>
      </transition>

      <div class="legend">
        <span class="legend-item"><i class="dot dot-done"></i> Completed</span>
        <span class="legend-item"><i class="dot dot-progress"></i> In progress</span>
        <span class="legend-item"><i class="dot dot-todo"></i> Not started</span>
        <span class="legend-item"><i class="dot dot-locked"></i> 🔒 Locked</span>
      </div>

      <div class="graph-wrap">
        <div class="graph-tree">
          <div class="root-node">{{ data.career.name }}</div>
          <div class="connector-v-main"></div>

          <!-- Structured Phases Flow -->
          <div class="phases-container">
            <div
              v-for="(phase, index) in (data.phases || [])"
              :key="phase.id"
              class="phase-section"
            >
              <!-- Phase Header Card -->
              <div class="phase-header" :class="{ 'phase-locked': isPhaseLocked(index) }">
                <div class="phase-title-group">
                  <span class="phase-badge">Phase {{ index + 1 }}</span>
                  <span v-if="isPhaseLocked(index)" class="phase-lock-pill">🔒 Locked</span>
                  <h2 class="phase-title">{{ phase.title }}</h2>
                </div>
                <p class="phase-desc">
                  {{ isPhaseLocked(index) ? (phase.lockedReason || `Complete all skills in Phase ${index} to unlock this phase`) : phase.description }}
                </p>
                <div class="phase-meta">
                  <span class="phase-progress-text">{{ phase.completedCount }} of {{ phase.totalCount }} completed</span>
                  <span class="phase-progress-pct">{{ phase.percent }}%</span>
                </div>
              </div>

              <div class="connector-v-small"></div>

              <!-- Phase Skill Branches -->
              <div class="branches">
                <div v-for="node in phase.nodes" :key="node.skillId" class="branch">
                  <div class="connector-v"></div>
                  <div
                    class="skill-node"
                    :class="[
                      statusClass(resolveNodeStatus(node), isNodeLocked(node, index)),
                      { updating: updatingSkillId === node.skillId, 'node-is-locked': isNodeLocked(node, index) }
                    ]"
                    :title="isNodeLocked(node, index) ? resolveLockedReason(node, index) : ''"
                    @contextmenu.prevent="openContextMenu($event, node, index)"
                  >
                    <div class="skill-node-body" @click="handleNodeClick(node, index)">
                      <div class="skill-node-header-row">
                        <span v-if="isNodeLocked(node, index)" class="lock-icon" title="Locked skill">🔒</span>
                        <span class="skill-node-name">{{ node.name }}</span>
                      </div>
                      <span class="skill-node-pct">
                        {{ isNodeLocked(node, index) ? 'Locked' : (resolveNodeStatus(node) === 'completed' ? '100%' : `${node.percent}%`) }}
                      </span>
                    </div>

                    <button
                      type="button"
                      class="quick-status-btn"
                      :class="badgeClass(resolveNodeStatus(node), isNodeLocked(node, index))"
                      :disabled="updatingSkillId === node.skillId || isNodeLocked(node, index)"
                      @click.stop="handleQuickStatusClick(node, index)"
                      :title="isNodeLocked(node, index) ? resolveLockedReason(node, index) : 'Quick toggle status'"
                    >
                      <span v-if="updatingSkillId === node.skillId" class="spinner"></span>
                      <template v-else>
                        <span class="status-icon">{{ statusIcon(resolveNodeStatus(node), isNodeLocked(node, index)) }}</span>
                        <span class="status-text">{{ statusLabel(resolveNodeStatus(node), isNodeLocked(node, index)) }}</span>
                      </template>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Vertical Connector between phases -->
              <div v-if="index < data.phases.length - 1" class="phase-connector">
                <div class="connector-v-long"></div>
                <div class="connector-arrow">▼</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="tree-hint">
        💡 <strong>Tip:</strong> Click any skill node to slide out the preview drawer. Right-click or use the button for quick status toggling.
      </p>
    </template>

    <template v-else>
      <div class="empty-roadmap-card card">
        <div class="empty-roadmap-icon">🗺️</div>
        <h2>No Target Career Selected</h2>
        <p>{{ roadmapStore.error || 'Please select a career track to generate your personalized learning roadmap.' }}</p>
        <button type="button" class="btn btn-primary" @click="openCareerModal">
          Choose Career Track &rarr;
        </button>
      </div>
    </template>

    <!-- Context Menu for Right Click -->
    <div
      v-if="contextMenu.visible"
      class="roadmap-context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <div class="context-header">{{ contextMenu.node?.name }}</div>
      <template v-if="contextMenu.node?.isLocked">
        <div class="context-locked-warning">
          🔒 Locked<br/>
          <small>{{ contextMenu.node?.lockedReason }}</small>
        </div>
      </template>
      <template v-else>
        <button
          type="button"
          class="context-item"
          :class="{ active: contextMenu.node?.status === 'completed' }"
          @click="selectMenuStatus('completed')"
        >
          <span class="status-icon">✓</span> Mark as Completed
        </button>
        <button
          type="button"
          class="context-item"
          :class="{ active: contextMenu.node?.status === 'in_progress' }"
          @click="selectMenuStatus('in_progress')"
        >
          <span class="status-icon">⚡</span> Mark as In Progress
        </button>
        <button
          type="button"
          class="context-item"
          :class="{ active: contextMenu.node?.status === 'not_started' }"
          @click="selectMenuStatus('not_started')"
        >
          <span class="status-icon">⚪</span> Mark as Not Started
        </button>
      </template>
    </div>

    <!-- Career Selector Modal -->
    <Teleport to="body">
      <div v-if="isCareerModalOpen" class="career-modal-backdrop" @click.self="closeCareerModal">
        <div class="career-modal-card">
          <div class="career-modal-header">
            <div>
              <h2>Choose Your Target Career</h2>
              <p>Select a career track to view its tailored roadmap.</p>
            </div>
            <button type="button" class="close-btn" @click="closeCareerModal">&times;</button>
          </div>

          <div class="modal-filter-bar">
            <span v-if="filterStreamActive && userStore.userStream">
              🎓 Restricted to your stream: <strong>{{ userStore.userStream }}</strong>
            </span>
            <span v-else>
              🌐 Showing all available career tracks
            </span>
            <button
              v-if="userStore.userStream"
              type="button"
              class="btn-toggle-filter"
              @click="toggleStreamFilter"
            >
              {{ filterStreamActive ? 'Show all' : `Filter by ${userStore.userStream}` }}
            </button>
          </div>

          <div v-if="loadingCareers" class="loading-careers">Loading available careers…</div>
          <div v-else-if="careers.length === 0" class="modal-empty-tracks">
            <p>No career tracks specifically match "<strong>{{ userStore.userStream }}</strong>".</p>
            <button type="button" class="btn btn-secondary btn-sm" @click="toggleStreamFilter">
              Show all available tracks
            </button>
          </div>
          <div v-else class="career-grid">
            <div
              v-for="c in careers"
              :key="c._id"
              class="career-card-item"
              :class="{ active: data.career?.id === c._id || data.career?._id === c._id }"
              @click="selectCareer(c._id)"
            >
              <div class="career-card-content">
                <h3>{{ c.name }}</h3>
                <p>{{ c.description }}</p>
              </div>
              <span v-if="data.career?.id === c._id || data.career?._id === c._id" class="current-badge">Active Track</span>
              <span v-else class="select-badge">Select Track &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Quick Topic Preview Drawer -->
    <SkillPreviewDrawer
      :is-open="isDrawerOpen"
      :slug="selectedSkillSlug"
      @close="closeDrawer"
      @progress-updated="handleProgressUpdated"
    />
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRoadmapStore } from '../stores/roadmap';
import { useUserStore } from '../stores/user';
import SkillPreviewDrawer from '../components/SkillPreviewDrawer.vue';

const route = useRoute();
const roadmapStore = useRoadmapStore();
const userStore = useUserStore();

const toastMessage = ref('');
const data = computed(() => roadmapStore.roadmap);
const loading = computed(() => roadmapStore.loading);
const updatingSkillId = computed(() => roadmapStore.updatingSkillId);
const careers = computed(() => roadmapStore.careers);
const loadingCareers = computed(() => roadmapStore.loadingCareers);

const selectedSkillSlug = ref('');
const isDrawerOpen = ref(false);
const isCareerModalOpen = ref(false);
const filterStreamActive = ref(true);

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null
});

async function loadRoadmapData() {
  try {
    await roadmapStore.fetchRoadmap(route.params.careerId);
  } catch (err) {
    console.error('Failed to load roadmap data:', err);
  }
}

onMounted(loadRoadmapData);

function triggerToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
}

// Shared Skill Reflection: Checks if skill was completed across any track in userStore
function isNodeCompleted(node) {
  if (!node) return false;
  if (node.status === 'completed') return true;
  return (
    userStore.isSkillCompleted(node.skillId) ||
    userStore.isSkillCompleted(node.slug) ||
    userStore.isSkillCompleted(node.explicitSkillId)
  );
}

function resolveNodeStatus(node) {
  if (isNodeCompleted(node)) return 'completed';
  return node.status;
}

// Sequential Phase Locking: Verifies all prior phases are 100% finished
function isPhaseLocked(index) {
  if (index === 0) return false;
  const phases = data.value.phases || [];
  for (let i = 0; i < index; i++) {
    const p = phases[i];
    if (!p || !p.nodes) continue;
    const allDone = p.nodes.every((n) => isNodeCompleted(n));
    if (!allDone) return true;
  }
  return false;
}

function isNodeLocked(node, phaseIndex) {
  if (isNodeCompleted(node)) return false;
  if (isPhaseLocked(phaseIndex)) return true;
  return !!node.isLocked;
}

function resolveLockedReason(node, phaseIndex) {
  if (isPhaseLocked(phaseIndex)) {
    const prevTitle = data.value.phases[phaseIndex - 1]?.title || `Phase ${phaseIndex}`;
    return `Locked: Complete all skills in ${prevTitle} first`;
  }
  return node.lockedReason || 'Complete prerequisites first';
}

function handleNodeClick(node, phaseIndex) {
  if (isNodeLocked(node, phaseIndex)) {
    triggerToast(`🔒 ${resolveLockedReason(node, phaseIndex)}`);
    return;
  }
  openDrawer(node.slug);
}

function handleQuickStatusClick(node, phaseIndex) {
  if (isNodeLocked(node, phaseIndex)) {
    triggerToast(`🔒 ${resolveLockedReason(node, phaseIndex)}`);
    return;
  }
  cycleStatus(node);
}


async function loadModalCareers() {
  try {
    if (filterStreamActive.value && userStore.userStream) {
      await roadmapStore.fetchCareers({ stream: userStore.userStream });
    } else {
      await roadmapStore.fetchCareers({ all: true });
    }
  } catch (err) {
    console.error('Failed to load careers:', err);
  }
}

async function openCareerModal() {
  isCareerModalOpen.value = true;
  filterStreamActive.value = true;
  await loadModalCareers();
}

async function toggleStreamFilter() {
  filterStreamActive.value = !filterStreamActive.value;
  await loadModalCareers();
}

function closeCareerModal() {
  isCareerModalOpen.value = false;
}

async function selectCareer(careerId) {
  const currentId = data.value.career?.id || data.value.career?._id;
  if (careerId === currentId) {
    closeCareerModal();
    return;
  }
  try {
    await userStore.updateTargetCareer(careerId);
    await roadmapStore.fetchRoadmap(careerId);
    closeCareerModal();
  } catch (err) {
    console.error('Failed to update target career:', err);
  }
}

function openDrawer(slug) {
  selectedSkillSlug.value = slug;
  isDrawerOpen.value = true;
}

function closeDrawer() {
  isDrawerOpen.value = false;
}

function handleProgressUpdated() {
  loadRoadmapData();
}

const NEXT_STATUS = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started'
};

async function cycleStatus(node) {
  const next = NEXT_STATUS[node.status] || 'in_progress';
  await setStatus(node, next);
}

async function setStatus(node, targetStatus) {
  if (updatingSkillId.value) return;
  try {
    await roadmapStore.setSkillStatus(node.skillId, targetStatus);
  } catch (err) {
    const msg = roadmapStore.error || err.response?.data?.message || 'Failed to update skill status';
    triggerToast(`🔒 ${msg}`);
  } finally {
    closeContextMenu();
  }
}

function openContextMenu(event, node) {
  contextMenu.visible = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.node = node;
}

function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.node = null;
}

function selectMenuStatus(targetStatus) {
  if (contextMenu.node) {
    if (contextMenu.node.isLocked) {
      triggerToast(`🔒 ${contextMenu.node.lockedReason}`);
      closeContextMenu();
      return;
    }
    setStatus(contextMenu.node, targetStatus);
  }
}


function statusClass(status, isLocked) {
  if (isLocked) return 'node-locked';
  return { completed: 'node-done', in_progress: 'node-progress', not_started: 'node-todo' }[status];
}
function statusLabel(status, isLocked) {
  if (isLocked) return 'Locked';
  return { completed: 'Done', in_progress: 'Learning', not_started: 'Start' }[status];
}
function statusIcon(status, isLocked) {
  if (isLocked) return '🔒';
  return { completed: '✓', in_progress: '⚡', not_started: '+' }[status];
}
function badgeClass(status, isLocked) {
  if (isLocked) return 'badge-quick-locked';
  return { completed: 'badge-quick-done', in_progress: 'badge-quick-progress', not_started: 'badge-quick-todo' }[status];
}
</script>

<style scoped>
.roadmap-page { padding: 2.5rem 1.5rem 4rem; position: relative; }
.loading { padding: 4rem 0; text-align: center; color: var(--text-dim); }

.empty-roadmap-card {
  text-align: center;
  padding: 3.5rem 2rem;
  margin: 2rem auto;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-roadmap-icon { font-size: 3rem; }
.empty-roadmap-card h2 { font-size: 1.4rem; margin: 0; }
.empty-roadmap-card p { color: var(--text-dim); margin: 0; }

.roadmap-header h1 { font-size: 1.7rem; margin-bottom: 0.25rem; }
.roadmap-header p { margin: 0; color: var(--text-dim); }
.roadmap-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.btn-switch {
  white-space: nowrap;
  font-size: 0.85rem;
  padding: 0.55rem 1rem;
}

.toast-lock-banner {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 3000;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  font-weight: 600;
}
.toast-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #991b1b;
  cursor: pointer;
  margin-left: 0.5rem;
}

.legend { display: flex; gap: 1.25rem; margin: 1.25rem 0 2rem; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
.dot { width: 9px; height: 9px; border-radius: 999px; display: inline-block; }
.dot-done { background: var(--done); }
.dot-progress { background: var(--progress); }
.dot-todo { background: #cbd5e1; }
.dot-locked { background: #94a3b8; }

.graph-wrap { overflow-x: auto; padding: 1rem 0 2rem; }
.graph-tree { display: flex; flex-direction: column; align-items: center; min-width: 640px; }

.root-node {
  padding: 0.85rem 1.6rem;
  border-radius: 12px;
  background: var(--accent);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.connector-v-main { width: 2px; height: 32px; background: var(--border); }
.connector-v-small { width: 2px; height: 18px; background: var(--border); }

.phases-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0;
}

.phase-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.phase-header {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1rem 1.5rem;
  min-width: 320px;
  max-width: 520px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.phase-title-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 0.25rem;
}
.phase-badge {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.phase-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.phase-desc { font-size: 0.82rem; color: var(--text-dim); margin: 0.2rem 0 0.6rem; }
.phase-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-dim);
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
  margin-top: 0.4rem;
}
.phase-progress-pct { font-weight: 700; color: var(--accent); }

.phase-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}
.connector-v-long { width: 2px; height: 36px; background: var(--border); }
.connector-arrow { color: var(--text-dim); font-size: 0.75rem; margin-top: -4px; }

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
  gap: 0.5rem;
  padding: 0.85rem 1.15rem 0.65rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  min-width: 135px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}
.skill-node:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.skill-node.updating { opacity: 0.6; pointer-events: none; }

.skill-node-body {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  width: 100%;
}
.skill-node-header-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.lock-icon { font-size: 0.8rem; }
.skill-node-name { font-weight: 600; color: var(--text); font-size: 0.9rem; }
.skill-node-pct { font-size: 0.75rem; color: var(--text-dim); }

.quick-status-btn {
  border: none;
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: background-color 0.15s ease, transform 0.1s ease;
  outline: none;
}
.quick-status-btn:hover:not(:disabled) { transform: scale(1.05); }

.badge-quick-done { background: var(--done); color: #ffffff; }
.badge-quick-progress { background: var(--progress); color: #1e293b; }
.badge-quick-todo { background: var(--surface-2); color: var(--text-dim); border: 1px solid var(--border); }
.badge-quick-locked { background: #f1f5f9; color: #94a3b8; border: 1px solid #cbd5e1; cursor: not-allowed; }

.node-done { background: var(--done-soft); border-color: #bbf0ce; }
.node-done .skill-node-name { color: var(--done); }
.node-progress { background: var(--progress-soft); border-color: #fde3a3; }
.node-progress .skill-node-name { color: var(--progress); }
.node-todo { background: var(--surface); }
.node-locked { background: #f8fafc; border-color: #e2e8f0; opacity: 0.75; }
.node-locked .skill-node-name { color: #64748b; }

.tree-hint { font-size: 0.85rem; color: var(--text-dim); text-align: center; margin-top: 2rem; }

/* Context Menu */
.roadmap-context-menu {
  position: fixed;
  z-index: 1000;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  padding: 0.4rem;
  min-width: 170px;
}
.context-header {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-dim);
  padding: 0.35rem 0.6rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.context-locked-warning {
  padding: 0.5rem 0.6rem;
  font-size: 0.8rem;
  color: #991b1b;
  background: #fef2f2;
  border-radius: 6px;
  line-height: 1.3;
}
.context-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.45rem 0.6rem;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.82rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s ease;
}
.context-item:hover { background: var(--accent-soft); }
.context-item.active { font-weight: 700; color: var(--accent); }

/* Career Modal */
.career-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.career-modal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.career-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.career-modal-header h2 { font-size: 1.3rem; margin: 0 0 0.2rem; }
.career-modal-header p { font-size: 0.85rem; color: var(--text-dim); margin: 0; }
.close-btn {
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
  color: var(--text);
}
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
.modal-empty-tracks {
  padding: 2.5rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.loading-careers { padding: 3rem 1.5rem; text-align: center; color: var(--text-dim); }
.career-grid {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.career-card-item {
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
.career-card-item:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.career-card-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.career-card-content h3 { font-size: 1rem; margin: 0 0 0.35rem; color: var(--text); }
.career-card-content p { font-size: 0.8rem; color: var(--text-dim); margin: 0; line-height: 1.35; }
.current-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--surface);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  align-self: flex-start;
}
.select-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
}
.career-card-item:hover .select-badge { color: var(--accent); }

.spinner {
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 700px) {
  .graph-tree { min-width: 100%; }
  .branches { flex-wrap: wrap; }
  .branches::before { display: none; }
  .phase-header { min-width: 100%; }
  .career-grid { grid-template-columns: 1fr; }
}
</style>
