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
