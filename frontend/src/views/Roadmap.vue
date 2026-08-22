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
