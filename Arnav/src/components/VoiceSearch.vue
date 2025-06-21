<template>
  <div class="voice-search">
    <button
      @click="toggleVoiceRecognition"
      class="voice-button"
      :class="{ listening: isListening }"
      aria-label="Voice search">
      <span v-if="isListening" class="pulse"></span>
      <span class="icon">🎤</span>
    </button>
    <div v-if="isListening" class="listening-indicator">
      Listening... {{ transcript }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  lang: {
    type: String,
    default: "en-US",
  },
});

// Emits
const emit = defineEmits(["result", "error"]);

// Data
const recognition = ref(null);
const isListening = ref(false);
const transcript = ref("");
const error = ref(null);

// Lifecycle
onMounted(() => {
  initSpeechRecognition();
});

onUnmounted(() => {
  if (recognition.value) {
    recognition.value.abort();
  }
});

// Methods
function initSpeechRecognition() {
  // Check if browser supports speech recognition
  let SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition.value = new SpeechRecognition();
    setupRecognition();
  } else {
    error.value = "Speech recognition is not supported in this browser.";
    console.error(error.value);
  }
}

function setupRecognition() {
  if (!recognition.value) return;

  recognition.value.continuous = false;
  recognition.value.interimResults = true;
  recognition.value.lang = props.lang;

  recognition.value.onstart = () => {
    isListening.value = true;
    transcript.value = "";
  };

  recognition.value.onresult = (event) => {
    const result = event.results[0];
    transcript.value = result[0].transcript;

    if (result.isFinal) {
      emit("result", transcript.value);
      stopListening();
    }
  };

  recognition.value.onerror = (event) => {
    error.value = `Error: ${event.error}`;
    emit("error", error.value);
    stopListening();
  };

  recognition.value.onend = () => {
    isListening.value = false;
  };
}

function toggleVoiceRecognition() {
  if (isListening.value) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  if (!recognition.value) {
    initSpeechRecognition();
  }

  if (recognition.value) {
    try {
      recognition.value.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }
}

function stopListening() {
  if (recognition.value && isListening.value) {
    try {
      recognition.value.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }
}
</script>

<style scoped>
.voice-search {
  position: relative;
  display: inline-block;
}

.voice-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.voice-button:hover {
  background-color: #f5f5f5;
}

.voice-button.listening {
  background-color: #ff5733;
  border-color: #ff5733;
  color: white;
}

.icon {
  font-size: 24px;
  z-index: 2;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 87, 51, 0.7);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.listening-indicator {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background-color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  z-index: 10;
}
</style>
