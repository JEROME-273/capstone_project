<template>
  <div class="notification-bell" ref="notificationRef">
    <!-- Notification Bell Button -->
    <button
      @click="toggleNotifications"
      class="bell-button"
      :class="{ 'has-notifications': unreadCount > 0 }">
      <i class="bx bx-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown (non-modal) -->
    <div v-if="showNotifications && !asModal" class="notification-dropdown">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="mark-all-read-btn">
            Mark all as read
          </button>
          <button @click="closeNotifications" class="close-btn">
            <i class="bx bx-x"></i>
          </button>
        </div>
      </div>
      <div class="notification-content">
        <div v-if="loading" class="notification-loading">
          <i class="bx bx-loader-alt bx-spin"></i>
          <span>Loading notifications...</span>
        </div>
        <div v-else-if="notifications.length === 0" class="notification-empty">
          <i class="bx bx-bell-off"></i>
          <h4>No notifications</h4>
          <p>You're all caught up!</p>
        </div>
        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="notification-item"
            :class="{
              unread: !notification.isRead,
              'waypoint-notification': notification.type === 'new_waypoint',
            }">
            <div class="notification-icon">
              <i class="bx" :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-details">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <button
                  v-if="!notification.isRead"
                  @click.stop="markAsRead(notification.id)"
                  class="close-notification-btn">
                  <i class="bx bx-x"></i>
                </button>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-meta">
                <span
                  v-if="notification.priority"
                  class="priority-tag"
                  :class="notification.priority"
                  >{{ notification.priority }}</span
                >
                <span class="notification-time">{{
                  formatTime(notification.createdAt)
                }}</span>
              </div>
              <div
                v-if="notification.type === 'new_waypoint'"
                class="notification-actions">
                <button
                  v-if="hasValidCoordinates(notification)"
                  @click.stop="viewLocation(notification)"
                  class="view-location-btn">
                  <i class="bx bx-map-pin"></i>
                  View Location
                </button>
                <div v-else class="no-coordinates-message">
                  <i class="bx bx-info-circle"></i>
                  Location coordinates not available
                </div>
              </div>
            </div>
            <div v-if="!notification.isRead" class="unread-indicator"></div>
          </div>
        </div>
        <div
          v-if="notifications.length > 0 && hasMore"
          class="load-more-container">
          <button @click="loadMoreNotifications" class="load-more-btn">
            Load more notifications
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Modal EXACT same structure as learning-progress modal -->
    <div
      v-if="showNotifications && asModal"
      class="learning-progress-modal-overlay"
      @click="closeNotifications">
      <div class="learning-progress-modal" @click.stop>
        <div class="learning-progress-modal-content">
          <div class="learning-modal-header">
            <h2>
              <i class="bx bx-bell"></i>
              Notifications
            </h2>
            <button @click="closeNotifications" class="close-modal-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="learning-modal-body">
            <div class="notification-content">
              <div v-if="loading" class="notification-loading">
                <i class="bx bx-loader-alt bx-spin"></i>
                <span>Loading notifications...</span>
              </div>
              <div
                v-else-if="notifications.length === 0"
                class="notification-empty">
                <i class="bx bx-bell-off"></i>
                <h4>No notifications</h4>
                <p>You're all caught up!</p>
              </div>
              <div v-else class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  @click="handleNotificationClick(notification)"
                  class="notification-item"
                  :class="{
                    unread: !notification.isRead,
                    'waypoint-notification':
                      notification.type === 'new_waypoint',
                  }">
                  <div class="notification-icon">
                    <i
                      class="bx"
                      :class="getNotificationIcon(notification.type)"></i>
                  </div>
                  <div class="notification-details">
                    <div class="notification-header">
                      <h4 class="notification-title">
                        {{ notification.title }}
                      </h4>
                      <button
                        v-if="!notification.isRead"
                        @click.stop="markAsRead(notification.id)"
                        class="close-notification-btn">
                        <i class="bx bx-x"></i>
                      </button>
                    </div>
                    <p class="notification-message">
                      {{ notification.message }}
                    </p>
                    <div class="notification-meta">
                      <span
                        v-if="notification.priority"
                        class="priority-tag"
                        :class="notification.priority"
                        >{{ notification.priority }}</span
                      >
                      <span class="notification-time">{{
                        formatTime(notification.createdAt)
                      }}</span>
                    </div>
                    <div
                      v-if="notification.type === 'new_waypoint'"
                      class="notification-actions">
                      <button
                        v-if="hasValidCoordinates(notification)"
                        @click.stop="viewLocation(notification)"
                        class="view-location-btn">
                        <i class="bx bx-map-pin"></i>
                        View Location
                      </button>
                      <div v-else class="no-coordinates-message">
                        <i class="bx bx-info-circle"></i>
                        Location coordinates not available
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="!notification.isRead"
                    class="unread-indicator"></div>
                </div>
              </div>
              <div
                v-if="notifications.length > 0 && hasMore"
                class="load-more-container">
                <button @click="loadMoreNotifications" class="load-more-btn">
                  Load more notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Card Popup for new arrivals -->
    <div v-if="showNotificationCard" class="notification-card-popup">
      <div class="notification-card">
        <div class="card-icon">
          <i class="bx bx-map-pin"></i>
        </div>
        <div class="card-content">
          <h4 class="card-title">{{ newNotificationCard.title }}</h4>
          <p class="card-message">{{ newNotificationCard.message }}</p>
          <div class="card-meta">
            <span
              v-if="newNotificationCard.priority"
              class="card-priority-tag"
              :class="newNotificationCard.priority">
              {{ newNotificationCard.priority }}
            </span>
            <span class="card-time">Just now</span>
          </div>
        </div>
        <button @click="closeNotificationCard" class="card-close-btn">
          <i class="bx bx-x"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useToast } from "vue-toastification";
import NotificationService from "@/services/NotificationService";

// Props
const props = defineProps({
  asModal: { type: Boolean, default: false },
});
const asModal = props.asModal;

// Define emits
const emit = defineEmits(["startNavigation"]);

// Reactive data
const notifications = ref([]);
const unreadCount = ref(0);
const showNotifications = ref(false);
const loading = ref(false);
const hasMore = ref(true);
const notificationRef = ref(null);
const showNotificationCard = ref(false);
const newNotificationCard = ref({});

// Initialize toast
const toast = useToast();

// Real-time listener
let unsubscribeListener = null;

// Mounted hook
onMounted(async () => {
  await loadNotifications();
  setupRealtimeListener();
  setupClickOutsideListener();
});

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribeListener) {
    unsubscribeListener();
  }
  document.removeEventListener("click", handleClickOutside);
  // Ensure body class is removed when component unmounts
  document.body.classList.remove("notifications-open");
});

// Watch for dropdown visibility to toggle a body class used to hide weather icon
watch(
  () => showNotifications.value,
  (val) => {
    if (val) {
      document.body.classList.add("notifications-open");
    } else {
      document.body.classList.remove("notifications-open");
    }
  }
);

// Load notifications
const loadNotifications = async () => {
  loading.value = true;
  try {
    const data = await NotificationService.getUserNotifications();
    notifications.value = data;

    // Count unread notifications
    unreadCount.value = data.filter((n) => !n.isRead).length;
  } catch (error) {
    console.error("Error loading notifications:", error);
    toast.error("Failed to load notifications");
  } finally {
    loading.value = false;
  }
};

// Setup real-time listener
const setupRealtimeListener = () => {
  unsubscribeListener = NotificationService.listenToNotifications((data) => {
    const previousCount = notifications.value.length;
    notifications.value = data;
    unreadCount.value = data.filter((n) => !n.isRead).length;

    // Show notification card for new notifications
    const latestNotification = data[0];
    if (
      latestNotification &&
      !latestNotification.isRead &&
      data.length > previousCount
    ) {
      // Only show card if it's a very recent notification (within last 30 seconds)
      const notificationTime =
        latestNotification.createdAt?.toDate?.() ||
        new Date(latestNotification.createdAt);
      const now = new Date();
      const timeDiff = now - notificationTime;

      if (timeDiff < 30000) {
        // 30 seconds
        showNewNotificationCard(latestNotification);
      }
    }
  });
};

// Toggle notifications dropdown
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Close notifications dropdown
const closeNotifications = () => {
  showNotifications.value = false;
};

// Show new notification card
const showNewNotificationCard = (notification) => {
  newNotificationCard.value = notification;
  showNotificationCard.value = true;

  // Auto close after 5 seconds
  setTimeout(() => {
    showNotificationCard.value = false;
  }, 5000);
};

// Close notification card
const closeNotificationCard = () => {
  showNotificationCard.value = false;
};

// Handle notification click
const handleNotificationClick = async (notification) => {
  try {
    if (!notification.isRead) {
      await NotificationService.markAsRead(notification.id);
      // Update local state
      const index = notifications.value.findIndex(
        (n) => n.id === notification.id
      );
      if (index !== -1) {
        notifications.value[index].isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    }

    // Handle specific notification types
    if (notification.type === "new_waypoint") {
      // Only start navigation if coordinates are valid
      if (hasValidCoordinates(notification)) {
        startNavigationToWaypoint(notification);
      } else {
        toast.error(
          `Location "${notification.waypointName}" doesn't have valid coordinates for navigation.`
        );
      }
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Mark individual notification as read
const markAsRead = async (notificationId) => {
  try {
    await NotificationService.markAsRead(notificationId);

    // Update local state
    const index = notifications.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      notifications.value[index].isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    toast.error("Failed to mark notification as read");
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await NotificationService.markAllAsRead();

    // Update local state
    notifications.value = notifications.value.map((n) => ({
      ...n,
      isRead: true,
      readAt: new Date(),
    }));
    unreadCount.value = 0;

    toast.success("All notifications marked as read");
  } catch (error) {
    console.error("Error marking all as read:", error);
    toast.error("Failed to mark notifications as read");
  }
};

// Load more notifications (for future pagination)
const loadMoreNotifications = () => {
  // Implementation for pagination can be added here
  hasMore.value = false;
};

// Setup click outside listener
const setupClickOutsideListener = () => {
  document.addEventListener("click", handleClickOutside);
};

// Handle click outside
const handleClickOutside = (event) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

// Handle starting navigation to waypoint
const startNavigationToWaypoint = (notification) => {
  // Check if coordinates are valid
  if (
    !notification.coordinates ||
    notification.coordinates.x === undefined ||
    notification.coordinates.y === undefined ||
    notification.coordinates.x === null ||
    notification.coordinates.y === null
  ) {
    console.warn(
      "Cannot start navigation: waypoint has invalid coordinates",
      notification
    );
    toast.error(
      `Location "${notification.waypointName}" doesn't have valid coordinates for navigation.`
    );
    return;
  }

  const waypointData = {
    id: notification.waypointId,
    name: notification.waypointName,
    type: notification.waypointType,
    coordinates: notification.coordinates,
  };

  // Emit event to parent component to start AR navigation
  emit("startNavigation", waypointData);

  // Close notifications dropdown
  showNotifications.value = false;

  console.log("Starting navigation to waypoint:", notification.waypointName);
};

// Handle view location button click
const viewLocation = (notification) => {
  startNavigationToWaypoint(notification);
};

// Helper function to check if notification has valid coordinates
const hasValidCoordinates = (notification) => {
  return (
    notification.coordinates &&
    notification.coordinates.x !== undefined &&
    notification.coordinates.y !== undefined &&
    notification.coordinates.x !== null &&
    notification.coordinates.y !== null
  );
};

// Utility functions
const getNotificationIcon = (type) => {
  switch (type) {
    case "new_waypoint":
      return "bx-map-pin";
    case "weather_advice":
      return "bx-cloud-rain";
    case "system":
      return "bx-cog";
    case "update":
      return "bx-refresh";
    default:
      return "bx-bell";
  }
};

const formatWaypointType = (type) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp?.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.bell-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.bell-button.has-notifications {
  color: #2196f3;
  animation: bell-shake 0.5s ease-in-out;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  z-index: 1000;
  overflow: hidden;
}

/* Centered modal variant for dropdown */
.notification-dropdown.modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 420px);
  max-height: min(70vh, 540px);
  z-index: 10001;
}

.notification-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.notification-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #2196f3;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover {
  background-color: #e3f2fd;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.notification-content {
  max-height: 400px;
  overflow-y: auto;
}

.notification-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #666;
}

.notification-empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.notification-empty i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

.notification-empty h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.notification-empty p {
  margin: 0;
  font-size: 14px;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item.unread:hover {
  background-color: #e6f3ff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fffbe0 0%, #e3ffd6 55%, #ffeaa3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  border: 1px solid #e5edc8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 0 3px rgba(255, 191, 0, 0.18);
  transition: background 0.4s ease, transform 0.25s ease, box-shadow 0.3s ease;
}

/* Slight variant for waypoint notifications (a bit more green) */
.waypoint-notification .notification-icon {
  background: linear-gradient(140deg, #e9ffe2 0%, #fff9d3 60%, #fff1a8 100%);
}

.notification-icon i {
  font-size: 18px;
  /* Fallback color */
  color: #4caf50;
  /* Gradient text for modern browsers */
  background: linear-gradient(135deg, #4caf50 0%, #ffbf00 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15), 0 0 4px rgba(255, 191, 0, 0.55);
}

.waypoint-notification .notification-icon i {
  background: linear-gradient(135deg, #43a047 0%, #ffc400 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.notification-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12), 0 0 0 4px rgba(255, 191, 0, 0.25);
}

.notification-details {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  flex: 1;
}

.close-notification-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 2px;
  margin-left: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.close-notification-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  word-wrap: break-word;
}

.waypoint-info {
  margin-bottom: 8px;
}

.waypoint-type {
  display: inline-block;
  background: #e8f5e8;
  color: #4caf50;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.notification-time {
  font-size: 11px;
  color: #999;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #2196f3;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  right: 16px;
}

.load-more-container {
  padding: 16px 20px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.load-more-btn {
  background: none;
  border: 1px solid #2196f3;
  color: #2196f3;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #2196f3;
  color: white;
}

/* Animations */
@keyframes bell-shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

/* Scrollbar styling */
.notification-content::-webkit-scrollbar {
  width: 6px;
}

.notification-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.notification-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notification-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 480px) {
  .notification-dropdown {
    width: 320px;
    right: -50px;
  }
  .notification-dropdown.modal {
    width: 92vw;
  }
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.priority-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: lowercase;
}

.priority-tag.high {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.priority-tag.medium {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc02;
}

.priority-tag.low {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.notification-actions {
  margin-top: 8px;
}

.view-location-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
}

.view-location-btn:hover {
  color: #4caf50;
}

.view-location-btn i {
  font-size: 14px;
}

/* Notification Card Popup */
.notification-card-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  animation: slideInRight 0.3s ease-out;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  border-left: 4px solid #4caf50;
  max-width: 350px;
  position: relative;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f5e8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 18px;
  color: #4caf50;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.card-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-priority-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: lowercase;
}

.card-priority-tag.high {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.card-priority-tag.medium {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc02;
}

.card-priority-tag.low {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.card-time {
  font-size: 11px;
  color: #999;
}

.card-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.card-close-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.no-coordinates-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-style: italic;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-top: 8px;
}

.no-coordinates-message i {
  color: var(--warning-color);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
