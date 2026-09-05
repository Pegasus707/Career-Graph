<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="isOpen" class="drawer-backdrop" @click="close">
        <div class="drawer-panel" @click.stop>
          <header class="drawer-header">
            <div class="header-info">
              <span class="skill-category" v-if="skill">{{ skill.category }}</span>
              <h2>{{ skill ? skill.name : 'Loading...' }}</h2>
            </div>
            <button class="close-btn" @click="close" aria-label="Close drawer">&times;</button>
          </header>

          <div v-if="loading" class="drawer-loading">
            Loading skill details…
          </div>

          <div v-else-if="skill" class="drawer-body">
            <!-- Header Badges & Level Requirement -->
            <div class="requirement-banner">
              <div v-if="personalization">
                <span class="req-label">Required Level</span>
                <strong>{{ levelLabel(personalization.requiredLevel) }}</strong>
              </div>
              <div>
                <span class="req-label">Your Level</span>
                <strong>{{ levelLabel(isCompleted ? 4 : (personalization?.userLevel || 0)) }}</strong>
              </div>
              <div>
                <span class="req-label">Status</span>
                <span class="badge" :class="isCompleted ? 'badge-done' : 'badge-progress'">
                  {{ isCompleted ? '✓ Completed' : 'In Progress' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <section class="drawer-section">
              <h3>Overview</h3>
              <p>{{ skill.description }}</p>
            </section>

            <!-- Interactive Curriculum -->
            <section class="drawer-section" v-if="course">
              <div class="section-title-row">
                <h3>Curriculum &amp; Lessons</h3>
                <span class="progress-pct">{{ isCompleted ? 100 : courseProgress }}% Completed</span>
              </div>

              <div class="progress-track">
                <div class="progress-fill" :style="{ width: (isCompleted ? 100 : courseProgress) + '%' }"></div>
              </div>

              <div class="levels-container">
                <div v-for="level in levels" :key="level._id" class="level-group">
                  <h4 class="level-name">{{ level.name }}</h4>
                  <div v-for="mod in level.modules" :key="mod.title" class="module-group">
                    <ul class="lesson-list">
                      <li v-for="lesson in mod.lessons" :key="lesson._id" class="lesson-item">
                        <label class="lesson-label">
                          <input
                            type="checkbox"
                            :checked="isCompleted || completedIds.has(lesson._id)"
                            @change="handleToggleLesson(lesson._id, level._id, $event.target.checked)"
                          />
                          <span :class="{ 'lesson-done': isCompleted || completedIds.has(lesson._id) }">{{ lesson.title }}</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <!-- Learning Resources -->
            <section class="drawer-section" v-if="skill.resources?.length">
              <h3>Learning Resources</h3>
              <div class="resource-list">
                <a
                  v-for="(r, i) in skill.resources"
                  :key="i"
                  :href="r.url"
                  target="_blank"
                  rel="noopener"
                  class="resource-link"
                >
                  <span class="resource-badge">{{ r.type }}</span>
                  <span class="resource-title">{{ r.title }}</span>
                  <span class="resource-provider">{{ r.provider }}</span>
                </a>
              </div>
            </section>

            <!-- Footer Link directly to SkillDetail.vue -->
            <div class="drawer-footer">
              <router-link :to="`/skills/${skill.slug}`" class="btn btn-primary btn-full full-page-btn" @click="close">
                Full Page &amp; Resources &rarr;
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import { useUserStore } from '../stores/user';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  slug: { type: String, default: '' }
});

const emit = defineEmits(['close', 'progress-updated']);
const userStore = useUserStore();

const loading = ref(false);
const skill = ref(null);
const course = ref(null);
const levels = ref([]);
const courseProgress = ref(0);
const personalization = ref(null);
const completedIds = ref(new Set());

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}

const meetsRequirement = computed(
  () => personalization.value && personalization.value.userLevel >= personalization.value.requiredLevel
);

// Shared Skill Reflection: Check if skill is completed across any track in userStore
const isGloballyCompleted = computed(() => {
  if (!skill.value) return false;
  return (
    userStore.isSkillCompleted(skill.value._id) ||
    userStore.isSkillCompleted(skill.value.slug) ||
    userStore.isSkillCompleted(skill.value.skillId)
  );
});

const isCompleted = computed(
  () => meetsRequirement.value || courseProgress.value === 100 || isGloballyCompleted.value
);

async function loadSkillData() {
  if (!props.slug) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/skills/${props.slug}`);
    skill.value = data.skill;
    course.value = data.course;
    levels.value = data.levels || [];
    courseProgress.value = data.courseProgress || 0;
    personalization.value = data.personalization;
    completedIds.value = new Set(data.completedLessonIds || []);
  } catch (err) {
    console.error('Failed to load skill preview:', err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [props.isOpen, props.slug],
  ([open, slug]) => {
    if (open && slug) {
      loadSkillData();
    } else if (!open) {
      skill.value = null;
    }
  },
  { immediate: true }
);

async function handleToggleLesson(lessonId, levelId, checked) {
  try {
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

    // Emit event so Roadmap.vue updates its node status and overall percentage live
    emit('progress-updated', { slug: props.slug, courseProgress: data.courseProgress });
  } catch (err) {
    console.error('Failed to update lesson progress:', err);
  }
}

function close() {
  emit('close');
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 100%;
  max-width: 520px;
  height: 100%;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  background: var(--surface);
}

.header-info h2 {
  font-size: 1.35rem;
  margin: 0.2rem 0 0;
}

.skill-category {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}
.close-btn:hover {
  color: var(--text);
  background: var(--surface-2);
}

.drawer-loading {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-dim);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.requirement-banner {
  display: flex;
  gap: 1.25rem;
  padding: 1rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  flex-wrap: wrap;
}
.requirement-banner > div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.req-label {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.drawer-section h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.section-title-row h3 {
  margin: 0;
}
.progress-pct {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
}

.levels-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.level-name {
  font-size: 0.85rem;
  color: var(--accent);
  margin-bottom: 0.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.lesson-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lesson-item {
  padding: 0.5rem 0.75rem;
  background: var(--surface-2);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.15s ease;
}
.lesson-item:hover {
  border-color: var(--border);
}

.lesson-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text);
}

.lesson-done {
  text-decoration: line-through;
  color: var(--text-dim);
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.85rem;
  transition: border-color 0.15s ease, transform 0.12s ease;
}
.resource-link:hover {
  border-color: var(--accent);
  text-decoration: none;
  transform: translateX(2px);
}

.resource-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--accent);
  min-width: 65px;
}

.resource-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-provider {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.drawer-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-full {
  width: 100%;
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-active .drawer-panel,
.drawer-fade-leave-active .drawer-panel {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-from .drawer-panel,
.drawer-fade-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
