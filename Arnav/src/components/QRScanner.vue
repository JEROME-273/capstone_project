<template>
  <div class="qr-scanner-container">
    <h2>{{ title || "Scan QR Code" }}</h2>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-if="!scanning" class="scanner-controls">
      <button @click="startScanning" class="scan-button">Start Scanning</button>
    </div>
    <div v-else class="scanner-active">
      <div class="scan-frame" :class="{ 'qr-detected': qrDetected }">
        <qrcode-stream
          :key="constraintsKey"
          :constraints="videoConstraints"
          @decode="onDecode"
          @init="onInit"
          @detect="onDetect"
          :track="trackBoundingBox" />
        <div
          class="frame-guide"
          :class="{ 'scanning-active': qrDetected }"></div>
        <div v-if="decodedInfo && processing" class="success-overlay">
          <span class="success-pulse"></span>
          <span class="success-text">OK</span>
        </div>
        <!-- Detection indicator -->
        <div v-if="qrDetected && !processing" class="detection-indicator">
          <span class="detect-pulse"></span>
          <span class="detect-text">QR Detected</span>
        </div>
      </div>
      <div class="scan-actions">
        <button @click="stopScanning" class="stop-button">Cancel</button>
      </div>
      <p class="scan-tip">
        I-center ang QR sa loob ng square frame. AR Navigation ay magsisimula
        pagkatapos ma-scan.
      </p>
      <div class="scan-status">
        <span v-if="!qrDetected && !processing" class="status-scanning"
          >🔍 Looking for QR...</span
        >
        <span v-else-if="qrDetected && !processing" class="status-found"
          >✅ QR Found - Hold steady</span
        >
        <span v-else-if="processing" class="status-processing"
          >⏳ Processing...</span
        >
      </div>
      <p v-if="decodedInfo" class="decoded-feedback">
        Nabasa: {{ decodedInfo.locationId }}
        (AR Navigation starting...)
      </p>
    </div>
  </div>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "QRScanner",
  components: {
    QrcodeStream,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const scanning = ref(false);
    const error = ref("");
    const processing = ref(false);
    const decodedInfo = ref(null);
    const constraintsKey = ref(0); // Key to force component refresh when constraints change

    // Simple camera cleanup - no complex device enumeration
    const cleanupExistingStreams = async () => {
      console.log("Preparing camera for QR scanning...");
      // Just a simple delay to ensure clean camera initialization
      return new Promise((resolve) => setTimeout(resolve, 100));
    };

    // Mobile Chrome specific camera constraints - force rear camera
    const videoConstraints = ref({
      audio: false,
      video: {
        facingMode: { ideal: "environment" }, // Use ideal instead of exact for better mobile compatibility
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Mobile Chrome specific constraints
        advanced: [{ facingMode: { exact: "environment" } }],
      },
    });

    console.log(
      "QRScanner initialized with REAR camera constraints:",
      videoConstraints.value
    );

    const qrDetected = ref(false);
    const qrDetectionTimeout = ref(null); // Keep this for the new logic

    // Reset QR detection state after timeout - made more responsive
    // const resetQRDetection = () => {
    //   if (qrDetectionTimeout.value) {
    //     clearTimeout(qrDetectionTimeout.value);
    //   }
    //   qrDetectionTimeout.value = setTimeout(() => {
    //     qrDetected.value = false;
    //   }, 150); // Reduced to 150ms for faster response
    // };

    const trackBoundingBox = (detectedCodes, ctx) => {
      // const now = Date.now();

      if (!detectedCodes || detectedCodes.length === 0) {
        // Only start reset timer if we haven't detected anything recently
        // if (now - lastDetectionTime.value > 100) {
        //   resetQRDetection();
        // }
        return;
      }

      // Update last detection time
      // lastDetectionTime.value = now;

      // Clear any pending timeout since we detected QR
      // if (qrDetectionTimeout.value) {
      //   clearTimeout(qrDetectionTimeout.value);
      //   qrDetectionTimeout.value = null;
      // }

      // Visual feedback - may nakitang QR
      // qrDetected.value = true;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#00ff73";
      ctx.shadowColor = "#00ff73";
      ctx.shadowBlur = 8;

      detectedCodes.forEach((code) => {
        const { boundingBox: b } = code;
        // Draw glowing rectangle around QR
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // Add corner markers
        const cornerSize = 15;
        ctx.lineWidth = 4;
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + cornerSize);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(b.x + cornerSize, b.y);
        ctx.stroke();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(b.x + b.width - cornerSize, b.y);
        ctx.lineTo(b.x + b.width, b.y);
        ctx.lineTo(b.x + b.width, b.y + cornerSize);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.height - cornerSize);
        ctx.lineTo(b.x, b.y + b.height);
        ctx.lineTo(b.x + cornerSize, b.y + b.height);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(b.x + b.width - cornerSize, b.y + b.height);
        ctx.lineTo(b.x + b.width, b.y + b.height);
        ctx.lineTo(b.x + b.width, b.y + b.height - cornerSize);
        ctx.stroke();
      });
    };

    const startScanning = async () => {
      scanning.value = true;
      error.value = "";
    };

    const stopScanning = () => {
      scanning.value = false;

      // Clean up QR detection state
      qrDetected.value = false;
      processing.value = false;
      if (qrDetectionTimeout.value) {
        clearTimeout(qrDetectionTimeout.value);
        qrDetectionTimeout.value = null;
      }
    };

    function extractLocationId(raw) {
      console.log("Trying to extract location ID from:", raw); // Debug log

      // Try JSON first
      try {
        const obj = JSON.parse(raw);
        if (obj.locationId || obj.id) {
          console.log("Found ID in JSON:", obj.locationId || obj.id); // Debug log
          return { id: obj.locationId || obj.id, ar: !!obj.ar };
        }
      } catch (_) {
        console.log("Not a JSON format"); // Debug log
      }

      // URL patterns
      const urlLike = /https?:\/\//i.test(raw);
      if (urlLike) {
        try {
          const u = new URL(raw.trim());
          // check query parameter
          if (u.searchParams.get("id")) {
            console.log("Found ID in URL query:", u.searchParams.get("id")); // Debug log
            return {
              id: u.searchParams.get("id"),
              ar: u.searchParams.get("ar") === "true",
            };
          }
          // path segments
          const segs = u.pathname.split("/").filter(Boolean);
          const maybe = segs[segs.length - 1];
          if (maybe && maybe.length >= 5) {
            // Reduced minimum length from 10 to 5
            console.log("Found ID in URL path:", maybe); // Debug log
            return { id: maybe, ar: false };
          }
        } catch (_) {
          console.log("Invalid URL format"); // Debug log
        }
      }

      // Plain pattern (more flexible: letters+digits, length 5-50)
      if (/^[A-Za-z0-9_-]{5,50}$/.test(raw.trim())) {
        console.log("Found plain ID:", raw.trim()); // Debug log
        return { id: raw.trim(), ar: false };
      }

      // Path style location/<id>
      if (raw.includes("location/")) {
        const parts = raw.split("location/")[1].split(/[\n\r\s?&#]/)[0];
        if (parts) {
          console.log("Found ID in location path:", parts); // Debug log
          return { id: parts, ar: false };
        }
      }

      // Any alphanumeric string (fallback for most QR codes)
      const trimmed = raw.trim();
      if (trimmed && trimmed.length >= 3 && /^[A-Za-z0-9_-]+$/.test(trimmed)) {
        console.log("Using fallback ID extraction:", trimmed); // Debug log
        return { id: trimmed, ar: false };
      }

      console.log("Could not extract location ID from:", raw); // Debug log
      return null;
    }

    // More responsive detection handler
    const onDetect = (detectedCodes) => {
      console.log("QR codes detected:", detectedCodes.length); // Debug log

      if (detectedCodes.length > 0) {
        qrDetected.value = true;
        console.log("QR detected, setting qrDetected to true"); // Debug log

        // Clear any pending reset timer
        if (qrDetectionTimeout.value) {
          clearTimeout(qrDetectionTimeout.value);
          qrDetectionTimeout.value = null;
        }

        // If QR is detected for a while but not decoded, try to manually decode
        setTimeout(() => {
          if (qrDetected.value && !processing.value) {
            console.log("QR detected but not decoded, trying manual approach"); // Debug log
            // Try to get the raw value from the detected code
            if (detectedCodes[0] && detectedCodes[0].rawValue) {
              onDecode(detectedCodes[0].rawValue);
            }
          }
        }, 2000); // Wait 2 seconds
      } else {
        // If no codes are detected, start a timer to reset the status
        if (!qrDetectionTimeout.value) {
          qrDetectionTimeout.value = setTimeout(() => {
            qrDetected.value = false;
            qrDetectionTimeout.value = null;
            console.log("No QR detected, resetting status"); // Debug log
          }, 200); // Reset after 200ms of no detection
        }
      }
    };

    const onDecode = (decodedString) => {
      console.log("QR Code decoded:", decodedString); // Debug log

      if (processing.value) return; // prevent double triggers
      processing.value = true;
      qrDetected.value = false; // Immediately hide "QR Found"

      // Clear any pending reset timer
      if (qrDetectionTimeout.value) {
        clearTimeout(qrDetectionTimeout.value);
        qrDetectionTimeout.value = null;
      }

      const result = extractLocationId(decodedString);
      console.log("Extracted location result:", result); // Debug log

      if (!result) {
        console.log("Failed to extract location ID, trying direct approach"); // Debug log
        // If extraction fails, try to use the decoded string directly as location ID
        const directId = decodedString.trim();
        if (directId && directId.length > 5) {
          console.log("Using direct ID:", directId); // Debug log
          decodedInfo.value = { locationId: directId, ar: true };
          if (navigator.vibrate) navigator.vibrate(40);

          setTimeout(() => {
            router.push({ name: "homepage", query: { startAr: directId } });
            emit("scanned", decodedInfo.value);
            stopScanning();
          }, 220);
          return;
        }

        error.value = "Hindi mabasa ang QR (unsupported format).";
        // Allow trying again after a short delay
        setTimeout(() => {
          processing.value = false;
        }, 1000);
        return;
      }

      // Always set ar to true to automatically start AR navigation
      decodedInfo.value = { locationId: result.id, ar: true };
      if (navigator.vibrate) navigator.vibrate(40);

      setTimeout(() => {
        // Always redirect to homepage with startAr to trigger AR navigation automatically
        router.push({ name: "homepage", query: { startAr: result.id } });
        emit("scanned", decodedInfo.value);
        stopScanning();
      }, 220);
    };

    const onInit = async (promise) => {
      console.log(
        "Initializing camera with constraints:",
        videoConstraints.value
      );
      try {
        const result = await promise;
        console.log("Camera initialized successfully:", result);

        // Enhanced mobile Chrome camera verification
        if (result && result.getVideoTracks) {
          const videoTrack = result.getVideoTracks()[0];
          if (videoTrack) {
            const settings = videoTrack.getSettings();
            console.log("Camera settings:", settings);
            console.log("Facing mode:", settings.facingMode);

            // CRITICAL: Check if wrong camera on mobile Chrome
            if (settings.facingMode !== "environment") {
              console.error(
                "❌ MOBILE CHROME BUG: Wrong camera detected!",
                settings.facingMode
              );

              // Stop wrong camera immediately
              result.getTracks().forEach((track) => track.stop());

              // Try alternative constraints for mobile Chrome
              console.log(
                "🔄 Retrying with mobile Chrome specific constraints..."
              );

              videoConstraints.value = {
                audio: false,
                video: {
                  facingMode: { exact: "environment" },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
              };

              // Force component refresh
              constraintsKey.value++;
              error.value = "Switching to rear camera...";

              return;
            }

            console.log("✅ REAR CAMERA CONFIRMED:", settings.facingMode);
            error.value = ""; // Clear any errors
          }
        }
      } catch (err) {
        console.error("Camera initialization error:", err);

        // Enhanced error handling for mobile Chrome
        if (err.name === "OverconstrainedError") {
          console.log("📱 Mobile Chrome: Trying fallback constraints...");

          // Fallback constraints for problematic mobile Chrome versions
          videoConstraints.value = {
            audio: false,
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "environment", // Simple constraint as last resort
            },
          };

          constraintsKey.value++;
          error.value = "Retrying camera access...";
        } else {
          error.value = `Camera error: ${err.message}`;
        }
      }
    };

    onUnmounted(() => {
      stopScanning();
      // Clean up QR detection timeout
      if (qrDetectionTimeout.value) {
        clearTimeout(qrDetectionTimeout.value);
      }
    });

    return {
      scanning,
      error,
      constraintsKey,
      trackBoundingBox,
      processing,
      decodedInfo,
      videoConstraints,
      startScanning,
      stopScanning,
      onDecode,
      onDetect,
      onInit,
      qrDetected,
    };
  },
};
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.scan-frame {
  position: relative;
  width: 320px;
  height: 320px;
  max-width: 90vw;
  max-height: 90vw;
  border-radius: 18px;
  overflow: hidden;
  border: 3px solid #00ff73;
  box-shadow: 0 0 0 4px rgba(0, 255, 115, 0.25), 0 8px 20px rgba(0, 0, 0, 0.35);
  background: #000;
}

.qrcode-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-guide {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.35);
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 16px;
}

.success-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.success-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid #00ff73;
  border-radius: 16px;
  animation: pulse 0.6s ease-out;
}

.success-text {
  font-size: 2.2rem;
  font-weight: 700;
  color: #00ff73;
  text-shadow: 0 0 6px rgba(0, 255, 115, 0.8);
  animation: pop 0.5s ease;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}
@keyframes pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.scan-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.switch-btn {
  background: #2196f3;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
}

.switch-btn:disabled,
.switch-btn.switching {
  opacity: 0.7;
  cursor: not-allowed;
  background: #666;
}

.switch-btn i {
  margin-right: 6px;
}

.scan-tip {
  font-size: 0.8rem;
  color: #ccc;
  margin-top: 8px;
  text-align: center;
  max-width: 320px;
}

.decoded-feedback {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #00ff73;
  font-weight: 600;
}

.error-message {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 5px;
  width: 100%;
  text-align: center;
}

.scanner-controls,
.scanner-active {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
}

button {
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.scan-button {
  background-color: #4caf50;
  color: white;
}

.stop-button {
  background-color: #f44336;
  color: white;
  margin-top: 15px;
}

button:hover {
  opacity: 0.8;
}

.scan-status {
  margin: 10px 0;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.status-scanning {
  color: #ff9800;
  animation: pulse 2s infinite;
}

.status-found {
  color: #4caf50;
  animation: pop 0.3s ease-out;
}

.status-processing {
  color: #2196f3;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
