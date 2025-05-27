/**
 * Voice Service for text-to-speech functionality
 */

// Default voice settings
const defaultVoiceSettings = {
  lang: "en-US",
  volume: 1,
  rate: 1,
  pitch: 1,
};

// Store the speech synthesis instance
let speechSynthesis = null;

// Store available voices
let availableVoices = [];

/**
 * Initialize the voice service
 * @param {Object} options - Voice options
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initialize(options = {}) {
  return new Promise((resolve) => {
    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported");
      resolve(false);
      return;
    }

    speechSynthesis = window.speechSynthesis;

    // Get available voices
    const getVoices = () => {
      availableVoices = speechSynthesis.getVoices();

      // If we have voices, we're ready
      if (availableVoices.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = getVoices;
    }

    // Try to get voices immediately (for Firefox)
    getVoices();
  });
}

/**
 * Speak text using speech synthesis
 * @param {string} text - Text to speak
 * @param {Object} options - Voice options
 * @returns {Promise<void>} - Promise that resolves when speech is complete
 */
function speak(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error("Speech synthesis not initialized"));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create utterance with text
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply settings
    const settings = { ...defaultVoiceSettings, ...options };
    utterance.lang = settings.lang;
    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    // Select voice if specified
    if (settings.voiceName && availableVoices.length > 0) {
      const voice = availableVoices.find((v) => v.name === settings.voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Handle events
    utterance.onend = () => resolve();
    utterance.onerror = (event) =>
      reject(new Error(`Speech synthesis error: ${event.error}`));

    // Speak the text
    speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
function stop() {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}

/**
 * Get available voices
 * @returns {Array} - Available voices
 */
function getVoices() {
  return availableVoices;
}

/**
 * Set default voice settings
 * @param {Object} settings - Voice settings
 */
function setDefaultSettings(settings = {}) {
  Object.assign(defaultVoiceSettings, settings);
}

export default {
  initialize,
  speak,
  stop,
  getVoices,
  setDefaultSettings,
};
