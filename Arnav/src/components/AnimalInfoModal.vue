<template>
  <div
    v-if="animal && visible"
    class="animal-info-modal-overlay"
    @click="closeModal">
    <div class="animal-info-modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <h2 class="animal-name">
            {{ (animal?.name || "ANIMAL INFORMATION").toUpperCase() }}
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
              <!-- Play Button -->
              <button
                @click="togglePlay"
                class="play-button"
                :class="{ playing: isPlaying }"
                :disabled="!audioLoaded">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>

              <!-- Progress + Time -->
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    animal: Object,
    visible: Boolean,
  },
  data() {
    return {
      isPlaying: false,
      audioLoaded: false,
      currentTime: 0,
      audioDuration: 0,
    };
  },
  computed: {
    progressPercent() {
      return this.audioDuration
        ? (this.currentTime / this.audioDuration) * 100
        : 0;
    },
  },
  methods: {
    closeModal() {
      this.stopAudio();
      this.$emit("close");
    },
    shareAnimal() {
      if (navigator.share) {
        navigator.share({
          title: this.animal.name,
          text: `Check out this animal: ${this.animal.name}`,
          url: window.location.href,
        });
      } else {
        alert("Sharing not supported on this browser.");
      }
    },
    togglePlay() {
      const player = this.$refs.audioPlayer;
      if (!player) return;

      if (this.isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    stopAudio() {
      const player = this.$refs.audioPlayer;
      if (player) {
        player.pause();
        player.currentTime = 0;
      }
      this.isPlaying = false;
    },
    onAudioLoaded() {
      const player = this.$refs.audioPlayer;
      if (player) {
        this.audioDuration = player.duration;
        this.audioLoaded = true;
      }
    },
    onTimeUpdate() {
      const player = this.$refs.audioPlayer;
      if (player) {
        this.currentTime = player.currentTime;
      }
    },
    seekAudio() {
      const player = this.$refs.audioPlayer;
      if (player) {
        player.currentTime = this.currentTime;
      }
    },
    onAudioEnded() {
      this.isPlaying = false;
      this.currentTime = 0;
    },
    formatTime(seconds) {
      if (!seconds) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    },
    getStatusClass(status) {
      switch (status.toLowerCase()) {
        case "endangered":
          return "status-endangered";
        case "vulnerable":
          return "status-vulnerable";
        case "near threatened":
          return "status-near-threatened";
        case "least concern":
          return "status-least-concern";
        default:
          return "";
      }
    },
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
  font-weight: 800 !important;
  text-transform: uppercase !important;
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

.share-btn {
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

  .share-btn {
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

/* Sound Section */
.animal-sound-section {
  padding: 5px 16px;
  border-radius: 10px;
  margin: 0 20px 16px 20px;
  color: white;
}

.sound-player {
  background: #fff;
  border-radius: 6px;
  padding: 6px 12px; /* compact padding */
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px; /* lengthened player */
  margin: auto;
}

/* Controls row */
.audio-controls {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

/* Play button */
.play-button {
  background: #0a8204; /* green */
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: white;
  transition: background 0.3s ease;
}
.play-button.playing {
  background: #0a6603; /* darker green */
}
.play-button:hover {
  background: #9e061d;
}

/* Progress section */
.audio-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Progress bar */
.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background: #ccc;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #012b01;
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;
  opacity: 0;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #0a8204; /* green thumb */
  border-radius: 50%;
  cursor: pointer;
}
.progress-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #0a8204;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* Time display */
.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #0a0909;
  margin-top: 3px;
}
</style>
