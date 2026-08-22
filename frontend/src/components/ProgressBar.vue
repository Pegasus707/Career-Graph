<template>
  <div class="progress-wrap">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: pct + '%' }"></div>
    </div>
    <span v-if="showLabel" class="progress-label">{{ pct }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percent: { type: Number, default: 0 },
  showLabel: { type: Boolean, default: true }
});

const pct = computed(() => Math.max(0, Math.min(100, Math.round(props.percent || 0))));
</script>

<style scoped>
.progress-wrap { display: flex; align-items: center; gap: 0.75rem; }
.progress-track { flex: 1; }
.progress-label { font-size: 0.85rem; font-weight: 600; color: var(--text-dim); min-width: 2.5rem; text-align: right; }
</style>
