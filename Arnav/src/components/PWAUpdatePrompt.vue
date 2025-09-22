<template>
  <div v-if="showUpdatePrompt" class="pwa-update-prompt">
    <div class="update-prompt-content">
      <div class="update-icon">🔄</div>
      <div class="update-message">
        <h4>App Update Available</h4>
        <p>A new version is ready. Reload to update?</p>
      </div>
      <div class="update-actions">
        <button @click="updateApp" class="update-btn">Update</button>
        <button @click="dismissUpdate" class="dismiss-btn">Later</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "PWAUpdatePrompt",
  setup() {
    const showUpdatePrompt = ref(false);
    let updateSW = null;

    onMounted(() => {
      // Listen for PWA update events
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "SW_UPDATE_AVAILABLE") {
            showUpdatePrompt.value = true;
            updateSW = event.data.updateSW;
          }
        });
      }
    });

    const updateApp = () => {
      if (updateSW) {
        updateSW(true);
      } else {
        window.location.reload();
      }
      showUpdatePrompt.value = false;
    };

    const dismissUpdate = () => {
      showUpdatePrompt.value = false;
    };

    return {
      showUpdatePrompt,
      updateApp,
      dismissUpdate,
    };
  },
};
</script>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  max-width: 400px;
  min-width: 320px;
}

.update-prompt-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.update-icon {
  font-size: 24px;
  animation: spin 2s linear infinite;
}

.update-message {
  flex: 1;
}

.update-message h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.update-message p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.update-actions {
  display: flex;
  gap: 8px;
}

.update-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.update-btn:hover {
  background: #218838;
}

.dismiss-btn {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  background: #f5f5f5;
  color: #333;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .pwa-update-prompt {
    left: 10px;
    right: 10px;
    max-width: none;
    transform: none;
  }
}
</style>
