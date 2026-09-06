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
          <option value="">Select degree…</option>
          <option>High School</option>
          <option>Diploma</option>
          <option>Bachelor's Degree</option>
          <option>Master's Degree</option>
          <option>Other</option>
        </select>

        <label class="label" style="margin-top: 1rem;">Field of study</label>
        <select v-model="education.field" class="input-field">
          <option value="">Select field of study…</option>
          <option v-for="opt in fieldOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>

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
        <p>
          Select the skills you already know for <strong>{{ education.field || 'your field' }}</strong>:
        </p>

        <div v-if="fieldSkills.length" class="field-skills-grid">
          <div
            v-for="s in fieldSkills"
            :key="s._id"
            class="field-skill-card"
            :class="{ active: isSkillSelected(s._id) }"
          >
            <label class="skill-checkbox-label">
              <input
                type="checkbox"
                :checked="isSkillSelected(s._id)"
                @change="toggleFieldSkill(s)"
              />
              <span class="skill-label-text">{{ s.name }}</span>
            </label>

            <div v-if="isSkillSelected(s._id)" class="skill-level-wrapper">
              <select
                :value="getSkillLevel(s._id)"
                @change="setSkillLevel(s._id, Number($event.target.value))"
                class="input-field level-select-mini"
              >
                <option :value="1">Beginner</option>
                <option :value="2">Know a little basics</option>
                <option :value="3">Know everything</option>
              </select>
            </div>
          </div>
        </div>

        <div v-else class="empty-hint">
          Loading skills relevant to {{ education.field || 'your field' }}…
        </div>

        <!-- Optional search for extra skills outside the field -->
        <div class="additional-skills-section">
          <button
            type="button"
            class="btn-toggle-search"
            @click="showExtraSearch = !showExtraSearch"
          >
            {{ showExtraSearch ? '– Hide extra skills search' : '+ Add more skills outside your field' }}
          </button>

          <div v-if="showExtraSearch" class="skill-search">
            <input v-model="skillQuery" type="text" class="input-field" placeholder="Search other skills… (e.g. Docker, Python)" />
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
        </div>

        <!-- Additional selected skills summary if any added from extra search -->
        <div v-if="extraSelectedSkills.length" class="extra-selected-box">
          <span class="extra-selected-title">Additional skills added:</span>
          <div class="extra-selected-chips">
            <div v-for="row in extraSelectedSkills" :key="row.skill" class="extra-chip">
              <span class="extra-chip-name">{{ skillName(row.skill) }}</span>
              <select
                :value="row.level"
                @change="setSkillLevel(row.skill, Number($event.target.value))"
                class="input-field level-select-mini"
              >
                <option :value="1">Beginner</option>
                <option :value="2">Know a little basics</option>
                <option :value="3">Know everything</option>
              </select>
              <button type="button" class="extra-chip-remove" @click="removeSkill(row.skill)">&times;</button>
            </div>
          </div>
        </div>
      </section>

        <!-- STEP 4: TARGET CAREER -->
      <section v-else-if="step === 4">
        <h2>What do you want to become?</h2>
        <p>We'll compare this career's required skills against what you already know.</p>

        <div class="stream-info-badge">
          <div class="stream-badge-info">
            <span v-if="!showingAllTracks && education.field">
              🎓 Recommended for: <strong>{{ education.field }}</strong>
            </span>
            <span v-else>
              🌐 All Available Career Tracks ({{ careers.length }})
            </span>
          </div>
          <button
            v-if="education.field"
            type="button"
            class="btn-toggle-stream"
            @click="toggleShowAllTracks"
          >
            {{ showingAllTracks ? `Show ${education.field} only` : 'Browse all tracks →' }}
          </button>
        </div>

        <div v-if="roadmapStore.loadingCareers" class="loading-box">
          <span class="loading-spinner"></span>
          <p>Loading career tracks…</p>
        </div>

        <div v-else-if="careers.length === 0" class="empty-careers-hint">
          <p>No tracks specifically categorized under "<strong>{{ education.field }}</strong>".</p>
          <button type="button" class="btn btn-secondary btn-sm" @click="toggleShowAllTracks">
            Browse All Available Career Tracks
          </button>
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
            <div class="career-card-top">
              <strong>{{ c.name }}</strong>
              <span v-if="c.category" class="category-pill">{{ c.category }}</span>
            </div>
            <span>{{ c.description }}</span>
          </button>
        </div>

        <div v-if="!showingAllTracks && careers.length > 0" class="browse-more-hint">
          <span>Looking for a different track?</span>
          <button type="button" class="link-btn" @click="toggleShowAllTracks">
            Explore all available roadmaps
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
import { ref, computed, onMounted, watch } from 'vue';
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
const fieldOptions = ref([
  'Computer Science',
  'DevOps & Cloud Engineering',
  'AI & Data Science'
]);

const initialStream = userStore.userStream || 'Computer Science';
const education = ref({
  degree: userStore.userDegree || '',
  field: initialStream,
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
const showExtraSearch = ref(false);

const LEVEL_LABELS = ['None', 'Beginner', 'Know a little basics', 'Know everything', 'Know everything'];
function levelLabel(n) {
  return LEVEL_LABELS[n] ?? 'None';
}

const FIELD_SKILLS_MAP = {
  'Computer Science': [
    'html', 'css', 'javascript', 'git', 'rest-apis',
    'vue', 'nodejs', 'express', 'mongodb', 'sql', 'docker'
  ],
  'DevOps & Cloud Engineering': [
    'linux', 'git', 'networking-fundamentals', 'docker', 'cloud-aws',
    'cicd-pipelines', 'python', 'kubernetes', 'terraform', 'monitoring-observability'
  ],
  'AI & Data Science': [
    'python', 'sql', 'git', 'linear-algebra-stats', 'data-analysis',
    'machine-learning', 'deep-learning', 'genai-llms', 'mlops', 'docker'
  ]
};

const fieldSkills = computed(() => {
  const slugs = FIELD_SKILLS_MAP[education.value.field] || [];
  if (!slugs.length) return allSkills.value;
  return allSkills.value.filter((s) => slugs.includes(s.slug));
});

const extraSelectedSkills = computed(() => {
  const fieldSkillIds = new Set(fieldSkills.value.map((s) => s._id));
  return userSkills.value.filter((r) => !fieldSkillIds.has(r.skill));
});

function isSkillSelected(skillId) {
  return userSkills.value.some((r) => r.skill?.toString() === skillId?.toString());
}

function getSkillLevel(skillId) {
  const row = userSkills.value.find((r) => r.skill?.toString() === skillId?.toString());
  return row ? row.level : 1;
}

function setSkillLevel(skillId, level) {
  const row = userSkills.value.find((r) => r.skill?.toString() === skillId?.toString());
  if (row) {
    row.level = level;
  }
}

function toggleFieldSkill(skill) {
  if (isSkillSelected(skill._id)) {
    removeSkill(skill._id);
  } else {
    userSkills.value.push({ skill: skill._id, level: 1 });
  }
}

const filteredSkills = computed(() => {
  if (!skillQuery.value.trim()) return [];
  const q = skillQuery.value.toLowerCase();
  const already = new Set(userSkills.value.map((r) => r.skill?.toString()));
  return allSkills.value.filter((s) => s.name?.toLowerCase().includes(q) && !already.has(s._id?.toString())).slice(0, 6);
});

function skillName(id) {
  const s = allSkills.value.find((sk) => sk._id?.toString() === id?.toString());
  return s ? s.name : '';
}

function addSkill(skill) {
  if (!isSkillSelected(skill._id)) {
    userSkills.value.push({ skill: skill._id, level: 1 });
  }
  skillQuery.value = '';
}

function removeSkill(id) {
  userSkills.value = userSkills.value.filter((r) => r.skill?.toString() !== id?.toString());
}

// Step 4
const careers = computed(() => roadmapStore.careers);
const targetCareer = ref('');
const showingAllTracks = ref(false);

async function loadCareers() {
  try {
    if (showingAllTracks.value) {
      await roadmapStore.fetchCareers({ all: true });
    } else {
      await roadmapStore.fetchCareers({
        stream: education.value.field,
        degree: education.value.degree
      });
    }
  } catch (err) {
    console.error('Failed to load careers:', err);
  }
}

async function toggleShowAllTracks() {
  showingAllTracks.value = !showingAllTracks.value;
  await loadCareers();
}

onMounted(async () => {
  try {
    const [skillsRes, streamsRes] = await Promise.all([
      api.get('/skills'),
      api.get('/careers/streams').catch(() => ({ data: { streams: [] } })),
      loadCareers()
    ]);
    allSkills.value = skillsRes.data.skills || [];
    if (streamsRes.data?.streams?.length) {
      fieldOptions.value = streamsRes.data.streams;
      if (!fieldOptions.value.includes(education.value.field)) {
        education.value.field = fieldOptions.value[0];
      }
    }

    // Prefill existing user profile info if returning to onboarding
    try {
      const profileData = await userStore.fetchProfile();
      if (profileData.profile?.education) {
        const edu = profileData.profile.education;
        if (edu.degree) education.value.degree = edu.degree;
        if (edu.field) education.value.field = edu.field;
        if (edu.gradYear) education.value.gradYear = edu.gradYear;
        if (typeof edu.stillStudying === 'boolean') education.value.stillStudying = edu.stillStudying;
      }
      if (profileData.profile?.status) {
        status.value = profileData.profile.status;
      }
      if (profileData.profile?.jobTitle) {
        jobTitle.value = profileData.profile.jobTitle;
      }
      if (profileData.skills?.length && userSkills.value.length === 0) {
        userSkills.value = profileData.skills.map((s) => ({
          skill: s.skill?._id || s.skill,
          level: s.level || 1
        }));
      }
      if (profileData.targetCareer?._id || profileData.targetCareer) {
        targetCareer.value = profileData.targetCareer._id || profileData.targetCareer;
      }
    } catch (e) {
      // New registration without prior profile
    }
  } catch (err) {
    console.error('Failed to initialize onboarding data:', err);
  }
});

watch(step, (newStep) => {
  if (newStep === 4) {
    loadCareers();
  }
});

const canProceed = computed(() => {
  if (step.value === 1) return !!education.value.degree && !!education.value.field;
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
      await loadCareers();
    }
    if (step.value === 2) await saveStep(2, { status: status.value, jobTitle: jobTitle.value });
    if (step.value === 3) {
      await saveStep(3, { skills: userSkills.value });
      await loadCareers();
    }
    step.value += 1;
  } catch (e) {
    console.error('Failed to advance step:', e);
  }
}

function prevStep() {
  step.value -= 1;
}

async function finish() {
  try {
    loading.value = true;
    error.value = '';
    const { data } = await api.put('/users/onboarding', {
      step: 4,
      data: { careerId: targetCareer.value }
    });
    if (data.user) {
      auth.setSession(auth.token, data.user);
    }
    await userStore.fetchProfile();
    await roadmapStore.fetchDashboardProgress();
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not complete onboarding. Please try again.';
  } finally {
    loading.value = false;
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
  padding: 0.65rem 1rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text);
  gap: 0.75rem;
}
.btn-toggle-stream {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.btn-toggle-stream:hover {
  background: var(--accent);
  color: #fff;
}
.career-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.category-pill {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 999px;
  color: var(--accent);
  font-weight: 600;
  white-space: nowrap;
}
.browse-more-hint {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-dim);
}
.link-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.link-btn:hover {
  color: var(--text);
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
.field-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1.25rem;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.field-skill-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}
.field-skill-card:hover {
  border-color: var(--accent);
  background: var(--surface-2);
}
.field-skill-card.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.skill-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  user-select: none;
}
.skill-checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.skill-level-wrapper {
  display: flex;
  align-items: center;
}
.level-select-mini {
  padding: 0.25rem 0.5rem;
  font-size: 0.78rem;
  height: 30px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}

.additional-skills-section {
  margin-top: 1.25rem;
  border-top: 1px dashed var(--border);
  padding-top: 0.75rem;
}
.btn-toggle-search {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
}

.extra-selected-box {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.extra-selected-title {
  display: block;
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-bottom: 0.4rem;
  font-weight: 600;
}
.extra-selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.extra-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
}
.extra-chip-remove {
  background: transparent;
  border: none;
  font-size: 0.95rem;
  color: var(--text-dim);
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.extra-chip-remove:hover { color: #ef4444; }

.empty-hint { font-size: 0.85rem; margin: 1rem 0; color: var(--text-dim); }

.step-actions { display: flex; align-items: center; margin-top: 2rem; }

@media (max-width: 600px) {
  .option-grid { grid-template-columns: 1fr; }
  .field-skills-grid { grid-template-columns: 1fr; }
  .selected-skill-row { flex-wrap: wrap; }
}
</style>
