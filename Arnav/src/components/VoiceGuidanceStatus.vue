<template>
  <div class="voice-guidance-status" :class="{ 'is-speaking': isSpeaking }">
    <div class="status-icon">
      <span v-if="isSpeaking" class="speaking-animation">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </span>
      <span v-else class="icon">🔊</span>
    </div>
    <div class="status-text">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  isSpeaking: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

// Computed
const statusText = computed(() => {
  if (!props.enabled) {
    return "Voice guidance is disabled";
  }

  return props.isSpeaking ? "Speaking..." : "Voice guidance ready";
});
</script>

<style scoped>
.voice-guidance-status {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 200px;
  transition: all 0.3s ease;
}

.voice-guidance-status.is-speaking {
  background-color: rgba(66, 133, 244, 0.1);
}

.status-icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 18px;
}

.status-text {
  font-size: 14px;
  color: #333;
}

.speaking-animation {
  display: flex;
  align-items: flex-end;
  height: 16px;
  width: 18px;
}

.bar {
  background-color: #4285f4;
  width: 3px;
  margin: 0 1px;
  height: 3px;
  border-radius: 1px;
  animation: sound 0.5s 0s infinite alternate;
}

.bar:nth-child(1) {
  animation-duration: 0.2s;
}

.bar:nth-child(2) {
  animation-duration: 0.15s;
}

.bar:nth-child(3) {
  animation-duration: 0.25s;
}

.bar:nth-child(4) {
  animation-duration: 0.3s;
}

@keyframes sound {
  0% {
    height: 3px;
  }
  100% {
    height: 15px;
  }
}
</style>
