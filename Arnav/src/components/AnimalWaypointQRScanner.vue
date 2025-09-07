<template>
  <div class="qr-scanner-container">
    <div class="scanner-header">
      <h3>Animal & Waypoint QR Scanner</h3>
      <p>Scan QR codes for animals and waypoints</p>
    </div>

    <!-- Video Display -->
    <div class="video-container">
      <video ref="video" autoplay playsinline></video>
      <div v-if="scanning" class="scan-overlay">
        <div class="scan-frame"></div>
        <p class="scan-instruction">Position QR code within the frame</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button @click="startScanner" :disabled="scanning" class="btn-primary">
        {{ scanning ? "Scanning..." : "Start Scanner" }}
      </button>
      <button @click="stopScanner" :disabled="!scanning" class="btn-secondary">
        Stop Scanner
      </button>
    </div>

    <!-- Status -->
    <div class="status" v-if="statusMessage">
      <p :class="statusType">{{ statusMessage }}</p>
    </div>

    <!-- Scan Results -->
    <div v-if="lastScanResult" class="scan-result">
      <h4>Last Scan Result:</h4>
      <div class="result-card">
        <div v-if="lastScanResult.type === 'animal'">
          <h5>🐾 Animal Information</h5>
          <p><strong>Name:</strong> {{ lastScanResult.data.name }}</p>
          <p><strong>Species:</strong> {{ lastScanResult.data.species }}</p>
          <p><strong>Location:</strong> {{ lastScanResult.data.location }}</p>
          <p v-if="lastScanResult.data.description">
            <strong>Description:</strong> {{ lastScanResult.data.description }}
          </p>
        </div>
        <div v-else-if="lastScanResult.type === 'waypoint'">
          <h5>📍 Waypoint Information</h5>
          <p><strong>Name:</strong> {{ lastScanResult.data.name }}</p>
          <p>
            <strong>Coordinates:</strong> {{ lastScanResult.data.latitude }},
            {{ lastScanResult.data.longitude }}
          </p>
          <p v-if="lastScanResult.data.description">
            <strong>Description:</strong> {{ lastScanResult.data.description }}
          </p>
          <p v-if="lastScanResult.data.category">
            <strong>Category:</strong> {{ lastScanResult.data.category }}
          </p>
        </div>
        <div v-else>
          <h5>📄 Generic QR Code</h5>
          <p>{{ lastScanResult.rawData }}</p>
        </div>
        <small
          >Scanned at:
          {{ new Date(lastScanResult.timestamp).toLocaleString() }}</small
        >
      </div>
    </div>

    <!-- Canvas for QR processing (hidden) -->
    <canvas ref="canvas" style="display: none"></canvas>
  </div>
</template>

<script>
export default {
  name: "AnimalWaypointQRScanner",
  data() {
    return {
      stream: null,
      scanning: false,
      statusMessage: "",
      statusType: "info",
      lastScanResult: null,
      scanInterval: null,
      jsQR: null, // Will hold the jsQR library when loaded
    };
  },
  async mounted() {
    // Load jsQR library dynamically
    await this.loadJsQR();
  },
  methods: {
    async loadJsQR() {
      try {
        // Load jsQR from CDN
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
        script.onload = () => {
          this.jsQR = window.jsQR;
          this.setStatus("QR scanner ready", "success");
        };
        script.onerror = () => {
          this.setStatus("Failed to load QR scanner library", "error");
        };
        document.head.appendChild(script);
      } catch (error) {
        this.setStatus("Error loading QR scanner: " + error.message, "error");
      }
    },

    async startScanner() {
      if (!this.jsQR) {
        this.setStatus("QR scanner library not loaded yet", "error");
        return;
      }

      try {
        this.setStatus("Starting camera...", "info");

        // Prefer back camera for better QR scanning
        const constraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = this.stream;
        this.scanning = true;

        // Wait for video to be ready
        this.$refs.video.onloadedmetadata = () => {
          this.startQRDetection();
          this.setStatus("Scanner active - point camera at QR code", "success");
        };
      } catch (err) {
        // Fallback to any available camera
        try {
          const fallbackConstraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          };
          this.stream = await navigator.mediaDevices.getUserMedia(
            fallbackConstraints
          );
          this.$refs.video.srcObject = this.stream;
          this.scanning = true;

          this.$refs.video.onloadedmetadata = () => {
            this.startQRDetection();
            this.setStatus(
              "Scanner active (front camera) - point camera at QR code",
              "success"
            );
          };
        } catch (error) {
          this.setStatus("Camera access failed: " + error.message, "error");
        }
      }
    },

    startQRDetection() {
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
      }

      this.scanInterval = setInterval(() => {
        this.scanForQR();
      }, 300); // Scan every 300ms
    },

    scanForQR() {
      if (!this.scanning || !this.$refs.video || !this.jsQR) return;

      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const context = canvas.getContext("2d");

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const qrCode = this.jsQR(
          imageData.data,
          imageData.width,
          imageData.height
        );

        if (qrCode) {
          this.processQRCode(qrCode.data);
        }
      }
    },

    processQRCode(data) {
      try {
        // Try to parse as JSON first (structured data)
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch {
          // If not JSON, treat as plain text
          parsedData = { raw: data };
        }

        const result = {
          rawData: data,
          timestamp: Date.now(),
          type: "unknown",
          data: parsedData,
        };

        // Determine type based on data structure
        if (
          parsedData.type === "animal" ||
          parsedData.species ||
          parsedData.animal_id
        ) {
          result.type = "animal";
          result.data = {
            name: parsedData.name || parsedData.animal_name || "Unknown Animal",
            species:
              parsedData.species ||
              parsedData.animal_species ||
              "Unknown Species",
            location:
              parsedData.location || parsedData.habitat || "Unknown Location",
            description: parsedData.description || parsedData.info || "",
            id: parsedData.id || parsedData.animal_id || null,
          };
        } else if (
          parsedData.type === "waypoint" ||
          parsedData.latitude ||
          parsedData.coordinates
        ) {
          result.type = "waypoint";
          result.data = {
            name: parsedData.name || parsedData.waypoint_name || "Waypoint",
            latitude:
              parsedData.latitude ||
              parsedData.lat ||
              parsedData.coordinates?.lat ||
              0,
            longitude:
              parsedData.longitude ||
              parsedData.lng ||
              parsedData.coordinates?.lng ||
              0,
            description: parsedData.description || parsedData.info || "",
            category: parsedData.category || parsedData.type || "general",
            id: parsedData.id || parsedData.waypoint_id || null,
          };
        }

        this.lastScanResult = result;
        this.setStatus(
          `${
            result.type === "animal"
              ? "Animal"
              : result.type === "waypoint"
              ? "Waypoint"
              : "QR Code"
          } detected!`,
          "success"
        );

        // Emit event for parent components
        this.$emit("qr-scanned", result);

        // Optional: Stop scanning after successful scan
        // this.stopScanner();
      } catch (error) {
        this.setStatus("Error processing QR code: " + error.message, "error");
      }
    },

    stopScanner() {
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
        this.$refs.video.srcObject = null;
      }

      this.scanning = false;
      this.setStatus("Scanner stopped", "info");
    },

    setStatus(message, type = "info") {
      this.statusMessage = message;
      this.statusType = type;

      // Clear status after 5 seconds
      setTimeout(() => {
        if (this.statusMessage === message) {
          this.statusMessage = "";
        }
      }, 5000);
    },

    clearLastResult() {
      this.lastScanResult = null;
    },
  },

  beforeDestroy() {
    this.stopScanner();
  },
};
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.scanner-header {
  text-align: center;
  margin-bottom: 20px;
}

.scanner-header h3 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.scanner-header p {
  color: #6c757d;
  margin: 0;
}

.video-container {
  position: relative;
  margin-bottom: 20px;
}

video {
  width: 320px;
  height: 240px;
  object-fit: cover;
  border: 3px solid #007bff;
  border-radius: 12px;
  background: #000;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid #28a745;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
}

.scan-instruction {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-secondary:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.status {
  margin-bottom: 15px;
}

.status p {
  margin: 0;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.status .info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status .success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status .error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.scan-result {
  width: 100%;
  max-width: 500px;
}

.scan-result h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.result-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.result-card h5 {
  color: #495057;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-card p {
  margin: 5px 0;
  color: #6c757d;
}

.result-card strong {
  color: #2c3e50;
}

.result-card small {
  color: #868e96;
  font-style: italic;
  display: block;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

/* Responsive design */
@media (max-width: 480px) {
  .qr-scanner-container {
    padding: 15px;
    margin: 10px;
  }

  video {
    width: 280px;
    height: 210px;
  }

  .controls {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
