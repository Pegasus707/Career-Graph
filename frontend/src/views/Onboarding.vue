<template>
  <main class="container onboarding">
    <div class="onboarding-header">
      <span class="step-label">Step {{ step }} of 4</span>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: (step / 4) * 100 + '%' }"></div>
      </div>
    </div>

    <div class="card step-card">
      <!-- STEP 1: EDUCATION -->
      <section v-if="step === 1">
        <h2>Tell us about your education</h2>
        <p>This helps us understand your starting point.</p>

        <label class="label">Highest degree</label>
        <select v-model="education.degree" class="input-field">
          <option value="">Select…</option>
          <option>High School</option>
          <option>Diploma</option>
          <option>Bachelor's Degree</option>
          <option>Master's Degree</option>
          <option>Other</option>
        </select>

        <label class="label" style="margin-top: 1rem;">Field of study</label>
        <input v-model="education.field" type="text" class="input-field" placeholder="e.g. Computer Engineering" />

        <label class="label" style="margin-top: 1rem;">Graduation year</label>
        <input v-model.number="education.gradYear" type="number" class="input-field" placeholder="e.g. 2027" />

        <label class="checkbox-row" style="margin-top: 1rem;">
          <input type="checkbox" v-model="education.stillStudying" />
          I'm still studying
        </label>
      </section>

      <!-- STEP 2: CURRENT STATUS -->
      <section v-else-if="step === 2">
        <h2>What best describes you right now?</h2>
        <p>We'll tailor recommendations to your current stage.</p>

        <div class="option-grid">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            class="option-card"
            :class="{ active: status === opt.value }"
            @click="status = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-if="status === 'employed'" style="margin-top: 1rem;">
          <label class="label">Job title</label>
          <input v-model="jobTitle" type="text" class="input-field" placeholder="e.g. Frontend Developer Intern" />
        </div>
      </section>

      <!-- STEP 3: EXISTING SKILLS -->
      <section v-else-if="step === 3">
        <h2>What skills do you already have?</h2>
        <p>Search, add a skill, and set how confident you are with it.</p>

        <div class="skill-search">
          <input v-model="skillQuery" type="text" class="input-field" placeholder="Search skills… (e.g. JavaScript)" />
          <div v-if="filteredSkills.length" class="skill-suggestions">
            <button
              v-for="s in filteredSkills"
              :key="s._id"
              type="button"
              class="suggestion-item"
              @click="addSkill(s)"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <div class="selected-skills-box">
          <h3 class="selected-skills-heading">
            Your skills <span v-if="userSkills.length">({{ userSkills.length }})</span>
          </h3>
          <div v-if="userSkills.length" class="selected-skills">
            <div v-for="row in userSkills" :key="row.skill" class="selected-skill-row">
              <span class="selected-skill-name">{{ skillName(row.skill) }}</span>
              <select v-model.number="row.level" class="input-field level-select">
                <option :value="1">Beginner</option>
                <option :value="2">Intermediate</option>
                <option :value="3">Advanced</option>
                <option :value="4">Expert</option>
              </select>
              <button type="button" class="btn btn-ghost" @click="removeSkill(row.skill)">Remove</button>
            </div>
          </div>
          <p v-else class="empty-hint">Nothing added yet — search above and click a skill to add it here, or skip if you're starting fresh.</p>
        </div>
      </section>

        <!-- STEP 4: TARGET CAREER -->
      <section v-else-if="step === 4">
        <h2>What do you want to become?</h2>
        <p>We'll compare this career's required skills against what you already know.</p>

        <div v-if="education.field" class="stream-info-badge">
          <span>🎓 Filtered for stream: <strong>{{ education.field }}</strong></span>
          <button type="button" class="btn-clear-filter" @click="clearStreamFilter">Show all</button>
        </div>

        <div v-if="roadmapStore.loadingCareers" class="loading-box">
          <span class="loading-spinner"></span>
          <p>Loading matching career tracks…</p>
        </div>

        <div v-else-if="careers.length === 0" class="empty-careers-hint">
          <p>No tracks specifically matched "<strong>{{ education.field }}</strong>".</p>
          <button type="button" class="btn btn-secondary btn-sm" @click="clearStreamFilter">Browse all available tracks</button>
        </div>

        <div v-else class="option-grid">
          <button
            v-for="c in careers"
            :key="c._id"
            type="button"
            class="option-card career-card"
            :class="{ active: targetCareer === c._id }"
            @click="targetCareer = c._id"
          >
            <strong>{{ c.name }}</strong>
            <span>{{ c.description }}</span>
          </button>
        </div>
      </section>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="step-actions">
        <button v-if="step > 1" type="button" class="btn btn-secondary" @click="prevStep">Back</button>
        <div style="flex: 1;"></div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || !canProceed"
          @click="step < 4 ? nextStep() : finish()"
        >
          {{ loading ? 'Saving…' : step < 4 ? 'Next' : 'Finish → Generate My Roadmap' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useRoadmapStore } from '../stores/roadmap';

const router = useRouter();
const auth = useAuthStore();
const userStore = useUserStore();
const roadmapStore = useRoadmapStore();

const step = ref(1);
const loading = ref(false);
const error = ref('');

// Step 1
const education = ref({
  degree: userStore.userDegree || '',
  field: userStore.userStream || '',
  gradYear: null,
  stillStudying: false
});

// Step 2
const status = ref('');
const jobTitle = ref('');
const statusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'fresher', label: 'Fresher / recently graduated' },
  { value: 'employed', label: 'Currently employed' }
];

// Step 3
const allSkills = ref([]);
const skillQuery = ref('');
const userSkills = ref([]); // [{ skill: id, level: n }]

const filteredSkills = computed(() => {
  if (!skillQuery.value.trim()) return [];
  const q = skillQuery.value.toLowerCase();
  const already = new Set(userSkills.value.map((r) => r.skill));
  return allSkills.value.filter((s) => s.name.toLowerCase().includes(q) && !already.has(s._id)).slice(0, 6);
});

function skillName(id) {
  const s = allSkills.value.find((sk) => sk._id === id);
  return s ? s.name : '';
}

function addSkill(skill) {
  userSkills.value.push({ skill: skill._id, level: 2 });
  skillQuery.value = '';
}

function removeSkill(id) {
  userSkills.value = userSkills.value.filter((r) => r.skill !== id);
}

// Step 4
const careers = computed(() => roadmapStore.careers);
const targetCareer = ref('');

onMounted(async () => {
  try {
    const [skillsRes] = await Promise.all([
      api.get('/skills'),
      roadmapStore.fetchCareers({ stream: education.value.field, degree: education.value.degree })
    ]);
    allSkills.value = skillsRes.data.skills;
  } catch (err) {
    console.error('Failed to initialize onboarding data:', err);
  }
});

const canProceed = computed(() => {
  if (step.value === 1) return !!education.value.degree;
  if (step.value === 2) return !!status.value;
  if (step.value === 3) return true; // skills are optional
  if (step.value === 4) return !!targetCareer.value;
  return true;
});

async function saveStep(stepNum, data) {
  loading.value = true;
  error.value = '';
  try {
    await api.put('/users/onboarding', { step: stepNum, data });
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not save. Please try again.';
    throw err;
  } finally {
    loading.value = false;
  }
}

async function nextStep() {
  try {
    if (step.value === 1) {
      await saveStep(1, education.value);
      userStore.setDegreePreference(education.value.degree);
      userStore.setStreamPreference(education.value.field);
      // Refresh career list dynamically based on degree/stream
      roadmapStore.fetchCareers({
        stream: education.value.field,
        degree: education.value.degree
      });
    }
    if (step.value === 2) await saveStep(2, { status: status.value, jobTitle: jobTitle.value });
    if (step.value === 3) await saveStep(3, { skills: userSkills.value });
    step.value += 1;
  } catch (e) {
    /* error already set */
  }
}

function prevStep() {
  step.value -= 1;
}

async function clearStreamFilter() {
  try {
    await roadmapStore.fetchCareers({ stream: '', degree: '' });
  } catch (err) {
    console.error('Failed to load all careers:', err);
  }
}

async function finish() {
  try {
    await saveStep(4, { careerId: targetCareer.value });
    await userStore.updateTargetCareer(targetCareer.value);
    await auth.refreshUser();
    router.push('/dashboard');
  } catch (e) {
    /* error already set */
  }
}

</script>

<style scoped>
.onboarding { padding: 3rem 1.5rem; max-width: 640px; }
.onboarding-header { margin-bottom: 1.5rem; }
.step-label { font-size: 0.85rem; color: var(--text-dim); display: block; margin-bottom: 0.5rem; font-weight: 600; }
.step-card { min-height: 360px; display: flex; flex-direction: column; }
.step-card h2 { font-size: 1.4rem; }

.checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-dim); }

.option-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; }

.stream-info-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0.6rem 0.9rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text);
}
.btn-clear-filter {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.empty-careers-hint {
  margin-top: 1.5rem;
  padding: 1.5rem;
  text-align: center;
  background: var(--surface-2);
  border: 1px dashed var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.option-card {
  text-align: left;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.option-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent); }
.option-card span { font-size: 0.8rem; color: var(--text-dim); }
.option-card.active { background: var(--accent); color: #ffffff; border-color: var(--accent); }
.option-card.active span { color: #e0e0fc; }
.career-card { grid-column: span 1; }

.skill-search { position: relative; margin-top: 1rem; }
.skill-suggestions {
  margin-top: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.suggestion-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.85rem;
  background: var(--surface-2);
  color: var(--text);
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: var(--accent-soft); }

.selected-skills-box {
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.selected-skills-heading { font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text); }
.selected-skills-heading span { color: var(--accent); font-weight: 700; }
.selected-skills { display: flex; flex-direction: column; gap: 0.5rem; }
.selected-skill-row { display: flex; align-items: center; gap: 0.75rem; }
.selected-skill-name { flex: 1; font-weight: 500; }
.level-select { width: 150px; }
.empty-hint { font-size: 0.85rem; margin: 0; }

.step-actions { display: flex; align-items: center; margin-top: 2rem; }

@media (max-width: 600px) {
  .option-grid { grid-template-columns: 1fr; }
  .selected-skill-row { flex-wrap: wrap; }
}
</style>
