<template>
  <div
    v-if="animal && visible"
    class="animal-info-modal-overlay"
    @click="closeModal">
    <div class="animal-info-modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <h2 class="animal-name">
            <i class="fas fa-paw"></i>
            {{ animal.name || "Animal Information" }}
          </h2>
        </div>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Animal Image -->
        <div class="animal-image-section" v-if="animal.imageUrl">
          <img :src="animal.imageUrl" :alt="animal.name" class="animal-image" />
        </div>

        <!-- Animal Sound Player -->
        <div class="animal-sound-section" v-if="animal.soundUrl">
          <h3 class="sound-title">
            <i class="fas fa-volume-up"></i>
            Listen to {{ animal.name }}
          </h3>
          <div class="sound-player">
            <audio
              ref="audioPlayer"
              :src="animal.soundUrl"
              preload="metadata"
              @loadedmetadata="onAudioLoaded"
              @timeupdate="onTimeUpdate"
              @ended="onAudioEnded">
              Your browser does not support the audio element.
            </audio>

            <div class="audio-controls">
              <button
                @click="togglePlay"
                class="play-button"
                :class="{ playing: isPlaying }"
                :disabled="!audioLoaded">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>

              <div class="audio-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: progressPercent + '%' }"></div>
                  <input
                    type="range"
                    min="0"
                    :max="audioDuration"
                    v-model="currentTime"
                    @input="seekAudio"
                    class="progress-slider"
                    :disabled="!audioLoaded" />
                </div>
                <div class="time-display">
                  <span class="current-time">{{
                    formatTime(currentTime)
                  }}</span>
                  <span class="duration">{{ formatTime(audioDuration) }}</span>
                </div>
              </div>

              <div class="volume-control">
                <i class="fas fa-volume-down"></i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  v-model="volume"
                  @input="updateVolume"
                  class="volume-slider" />
                <i class="fas fa-volume-up"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Animal Details -->
        <div class="animal-details">
          <div class="detail-list">
            <div class="detail-item" v-if="animal.scientificName">
              <span class="detail-text"
                >Scientific Name: {{ animal.scientificName }}</span
              >
            </div>

            <div class="detail-item" v-if="animal.species">
              <span class="detail-text">Species: {{ animal.species }}</span>
            </div>

            <div class="detail-item" v-if="animal.habitat">
              <span class="detail-text">Habitat: {{ animal.habitat }}</span>
            </div>

            <div class="detail-item" v-if="animal.diet">
              <span class="detail-text">Diet: {{ animal.diet }}</span>
            </div>

            <div class="detail-item" v-if="animal.lifespan">
              <span class="detail-text">Lifespan: {{ animal.lifespan }}</span>
            </div>

            <div class="detail-item" v-if="animal.conservationStatus">
              <span class="detail-text"
                >Conservation Status:
                <span
                  class="conservation-status"
                  :class="getStatusClass(animal.conservationStatus)">
                  {{ animal.conservationStatus }}
                </span>
              </span>
            </div>

            <div class="detail-item" v-if="animal.weight">
              <span class="detail-text">Weight: {{ animal.weight }}</span>
            </div>

            <div class="detail-item" v-if="animal.length">
              <span class="detail-text">Length: {{ animal.length }}</span>
            </div>

            <div class="detail-item" v-if="animal.location">
              <span class="detail-text"
                >Location in Park: {{ animal.location }}</span
              >
            </div>
          </div>

          <!-- Description -->
          <div class="animal-description" v-if="animal.description">
            <h3>About {{ animal.name }}</h3>
            <p>{{ animal.description }}</p>
          </div>

          <!-- Fun Facts -->
          <div
            class="fun-facts"
            v-if="animal.funFacts && animal.funFacts.length">
            <h3>Fun Facts</h3>
            <ul>
              <li v-for="(fact, index) in animal.funFacts" :key="index">
                {{ fact }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="shareAnimal" class="share-btn">
          <i class="fas fa-share-alt"></i>
          Share
        </button>
        <button @click="closeModal" class="close-modal-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from "vue";

export default {
  name: "AnimalInfoModal",
  props: {
    animal: {
      type: Object,
      default: null,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    // Audio player state
    const audioPlayer = ref(null);
    const isPlaying = ref(false);
    const audioLoaded = ref(false);
    const currentTime = ref(0);
    const audioDuration = ref(0);
    const volume = ref(1);
    const progressPercent = ref(0);

    // Watch for modal visibility changes
    watch(
      () => props.visible,
      (newVisible) => {
        if (!newVisible && isPlaying.value) {
          stopAudio();
        }
      }
    );

    // Watch for animal changes
    watch(
      () => props.animal,
      () => {
        resetAudioState();
      }
    );

    const resetAudioState = () => {
      isPlaying.value = false;
      audioLoaded.value = false;
      currentTime.value = 0;
      audioDuration.value = 0;
      progressPercent.value = 0;
    };

    const onAudioLoaded = () => {
      if (audioPlayer.value) {
        audioLoaded.value = true;
        audioDuration.value = audioPlayer.value.duration || 0;
        audioPlayer.value.volume = volume.value;
      }
    };

    const onTimeUpdate = () => {
      if (audioPlayer.value) {
        currentTime.value = audioPlayer.value.currentTime;
        progressPercent.value =
          audioDuration.value > 0
            ? (currentTime.value / audioDuration.value) * 100
            : 0;
      }
    };

    const onAudioEnded = () => {
      isPlaying.value = false;
      currentTime.value = 0;
      progressPercent.value = 0;
    };

    const togglePlay = async () => {
      if (!audioPlayer.value || !audioLoaded.value) return;

      try {
        if (isPlaying.value) {
          audioPlayer.value.pause();
          isPlaying.value = false;
        } else {
          await audioPlayer.value.play();
          isPlaying.value = true;
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Unable to play audio. Please check your internet connection.");
      }
    };

    const stopAudio = () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.currentTime = 0;
        isPlaying.value = false;
        currentTime.value = 0;
        progressPercent.value = 0;
      }
    };

    const seekAudio = (event) => {
      if (audioPlayer.value && audioLoaded.value) {
        const seekTime = parseFloat(event.target.value);
        audioPlayer.value.currentTime = seekTime;
        currentTime.value = seekTime;
      }
    };

    const updateVolume = (event) => {
      const newVolume = parseFloat(event.target.value);
      volume.value = newVolume;
      if (audioPlayer.value) {
        audioPlayer.value.volume = newVolume;
      }
    };

    const formatTime = (seconds) => {
      if (isNaN(seconds) || seconds === 0) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const closeModal = () => {
      stopAudio();
      emit("close");
    };

    const getStatusClass = (status) => {
      if (!status) return "";
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes("extinct")) return "extinct";
      if (lowerStatus.includes("endangered")) return "endangered";
      if (lowerStatus.includes("vulnerable")) return "vulnerable";
      if (lowerStatus.includes("concern")) return "concern";
      return "stable";
    };

    const shareAnimal = () => {
      if (!props.animal) return;

      if (navigator.share) {
        navigator
          .share({
            title: `Learn about ${props.animal.name}`,
            text: `Check out this information about ${props.animal.name}!`,
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        // Fallback: copy to clipboard
        const text = `Learn about ${props.animal.name}! ${
          props.animal.description || ""
        }`;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            alert("Animal information copied to clipboard!");
          })
          .catch(() => {
            alert("Unable to share. Please try again.");
          });
      }
    };

    return {
      // Audio player refs and state
      audioPlayer,
      isPlaying,
      audioLoaded,
      currentTime,
      audioDuration,
      volume,
      progressPercent,

      // Audio methods
      onAudioLoaded,
      onTimeUpdate,
      onAudioEnded,
      togglePlay,
      stopAudio,
      seekAudio,
      updateVolume,
      formatTime,

      // Other methods
      closeModal,
      getStatusClass,
      shareAnimal,
    };
  },
};
</script>

<style scoped>
.animal-info-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

.animal-info-modal {
  background: #ffffff;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.animal-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.animal-image-section {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.animal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.animal-details {
  padding: 24px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
}

.detail-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
}

.detail-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.detail-item span {
  color: #333;
  font-size: 1rem;
}

.conservation-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.conservation-status.extinct {
  background: #ffebee;
  color: #c62828;
}

.conservation-status.endangered {
  background: #fff3e0;
  color: #ef6c00;
}

.conservation-status.vulnerable {
  background: #fff8e1;
  color: #f57f17;
}

.conservation-status.concern {
  background: #f3e5f5;
  color: #7b1fa2;
}

.conservation-status.stable {
  background: #e8f5e8;
  color: #2e7d32;
}

.animal-description {
  margin-bottom: 24px;
}

.animal-description h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.animal-description p {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

.fun-facts {
  margin-bottom: 24px;
}

.fun-facts h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.fun-facts ul {
  margin: 0;
  padding-left: 20px;
}

.fun-facts li {
  color: #555;
  margin-bottom: 8px;
  line-height: 1.5;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.share-btn,
.close-modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-btn {
  background: #4caf50;
  color: white;
  border: none;
}

.share-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.close-modal-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.close-modal-btn:hover {
  background: #e0e0e0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .animal-info-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .animal-name {
    font-size: 1.3rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .animal-details {
    padding: 20px;
  }

  .detail-list {
    gap: 10px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .share-btn,
  .close-modal-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .animal-info-modal {
    width: 98%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 14px 16px;
  }

  .animal-name {
    font-size: 1.2rem;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .animal-details {
    padding: 16px;
  }
}

/* Dark mode support */
body.dark-mode .animal-info-modal {
  background: #1e1e20;
  color: #f2f2f7;
}

body.dark-mode .modal-header {
  background: linear-gradient(135deg, #654321 0%, #8b4513 100%);
}

body.dark-mode .detail-item label {
  color: #a0a0a8;
}

body.dark-mode .detail-item span {
  color: #f2f2f7;
}

body.dark-mode .animal-description h3,
body.dark-mode .fun-facts h3 {
  color: #f2f2f7;
}

body.dark-mode .animal-description p,
body.dark-mode .fun-facts li {
  color: #a0a0a8;
}

body.dark-mode .modal-footer {
  border-top-color: #444;
}

body.dark-mode .close-modal-btn {
  background: #28282c;
  color: #f2f2f7;
  border-color: #444;
}

body.dark-mode .close-modal-btn:hover {
  background: #333;
}

/* Animal Sound Player Styles */
.animal-sound-section {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 0 24px 20px 24px;
  color: white;
}

.sound-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.sound-title i {
  color: #ffd700;
  animation: pulse 2s infinite;
}

.sound-player {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  backdrop-filter: blur(10px);
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.play-button {
  background: #ffd700;
  color: #333;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.play-button:hover {
  background: #ffed4e;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.play-button:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.play-button.playing {
  background: #ff6b6b;
  color: white;
}

.play-button.playing:hover {
  background: #ff5252;
}

.audio-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffd700;
  border-radius: 3px;
  transition: width 0.1s ease;
}

.progress-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  background: #ffd700;
  border-radius: 50%;
  cursor: pointer;
  opacity: 1;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.volume-control i {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #ffd700;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #ffd700;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design for Sound Player */
@media (max-width: 768px) {
  .audio-controls {
    flex-wrap: wrap;
    gap: 10px;
  }

  .volume-control {
    min-width: 100px;
    order: 3;
    flex-basis: 100%;
    justify-content: center;
  }

  .play-button {
    width: 45px;
    height: 45px;
  }

  .animal-sound-section {
    margin: 0 16px 20px 16px;
    padding: 15px;
  }
}

/* Dark mode support for sound player */
body.dark-mode .animal-sound-section {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

body.dark-mode .sound-player {
  background: rgba(0, 0, 0, 0.3);
}
</style>
