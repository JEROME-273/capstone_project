// BackgroundMusicService.js
// Centralized service to manage background music across all components

class BackgroundMusicService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 50;
    this.listeners = new Set();
    this.isInitialized = false;
  }

  // Initialize the audio element
  init(audioElement) {
    if (this.isInitialized && this.audio) {
      // If already initialized, sync the current state with the audio element
      if (this.isPlaying && this.audio.paused) {
        this.audio.play().catch((err) => {
          console.log("Resume play prevented:", err);
        });
      } else if (!this.isPlaying && !this.audio.paused) {
        this.audio.pause();
      }
      return this.audio;
    }

    this.audio = audioElement;
    this.isInitialized = true;

    // Load saved state from localStorage
    const savedState = localStorage.getItem("backgroundMusicPlaying");
    const savedVolume = localStorage.getItem("backgroundMusicVolume");
    const savedTime = localStorage.getItem("backgroundMusicTime");

    if (savedVolume) {
      this.volume = parseInt(savedVolume);
      this.audio.volume = this.volume / 100;
    }

    if (savedTime) {
      this.audio.currentTime = parseFloat(savedTime);
    }

    // Auto-play only if explicitly saved as true, or first time visit (null = first visit)
    if (savedState === "true") {
      this.play();
    } else if (savedState === null) {
      // First time user - autoplay on first visit
      this.play();
    } else {
      // savedState is "false" - user explicitly paused, so don't play
      this.isPlaying = false;
    }

    // Save state periodically
    this.startStateSaver();

    // Listen to audio events
    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.notifyListeners();
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.notifyListeners();
    });

    this.audio.addEventListener("volumechange", () => {
      this.volume = Math.round(this.audio.volume * 100);
      this.notifyListeners();
    });

    return this.audio;
  }

  // Start periodic state saving
  startStateSaver() {
    if (this.stateSaverInterval) {
      clearInterval(this.stateSaverInterval);
    }

    this.stateSaverInterval = setInterval(() => {
      if (this.audio) {
        localStorage.setItem("backgroundMusicPlaying", this.isPlaying);
        localStorage.setItem("backgroundMusicVolume", this.volume);
        localStorage.setItem("backgroundMusicTime", this.audio.currentTime);
      }
    }, 1000);
  }

  // Play music
  play() {
    if (this.audio) {
      this.audio.play().catch((err) => {
        console.log("Auto-play prevented:", err);
      });
      this.isPlaying = true;
      localStorage.setItem("backgroundMusicPlaying", "true");
      this.notifyListeners();
    }
  }

  // Pause music
  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      localStorage.setItem("backgroundMusicPlaying", "false");
      this.notifyListeners();
    }
  }

  // Toggle play/pause
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Set volume (0-100)
  setVolume(volume) {
    if (this.audio) {
      this.volume = Math.max(0, Math.min(100, volume));
      this.audio.volume = this.volume / 100;
      localStorage.setItem("backgroundMusicVolume", this.volume);
      this.notifyListeners();
    }
  }

  // Get current state
  getState() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      currentTime: this.audio ? this.audio.currentTime : 0,
      duration: this.audio ? this.audio.duration : 0,
    };
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.getState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners of state change
  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((callback) => {
      callback(state);
    });
  }

  // Cleanup
  destroy() {
    if (this.stateSaverInterval) {
      clearInterval(this.stateSaverInterval);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export default new BackgroundMusicService();
