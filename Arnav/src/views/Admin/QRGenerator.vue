<template>
  <div class="qr-generator">
    <h1>QR Code Generator for Locations</h1>

    <div class="form-container">
      <h2>Enter Location Details</h2>

      <div class="form-group">
        <label for="locationId">Location ID*:</label>
        <input
          id="locationId"
          v-model="locationData.locationId"
          placeholder="e.g., lib001"
          required />
      </div>

      <div class="form-group">
        <label for="locationName">Location Name*:</label>
        <input
          id="locationName"
          v-model="locationData.name"
          placeholder="e.g., Main Library"
          required />
      </div>

      <div class="form-group">
        <label for="building">Building:</label>
        <input
          id="building"
          v-model="locationData.building"
          placeholder="e.g., Academic Center" />
      </div>

      <div class="form-group">
        <label for="floor">Floor:</label>
        <input id="floor" v-model="locationData.floor" type="number" min="0" />
      </div>

      <div class="form-group">
        <label for="coordX">X Coordinate:</label>
        <input id="coordX" v-model="locationData.x" type="number" step="0.1" />
      </div>

      <div class="form-group">
        <label for="coordY">Y Coordinate:</label>
        <input id="coordY" v-model="locationData.y" type="number" step="0.1" />
      </div>

      <div class="buttons">
        <button
          @click="generateQR"
          :disabled="!isFormValid"
          class="generate-btn">
          Generate QR Code
        </button>
        <button @click="clearForm" class="clear-btn">Clear Form</button>
      </div>
    </div>

    <div v-if="qrValue" class="qr-result">
      <h2>QR Code for {{ locationData.name }}</h2>
      <div class="qr-code">
        <vue-qr :text="qrValue" :size="200" :margin="10" />
      </div>

      <div class="qr-info">
        <p><strong>Location ID:</strong> {{ locationData.locationId }}</p>
        <p><strong>Data encoded:</strong></p>
        <pre>{{ qrValue }}</pre>
      </div>

      <div class="qr-actions">
        <button @click="downloadQR" class="download-btn">
          Download QR Code
        </button>
        <button @click="printQR" class="print-btn">Print QR Code</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import VueQr from "vue-qr";

export default {
  name: "QRGenerator",
  components: {
    VueQr,
  },
  setup() {
    const locationData = ref({
      locationId: "",
      name: "",
      building: "",
      floor: null,
      x: null,
      y: null,
    });

    const qrValue = ref("");

    const isFormValid = computed(() => {
      return (
        locationData.value.locationId.trim() !== "" &&
        locationData.value.name.trim() !== ""
      );
    });

    const generateQR = () => {
      // Create an object with only non-empty values
      const dataToEncode = {};
      Object.keys(locationData.value).forEach((key) => {
        if (
          locationData.value[key] !== null &&
          locationData.value[key] !== ""
        ) {
          dataToEncode[key] = locationData.value[key];
        }
      });

      // Convert the coordinates into proper format if they exist
      if (dataToEncode.x !== undefined && dataToEncode.y !== undefined) {
        dataToEncode.coordinates = {
          x: parseFloat(dataToEncode.x),
          y: parseFloat(dataToEncode.y),
        };
        // Remove individual coordinate fields
        delete dataToEncode.x;
        delete dataToEncode.y;
      }

      // Convert to JSON string
      qrValue.value = JSON.stringify(dataToEncode);
    };

    const clearForm = () => {
      locationData.value = {
        locationId: "",
        name: "",
        building: "",
        floor: null,
        x: null,
        y: null,
      };
      qrValue.value = "";
    };

    const downloadQR = () => {
      // This is just a placeholder - you would need to implement actual download functionality
      // using a library like html2canvas or dom-to-image to capture the QR code as an image
      alert("Download functionality would be implemented here");
      // In a real implementation you would:
      // 1. Convert QR code to an image using html2canvas
      // 2. Create a download link
      // 3. Trigger download
    };

    const printQR = () => {
      window.print();
    };

    return {
      locationData,
      qrValue,
      isFormValid,
      generateQR,
      clearForm,
      downloadQR,
      printQR,
    };
  },
};
</script>

<style scoped>
.qr-generator {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

h2 {
  margin-bottom: 20px;
  color: #444;
}

.form-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn {
  background-color: #4caf50;
  color: white;
  flex: 1;
}

.generate-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.qr-result {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-info {
  margin: 20px 0;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.qr-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.download-btn {
  background-color: #2196f3;
  color: white;
}

.print-btn {
  background-color: #9e9e9e;
  color: white;
}

button:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .buttons,
  .qr-actions {
    flex-direction: column;
  }
}

@media print {
  body * {
    visibility: hidden;
  }

  .qr-result,
  .qr-result * {
    visibility: visible;
  }

  .qr-result {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .qr-actions {
    display: none;
  }
}
</style>
