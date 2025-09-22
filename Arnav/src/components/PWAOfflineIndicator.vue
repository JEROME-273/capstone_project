<template>
  <div v-if="!isOnline" class="offline-indicator">
    <div class="offline-content">
      <span class="offline-icon">📡</span>
      <span class="offline-text">You're offline</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "PWAOfflineIndicator",
  setup() {
    const isOnline = ref(navigator.onLine);

    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine;
    };

    onMounted(() => {
      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
    });

    onUnmounted(() => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    });

    return {
      isOnline,
    };
  },
};
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  z-index: 1002;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.offline-icon {
  font-size: 16px;
}

.offline-text {
  font-size: 14px;
}
</style>
