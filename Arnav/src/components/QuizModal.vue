<template>
  <div v-if="visible" class="quiz-modal-overlay" @click="handleOverlayClick">
    <div class="quiz-modal" @click.stop>
      <!-- Quiz Header -->
      <div class="quiz-header">
        <div class="quiz-title">
          <i class="bx bxs-graduation"></i>
          <h3>
            {{ quizStarted ? "Quiz Time!" : "Ready to Test Your Knowledge?" }}
          </h3>
        </div>
        <button v-if="!quizStarted" class="close-btn" @click="closeModal">
          <i class="bx bx-x"></i>
        </button>
      </div>

      <!-- Quiz Intro (Before Starting) -->
      <div v-if="!quizStarted" class="quiz-intro">
        <div class="intro-content">
          <div class="intro-icon">
            <i class="bx bxs-brain"></i>
          </div>
          <h4>Test what you've learned!</h4>
          <p>
            Great job marking "<strong>{{ contentTitle }}</strong
            >" as learned! Let's make sure you've mastered it with a quick quiz.
          </p>
          <div class="quiz-details">
            <div class="detail-item">
              <i class="bx bx-question-mark"></i>
              <span>{{ questions.length }} Questions</span>
            </div>
            <div class="detail-item">
              <i class="bx bx-time"></i>
              <span>~{{ estimatedTime }} minutes</span>
            </div>
            <div class="detail-item">
              <i class="bx bx-trophy"></i>
              <span>70% to pass</span>
            </div>
          </div>
        </div>
        <div class="intro-actions">
          <button @click="startQuiz" class="btn-start">
            <i class="bx bx-play"></i>
            Start Quiz
          </button>
          <button @click="skipQuiz" class="btn-skip">Skip for now</button>
        </div>
      </div>

      <!-- Quiz Content (During Quiz) -->
      <div v-else-if="!showResults" class="quiz-content">
        <!-- Progress Bar -->
        <div class="quiz-progress">
          <div class="progress-info">
            <span class="question-number"
              >Question {{ currentQuestionIndex + 1 }} of
              {{ questions.length }}</span
            >
            <span class="time-elapsed">{{ formatTime(timeElapsed) }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <!-- Question -->
        <div class="question-container">
          <h4 class="question-text">{{ currentQuestion.question }}</h4>

          <!-- Options -->
          <div class="options-list">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-item"
              :class="{ selected: selectedAnswer === index }"
              @click="selectAnswer(index)">
              <div class="option-radio">
                <span>{{ String.fromCharCode(65 + index) }}</span>
              </div>
              <span class="option-text">{{ option }}</span>
              <div v-if="selectedAnswer === index" class="option-check">
                <i class="bx bx-check"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="quiz-navigation">
          <button
            v-if="currentQuestionIndex > 0"
            @click="previousQuestion"
            class="btn-nav btn-previous">
            <i class="bx bx-chevron-left"></i>
            Previous
          </button>
          <div class="question-dots">
            <span
              v-for="(q, index) in questions"
              :key="index"
              class="dot"
              :class="{
                active: index === currentQuestionIndex,
                answered: userAnswers[index] !== null,
              }"></span>
          </div>
          <button
            v-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion"
            class="btn-nav btn-next"
            :disabled="selectedAnswer === null">
            Next
            <i class="bx bx-chevron-right"></i>
          </button>
          <button
            v-else
            @click="submitQuiz"
            class="btn-nav btn-submit"
            :disabled="!allQuestionsAnswered">
            <i class="bx bx-check-double"></i>
            Submit Quiz
          </button>
        </div>
      </div>

      <!-- Quiz Results -->
      <div v-else class="quiz-results">
        <button
          class="close-btn results-close"
          @click="closeModal"
          :title="
            autoCloseCountdown > 0
              ? `Auto-closing in ${autoCloseCountdown}s`
              : 'Close'
          ">
          <i class="bx bx-x"></i>
          <span v-if="autoCloseCountdown > 0" class="countdown-badge">{{
            autoCloseCountdown
          }}</span>
        </button>
        <div class="results-header">
          <div
            class="results-icon"
            :class="{
              passed: quizResults.passed,
              failed: !quizResults.passed,
            }">
            <i :class="quizResults.passed ? 'bx bxs-trophy' : 'bx bx-sad'"></i>
          </div>
          <h3>
            {{ quizResults.passed ? "Congratulations!" : "Keep Learning!" }}
          </h3>
          <p class="results-message">
            {{
              quizResults.passed
                ? "You've demonstrated a strong understanding!"
                : "Don't worry, you can review and try again."
            }}
          </p>
        </div>

        <!-- Score Display -->
        <div class="score-display">
          <div class="score-circle" :class="{ passed: quizResults.passed }">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="score-bg"></circle>
              <circle
                cx="50"
                cy="50"
                r="45"
                class="score-progress"
                :style="{
                  strokeDashoffset: scoreStrokeDashoffset,
                }"></circle>
            </svg>
            <div class="score-text">
              <span class="score-number">{{ quizResults.score }}%</span>
              <span class="score-label">Score</span>
            </div>
          </div>

          <div class="score-stats">
            <div class="stat-item">
              <i class="bx bx-check-circle"></i>
              <span>{{ quizResults.correctCount }} Correct</span>
            </div>
            <div class="stat-item">
              <i class="bx bx-x-circle"></i>
              <span
                >{{
                  questions.length - quizResults.correctCount
                }}
                Incorrect</span
              >
            </div>
            <div class="stat-item">
              <i class="bx bx-time"></i>
              <span>{{ formatTime(timeElapsed) }} Time</span>
            </div>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="detailed-results">
          <h4>Review Your Answers</h4>
          <div class="results-list">
            <div
              v-for="(result, index) in quizResults.results"
              :key="index"
              class="result-item"
              :class="{
                correct: result.isCorrect,
                incorrect: !result.isCorrect,
              }">
              <div class="result-header">
                <span class="result-number">Question {{ index + 1 }}</span>
                <i
                  :class="
                    result.isCorrect ? 'bx bx-check-circle' : 'bx bx-x-circle'
                  "
                  class="result-icon"></i>
              </div>
              <p class="result-question">{{ result.question }}</p>
              <div class="result-answers">
                <div class="answer-item">
                  <span class="answer-label">Your answer:</span>
                  <span
                    class="answer-text"
                    :class="{
                      correct: result.isCorrect,
                      incorrect: !result.isCorrect,
                    }">
                    {{ result.selectedOption }}
                  </span>
                </div>
                <div v-if="!result.isCorrect" class="answer-item">
                  <span class="answer-label">Correct answer:</span>
                  <span class="answer-text correct">
                    {{ result.correctOption }}
                  </span>
                </div>
              </div>
              <p v-if="result.explanation" class="result-explanation">
                <i class="bx bx-info-circle"></i>
                {{ result.explanation }}
              </p>
            </div>
          </div>
        </div>

        <!-- Results Actions -->
        <div class="results-actions">
          <button @click="retakeQuiz" class="btn-retake">
            <i class="bx bx-refresh"></i>
            Retake Quiz
          </button>
          <button @click="closeModal" class="btn-continue">
            <i class="bx bx-check"></i>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  generateQuizQuestions,
  validateQuizAnswers,
  saveQuizResult,
} from "@/services/QuizService";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  content: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "complete", "skip"]);

// State
const quizStarted = ref(false);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const userAnswers = ref([]);
const showResults = ref(false);
const quizResults = ref(null);
const timeElapsed = ref(0);
const timerInterval = ref(null);
const autoCloseCountdown = ref(0);
const autoCloseInterval = ref(null);

// Computed
const questions = computed(() => {
  return generateQuizQuestions(props.content);
});

const contentTitle = computed(() => {
  return props.content?.title || "this content";
});

const estimatedTime = computed(() => {
  return Math.ceil(questions.value.length * 0.5); // ~30 seconds per question
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value];
});

const progressPercentage = computed(() => {
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const allQuestionsAnswered = computed(() => {
  return userAnswers.value.every((answer) => answer !== null);
});

const scoreStrokeDashoffset = computed(() => {
  if (!quizResults.value) return 283; // Full circle (2 * π * 45)
  const percentage = quizResults.value.score / 100;
  return 283 - 283 * percentage;
});

// Methods
function startQuiz() {
  quizStarted.value = true;
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  userAnswers.value = Array(questions.value.length).fill(null);
  startTimer();
}

function startTimer() {
  timeElapsed.value = 0;
  timerInterval.value = setInterval(() => {
    timeElapsed.value++;
  }, 1000);
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

function startAutoCloseTimer() {
  autoCloseCountdown.value = 10;

  autoCloseInterval.value = setInterval(() => {
    autoCloseCountdown.value--;

    if (autoCloseCountdown.value <= 0) {
      stopAutoCloseTimer();
      closeModal();
    }
  }, 1000);
}

function stopAutoCloseTimer() {
  if (autoCloseInterval.value) {
    clearInterval(autoCloseInterval.value);
    autoCloseInterval.value = null;
  }
  autoCloseCountdown.value = 0;
}

function selectAnswer(index) {
  selectedAnswer.value = index;
  userAnswers.value[currentQuestionIndex.value] = index;
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value];
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value];
  }
}

async function submitQuiz() {
  if (!allQuestionsAnswered.value) {
    alert("Please answer all questions before submitting.");
    return;
  }

  stopTimer();

  // Validate answers
  quizResults.value = validateQuizAnswers(questions.value, userAnswers.value);

  // Save result to Firebase
  try {
    await saveQuizResult(
      props.content.id,
      quizResults.value,
      timeElapsed.value
    );
  } catch (error) {
    console.error("Error saving quiz result:", error);
  }

  showResults.value = true;
  emit("complete", quizResults.value);

  // Start auto-close countdown
  startAutoCloseTimer();
}

function retakeQuiz() {
  // Stop auto-close timer
  stopAutoCloseTimer();

  // Reset quiz state
  quizStarted.value = false;
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  userAnswers.value = [];
  showResults.value = false;
  quizResults.value = null;
  timeElapsed.value = 0;
}

function skipQuiz() {
  emit("skip");
  closeModal();
}

function closeModal() {
  stopTimer();
  stopAutoCloseTimer();
  emit("close");
}

function handleOverlayClick() {
  // Only allow closing before quiz starts or after results
  if (!quizStarted.value || showResults.value) {
    closeModal();
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Watch for visibility changes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // Reset state when modal opens
      quizStarted.value = false;
      currentQuestionIndex.value = 0;
      selectedAnswer.value = null;
      userAnswers.value = [];
      showResults.value = false;
      quizResults.value = null;
      timeElapsed.value = 0;
      stopAutoCloseTimer();
    } else {
      stopTimer();
      stopAutoCloseTimer();
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  stopTimer();
  stopAutoCloseTimer();
});
</script>

<style scoped>
.quiz-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.quiz-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.quiz-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quiz-title i {
  font-size: 32px;
}

.quiz-title h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-btn i {
  font-size: 24px;
}

/* Quiz Intro */
.quiz-intro {
  padding: 40px;
}

.intro-content {
  text-align: center;
  margin-bottom: 30px;
}

.intro-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.intro-icon i {
  font-size: 40px;
  color: white;
}

.intro-content h4 {
  font-size: 24px;
  margin: 0 0 15px;
  color: #2d3748;
}

.intro-content p {
  font-size: 16px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 25px;
}

.quiz-details {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #4a5568;
}

.detail-item i {
  font-size: 20px;
  color: #667eea;
}

.intro-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-start,
.btn-skip {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-skip {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-skip:hover {
  background: #cbd5e0;
}

/* Quiz Content */
.quiz-content {
  padding: 30px 40px 40px;
}

.quiz-progress {
  margin-bottom: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.question-container {
  margin-bottom: 30px;
}

.question-text {
  font-size: 20px;
  color: #2d3748;
  margin: 0 0 25px;
  line-height: 1.6;
  font-weight: 600;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.option-item:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.option-item.selected {
  border-color: #667eea;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
}

.option-radio {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
  transition: all 0.3s;
}

.option-item.selected .option-radio {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: #2d3748;
}

.option-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #48bb78;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.option-check i {
  font-size: 16px;
}

/* Quiz Navigation */
.quiz-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e2e8f0;
}

.btn-nav {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-previous {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-previous:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-next,
.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-next:hover:not(:disabled),
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-dots {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e0;
  transition: all 0.3s;
}

.dot.answered {
  background: #48bb78;
}

.dot.active {
  background: #667eea;
  transform: scale(1.3);
}

/* Quiz Results */
.quiz-results {
  padding: 40px;
  position: relative;
}

.results-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
  color: #667eea;
  z-index: 10;
}

.results-close:hover {
  background: #667eea;
  color: white;
  transform: rotate(90deg);
}

.countdown-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56565;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.results-header {
  text-align: center;
  margin-bottom: 35px;
}

.results-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.results-icon.passed {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.results-icon.failed {
  background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
}

.results-icon i {
  font-size: 45px;
  color: white;
}

.results-header h3 {
  font-size: 28px;
  margin: 0 0 10px;
  color: #2d3748;
}

.results-message {
  font-size: 16px;
  color: #4a5568;
  margin: 0;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.score-circle {
  position: relative;
  width: 180px;
  height: 180px;
}

.score-circle svg {
  transform: rotate(-90deg);
}

.score-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 8;
}

.score-progress {
  fill: none;
  stroke: #f56565;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease-in-out;
}

.score-circle.passed .score-progress {
  stroke: #48bb78;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: 42px;
  font-weight: 700;
  color: #2d3748;
}

.score-label {
  display: block;
  font-size: 14px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #4a5568;
}

.stat-item i {
  font-size: 22px;
  color: #667eea;
}

.detailed-results {
  margin-bottom: 30px;
}

.detailed-results h4 {
  font-size: 20px;
  margin: 0 0 20px;
  color: #2d3748;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #f7fafc;
}

.result-item.correct {
  border-color: #48bb78;
  background: rgba(72, 187, 120, 0.05);
}

.result-item.incorrect {
  border-color: #f56565;
  background: rgba(245, 101, 101, 0.05);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-number {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-icon {
  font-size: 24px;
}

.result-item.correct .result-icon {
  color: #48bb78;
}

.result-item.incorrect .result-icon {
  color: #f56565;
}

.result-question {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 15px;
}

.result-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.answer-label {
  color: #718096;
  font-weight: 500;
  min-width: 110px;
}

.answer-text {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.answer-text.correct {
  background: rgba(72, 187, 120, 0.15);
  color: #2f855a;
}

.answer-text.incorrect {
  background: rgba(245, 101, 101, 0.15);
  color: #c53030;
}

.result-explanation {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
  margin: 12px 0 0;
  padding: 12px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 8px;
  line-height: 1.5;
}

.result-explanation i {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.btn-retake,
.btn-continue {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-retake {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-retake:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.btn-continue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .quiz-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .quiz-header,
  .quiz-intro,
  .quiz-content,
  .quiz-results {
    padding: 20px;
  }

  .quiz-title h3 {
    font-size: 20px;
  }

  .intro-content h4 {
    font-size: 20px;
  }

  .score-display {
    flex-direction: column;
    gap: 25px;
  }

  .quiz-details {
    flex-direction: column;
    gap: 12px;
  }

  .intro-actions {
    flex-direction: column;
  }

  .btn-start,
  .btn-skip {
    width: 100%;
    justify-content: center;
  }

  .results-actions {
    flex-direction: column;
  }

  .btn-retake,
  .btn-continue {
    width: 100%;
    justify-content: center;
  }

  .quiz-navigation {
    flex-wrap: wrap;
  }

  .question-dots {
    order: -1;
    width: 100%;
    margin-bottom: 15px;
  }
}

/* Scrollbar Styling */
.quiz-modal::-webkit-scrollbar {
  width: 8px;
}

.quiz-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.quiz-modal::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.quiz-modal::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>
