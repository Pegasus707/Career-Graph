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
              <div>
                <span class="req-label">Proof of Skill</span>
                <span class="badge" :class="isVerified ? 'badge-verified' : 'badge-unverified'">
                  {{ isVerified ? '🛡️ Verified' : 'Unverified' }}
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
                  <div class="level-header-row">
                    <h4 class="level-name">{{ level.name }}</h4>
                    <span v-if="level.name === 'Advanced'" class="level-phase-tag">Verification Gate</span>
                  </div>
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

              <!-- Proof of Skill Action Banner (Visible only when user reaches the Advanced phase or is already verified) -->
              <div v-if="hasReachedAdvanced || isVerified" class="proof-card" :class="{ 'is-verified': isVerified }">
                <div class="proof-content">
                  <span class="proof-badge-icon">{{ isVerified ? '🛡️' : '🎓' }}</span>
                  <div class="proof-text">
                    <h4 class="proof-title">{{ isVerified ? 'Skill Verified' : 'Advanced Phase Reached!' }}</h4>
                    <p class="proof-desc">
                      {{ isVerified ? 'You passed the validation quiz and earned the Verified Badge.' : 'You’ve reached the Advanced phase! Pass the 3-question quiz (at least 2/3 correct) to earn your official 🛡️ Verified Badge.' }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn proof-action-btn"
                  :class="isVerified ? 'btn-secondary' : 'btn-primary'"
                  @click="$emit('open-quiz', { skill, isCompleted, courseProgress })"
                >
                  {{ isVerified ? 'Retake Quiz 🔄' : 'Take Quiz to Verify 🛡️' }}
                </button>
              </div>

              <!-- Locked notice when user has not yet reached Advanced phase -->
              <div v-else class="proof-locked-notice">
                <span class="proof-locked-icon">🔒</span>
                <div class="proof-locked-text">
                  <span class="proof-locked-title">Proof of Skill Quiz Locked</span>
                  <p class="proof-locked-desc">
                    Complete the Beginner and Intermediate lessons above to reach the Advanced phase and unlock the 3-question verification quiz.
                  </p>
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

const emit = defineEmits(['close', 'progress-updated', 'open-quiz']);
const userStore = useUserStore();

const loading = ref(false);
const skill = ref(null);
const course = ref(null);
const levels = ref([]);
const courseProgress = ref(0);
const isVerified = ref(false);
const quizScore = ref(0);
const personalization = ref(null);
const completedIds = ref(new Set());

const LEVEL_LABELS = ['None', 'Beginner', 'Know a little basics', 'Know everything', 'Know everything'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}

const meetsRequirement = computed(
  () => personalization.value && personalization.value.userLevel >= 3
);

/**
 * Checks if user has progressed to Advanced phase:
 * 1. Already verified.
 * 2. Onboarding/profile declared userLevel >= 3.
 * 3. Course progress >= 66%.
 * 4. All Beginner and Intermediate level lessons checked.
 */
const hasReachedAdvanced = computed(() => {
  if (isVerified.value) return true;
  if (personalization.value && personalization.value.userLevel >= 3) return true;
  if (courseProgress.value >= 66) return true;

  if (levels.value && levels.value.length > 0) {
    const nonAdvancedLevels = levels.value.filter((lvl) => lvl.name !== 'Advanced');
    if (nonAdvancedLevels.length === 0) return true;

    let totalNonAdvanced = 0;
    let completedNonAdvanced = 0;

    for (const lvl of nonAdvancedLevels) {
      for (const mod of lvl.modules || []) {
        for (const lesson of mod.lessons || []) {
          totalNonAdvanced++;
          if (completedIds.value.has(lesson._id)) {
            completedNonAdvanced++;
          }
        }
      }
    }

    if (totalNonAdvanced > 0 && completedNonAdvanced >= totalNonAdvanced) {
      return true;
    }
  }

  return false;
});

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
  () => isVerified.value || meetsRequirement.value || courseProgress.value === 100 || isGloballyCompleted.value
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
    isVerified.value = !!data.verified;
    quizScore.value = data.quizScore || 0;
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

    if (data.courseProgress === 100 && skill.value) {
      userStore.addCompletedSkill(skill.value._id);
      userStore.addCompletedSkill(skill.value.slug);
      if (skill.value.skillId) userStore.addCompletedSkill(skill.value.skillId);
    } else if (data.courseProgress < 100 && skill.value) {
      if (!personalization.value || personalization.value.userLevel < 3) {
        userStore.removeCompletedSkill(skill.value._id);
        userStore.removeCompletedSkill(skill.value.slug);
        if (skill.value.skillId) userStore.removeCompletedSkill(skill.value.skillId);
      }
    }

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
  box-sizing: border-box;
}

@media (max-width: 580px) {
  .drawer-panel {
    max-width: 100%;
  }
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
  padding-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
}

.requirement-banner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(105px, 1fr));
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-sizing: border-box;
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

.level-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.level-name {
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
}

.level-phase-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  min-width: 0;
  box-sizing: border-box;
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
  flex-shrink: 0;
}

.resource-title {
  flex: 1;
  min-width: 0;
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

/* Proof of Skill Card */
.proof-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  margin-top: 1.25rem;
  box-sizing: border-box;
}

.proof-card.is-verified {
  background: #f0fdf4;
  border-color: #86efac;
}

.proof-locked-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  margin-top: 1.25rem;
  box-sizing: border-box;
}

.proof-locked-icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.proof-locked-text {
  flex: 1;
}

.proof-locked-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.2rem;
}

.proof-locked-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.proof-content {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.proof-badge-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.proof-text {
  flex: 1;
}

.proof-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.2rem 0;
}

.proof-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.4;
}

.proof-action-btn {
  width: 100%;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.55rem 1rem;
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
