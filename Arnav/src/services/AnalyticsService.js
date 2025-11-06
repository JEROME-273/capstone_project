// Centralized analytics logging service
// Provides generic event logging plus specific helpers for:
// - Destination selection
// - Navigation lifecycle (start, abandoned, arrival success/failure)
// - Login tracking
// - Arrival analytics
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function getDeviceSnapshot() {
  try {
    const ua = navigator.userAgent || "";
    const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua)
      ? "Mobile"
      : /Tablet|iPad/i.test(ua)
      ? "Tablet"
      : "Desktop";
    return {
      deviceType,
      platform: navigator.platform || null,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userAgent: ua,
    };
  } catch (e) {
    return {};
  }
}

export async function logDestinationSelection(location) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !location) return;
    const db = getFirestore();

    await addDoc(collection(db, "recentDestinations"), {
      userId: user.uid,
      userEmail: user.email,
      destination: location.name,
      destinationId: location.id || location.uuid || null,
      destinationType: location.type || location.category || null,
      coordinates: location.coordinates || { x: location.lat, y: location.lng },
      timestamp: serverTimestamp(),
      ...getDeviceSnapshot(),
    });
  } catch (err) {
    console.warn("AnalyticsService logDestinationSelection failed:", err);
  }
}

export async function logArrivalEvent(data) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !data) return;
    const db = getFirestore();

    await addDoc(collection(db, "arrivalAnalytics"), {
      userId: user.uid,
      userEmail: user.email,
      destinationName: data.destinationName,
      destinationCoordinates: data.destinationCoordinates,
      navigationDuration: data.navigationDuration,
      startTime: data.startTime || null,
      arrivalTime: data.arrivalTime || serverTimestamp(),
      successful: data.successful !== false,
      finalDistance: data.finalDistance ?? null,
      timestamp: serverTimestamp(),
      ...getDeviceSnapshot(),
    });
  } catch (err) {
    console.warn("AnalyticsService logArrivalEvent failed:", err);
  }
}

// Generic event logger (expansion point for all future analytics)
export async function logEvent(type, payload = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    await addDoc(collection(db, "events"), {
      type,
      userId: user.uid,
      userEmail: user.email,
      timestamp: serverTimestamp(),
      ...getDeviceSnapshot(),
      ...payload,
    });
  } catch (err) {
    console.warn("AnalyticsService logEvent failed:", type, err);
  }
}

// Navigation lifecycle helpers
export async function logNavigationStart(destination) {
  return logEvent("navigation_started", {
    destinationName: destination?.name,
    destinationId: destination?.id || destination?.uuid || null,
  });
}

export async function logNavigationAbandoned(context = {}) {
  return logEvent("navigation_abandoned", context);
}

export async function logArrivalFailure(data) {
  return logEvent("arrival_failed", {
    destinationName: data?.destinationName,
    destinationId: data?.destinationId || null,
    reason: data?.reason || "unknown",
    navigationDuration: data?.navigationDuration || null,
    startTime: data?.startTime || null,
  });
}

// Login tracking (simplified - uses generic logEvent)
export async function logLogin(extra = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn("AnalyticsService logLogin: No authenticated user");
      return;
    }

    // Wait a bit for Firebase auth to fully propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use the generic logEvent function - simpler and more consistent
    await logEvent("login", extra);
  } catch (err) {
    console.warn("AnalyticsService logLogin failed:", err);
  }
}
