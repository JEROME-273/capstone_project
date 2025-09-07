<template>
  <div class="scanner-container">
    <video ref="video" autoplay playsinline></video>
    <button @click="startScanner">Start Scanner</button>
    <button @click="stopScanner">Stop Scanner</button>
  </div>
</template>

<script>
export default {
  name: "Scanner",
  data() {
    return {
      stream: null,
    };
  },
  methods: {
    async startScanner() {
      try {
        // Prefer back camera
        const constraints = {
          video: {
            facingMode: { exact: "environment" },
          },
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = this.stream;
      } catch (err) {
        // Fallback to any camera if back camera is not available
        try {
          const fallbackConstraints = { video: true };
          this.stream = await navigator.mediaDevices.getUserMedia(
            fallbackConstraints
          );
          this.$refs.video.srcObject = this.stream;
        } catch (error) {
          alert("Camera access failed: " + error.message);
        }
      }
    },
    stopScanner() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
        this.$refs.video.srcObject = null;
      }
    },
  },
  beforeDestroy() {
    this.stopScanner();
  },
};
</script>

<style scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
video {
  width: 320px;
  height: 240px;
  object-fit: cover;
  border: 2px solid #333;
  border-radius: 8px;
  margin-bottom: 10px;
}
button {
  margin: 5px;
  padding: 8px 16px;
  font-size: 16px;
}
</style>
