import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "ar-path-3eb94.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ar-path-3eb94",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ar-path-3eb94.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "314906875610",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:314906875610:web:02edf761141fa1aa8677e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V7PCV8YV9P",
};

class NotificationService {
  constructor() {
    // Initialize Firebase if not already initialized
    let firebaseApp;
    const existingApps = getApps();
    if (existingApps.length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = existingApps[0];
    }

    this.db = getFirestore(firebaseApp);
    this.auth = getAuth(firebaseApp);
    this.listeners = new Map();
  }

  // Create notification for all users when new waypoint is added
  async createWaypointNotification(waypointData) {
    try {
      // Format the title based on waypoint type
      const formattedType = this.formatWaypointTypeForTitle(waypointData.type);
      const title = `New ${formattedType} Added`;

      // Create descriptive message
      const locationDescription = this.getLocationDescription(
        waypointData.type
      );
      const message = `A new ${waypointData.type.replace(
        "_",
        " "
      )} ${waypointData.name.toLowerCase()} has been added to ${locationDescription}.`;

      const notificationData = {
        type: "new_waypoint",
        title: title,
        message: message,
        waypointId: waypointData.id,
        waypointName: waypointData.name,
        waypointType: waypointData.type,
        priority: "high", // Add priority field
        createdAt: new Date(),
        isRead: false,
        isGlobal: true, // This notification is for all users
        createdBy: "admin",
        coordinates: waypointData.coordinates || null,
      };

      // Add to notifications collection
      await addDoc(collection(this.db, "notifications"), notificationData);

      console.log("Waypoint notification created successfully");
      return true;
    } catch (error) {
      console.error("Error creating waypoint notification:", error);
      throw error;
    }
  }

  // Create maintenance notification for waypoints
  async createMaintenanceNotification(maintenanceData) {
    try {
      const { id, name, type, reason, coordinates, action } = maintenanceData;

      const formattedType = this.formatWaypointTypeForTitle(type);

      let title, message, priority;

      if (action === "started") {
        title = `⚠️ ${formattedType} Under Maintenance`;
        message = `${name} is currently under maintenance and temporarily unavailable. ${
          reason ? `Reason: ${reason}` : "Please use alternative routes."
        }`;
        priority = "high";
      } else if (action === "completed") {
        title = `✅ ${formattedType} Back Online`;
        message = `${name} maintenance has been completed and is now available for navigation.`;
        priority = "medium";
      }

      const notificationData = {
        type: "maintenance_update",
        title: title,
        message: message,
        waypointId: id,
        waypointName: name,
        waypointType: type,
        maintenanceAction: action,
        maintenanceReason: reason || "",
        priority: priority,
        createdAt: new Date(),
        isRead: false,
        isGlobal: true,
        createdBy: "admin",
        coordinates: coordinates || null,
      };

      await addDoc(collection(this.db, "notifications"), notificationData);
      console.log(`Maintenance notification created for ${name} (${action})`);
      return true;
    } catch (error) {
      console.error("Error creating maintenance notification:", error);
      throw error;
    }
  }

  // Get notifications for current user
  async getUserNotifications(limit = 50) {
    try {
      // First get all global notifications
      const q = query(
        collection(this.db, "notifications"),
        where("isGlobal", "==", true)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt in JavaScript instead of Firestore
      const sortedNotifications = notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });

      return sortedNotifications.slice(0, limit);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const q = query(
        collection(this.db, "notifications"),
        where("isGlobal", "==", true)
      );

      const querySnapshot = await getDocs(q);

      // Filter unread notifications in JavaScript
      const unreadCount = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.isRead === false;
      }).length;

      return unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(this.db, "notifications", notificationId), {
        isRead: true,
        readAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const q = query(
        collection(this.db, "notifications"),
        where("isGlobal", "==", true)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs
        .filter((docSnapshot) => {
          const data = docSnapshot.data();
          return data.isRead === false; // Only update unread notifications
        })
        .map((docSnapshot) =>
          updateDoc(doc(this.db, "notifications", docSnapshot.id), {
            isRead: true,
            readAt: new Date(),
          })
        );

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Listen to real-time notification updates
  listenToNotifications(callback) {
    const q = query(
      collection(this.db, "notifications"),
      where("isGlobal", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt in JavaScript
        const sortedNotifications = notifications.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });

        callback(sortedNotifications);
      },
      (error) => {
        console.error("Error listening to notifications:", error);
      }
    );

    return unsubscribe;
  }

  // Create different types of notifications
  async createCustomNotification(type, title, message, additionalData = {}) {
    try {
      const notificationData = {
        type,
        title,
        message,
        createdAt: new Date(),
        isRead: false,
        isGlobal: true,
        createdBy: "admin",
        ...additionalData,
      };

      await addDoc(collection(this.db, "notifications"), notificationData);
      return true;
    } catch (error) {
      console.error("Error creating custom notification:", error);
      throw error;
    }
  }

  // Helper method to format waypoint type for title
  formatWaypointTypeForTitle(type) {
    const typeMap = {
      entrance: "Entrance",
      exit: "Exit",
      landmark: "Landmark",
      junction: "Junction",
      facility: "Facility",
      parking: "Parking Area",
      office: "Office",
      cr: "Restroom",
      animal_enclosure: "Animal Enclosure",
      food_production: "Greenhouse",
      plant_areas: "Plant Area",
    };
    return (
      typeMap[type] ||
      type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  // Helper method to get location description
  getLocationDescription(type) {
    const locationMap = {
      entrance: "the main entrance area",
      exit: "the exit area",
      landmark: "the landmark section",
      junction: "the junction area",
      facility: "the facility area",
      parking: "the parking area",
      office: "the office section",
      cr: "the facility area",
      animal_enclosure: "the animal area",
      food_production: "the east section of the farm",
      plant_areas: "the agricultural section",
    };
    return locationMap[type] || "the farm";
  }
}

export default new NotificationService();
