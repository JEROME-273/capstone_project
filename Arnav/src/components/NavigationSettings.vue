<template>
  <div class="navigation-settings">
    <button
      @click="toggleSettings"
      class="settings-button"
      aria-label="Navigation settings">
      <span class="icon">⚙️</span>
    </button>

    <div v-if="showSettings" class="settings-panel">
      <h3>Navigation Settings</h3>

      <div class="setting-item">
        <label for="voice-guidance">Voice Guidance</label>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="voice-guidance"
            v-model="settings.voiceGuidanceEnabled"
            @change="updateSettings" />
          <span class="slider"></span>
        </div>
      </div>

      <div class="setting-item">
        <label for="voice-volume">Voice Volume</label>
        <input
          type="range"
          id="voice-volume"
          min="0"
          max="1"
          step="0.1"
          v-model.number="settings.voiceVolume"
          @change="updateSettings"
          :disabled="!settings.voiceGuidanceEnabled" />
        <span class="volume-value"
          >{{ Math.round(settings.voiceVolume * 100) }}%</span
        >
      </div>

      <div class="setting-item">
        <label for="show-arrows">Show AR Arrows</label>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="show-arrows"
            v-model="settings.showArrows"
            @change="updateSettings" />
          <span class="slider"></span>
        </div>
      </div>

      <div class="setting-item">
        <label for="distance-unit">Distance Unit</label>
        <select
          id="distance-unit"
          v-model="settings.distanceUnit"
          @change="updateSettings">
          <option value="metric">Metric (m/km)</option>
          <option value="imperial">Imperial (ft/mi)</option>
        </select>
      </div>

      <button @click="closeSettings" class="close-settings">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

// Props
const props = defineProps({
  initialSettings: {
    type: Object,
    default: () => ({
      voiceGuidanceEnabled: true,
      voiceVolume: 1,
      showArrows: true,
      distanceUnit: "metric",
    }),
  },
});

// Emits
const emit = defineEmits(["update:settings"]);

// Data
const showSettings = ref(false);
const settings = reactive({ ...props.initialSettings });

// Methods
function toggleSettings() {
  showSettings.value = !showSettings.value;
}

function closeSettings() {
  showSettings.value = false;
}

function updateSettings() {
  emit("update:settings", { ...settings });
}
</script>

<style scoped>
.navigation-settings {
  position: relative;
  display: inline-block;
}

.settings-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.settings-button:hover {
  background-color: #f5f5f5;
}

.icon {
  font-size: 24px;
}

.settings-panel {
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

.settings-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
}

.setting-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item label {
  font-size: 14px;
  margin-right: 10px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4285f4;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4285f4;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

input[type="range"] {
  width: 150px;
}

.volume-value {
  font-size: 14px;
  width: 40px;
  text-align: right;
}

select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  font-size: 14px;
}

.close-settings {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}

.close-settings:hover {
  background-color: #e5e5e5;
}
</style>
