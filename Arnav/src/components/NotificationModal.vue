<template>
  <div
    v-if="visible"
    class="learning-progress-modal-overlay"
    @click="emitClose">
    <div class="learning-progress-modal" @click.stop>
      <div class="learning-progress-modal-content">
        <div class="learning-modal-header">
          <h2>
            <i class="bx bx-bell"></i>
            Notifications
            <span v-if="unreadCount > 0" class="unread-total"
              >({{ unreadCount }})</span
            >
          </h2>
          <div class="header-right">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="mark-all-read-btn">
              Mark all as read
            </button>
            <button @click="emitClose" class="close-modal-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
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
                  'waypoint-notification': notification.type === 'new_waypoint',
                }">
                <div class="notification-icon">
                  <i
                    class="bx"
                    :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-details">
                  <div class="notification-header-row">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import NotificationService from "@/services/NotificationService";

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "startNavigation"]);

const notifications = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const hasMore = ref(true);
let unsubscribeListener = null;

function emitClose() {
  emit("close");
}

onMounted(async () => {
  await loadNotifications();
  setupRealtimeListener();
  if (props.visible) document.body.classList.add("modal-open");
});

onUnmounted(() => {
  if (unsubscribeListener) unsubscribeListener();
  document.body.classList.remove("modal-open");
});

async function loadNotifications() {
  loading.value = true;
  try {
    const data = await NotificationService.getUserNotifications();
    notifications.value = data;
    unreadCount.value = data.filter((n) => !n.isRead).length;
  } catch (e) {
    console.error("Error loading notifications", e);
  } finally {
    loading.value = false;
  }
}

function setupRealtimeListener() {
  unsubscribeListener = NotificationService.listenToNotifications((data) => {
    const previousLength = notifications.value.length;
    notifications.value = data;
    unreadCount.value = data.filter((n) => !n.isRead).length;
    if (data.length > previousLength) {
      // could add toast or sound here
    }
  });
}

async function markAsRead(id) {
  try {
    await NotificationService.markAsRead(id);
    const i = notifications.value.findIndex((n) => n.id === id);
    if (i !== -1) {
      notifications.value[i].isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (e) {
    console.error("Failed to mark as read", e);
  }
}

async function markAllAsRead() {
  try {
    await NotificationService.markAllAsRead();
    notifications.value = notifications.value.map((n) => ({
      ...n,
      isRead: true,
      readAt: new Date(),
    }));
    unreadCount.value = 0;
  } catch (e) {
    console.error("Failed to mark all as read", e);
  }
}

function loadMoreNotifications() {
  hasMore.value = false;
}

function handleNotificationClick(notification) {
  if (!notification.isRead) markAsRead(notification.id);
  if (notification.type === "new_waypoint") {
    if (hasValidCoordinates(notification))
      startNavigationToWaypoint(notification);
  }
}

function startNavigationToWaypoint(notification) {
  const waypointData = {
    id: notification.waypointId,
    name: notification.waypointName,
    type: notification.waypointType,
    coordinates: notification.coordinates,
  };
  emit("startNavigation", waypointData);
  emitClose();
}

function viewLocation(notification) {
  startNavigationToWaypoint(notification);
}

function hasValidCoordinates(notification) {
  return (
    notification.coordinates &&
    notification.coordinates.x != null &&
    notification.coordinates.y != null
  );
}

function getNotificationIcon(type) {
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
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp?.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return diffMin + "m ago";
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + "h ago";
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay + "d ago";
  return date.toLocaleDateString();
}
</script>

<style>
@import "@/assets/allstyle.css";

.unread-total {
  font-weight: 400;
  font-size: 0.95rem;
  opacity: 0.9;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-content {
  max-height: calc(90vh - 100px);
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
}
.waypoint-notification .notification-icon {
  background: linear-gradient(140deg, #e9ffe2 0%, #fff9d3 60%, #fff1a8 100%);
}
.notification-icon i {
  font-size: 18px;
  background: linear-gradient(135deg, #4caf50 0%, #ffbf00 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.waypoint-notification .notification-icon i {
  background: linear-gradient(135deg, #43a047 0%, #ffc400 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.notification-details {
  flex: 1;
  min-width: 0;
}
.notification-header-row {
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
  color: #fff;
}
.no-coordinates-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
