<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-card" @click.stop>
          <!-- Header -->
          <header class="modal-header">
            <div class="header-left">
              <span class="quiz-badge">🛡️ Proof of Skill</span>
              <h2 class="modal-title">{{ skill?.name }} Skill Verification</h2>
            </div>
            <button class="close-btn" @click="closeModal" aria-label="Close modal">&times;</button>
          </header>

          <!-- Loading State -->
          <div v-if="loading" class="state-container">
            <div class="spinner-lg"></div>
            <p class="state-text">Loading validation quiz for {{ skill?.name }}…</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="state-container">
            <div class="error-icon">⚠️</div>
            <h3>Unable to load quiz</h3>
            <p class="error-message">{{ error }}</p>
            <button class="btn btn-secondary" @click="loadQuiz">Try Again</button>
          </div>

          <!-- Quiz Screen (Active Answering) -->
          <div v-else-if="quiz && !result" class="quiz-content">
            <!-- Progress Stepper -->
            <div class="stepper-wrap">
              <div class="stepper-info">
                <span class="step-label">Question {{ currentIndex + 1 }} of {{ totalQuestions }}</span>
                <span class="pass-hint">Pass criteria: at least 2 of 3 correct</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: ((currentIndex + 1) / totalQuestions) * 100 + '%' }"></div>
              </div>
            </div>

            <!-- Current Question Card -->
            <div class="question-container" v-if="currentQuestion">
              <h3 class="question-title">{{ currentQuestion.question }}</h3>

              <div class="options-grid">
                <button
                  v-for="(option, optIdx) in currentQuestion.options"
                  :key="optIdx"
                  type="button"
                  class="option-card"
                  :class="{ selected: userAnswers[currentIndex] === optIdx }"
                  @click="selectOption(optIdx)"
                >
                  <span class="option-letter">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                  <span class="option-text">{{ option }}</span>
                  <span v-if="userAnswers[currentIndex] === optIdx" class="check-indicator">✓</span>
                </button>
              </div>
            </div>

            <!-- Footer Navigation -->
            <footer class="quiz-footer">
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="currentIndex === 0"
                @click="prevQuestion"
              >
                &larr; Previous
              </button>

              <div class="footer-dots">
                <span
                  v-for="(_, idx) in quiz.questions"
                  :key="idx"
                  class="dot-indicator"
                  :class="{ active: currentIndex === idx, answered: userAnswers[idx] !== null }"
                  @click="goToQuestion(idx)"
                ></span>
              </div>

              <button
                v-if="currentIndex < totalQuestions - 1"
                type="button"
                class="btn btn-primary"
                :disabled="userAnswers[currentIndex] === null"
                @click="nextQuestion"
              >
                Next &rarr;
              </button>
              <button
                v-else
                type="button"
                class="btn btn-primary submit-btn"
                :disabled="!isAllAnswered || submitting"
                @click="submitQuiz"
              >
                <span v-if="submitting" class="spinner"></span>
                <span v-else>Submit &amp; Verify 🛡️</span>
              </button>
            </footer>
          </div>

          <!-- Result Screen: PASSED -->
          <div v-else-if="result && result.passed" class="result-container passed-card">
            <div class="confetti-icon">🎉</div>
            <span class="verified-pill">🛡️ Proof of Skill Verified</span>
            <h3 class="result-heading">Congratulations!</h3>
            <p class="result-sub">
              You scored <strong>{{ result.score }}/{{ result.total }}</strong>. You have demonstrated practical knowledge of <strong>{{ skill?.name }}</strong>!
            </p>

            <div class="perks-box">
              <div class="perk-item">
                <span class="perk-icon">✓</span>
                <span><strong>Verified Badge</strong> unlocked for {{ skill?.name }}</span>
              </div>
              <div class="perk-item">
                <span class="perk-icon">✓</span>
                <span>Status marked <strong>100% Completed</strong></span>
              </div>
              <div class="perk-item">
                <span class="perk-icon">✓</span>
                <span>Downstream prerequisite skills unlocked</span>
              </div>
            </div>

            <!-- Detailed Review Accordion -->
            <div class="review-section">
              <h4>Review Questions &amp; Answers</h4>
              <div v-for="(rev, rIdx) in result.review" :key="rIdx" class="review-item correct">
                <div class="review-header">
                  <span class="review-status-badge">✓ Question {{ rIdx + 1 }}</span>
                  <p class="review-q">{{ rev.question }}</p>
                </div>
                <div class="review-details">
                  <p class="ans-text"><strong>Your Answer:</strong> {{ rev.selectedOption }}</p>
                  <p v-if="rev.explanation" class="exp-text">💡 <em>{{ rev.explanation }}</em></p>
                </div>
              </div>
            </div>

            <footer class="result-footer">
              <button type="button" class="btn btn-primary btn-lg" @click="handleCompleteAndClose">
                Claim Verified Badge &amp; Update Roadmap 🚀
              </button>
            </footer>
          </div>

          <!-- Result Screen: FAILED -->
          <div v-else-if="result && !result.passed" class="result-container failed-card">
            <div class="failed-icon">📝</div>
            <span class="failed-pill">Needs Review</span>
            <h3 class="result-heading">Almost There!</h3>
            <p class="result-sub">
              You scored <strong>{{ result.score }}/{{ result.total }}</strong>. To earn the Verified Badge and complete this skill, you need at least <strong>2 out of 3 correct</strong>.
            </p>

            <!-- Detailed Review of Missed Questions -->
            <div class="review-section">
              <h4>Question Review &amp; Explanations</h4>
              <div
                v-for="(rev, rIdx) in result.review"
                :key="rIdx"
                class="review-item"
                :class="rev.isCorrect ? 'correct' : 'incorrect'"
              >
                <div class="review-header">
                  <span class="review-status-badge">{{ rev.isCorrect ? '✓ Correct' : '✗ Missed' }}</span>
                  <p class="review-q">{{ rev.question }}</p>
                </div>
                <div class="review-details">
                  <p class="ans-text" :class="{ 'wrong-ans': !rev.isCorrect }">
                    <strong>Your Choice:</strong> {{ rev.selectedOption }}
                  </p>
                  <p v-if="!rev.isCorrect" class="correct-ans">
                    <strong>Correct Answer:</strong> {{ rev.correctOption }}
                  </p>
                  <p v-if="rev.explanation" class="exp-text">💡 <em>{{ rev.explanation }}</em></p>
                </div>
              </div>
            </div>

            <footer class="result-footer">
              <button type="button" class="btn btn-primary btn-lg" @click="retryQuiz">
                🔄 Retry Verification Quiz
              </button>
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Review Lessons First
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  skill: { type: Object, default: null }
});

const emit = defineEmits(['close', 'verified']);

const loading = ref(false);
const error = ref('');
const quiz = ref(null);
const currentIndex = ref(0);
const userAnswers = ref([]);
const submitting = ref(false);
const result = ref(null);

const totalQuestions = computed(() => quiz.value?.questions?.length || 3);
const currentQuestion = computed(() => quiz.value?.questions?.[currentIndex.value] || null);
const isAllAnswered = computed(() => {
  if (!userAnswers.value.length) return false;
  return userAnswers.value.every((ans) => ans !== null && ans !== undefined);
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.skill) {
      loadQuiz();
    } else {
      resetState();
    }
  }
);

function resetState() {
  quiz.value = null;
  currentIndex.value = 0;
  userAnswers.value = [];
  submitting.value = false;
  result.value = null;
  error.value = '';
}

async function loadQuiz() {
  if (!props.skill) return;
  loading.value = true;
  error.value = '';
  resetState();

  const skillIdentifier = props.skill.slug || props.skill.skillId || props.skill._id;

  try {
    const { data } = await api.get(`/skills/${skillIdentifier}/quiz`);
    quiz.value = data;
    userAnswers.value = new Array(data.questions.length).fill(null);
  } catch (err) {
    console.error('Failed to load quiz:', err);
    error.value = err.response?.data?.message || 'Failed to load validation quiz. Please try again.';
  } finally {
    loading.value = false;
  }
}

function selectOption(optIndex) {
  userAnswers.value[currentIndex.value] = optIndex;
}

function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value += 1;
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

function goToQuestion(idx) {
  if (idx >= 0 && idx < totalQuestions.value) {
    currentIndex.value = idx;
  }
}

async function submitQuiz() {
  if (!isAllAnswered.value || submitting.value) return;
  submitting.value = true;
  error.value = '';

  const skillIdentifier = props.skill.slug || props.skill.skillId || props.skill._id;

  try {
    const { data } = await api.post(`/skills/${skillIdentifier}/quiz/submit`, {
      answers: userAnswers.value
    });
    result.value = data;
  } catch (err) {
    console.error('Failed to submit quiz:', err);
    error.value = err.response?.data?.message || 'Failed to submit quiz. Please try again.';
  } finally {
    submitting.value = false;
  }
}

let hasEmittedVerified = false;

function notifyVerified() {
  if (result.value?.passed && !hasEmittedVerified) {
    hasEmittedVerified = true;
    emit('verified', { skill: props.skill, result: result.value });
  }
}

function retryQuiz() {
  result.value = null;
  currentIndex.value = 0;
  hasEmittedVerified = false;
  if (quiz.value) {
    userAnswers.value = new Array(quiz.value.questions.length).fill(null);
  }
}

function handleCompleteAndClose() {
  notifyVerified();
  closeModal();
}

function closeModal() {
  notifyVerified();
  emit('close');
}

function handleBackdropClick() {
  // Prevent closing during active submission
  if (!submitting.value) {
    closeModal();
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.25rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quiz-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  width: fit-content;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
}
.close-btn:hover {
  color: #0f172a;
  background: #e2e8f0;
}

/* Loading & Error States */
.state-container {
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1.25rem;
}

/* Quiz Content */
.quiz-content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.5rem;
}

.stepper-wrap {
  margin-bottom: 1.5rem;
}

.stepper-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.step-label {
  font-weight: 700;
  color: #0f172a;
}

.pass-hint {
  color: #64748b;
}

.progress-bar-bg {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #10b981);
  transition: width 0.3s ease;
}

.question-container {
  margin-bottom: 1.5rem;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.5;
  color: #0f172a;
  margin-bottom: 1.25rem;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.option-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.option-card.selected {
  background: #eef2ff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #475569;
  flex-shrink: 0;
}

.option-card.selected .option-letter {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.option-text {
  font-size: 0.95rem;
  color: #1e293b;
  flex: 1;
  line-height: 1.4;
}

.check-indicator {
  color: #4f46e5;
  font-weight: bold;
  font-size: 1.1rem;
}

.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.footer-dots {
  display: flex;
  gap: 0.5rem;
}

.dot-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.dot-indicator.answered {
  background: #94a3b8;
}

.dot-indicator.active {
  background: #4f46e5;
  transform: scale(1.25);
}

/* Results Screens */
.result-container {
  padding: 2rem 1.5rem;
  text-align: center;
  overflow-y: auto;
}

.confetti-icon,
.failed-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.verified-pill {
  display: inline-block;
  background: #dcfce7;
  color: #15803d;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #bbf7d0;
  margin-bottom: 0.75rem;
}

.failed-pill {
  display: inline-block;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #fecaca;
  margin-bottom: 0.75rem;
}

.result-heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.result-sub {
  color: #475569;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.perks-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 1rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.perk-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #166534;
  margin-bottom: 0.4rem;
}
.perk-item:last-child { margin-bottom: 0; }

.perk-icon {
  font-weight: 800;
  color: #16a34a;
}

/* Review Section */
.review-section {
  text-align: left;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.review-section h4 {
  font-size: 0.95rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.review-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.9rem;
  margin-bottom: 0.75rem;
}

.review-item.correct {
  border-left: 4px solid #16a34a;
}

.review-item.incorrect {
  border-left: 4px solid #dc2626;
}

.review-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
.review-item.correct .review-status-badge {
  background: #dcfce7;
  color: #166534;
}
.review-item.incorrect .review-status-badge {
  background: #fee2e2;
  color: #991b1b;
}

.review-q {
  font-weight: 600;
  color: #0f172a;
  margin-top: 0.35rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.review-details p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
}

.wrong-ans {
  color: #b91c1c;
}

.correct-ans {
  color: #15803d;
}

.exp-text {
  color: #475569;
  background: #f1f5f9;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.4rem !important;
}

.result-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-lg {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
}
</style>
