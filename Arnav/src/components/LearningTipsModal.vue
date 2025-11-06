<template>
  <div v-if="visible" class="ltips-modal">
    <div class="ltips-backdrop" @click="close"></div>
    <div class="ltips-content" role="dialog" aria-modal="true">
      <div class="ltips-header">
        <h3>New Tips for You</h3>
        <button class="ltips-close" @click="close" aria-label="Close">×</button>
      </div>

      <div v-if="tips && tips.length" class="ltips-body">
        <div class="ltips-item">
          <div class="ltips-meta">
            <span class="ltips-chip">{{ current.category || "general" }}</span>
            <span v-if="current.priority" class="ltips-chip alt">{{
              current.priority
            }}</span>
          </div>
          <h4 class="ltips-title">{{ current.title }}</h4>
          <p class="ltips-text">{{ current.content }}</p>
          <details v-if="current.detailedContent" class="ltips-details">
            <summary>Read more</summary>
            <p>{{ current.detailedContent }}</p>
          </details>
          
          <!-- Voice Read Button -->
          <div class="ltips-voice-controls">
            <button 
              class="ltips-voice-btn" 
              @click="toggleVoiceReading"
              :class="{ 'reading': isReading, 'disabled': !voiceSupported }"
              :disabled="!voiceSupported"
              :title="voiceSupported ? (isReading ? 'Stop reading' : 'Read aloud') : 'Voice not supported'">
              <i class="fas" :class="isReading ? 'fa-stop' : 'fa-volume-up'"></i>
              {{ isReading ? 'Stop' : 'Read' }}
            </button>
          </div>
        </div>
      </div>

      <div class="ltips-footer">
        <div class="ltips-steps">{{ index + 1 }} / {{ tips.length }}</div>
        <div class="ltips-actions">
          <button class="ltips-btn" @click="next">
            {{ index < tips.length - 1 ? "Next" : "Done" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  tips: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "seen"]);

const index = ref(0);

const current = computed(() => props.tips?.[index.value] || {});

// Voice functionality
const isReading = ref(false);
const voiceSupported = ref(false);
let speechSynthesis = null;
let currentUtterance = null;

// Check for voice support on component mount
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis = window.speechSynthesis;
  voiceSupported.value = true;
}

function toggleVoiceReading() {
  if (!voiceSupported.value) return;
  
  if (isReading.value) {
    stopVoiceReading();
  } else {
    startVoiceReading();
  }
}

function startVoiceReading() {
  if (!voiceSupported.value || !speechSynthesis) return;
  
  // Stop any current reading
  stopVoiceReading();
  
  // Create text to read
  const textToRead = createReadingText();
  
  if (!textToRead.trim()) return;
  
  currentUtterance = new SpeechSynthesisUtterance(textToRead);
  
  // Configure speech settings
  currentUtterance.rate = 0.8; // Slightly slower for better comprehension
  currentUtterance.pitch = 1;
  currentUtterance.volume = 0.8;
  
  // Set language (you can modify this)
  currentUtterance.lang = 'en-US';
  
  // Event listeners
  currentUtterance.onstart = () => {
    isReading.value = true;
  };
  
  currentUtterance.onend = () => {
    isReading.value = false;
    currentUtterance = null;
  };
  
  currentUtterance.onerror = () => {
    isReading.value = false;
    currentUtterance = null;
    console.warn('Speech synthesis error');
  };
  
  // Start speaking
  speechSynthesis.speak(currentUtterance);
}

function stopVoiceReading() {
  if (speechSynthesis && isReading.value) {
    speechSynthesis.cancel();
    isReading.value = false;
    currentUtterance = null;
  }
}

function createReadingText() {
  const tip = current.value;
  if (!tip) return '';
  
  let text = '';
  
  // Add title
  if (tip.title) {
    text += `${tip.title}. `;
  }
  
  // Add main content
  if (tip.content) {
    text += `${tip.content} `;
  }
  
  // Add detailed content if available
  if (tip.detailedContent) {
    text += `Additional details: ${tip.detailedContent}`;
  }
  
  return text;
}

// Stop reading when component unmounts or tip changes
import { watch, onUnmounted } from 'vue';

watch(() => current.value, () => {
  stopVoiceReading();
});

onUnmounted(() => {
  stopVoiceReading();
});

function close() {
  stopVoiceReading(); // Stop reading when modal closes
  emit(
    "seen",
    props.tips.map((t) => t.id)
  );
  emit("close");
  index.value = 0;
}

function next() {
  stopVoiceReading(); // Stop reading when moving to next tip
  if (index.value < props.tips.length - 1) {
    index.value++;
  } else {
    close();
  }
}
</script>

<style scoped>
.ltips-modal {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: grid;
  place-items: center;
}
.ltips-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.ltips-content {
  position: relative;
  background: #fff;
  width: min(92vw, 560px);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.ltips-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.ltips-close {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}
.ltips-body {
  padding: 16px;
}
.ltips-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.ltips-chip {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
}
.ltips-chip.alt {
  background: #ecfeff;
  color: #0891b2;
}
.ltips-title {
  margin: 4px 0 8px;
  font-size: 18px;
}
.ltips-text {
  color: #374151;
  line-height: 1.5;
}
.ltips-details {
  margin-top: 8px;
}
.ltips-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
.ltips-btn {
  background: #22c55e;
  color: #fff;
  border: 0;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.ltips-steps {
  font-size: 12px;
  color: #6b7280;
}
:global(body.dark-mode) .ltips-content {
  background: #23272f;
  color: #f3f4f6;
}
:global(body.dark-mode) .ltips-footer {
  border-color: #3b3f47;
}

/* Voice Controls Styles */
.ltips-voice-controls {
  margin-top: 1rem;
  text-align: center;
}

.ltips-voice-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.ltips-voice-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.ltips-voice-btn:active:not(.disabled) {
  transform: translateY(0);
}

.ltips-voice-btn.reading {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
}

.ltips-voice-btn.reading:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  box-shadow: 0 4px 16px rgba(245, 101, 101, 0.4);
}

.ltips-voice-btn.disabled {
  background: #cbd5e0;
  color: #718096;
  cursor: not-allowed;
  opacity: 0.5;
}

.ltips-voice-btn i {
  font-size: 1rem;
}

/* Dark mode support for voice button */
:global(body.dark-mode) .ltips-voice-btn.disabled {
  background: #4a5568;
  color: #a0aec0;
}
</style>
