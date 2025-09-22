<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="install-prompt-content">
      <div class="install-prompt-header">
        <img src="/pwa-192x192.png" alt="ARNAV Logo" class="install-app-icon" />
        <div class="install-app-info">
          <h3>Install ARNAV App</h3>
          <p>Get quick access to AR navigation features</p>
        </div>
      </div>
      <div class="install-prompt-actions">
        <button @click="installApp" class="install-btn">Install</button>
        <button @click="dismissPrompt" class="dismiss-btn">Not now</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "PWAInstallPrompt",
  setup() {
    const showInstallPrompt = ref(false);
    let deferredPrompt = null;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Update UI to notify the user they can install the PWA
      showInstallPrompt.value = true;
    };

    const installApp = async () => {
      if (!deferredPrompt) {
        return;
      }

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the deferredPrompt variable
      deferredPrompt = null;
      showInstallPrompt.value = false;
    };

    const dismissPrompt = () => {
      showInstallPrompt.value = false;
      // Store dismissal in localStorage to avoid showing again for a while
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    const checkDismissalStatus = () => {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const currentTime = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        // Don't show prompt if dismissed within last 7 days
        if (currentTime - dismissedTime < sevenDays) {
          return false;
        }
      }
      return true;
    };

    onMounted(() => {
      // Check if app is already installed
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return;
      }

      // Check if user has dismissed recently
      if (!checkDismissalStatus()) {
        return;
      }

      // Listen for the beforeinstallprompt event
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Clean up event listener
      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    });

    return {
      showInstallPrompt,
      installApp,
      dismissPrompt,
    };
  },
};
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border: 1px solid #e0e0e0;
  max-width: 400px;
  margin: 0 auto;
}

.install-prompt-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.install-prompt-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.install-app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.install-app-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.install-app-info p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

.install-prompt-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.install-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.install-btn:hover {
  background: #0056b3;
}

.dismiss-btn {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  background: #f5f5f5;
  color: #333;
}

@media (max-width: 480px) {
  .pwa-install-prompt {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .install-prompt-actions {
    flex-direction: column;
  }

  .install-btn,
  .dismiss-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
