import VoiceService from "./VoiceService.js";

/**
 * Navigation Voice Service for turn-by-turn guidance
 */

// Queue for voice announcements
let announcementQueue = [];
let isProcessingQueue = false;

/**
 * Process the announcement queue
 */
async function processQueue() {
  if (isProcessingQueue || announcementQueue.length === 0) return;

  isProcessingQueue = true;

  while (announcementQueue.length > 0) {
    const announcement = announcementQueue.shift();
    try {
      await VoiceService.speak(announcement.text, announcement.options);
    } catch (error) {
      console.error("Error speaking announcement:", error);
    }
  }

  isProcessingQueue = false;
}

/**
 * Add announcement to queue
 * @param {string} text - Text to speak
 * @param {Object} options - Voice options
 */
function queueAnnouncement(text, options = {}) {
  announcementQueue.push({ text, options });
  processQueue();
}

/**
 * Announce the start of navigation
 * @param {string} destinationName - Name of the destination
 */
function announceNavigationStart(destinationName) {
  queueAnnouncement(
    `Starting navigation to ${destinationName}. Please follow the route on your screen.`
  );
}

/**
 * Announce distance to destination or next maneuver
 * @param {number} distance - Distance in meters
 * @param {string} type - Type of announcement ('destination' or 'maneuver')
 * @param {string} maneuverType - Type of maneuver (for maneuver announcements)
 */
function announceDistance(distance, type = "destination", maneuverType = null) {
  let announcement = "";

  // Format distance
  let formattedDistance = "";
  if (distance < 100) {
    formattedDistance = `${Math.round(distance / 10) * 10} meters`;
  } else if (distance < 1000) {
    formattedDistance = `${Math.round(distance / 100) * 100} meters`;
  } else {
    formattedDistance = `${(distance / 1000).toFixed(1)} kilometers`;
  }

  // Create announcement based on type
  if (type === "destination") {
    announcement = `You are ${formattedDistance} from your destination.`;
  } else if (type === "maneuver") {
    // Only announce at certain distances
    if (distance < 30) {
      announcement = `In ${formattedDistance}, `;

      // Add specific instructions based on maneuver type
      if (maneuverType === "turn-left") {
        announcement += "turn left.";
      } else if (maneuverType === "turn-right") {
        announcement += "turn right.";
      } else if (maneuverType === "turn-slight-left") {
        announcement += "turn slightly left.";
      } else if (maneuverType === "turn-slight-right") {
        announcement += "turn slightly right.";
      } else if (maneuverType === "turn-sharp-left") {
        announcement += "make a sharp left turn.";
      } else if (maneuverType === "turn-sharp-right") {
        announcement += "make a sharp right turn.";
      } else if (maneuverType === "u-turn") {
        announcement += "make a U-turn.";
      } else if (maneuverType === "continue") {
        announcement += "continue straight ahead.";
      } else if (maneuverType === "roundabout") {
        announcement += "enter the roundabout.";
      } else if (maneuverType === "arrive") {
        announcement += "you will arrive at your destination.";
      } else {
        announcement += "prepare for the next maneuver.";
      }
    }
  }

  if (announcement) {
    queueAnnouncement(announcement);
  }
}

/**
 * Announce a turn instruction
 * @param {string} instruction - Turn instruction
 */
function announceTurn(instruction) {
  queueAnnouncement(instruction);
}

/**
 * Announce arrival at destination
 */
function announceArrival() {
  queueAnnouncement("You have arrived at your destination.");
}

/**
 * Reset the voice service
 */
function reset() {
  announcementQueue = [];
  isProcessingQueue = false;
  VoiceService.stop();
}

export default {
  announceNavigationStart,
  announceDistance,
  announceTurn,
  announceArrival,
  reset,
};
