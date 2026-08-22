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
