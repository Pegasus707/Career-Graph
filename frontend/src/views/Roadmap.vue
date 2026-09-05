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
          <div class="header-actions">
            <div class="view-mode-toggle">
              <button
                type="button"
                class="btn-toggle-view"
                :class="{ active: viewMode === 'canvas' }"
                @click="setViewMode('canvas')"
                title="Switch to interactive canvas node graph"
              >
                🗺️ Canvas Graph
              </button>
              <button
                type="button"
                class="btn-toggle-view"
                :class="{ active: viewMode === 'flow' }"
                @click="setViewMode('flow')"
                title="Switch to structured phase flow"
              >
                📋 Phase Flow
              </button>
            </div>
            <button type="button" class="btn btn-secondary btn-switch" @click="openCareerModal">
              Switch / Choose Another Career &rarr;
            </button>
          </div>
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

      <!-- INTERACTIVE CANVAS GRAPH VIEW -->
      <div v-if="viewMode === 'canvas'" class="canvas-view-container">
        <!-- Floating HUD Controls -->
        <div class="canvas-hud">
          <div class="hud-left">
            <div class="hud-group">
              <button type="button" class="hud-btn" @click="zoomIn" title="Zoom In">+</button>
              <span class="hud-zoom-val">{{ Math.round(zoom * 100) }}%</span>
              <button type="button" class="hud-btn" @click="zoomOut" title="Zoom Out">−</button>
            </div>
            <button type="button" class="hud-btn hud-reset" @click="resetCanvasView" title="Center View & Reset Zoom">
              ⟲ Center
            </button>
          </div>
          <div class="hud-right">
            <div class="hud-legend-bar">
              <span class="hud-item"><i class="dot dot-done"></i> Done</span>
              <span class="hud-item"><i class="dot dot-progress"></i> In progress</span>
              <span class="hud-item"><i class="dot dot-todo"></i> Not started</span>
              <span class="hud-item"><i class="dot dot-locked"></i> Locked</span>
            </div>
          </div>
        </div>

        <div
          ref="canvasViewportRef"
          class="canvas-viewport"
          :class="{ 'is-panning': isDragging }"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @wheel.prevent="onWheel"
        >
          <!-- Canvas Stage -->
          <div
            ref="canvasStageRef"
            class="canvas-stage"
            :style="{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '50% 50px'
            }"
          >
            <!-- Dynamic SVG Bezier Connectors Layer -->
            <svg class="canvas-svg-layer">
              <defs>
                <marker
                  id="canvas-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(148, 163, 184, 0.45)" />
                </marker>
                <marker
                  id="canvas-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
                </marker>
                <marker
                  id="canvas-arrow-done"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
                </marker>
              </defs>

              <path
                v-for="edge in computedEdges"
                :key="edge.id"
                :d="edge.d"
                class="canvas-bezier-edge"
                :class="{
                  'edge-highlighted': edge.isHighlighted,
                  'edge-dimmed': hoveredSkillId && !edge.isHighlighted,
                  'edge-done': edge.isDone && !edge.isHighlighted
                }"
                :marker-end="edge.isHighlighted ? 'url(#canvas-arrow-active)' : (edge.isDone ? 'url(#canvas-arrow-done)' : 'url(#canvas-arrow)')"
              />
            </svg>

            <!-- Canvas Root Career Node -->
            <div id="canvas-node-root" class="canvas-root-badge">
              <span class="root-badge-label">Target Career</span>
              <h2>{{ data.career.name }}</h2>
              <span class="root-badge-pct">{{ data.overallProgress }}% Mastered</span>
            </div>

            <!-- Canvas Phases Groups -->
            <div class="canvas-phases-stage">
              <div
                v-for="(phase, pIndex) in (data.phases || [])"
                :key="phase.id"
                class="canvas-phase-group"
                :class="{ 'phase-locked': isPhaseLocked(pIndex) }"
              >
                <!-- Phase Header -->
                <div class="canvas-phase-header">
                  <div class="canvas-phase-title-row">
                    <span class="canvas-phase-pill">Phase {{ pIndex + 1 }}</span>
                    <span v-if="isPhaseLocked(pIndex)" class="canvas-lock-badge">🔒 Locked</span>
                    <h3>{{ phase.title }}</h3>
                  </div>
                  <span class="canvas-phase-progress">{{ phase.completedCount }} / {{ phase.totalCount }} Done</span>
                </div>

                <!-- Phase Nodes Row -->
                <div class="canvas-nodes-row">
                  <div
                    v-for="node in phase.nodes"
                    :id="`canvas-node-${node.skillId}`"
                    :key="node.skillId"
                    class="canvas-skill-card"
                    :class="[
                      statusClass(resolveNodeStatus(node), isNodeLocked(node, pIndex)),
                      {
                        'node-hovered': hoveredSkillId === node.skillId,
                        'node-path-active': activePathSkillIds.has(node.skillId),
                        'node-path-dimmed': hoveredSkillId && !activePathSkillIds.has(node.skillId),
                        'node-is-locked': isNodeLocked(node, pIndex),
                        updating: updatingSkillId === node.skillId
                      }
                    ]"
                    @mouseenter="setHoveredSkill(node.skillId)"
                    @mouseleave="clearHoveredSkill"
                    @contextmenu.prevent="openContextMenu($event, node, pIndex)"
                  >
                    <div class="canvas-card-body" @click="handleNodeClick(node, pIndex)">
                      <div class="canvas-card-top">
                        <span v-if="isNodeLocked(node, pIndex)" class="canvas-card-lock">🔒</span>
                        <span class="canvas-card-name">{{ node.name }}</span>
                      </div>
                      <div class="canvas-card-footer">
                        <span class="canvas-card-pct">
                          {{ isNodeLocked(node, pIndex) ? '' : (resolveNodeStatus(node) === 'completed' ? '100%' : `${node.percent}%`) }}
                        </span>
                        <button
                          type="button"
                          class="canvas-card-status-pill"
                          :class="badgeClass(resolveNodeStatus(node), isNodeLocked(node, pIndex))"
                          :disabled="updatingSkillId === node.skillId || isNodeLocked(node, pIndex)"
                          @click.stop="handleQuickStatusClick(node, pIndex)"
                          :title="isNodeLocked(node, pIndex) ? resolveLockedReason(node, pIndex) : 'Click to cycle status'"
                        >
                          <span v-if="updatingSkillId === node.skillId" class="spinner"></span>
                          <template v-else>
                            <span class="status-icon">{{ statusIcon(resolveNodeStatus(node), isNodeLocked(node, pIndex)) }}</span>
                            <span class="status-text">{{ statusLabel(resolveNodeStatus(node), isNodeLocked(node, pIndex)) }}</span>
                          </template>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p class="canvas-footer-hint">
          💡 <strong>Canvas Tips:</strong> Drag background to pan • Scroll to zoom • Hover over a skill node to highlight its prerequisite path • Click node to slide out lesson drawer.
        </p>
      </div>

      <!-- STRUCTURED PHASE FLOW VIEW (Classic Mode) -->
      <div v-else class="flow-view-container">
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
      </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
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

const viewMode = ref(localStorage.getItem('cg_roadmap_view') || 'canvas');

// Canvas Pan & Zoom State
const canvasViewportRef = ref(null);
const canvasStageRef = ref(null);
const zoom = ref(1);
const pan = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// Hovered Skill ID for Upstream/Downstream tracing
const hoveredSkillId = ref(null);
const nodePositions = ref({});

function setViewMode(mode) {
  viewMode.value = mode;
  localStorage.setItem('cg_roadmap_view', mode);
  if (mode === 'canvas') {
    nextTick(() => {
      setTimeout(measureNodePositions, 80);
    });
  }
}

function zoomIn() {
  zoom.value = Math.min(1.6, Math.round((zoom.value + 0.15) * 100) / 100);
  nextTick(measureNodePositions);
}

function zoomOut() {
  zoom.value = Math.max(0.45, Math.round((zoom.value - 0.15) * 100) / 100);
  nextTick(measureNodePositions);
}

function resetCanvasView() {
  zoom.value = 1;
  pan.value = { x: 0, y: 0 };
  nextTick(measureNodePositions);
}

function onWheel(e) {
  const delta = e.deltaY < 0 ? 0.08 : -0.08;
  zoom.value = Math.min(1.6, Math.max(0.45, Math.round((zoom.value + delta) * 100) / 100));
  nextTick(measureNodePositions);
}

function onMouseDown(e) {
  if (
    e.target.closest('.canvas-skill-card') ||
    e.target.closest('.canvas-hud') ||
    e.target.closest('button')
  ) {
    return;
  }
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX - pan.value.x,
    y: e.clientY - pan.value.y
  };
}

function onMouseMove(e) {
  if (!isDragging.value) return;
  pan.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  };
}

function onMouseUp() {
  isDragging.value = false;
}

function setHoveredSkill(skillId) {
  hoveredSkillId.value = skillId;
}

function clearHoveredSkill() {
  hoveredSkillId.value = null;
}

// Active path skills: Upstream prerequisites + Downstream dependents
const activePathSkillIds = computed(() => {
  if (!hoveredSkillId.value) return new Set();
  const set = new Set([hoveredSkillId.value]);
  const allNodes = data.value.nodes || [];

  function walkUp(id) {
    const node = allNodes.find((n) => n.skillId?.toString() === id?.toString());
    if (node && node.prerequisites) {
      node.prerequisites.forEach((p) => {
        if (!set.has(p.skillId)) {
          set.add(p.skillId);
          walkUp(p.skillId);
        }
      });
    }
  }

  function walkDown(id) {
    allNodes.forEach((n) => {
      const isDep = (n.prerequisites || []).some((p) => p.skillId?.toString() === id?.toString());
      if (isDep && !set.has(n.skillId)) {
        set.add(n.skillId);
        walkDown(n.skillId);
      }
    });
  }

  walkUp(hoveredSkillId.value);
  walkDown(hoveredSkillId.value);
  return set;
});

function measureNodePositions() {
  if (!canvasStageRef.value || viewMode.value !== 'canvas') return;
  const stageBox = canvasStageRef.value.getBoundingClientRect();
  const z = zoom.value || 1;
  const posMap = {};

  const rootEl = document.getElementById('canvas-node-root');
  if (rootEl) {
    const box = rootEl.getBoundingClientRect();
    posMap['root'] = {
      x: (box.left - stageBox.left + box.width / 2) / z,
      yBottom: (box.bottom - stageBox.top) / z,
      yTop: (box.top - stageBox.top) / z
    };
  }

  (data.value.nodes || []).forEach((node) => {
    const el = document.getElementById(`canvas-node-${node.skillId}`);
    if (el) {
      const box = el.getBoundingClientRect();
      posMap[node.skillId] = {
        x: (box.left - stageBox.left + box.width / 2) / z,
        yBottom: (box.bottom - stageBox.top) / z,
        yTop: (box.top - stageBox.top) / z
      };
    }
  });

  nodePositions.value = posMap;
}

const computedEdges = computed(() => {
  if (viewMode.value !== 'canvas') return [];
  const pos = nodePositions.value;
  if (!pos || Object.keys(pos).length === 0) return [];

  const edges = [];
  const allNodes = data.value.nodes || [];
  const nodeMap = {};
  allNodes.forEach((n) => {
    nodeMap[n.skillId] = n;
  });

  allNodes.forEach((node) => {
    const toPos = pos[node.skillId];
    if (!toPos) return;

    const prereqs = node.prerequisites || [];
    let hasDrawnExplicit = false;

    prereqs.forEach((prereq) => {
      const fromPos = pos[prereq.skillId];
      if (fromPos) {
        hasDrawnExplicit = true;
        const isHighlighted =
          activePathSkillIds.value.has(prereq.skillId) &&
          activePathSkillIds.value.has(node.skillId);
        const isDone =
          isNodeCompleted(nodeMap[prereq.skillId]) && isNodeCompleted(node);

        const deltaY = Math.max(30, Math.abs(toPos.yTop - fromPos.yBottom) * 0.5);
        const pathD = `M ${fromPos.x} ${fromPos.yBottom} C ${fromPos.x} ${fromPos.yBottom + deltaY}, ${toPos.x} ${toPos.yTop - deltaY}, ${toPos.x} ${toPos.yTop}`;

        edges.push({
          id: `${prereq.skillId}->${node.skillId}`,
          fromId: prereq.skillId,
          toId: node.skillId,
          d: pathD,
          isHighlighted,
          isDone
        });
      }
    });

    if (!hasDrawnExplicit && node.phaseId === 'foundations' && pos['root']) {
      const fromPos = pos['root'];
      const isHighlighted =
        hoveredSkillId.value === node.skillId ||
        activePathSkillIds.value.has(node.skillId);
      const isDone = isNodeCompleted(node);

      const deltaY = Math.max(25, Math.abs(toPos.yTop - fromPos.yBottom) * 0.5);
      const pathD = `M ${fromPos.x} ${fromPos.yBottom} C ${fromPos.x} ${fromPos.yBottom + deltaY}, ${toPos.x} ${toPos.yTop - deltaY}, ${toPos.x} ${toPos.yTop}`;

      edges.push({
        id: `root->${node.skillId}`,
        fromId: 'root',
        toId: node.skillId,
        d: pathD,
        isHighlighted,
        isDone
      });
    }
  });

  return edges;
});

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null
});

async function loadRoadmapData() {
  try {
    await roadmapStore.fetchRoadmap(route.params.careerId);
    await nextTick();
    setTimeout(measureNodePositions, 100);
  } catch (err) {
    console.error('Failed to load roadmap data:', err);
  }
}

onMounted(() => {
  loadRoadmapData();
  window.addEventListener('resize', measureNodePositions);
});

onUnmounted(() => {
  window.removeEventListener('resize', measureNodePositions);
});

watch(
  () => data.value,
  () => {
    nextTick(() => setTimeout(measureNodePositions, 100));
  },
  { deep: true }
);

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-mode-toggle {
  display: flex;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px;
  gap: 3px;
}

.btn-toggle-view {
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-toggle-view:hover {
  color: var(--text);
}

.btn-toggle-view.active {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.btn-switch {
  white-space: nowrap;
  font-size: 0.85rem;
  padding: 0.55rem 1rem;
}

/* ==========================================================================
   CANVAS GRAPH VIEW STYLES
   ========================================================================== */
.canvas-view-container {
  margin-top: 1.5rem;
  position: relative;
}

.canvas-viewport {
  position: relative;
  width: 100%;
  height: 740px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  background-color: #f8fafc;
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  cursor: grab;
  user-select: none;
  box-shadow: 0 4px 24px -2px rgba(15, 23, 42, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.canvas-viewport.is-panning {
  cursor: grabbing;
}

.canvas-hud {
  position: absolute;
  top: 1.1rem;
  left: 1.25rem;
  right: 1.25rem;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  gap: 1rem;
  flex-wrap: wrap;
}

.hud-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.hud-right {
  display: flex;
  align-items: center;
}

.hud-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 3px;
  pointer-events: auto;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.hud-btn {
  background: transparent;
  border: none;
  color: #334155;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 700;
  transition: all 0.15s ease;
}

.hud-btn:hover {
  background: #f1f5f9;
  color: var(--accent);
}

.hud-reset {
  width: auto;
  padding: 0 0.9rem;
  height: 38px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  pointer-events: auto;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hud-reset:hover {
  background: #f8fafc;
  border-color: var(--accent);
  color: var(--accent);
}

.hud-zoom-val {
  min-width: 46px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.hud-legend-bar {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #334155;
  font-weight: 600;
  pointer-events: auto;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.canvas-footer-hint {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-top: 0.85rem;
  text-align: center;
}

.canvas-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem 6rem;
  will-change: transform;
}

.canvas-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.canvas-bezier-edge {
  fill: none;
  stroke: #cbd5e1;
  stroke-width: 2.2px;
  transition: stroke 0.25s ease, stroke-width 0.25s ease, opacity 0.25s ease;
}

.canvas-bezier-edge.edge-done {
  stroke: #10b981;
  stroke-width: 2.5px;
}

.canvas-bezier-edge.edge-highlighted {
  stroke: #6366f1;
  stroke-width: 3.5px;
  stroke-dasharray: 8 5;
  animation: flowDash 0.9s linear infinite;
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.6));
}

@keyframes flowDash {
  to {
    stroke-dashoffset: -26;
  }
}

.canvas-bezier-edge.edge-dimmed {
  opacity: 0.15;
}

/* Canvas Root Badge */
.canvas-root-badge {
  position: relative;
  z-index: 2;
  background: #ffffff;
  border: 2px solid #6366f1;
  border-radius: 16px;
  padding: 0.9rem 2.2rem;
  text-align: center;
  box-shadow: 0 8px 30px -4px rgba(99, 102, 241, 0.18), 0 0 0 4px rgba(99, 102, 241, 0.06);
  margin-bottom: 2.8rem;
}

.root-badge-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  color: #6366f1;
  display: block;
  margin-bottom: 0.25rem;
}

.canvas-root-badge h2 {
  font-size: 1.35rem;
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.root-badge-pct {
  display: inline-block;
  font-size: 0.78rem;
  color: #4338ca;
  background: #eef2ff;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-weight: 700;
}

/* Canvas Phases Stage */
.canvas-phases-stage {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  width: 100%;
  max-width: 1100px;
  position: relative;
  z-index: 2;
}

.canvas-phase-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.35rem 1.75rem 1.6rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.canvas-phase-group.phase-locked {
  background: rgba(248, 250, 252, 0.75);
  border-style: dashed;
  border-color: #cbd5e1;
  box-shadow: none;
}

.canvas-phase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.85rem;
}

.canvas-phase-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.canvas-phase-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #eef2ff;
  color: #4f46e5;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #e0e7ff;
}

.canvas-lock-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #e11d48;
  background: #ffe4e6;
  border: 1px solid #fecdd3;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.canvas-phase-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.canvas-phase-progress {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
}

/* Canvas Nodes Row */
.canvas-nodes-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

/* Canvas Skill Card */
.canvas-skill-card {
  width: 215px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 2px 8px -1px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.25s ease;
}

.canvas-skill-card:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  box-shadow: 0 12px 24px -4px rgba(99, 102, 241, 0.2);
}

.canvas-skill-card.node-hovered,
.canvas-skill-card.node-path-active {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px #6366f1, 0 8px 24px rgba(99, 102, 241, 0.25);
  transform: translateY(-4px);
}

.canvas-skill-card.node-path-dimmed {
  opacity: 0.35;
}

.canvas-skill-card.node-done {
  border-color: #10b981;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.canvas-skill-card.node-progress {
  border-color: #f59e0b;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
}

.canvas-skill-card.node-is-locked {
  opacity: 0.7;
  border-style: dashed;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.canvas-card-body {
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.canvas-card-top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.canvas-card-lock {
  font-size: 0.85rem;
}

.canvas-card-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.canvas-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.45rem;
  border-top: 1px solid #f1f5f9;
}

.canvas-card-pct {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 700;
}

.canvas-card-status-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.canvas-card-status-pill:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: scale(1.04);
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
