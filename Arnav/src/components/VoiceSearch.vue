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

<script>
export default {
  name: "VoiceSearch",
  props: {
    lang: {
      type: String,
      default: "en-US",
    },
  },
  data() {
    return {
      recognition: null,
      isListening: false,
      transcript: "",
      error: null,
    };
  },
  mounted() {
    this.initSpeechRecognition();
  },
  methods: {
    initSpeechRecognition() {
      // Check if browser supports speech recognition
      let SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      } else {
        this.error = "Speech recognition is not supported in this browser.";
        console.error(this.error);
      }
    },

    setupRecognition() {
      if (!this.recognition) return;

      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.transcript = "";
      };

      this.recognition.onresult = (event) => {
        const result = event.results[0];
        this.transcript = result[0].transcript;

        if (result.isFinal) {
          this.$emit("result", this.transcript);
          this.stopListening();
        }
      };

      this.recognition.onerror = (event) => {
        this.error = `Error: ${event.error}`;
        this.$emit("error", this.error);
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    },

    toggleVoiceRecognition() {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    },

    startListening() {
      if (!this.recognition) {
        this.initSpeechRecognition();
      }

      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (error) {
          console.error("Error starting recognition:", error);
        }
      }
    },

    stopListening() {
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
    },
  },
  beforeUnmount() {
    if (this.recognition) {
      this.recognition.abort();
    }
  },
};
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
