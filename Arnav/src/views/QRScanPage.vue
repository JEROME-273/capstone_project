<template>
  <div class="qr-scanner-page">
    <div class="header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span> Back
      </button>
      <h1>Scan QR Code</h1>
    </div>

    <div class="scanner-wrapper">
      <QRScanner title="Scan QR Code to View Location" @scanned="onQRScanned" />
    </div>

    <div class="instructions">
      <h3>Instructions:</h3>
      <ol>
        <li>Position your device so the QR code appears in the scanner.</li>
        <li>Hold steady until the code is recognized.</li>
        <li>Once scanned, you'll be redirected to the location details.</li>
      </ol>
      <p class="note">
        Note: QR codes should be placed at entrances or key points of each
        location.
      </p>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import QRScanner from "@/components/QRScanner.vue";

export default {
  name: "QRScanPage",
  components: {
    QRScanner,
  },
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.back();
    };

    const onQRScanned = (data) => {
      console.log("QR Code scanned:", data);
      // The QRScanner component will handle navigation
    };

    return {
      goBack,
      onQRScanned,
    };
  },
};
</script>

<style scoped>
.qr-scanner-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  cursor: pointer;
  color: #2196f3;
}

.back-icon {
  font-size: 20px;
}

h1 {
  margin: 10px 0;
  text-align: center;
}

.scanner-wrapper {
  width: 100%;
  margin: 20px 0;
}

.instructions {
  width: 100%;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-top: 20px;
}

ol {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  line-height: 1.4;
}

.note {
  font-style: italic;
  color: #666;
  margin-top: 15px;
}

@media (max-width: 600px) {
  .qr-scanner-page {
    padding: 15px;
  }
}
</style>
