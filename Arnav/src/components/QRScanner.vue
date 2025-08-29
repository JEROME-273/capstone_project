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
      <qrcode-stream @decode="onDecode" @init="onInit" />
      <button @click="stopScanning" class="stop-button">Cancel</button>
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

    const startScanning = () => {
      scanning.value = true;
      error.value = "";
    };

    const stopScanning = () => {
      scanning.value = false;
    };

    const onDecode = (decodedString) => {
      try {
        // First check if the QR contains valid JSON
        const locationData = JSON.parse(decodedString);
        console.log("Decoded QR data:", locationData);

        // Check if the required data is available
        if (locationData && locationData.locationId) {
          // Navigate to the specific location
          router.push({
            name: "LocationView",
            params: { id: locationData.locationId },
            query: locationData.extraParams || {},
          });
          emit("scanned", locationData);
          stopScanning();
        } else {
          error.value = "Invalid QR code format. Missing location ID.";
        }
      } catch (e) {
        // If not JSON, try to process as URL or plain text
        if (decodedString.includes("location/")) {
          // Assume it's a URL with location ID
          const locationId = decodedString.split("location/")[1].split("/")[0];
          router.push({
            name: "LocationView",
            params: { id: locationId },
          });
          emit("scanned", { locationId });
          stopScanning();
        } else {
          error.value = "Invalid QR code format. Could not process data.";
        }
      }
    };

    const onInit = async (promise) => {
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          error.value = "ERROR: You need to grant camera access permission";
        } else if (error.name === "NotFoundError") {
          error.value = "ERROR: No camera on this device";
        } else if (error.name === "NotSupportedError") {
          error.value = "ERROR: Secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          error.value = "ERROR: Camera already in use";
        } else if (error.name === "OverconstrainedError") {
          error.value = "ERROR: Installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          error.value = "ERROR: Stream API is not supported in this browser";
        } else {
          error.value = `ERROR: ${error.message}`;
        }
      }
    };

    onUnmounted(() => {
      stopScanning();
    });

    return {
      scanning,
      error,
      startScanning,
      stopScanning,
      onDecode,
      onInit,
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

.qrcode-stream {
  width: 100%;
  max-width: 400px;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #333;
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
</style>
