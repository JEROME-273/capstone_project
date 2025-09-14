<template>
  <div class="voice-commands">
    <button
      @click="toggleVoiceCommands"
      class="command-button"
      :class="{ listening: isListening }"
      aria-label="Voice commands">
      <span v-if="isListening" class="pulse"></span>
      <span class="icon">🗣️</span>
    </button>
    <div v-if="isListening" class="listening-indicator">
      Listening for commands... {{ transcript }}
    </div>

    <div v-if="showHelp" class="commands-help">
      <h3>Available Voice Commands</h3>
      <ul>
        <li><strong>"Where am I"</strong> - Get your current location</li>
        <li><strong>"How far"</strong> - Distance to destination</li>
        <li>
          <strong>"Next instruction"</strong> - Hear the next navigation
          instruction
        </li>
        <li><strong>"End navigation"</strong> - Stop the current navigation</li>
        <li><strong>"Repeat"</strong> - Repeat the last instruction</li>
      </ul>
      <button @click="showHelp = false" class="close-help">Close</button>
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
const emit = defineEmits(["command", "error"]);

// Data
const recognition = ref(null);
const isListening = ref(false);
const transcript = ref("");
const error = ref(null);
const showHelp = ref(false);
const commandPatterns = [
  { pattern: /where am i/i, command: "whereAmI" },
  { pattern: /(how far|distance|eta)/i, command: "distance" },
  {
    pattern: /(next instruction|what next|next direction)/i,
    command: "nextInstruction",
  },
  { pattern: /(end|stop|cancel) navigation/i, command: "endNavigation" },
  { pattern: /(repeat|say again|what was that)/i, command: "repeat" },
];

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
      processCommand(transcript.value);
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

function toggleVoiceCommands() {
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

function processCommand(text) {
  // Check if help was requested
  if (/help|commands|what can (i|you) say/i.test(text)) {
    showHelp.value = true;
    return;
  }

  // Match command patterns
  let matchedCommand = "unknown";
  let matchFound = false;

  for (const { pattern, command } of commandPatterns) {
    if (pattern.test(text)) {
      matchedCommand = command;
      matchFound = true;
      break;
    }
  }

  // Emit the matched command
  emit("command", matchedCommand, text);
}

function toggleHelp() {
  showHelp.value = !showHelp.value;
}
</script>

<style scoped>
.voice-commands {
  position: relative;
  display: inline-block;
}

.command-button {
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

.command-button:hover {
  background-color: #f5f5f5;
}

.command-button.listening {
  background-color: #4285f4;
  border-color: #4285f4;
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
  background-color: rgba(66, 133, 244, 0.7);
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

.commands-help {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  z-index: 20;
}

.commands-help h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.commands-help ul {
  margin: 0;
  padding-left: 20px;
}

.commands-help li {
  margin-bottom: 5px;
  font-size: 14px;
}

.close-help {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.close-help:hover {
  background-color: #e5e5e5;
}

/* ===========================
   RESPONSIVE STYLES
   =========================== */

/* Tablet */
@media (max-width: 768px) {
  .command-button {
    width: 45px;
    height: 45px;
    font-size: 16px;
  }

  .listening-indicator {
    font-size: 12px;
    padding: 8px 12px;
    max-width: 250px;
  }

  .commands-help {
    width: 90vw;
    max-width: 350px;
    padding: 15px;
  }

  .commands-help h3 {
    font-size: 16px;
  }

  .commands-help ul li {
    font-size: 13px;
    margin-bottom: 8px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .voice-commands {
    position: relative;
  }

  .command-button {
    width: 40px;
    height: 40px;
    font-size: 14px;
    margin: 0;
  }

  .listening-indicator {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    max-width: 90vw;
    text-align: center;
    z-index: 1000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .commands-help {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95vw;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1001;
    padding: 20px;
  }

  .commands-help h3 {
    font-size: 18px;
    margin-bottom: 15px;
    text-align: center;
  }

  .commands-help ul {
    margin-bottom: 20px;
  }

  .commands-help ul li {
    font-size: 14px;
    margin-bottom: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .commands-help ul li strong {
    color: #007bff;
    display: block;
    margin-bottom: 4px;
  }

  .close-help {
    width: 100%;
    padding: 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px; /* Touch target size */
    background-color: #007bff;
    color: white;
    border-radius: 6px;
  }

  .close-help:hover {
    background-color: #0056b3;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .command-button {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .listening-indicator {
    top: 15px;
    padding: 6px 12px;
    font-size: 11px;
  }

  .commands-help {
    width: 98vw;
    padding: 15px;
  }

  .commands-help h3 {
    font-size: 16px;
  }

  .commands-help ul li {
    font-size: 13px;
    padding: 6px;
  }

  .close-help {
    padding: 10px;
    font-size: 15px;
  }
}

/* Landscape orientation */
@media (max-height: 500px) and (orientation: landscape) {
  .listening-indicator {
    top: 10px;
    padding: 4px 12px;
    font-size: 10px;
  }

  .commands-help {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80vw;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 15px;
  }

  .commands-help h3 {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .commands-help ul li {
    font-size: 12px;
    margin-bottom: 6px;
    padding: 4px;
  }

  .close-help {
    padding: 8px;
    font-size: 14px;
  }
}

/* Touch devices */
@media (pointer: coarse) {
  .command-button {
    min-width: 44px;
    min-height: 44px;
  }

  .close-help {
    min-height: 44px;
  }
}

/* Accessibility - high contrast mode */
@media (prefers-contrast: high) {
  .command-button {
    border: 2px solid currentColor;
  }

  .listening-indicator {
    border: 1px solid currentColor;
  }

  .commands-help {
    border: 2px solid currentColor;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .pulse,
  .command-button {
    animation: none !important;
  }
}
</style>
