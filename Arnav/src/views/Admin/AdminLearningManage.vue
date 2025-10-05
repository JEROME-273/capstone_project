<template>
  <AdminLayout>
    <template #nav>
      <div class="page-header">
        <h1 class="page-title">Learning Content Management</h1>
      </div>
    </template>

    <div class="learning-management">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <i class="bx bx-loader-alt bx-spin"></i>
        </div>
        <h3>Loading Learning Content...</h3>
        <p>Please wait while we fetch the data</p>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-bulb"></i>
            </div>
            <div class="stat-content">
              <h3>{{ triviaList.length }}</h3>
              <p>Total Tips & Trivia</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-category"></i>
            </div>
            <div class="stat-content">
              <h3>{{ uniqueCategories.length }}</h3>
              <p>Categories</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-badge-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ activeTriviaCount }}</h3>
              <p>Active Content</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="bx bxs-user-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalLearnerCount }}</h3>
              <p>Active Learners</p>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            :class="['tab-btn', { active: activeTab === 'add' }]"
            @click="activeTab = 'add'">
            <i class="bx bx-plus-circle"></i>
            Add Content
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'list' }]"
            @click="activeTab = 'list'">
            <i class="bx bx-list-ul"></i>
            Manage Content
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'analytics' }]"
            @click="activeTab = 'analytics'">
            <i class="bx bx-bar-chart-alt-2"></i>
            Learning Analytics
          </button>
        </div>

        <!-- Add/Edit Trivia Form -->
        <div v-if="activeTab === 'add'" class="content-card">
          <div class="card-header">
            <h2>
              {{
                isEditMode
                  ? "Edit Learning Content"
                  : "Add New Learning Content"
              }}
            </h2>
            <button v-if="isEditMode" @click="resetForm" class="btn-secondary">
              <i class="bx bx-x"></i>
              Cancel Edit
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="trivia-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Title</label>
                <input
                  id="title"
                  v-model="trivia.title"
                  type="text"
                  required
                  placeholder="Enter content title" />
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" v-model="trivia.category" required>
                  <option value="">Select category</option>
                  <option value="navigation">Navigation Tips</option>
                  <option value="ar">AR Technology</option>
                  <option value="campus">Campus Information</option>
                  <option value="safety">Safety Guidelines</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="general">General Tips</option>
                </select>
              </div>

              <div class="form-group">
                <label for="difficulty">Difficulty Level</label>
                <select id="difficulty" v-model="trivia.difficulty" required>
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div class="form-group">
                <label for="priority">Priority</label>
                <select id="priority" v-model="trivia.priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="content">Content</label>
              <textarea
                id="content"
                v-model="trivia.content"
                required
                rows="4"
                placeholder="Enter the tip or trivia content"></textarea>
            </div>

            <div class="form-group">
              <label for="detailedContent"
                >Detailed Explanation (Optional)</label
              >
              <textarea
                id="detailedContent"
                v-model="trivia.detailedContent"
                rows="6"
                placeholder="Enter detailed explanation or additional information"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="estimatedReadTime"
                  >Estimated Read Time (minutes)</label
                >
                <input
                  id="estimatedReadTime"
                  v-model.number="trivia.estimatedReadTime"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="5" />
              </div>

              <div class="form-group">
                <label for="tags">Tags (comma-separated)</label>
                <input
                  id="tags"
                  v-model="trivia.tags"
                  type="text"
                  placeholder="navigation, tips, beginners" />
              </div>
            </div>

            <div class="form-checkboxes">
              <div class="checkbox-group">
                <input
                  id="isActive"
                  v-model="trivia.isActive"
                  type="checkbox" />
                <label for="isActive">Active (visible to users)</label>
              </div>

              <div class="checkbox-group">
                <input
                  id="isFeatured"
                  v-model="trivia.isFeatured"
                  type="checkbox" />
                <label for="isFeatured">Featured content</label>
              </div>

              <div class="checkbox-group">
                <input
                  id="showOnFirstVisit"
                  v-model="trivia.showOnFirstVisit"
                  type="checkbox" />
                <label for="showOnFirstVisit">Show to new users</label>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <i class="bx bx-save"></i>
                {{
                  isSaving
                    ? "Saving..."
                    : isEditMode
                    ? "Update Content"
                    : "Add Content"
                }}
              </button>
              <button type="button" class="btn-secondary" @click="resetForm">
                <i class="bx bx-reset"></i>
                Reset Form
              </button>
            </div>
          </form>
        </div>

        <!-- Content List -->
        <div v-if="activeTab === 'list'" class="content-card">
          <div class="card-header">
            <h2>Learning Content Management</h2>
            <div class="header-actions">
              <button
                @click="initializeLearningSystem"
                class="btn-init"
                :disabled="isInitializing"
                title="Initialize with sample learning content">
                <i class="bx bx-download"></i>
                {{
                  isInitializing ? "Initializing..." : "Initialize Sample Data"
                }}
              </button>
              <div class="search-box">
                <i class="bx bx-search"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search content..." />
              </div>
              <select v-model="filterCategory" class="filter-select">
                <option value="">All Categories</option>
                <option value="navigation">Navigation Tips</option>
                <option value="ar">AR Technology</option>
                <option value="campus">Campus Information</option>
                <option value="safety">Safety Guidelines</option>
                <option value="accessibility">Accessibility</option>
                <option value="general">General Tips</option>
              </select>
            </div>
          </div>
          <div class="table-container">
            <table class="content-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Learning Count</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredTriviaList" :key="item.id">
                  <td>
                    <div class="content-title">
                      <h4>{{ item.title }}</h4>
                      <p class="content-preview">
                        {{ item.content.substring(0, 100) }}...
                      </p>
                    </div>
                  </td>
                  <td>
                    <span
                      class="category-badge"
                      :class="`category-${item.category}`">
                      {{ item.category }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="difficulty-badge"
                      :class="`difficulty-${item.difficulty}`">
                      {{ item.difficulty }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      :class="{
                        active: item.isActive,
                        inactive: !item.isActive,
                      }">
                      {{ item.isActive ? "Active" : "Inactive" }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="learning-stats">
                      <span class="stat-number">{{
                        item.learnedCount || 0
                      }}</span>
                      <small>learners</small>
                    </div>
                  </td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="editTrivia(item)"
                        class="btn-icon btn-edit"
                        title="Edit">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button
                        @click="toggleTriviaStatus(item)"
                        class="btn-icon btn-toggle"
                        :title="item.isActive ? 'Deactivate' : 'Activate'">
                        <i
                          class="bx"
                          :class="
                            item.isActive ? 'bx-toggle-right' : 'bx-toggle-left'
                          "></i>
                      </button>
                      <button
                        @click="deleteTrivia(item.id)"
                        class="btn-icon btn-delete"
                        title="Delete">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="filteredTriviaList.length === 0" class="no-content">
              <div class="no-content-icon">
                <i class="bx bx-folder-open"></i>
              </div>
              <h3>No learning content found</h3>
              <p>
                {{
                  searchQuery || filterCategory
                    ? "Try adjusting your filters"
                    : "Start by adding some learning content"
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Learning Analytics -->
        <div v-if="activeTab === 'analytics'" class="content-card">
          <div class="card-header">
            <h2>Learning Analytics</h2>
          </div>

          <div class="analytics-grid">
            <div class="analytics-card">
              <h3>Most Popular Content</h3>
              <div class="popular-list">
                <div
                  v-for="item in popularContent"
                  :key="item.id"
                  class="popular-item">
                  <div class="popular-info">
                    <h4>{{ item.title }}</h4>
                    <p>
                      {{ item.category }} •
                      {{ item.learnedCount || 0 }} learners
                    </p>
                  </div>
                  <div class="popular-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{
                          width: (progressPercentages[item.id] || 0) + '%',
                        }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h3>Category Performance</h3>
              <div class="category-stats">
                <div
                  v-for="(stats, category) in categoryStats"
                  :key="category"
                  class="category-stat">
                  <div class="category-info">
                    <span class="category-name">{{ category }}</span>
                    <span class="category-count">{{ stats.count }} items</span>
                  </div>
                  <div class="category-metrics">
                    <small>{{ stats.totalLearned }} total learns</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h3>Recent Learning Activity</h3>
              <div class="recent-activity">
                <div
                  v-for="activity in recentLearningActivity"
                  :key="activity.id"
                  class="activity-item">
                  <div class="activity-info">
                    <p>
                      <strong>{{ activity.userName }}</strong> learned:
                      {{ activity.contentTitle }}
                    </p>
                    <small>{{ formatRelativeTime(activity.learnedAt) }}</small>
                  </div>
                </div>
                <div
                  v-if="recentLearningActivity.length === 0"
                  class="no-activity">
                  <p>No recent learning activity</p>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h3>Learning Streaks</h3>
              <div class="streak-stats">
                <div class="streak-item">
                  <h4>Average Streak</h4>
                  <span class="streak-number">{{ averageStreak }} days</span>
                </div>
                <div class="streak-item">
                  <h4>Longest Streak</h4>
                  <span class="streak-number">{{ longestStreak }} days</span>
                </div>
                <div class="streak-item">
                  <h4>Active Streaks</h4>
                  <span class="streak-number">{{ activeStreaks }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AdminLayout from "./AdminLayout.vue";
import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { initializeLearningSystem as initLearningData } from "@/services/LearningInitService";

// Component state
const isLoading = ref(true);
const activeTab = ref("list");
const isEditMode = ref(false);
const isSaving = ref(false);
const isInitializing = ref(false);
const searchQuery = ref("");
const filterCategory = ref("");

// Trivia data
const triviaList = ref([]);
const currentEditId = ref(null);

// Analytics data
const recentLearningActivity = ref([]);
const averageStreak = ref(0);
const longestStreak = ref(0);
const activeStreaks = ref(0);
const totalUserProgress = ref([]);
const learningStats = ref({
  totalCompletions: 0,
  averageCompletionRate: 0,
  totalActiveUsers: 0,
  contentEngagement: [],
});

// Default trivia form structure
const defaultTrivia = {
  title: "",
  content: "",
  detailedContent: "",
  category: "",
  difficulty: "",
  priority: "medium",
  estimatedReadTime: 5,
  tags: "",
  isActive: true,
  isFeatured: false,
  showOnFirstVisit: false,
};

const trivia = ref({ ...defaultTrivia });

// Computed properties
const uniqueCategories = computed(() => {
  return [...new Set(triviaList.value.map((item) => item.category))];
});

const activeTriviaCount = computed(() => {
  return triviaList.value.filter((item) => item.isActive).length;
});

const totalLearnerCount = computed(() => {
  // This would be calculated from user learning progress data
  return triviaList.value.reduce(
    (total, item) => total + (item.learnedCount || 0),
    0
  );
});

const filteredTriviaList = computed(() => {
  let filtered = triviaList.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }

  if (filterCategory.value) {
    filtered = filtered.filter(
      (item) => item.category === filterCategory.value
    );
  }

  return filtered.sort((a, b) => b.createdAt - a.createdAt);
});

// Helper functions for display formatting
const formatRelativeTime = (date) => {
  if (!date) return "Unknown time";

  const now = new Date();
  const targetDate = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return targetDate.toLocaleDateString();
};

// Computed property for stable progress percentage calculations
const maxLearnedCount = computed(() => {
  const counts = triviaList.value.map((item) => item.learnedCount || 0);
  return counts.length > 0 ? Math.max(...counts) : 1;
});

// Computed property for all progress percentages (stable, no reactivity)
const progressPercentages = computed(() => {
  const max = maxLearnedCount.value;
  const percentages = {};

  triviaList.value.forEach((item) => {
    const count = item.learnedCount || 0;
    percentages[item.id] = max > 0 ? Math.round((count / max) * 100) : 0;
  });

  return percentages;
});

const popularContent = computed(() => {
  return [...triviaList.value]
    .sort((a, b) => (b.learnedCount || 0) - (a.learnedCount || 0))
    .slice(0, 5);
});

const categoryStats = computed(() => {
  const stats = {};

  triviaList.value.forEach((item) => {
    if (!stats[item.category]) {
      stats[item.category] = { count: 0, totalLearned: 0 };
    }
    stats[item.category].count++;
    stats[item.category].totalLearned += item.learnedCount || 0;
  });

  return stats;
});

// New functions for analytics data management
async function ensureAnalyticsDataExists() {
  try {
    // Check if we have any learning progress data
    const progressSnapshot = await getDocs(
      query(collection(db, "learningProgress"), limit(1))
    );

    const statsSnapshot = await getDocs(
      query(collection(db, "userLearningStats"), limit(1))
    );

    // If no data exists, generate sample data
    if (progressSnapshot.empty || statsSnapshot.empty) {
      await generateSampleAnalyticsData();
    }
  } catch (error) {
    console.error("Error checking analytics data:", error);
  }
}

async function generateSampleAnalyticsData() {
  try {
    console.log("Generating sample analytics data...");

    // Sample user names
    const sampleUsers = [
      { id: "user1", name: "Alice Johnson", email: "alice@example.com" },
      { id: "user2", name: "Bob Smith", email: "bob@example.com" },
      { id: "user3", name: "Carol Davis", email: "carol@example.com" },
      { id: "user4", name: "David Wilson", email: "david@example.com" },
      { id: "user5", name: "Eva Martinez", email: "eva@example.com" },
    ];

    // Generate sample learning progress entries
    const progressEntries = [];
    const now = new Date();

    for (let i = 0; i < 25; i++) {
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const triviaItem =
        triviaList.value[
          Math.floor(Math.random() * Math.max(1, triviaList.value.length))
        ];

      if (triviaItem) {
        const daysAgo = Math.floor(Math.random() * 30);
        const learnedAt = new Date(
          now.getTime() - daysAgo * 24 * 60 * 60 * 1000
        );

        progressEntries.push({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          contentId: triviaItem.id,
          contentTitle: triviaItem.title,
          contentCategory: triviaItem.category,
          learnedAt: learnedAt,
          completedAt: learnedAt,
          timeSpent: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          difficulty: triviaItem.difficulty || "beginner",
        });
      }
    }

    // Add progress entries to Firestore
    for (const entry of progressEntries) {
      await addDoc(collection(db, "learningProgress"), {
        ...entry,
        learnedAt: entry.learnedAt,
        createdAt: serverTimestamp(),
      });
    }

    // Generate sample user learning stats
    for (const user of sampleUsers) {
      const userProgress = progressEntries.filter((p) => p.userId === user.id);
      const currentStreak = Math.floor(Math.random() * 10) + 1;
      const longestStreak = currentStreak + Math.floor(Math.random() * 5);

      await addDoc(collection(db, "userLearningStats"), {
        userId: user.id,
        userName: user.name,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        totalCompleted: userProgress.length,
        lastActiveDate: new Date(),
        joinedDate: new Date(
          now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ),
        preferredCategories: ["navigation", "ar", "general"],
        averageTimePerContent: Math.floor(Math.random() * 200) + 100,
        createdAt: serverTimestamp(),
      });
    }

    console.log("Sample analytics data generated successfully!");
  } catch (error) {
    console.error("Error generating sample analytics data:", error);
  }
}

async function updateTriviaLearnedCounts() {
  try {
    // Get all learning progress data
    const progressSnapshot = await getDocs(collection(db, "learningProgress"));
    const learnedCounts = {};

    progressSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const contentId = data.contentId;
      if (contentId) {
        learnedCounts[contentId] = (learnedCounts[contentId] || 0) + 1;
      }
    });

    // Update trivia items with learned counts
    triviaList.value.forEach((item) => {
      item.learnedCount = learnedCounts[item.id] || 0;
    });
  } catch (error) {
    console.error("Error updating trivia learned counts:", error);
  }
}

// Methods
onMounted(async () => {
  await loadTriviaList();

  // If no content exists, create sample content for demonstration
  if (triviaList.value.length === 0) {
    await createSampleLearningContent();
    await loadTriviaList();
  }

  await loadLearningAnalytics();
  isLoading.value = false;
});

async function loadTriviaList() {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "learningContent"), orderBy("createdAt", "desc"))
    );

    triviaList.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error loading trivia list:", error);
  }
}

async function loadLearningAnalytics() {
  try {
    // Check if analytics data exists, if not generate sample data
    await ensureAnalyticsDataExists();

    // Load recent learning activity
    const recentQuery = query(
      collection(db, "learningProgress"),
      orderBy("learnedAt", "desc"),
      limit(10)
    );

    const recentSnapshot = await getDocs(recentQuery);
    recentLearningActivity.value = recentSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        learnedAt: data.learnedAt?.toDate
          ? data.learnedAt.toDate()
          : new Date(data.learnedAt),
      };
    });

    // Calculate streak statistics
    const userProgressQuery = query(collection(db, "userLearningStats"));
    const userProgressSnapshot = await getDocs(userProgressQuery);

    const streaks = userProgressSnapshot.docs.map(
      (doc) => doc.data().currentStreak || 0
    );

    if (streaks.length > 0) {
      averageStreak.value = Math.round(
        streaks.reduce((a, b) => a + b, 0) / streaks.length
      );
      longestStreak.value = Math.max(...streaks);
      activeStreaks.value = streaks.filter((streak) => streak > 0).length;
    } else {
      // Set default values when no data exists
      averageStreak.value = 1;
      longestStreak.value = 1;
      activeStreaks.value = 3;
    }

    // Update trivia list with learned counts from analytics
    await updateTriviaLearnedCounts();
  } catch (error) {
    console.error("Error loading learning analytics:", error);
    // Set fallback values
    averageStreak.value = 1;
    longestStreak.value = 1;
    activeStreaks.value = 3;
  }
}

async function handleSubmit() {
  isSaving.value = true;

  try {
    const triviaData = {
      ...trivia.value,
      tags: trivia.value.tags
        ? trivia.value.tags.split(",").map((tag) => tag.trim())
        : [],
      learnedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (isEditMode.value) {
      await updateDoc(doc(db, "learningContent", currentEditId.value), {
        ...triviaData,
        createdAt: undefined, // Don't update created date
        updatedAt: serverTimestamp(),
      });
    } else {
      const docRef = await addDoc(
        collection(db, "learningContent"),
        triviaData
      );
      console.log("✅ New learning content created:", {
        id: docRef.id,
        title: triviaData.title,
        createdAt: triviaData.createdAt,
      });
    }

    await loadTriviaList();
    resetForm();
    activeTab.value = "list";
  } catch (error) {
    console.error("Error saving trivia:", error);
  } finally {
    isSaving.value = false;
  }
}

function editTrivia(item) {
  trivia.value = {
    ...item,
    tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
  };
  currentEditId.value = item.id;
  isEditMode.value = true;
  activeTab.value = "add";
}

async function toggleTriviaStatus(item) {
  try {
    await updateDoc(doc(db, "learningContent", item.id), {
      isActive: !item.isActive,
      updatedAt: serverTimestamp(),
    });
    await loadTriviaList();
  } catch (error) {
    console.error("Error toggling trivia status:", error);
  }
}

async function deleteTrivia(id) {
  if (
    !confirm(
      "Are you sure you want to delete this learning content? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteDoc(doc(db, "learningContent", id));
    await loadTriviaList();
  } catch (error) {
    console.error("Error deleting trivia:", error);
  }
}

function resetForm() {
  trivia.value = { ...defaultTrivia };
  currentEditId.value = null;
  isEditMode.value = false;
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  return new Date(timestamp.toDate()).toLocaleDateString();
}

// Create sample learning content for demonstration
async function createSampleLearningContent() {
  const sampleContent = [
    {
      title: "Using AR Navigation Features",
      content:
        "Learn how to activate and use the AR camera overlay for enhanced navigation through campus.",
      detailedContent:
        "The AR navigation feature uses your device's camera to overlay directional arrows and information on the real world. To activate, simply tap the AR button when navigating to a destination.",
      category: "ar",
      difficulty: "beginner",
      priority: "high",
      estimatedReadTime: 3,
      tags: ["ar", "navigation", "camera"],
      isActive: true,
      isFeatured: true,
    },
    {
      title: "Finding the Shortest Route",
      content:
        "Tips for finding the most efficient path to your destination using our smart routing algorithm.",
      detailedContent:
        "Our navigation system calculates multiple route options based on real-time conditions, accessibility needs, and user preferences. Look for the green route indicator for the fastest path.",
      category: "navigation",
      difficulty: "beginner",
      priority: "high",
      estimatedReadTime: 2,
      tags: ["routing", "efficiency", "paths"],
      isActive: true,
      isFeatured: false,
    },
    {
      title: "Campus Safety Guidelines",
      content:
        "Essential safety information for navigating campus during different times and weather conditions.",
      detailedContent:
        "Always stay on well-lit paths during evening hours. Report any safety concerns using the emergency button in the app. Check weather conditions before heading out.",
      category: "safety",
      difficulty: "beginner",
      priority: "medium",
      estimatedReadTime: 4,
      tags: ["safety", "emergency", "weather"],
      isActive: true,
      isFeatured: false,
    },
    {
      title: "Accessibility Features Overview",
      content:
        "Learn about the accessibility features available in the navigation system.",
      detailedContent:
        "Our app includes voice guidance, high contrast mode, screen reader support, and wheelchair-accessible route options. Enable these features in the accessibility settings.",
      category: "accessibility",
      difficulty: "intermediate",
      priority: "medium",
      estimatedReadTime: 5,
      tags: ["accessibility", "voice", "wheelchair"],
      isActive: true,
      isFeatured: true,
    },
    {
      title: "Understanding Campus Zones",
      content:
        "Get familiar with different areas of the campus and their unique features.",
      detailedContent:
        "The campus is divided into academic zones, residential areas, recreational facilities, and administrative buildings. Each zone has specific navigation considerations and available services.",
      category: "campus",
      difficulty: "intermediate",
      priority: "low",
      estimatedReadTime: 6,
      tags: ["campus", "zones", "facilities"],
      isActive: true,
      isFeatured: false,
    },
  ];

  try {
    for (const content of sampleContent) {
      await addDoc(collection(db, "learningContent"), {
        ...content,
        learnedCount: Math.floor(Math.random() * 15), // Random learned count for demo
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("Sample learning content created successfully!");
  } catch (error) {
    console.error("Error creating sample content:", error);
  }
}

// Initialize learning system with sample data
async function initializeLearningSystem() {
  if (isInitializing.value) return;

  if (
    !confirm(
      "This will add sample learning content to your database. Continue?"
    )
  ) {
    return;
  }

  try {
    isInitializing.value = true;

    const result = await initLearningData();

    if (result.success) {
      alert("Learning system initialized successfully!");
      await loadTriviaList();

      // If no learning content exists after initialization, create some sample content
      if (triviaList.value.length === 0) {
        await createSampleLearningContent();
      }

      await loadLearningAnalytics();
    } else {
      alert("Error initializing learning system: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error initializing learning system: " + error.message);
  } finally {
    isInitializing.value = false;
  }
}
</script>

<style scoped>
/* Import base styles */
@import "@/assets/adminmap.css";

.learning-management {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 12px;
  font-size: 24px;
}

.stat-content h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.stat-content p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #718096;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.tab-btn:hover {
  color: #4299e1;
  background: #f7fafc;
}

.tab-btn.active {
  color: #4299e1;
  background: white;
  border: 2px solid #e2e8f0;
  border-bottom: 2px solid white;
  margin-bottom: -2px;
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* Forms */
.trivia-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-checkboxes {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4299e1;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
}

.btn-init {
  padding: 8px 16px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-right: 15px;
}

.btn-init:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
}

.btn-init:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Search and Filters */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #a0aec0;
  font-size: 16px;
}

.search-box input {
  padding: 10px 12px 10px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  min-width: 250px;
  font-size: 14px;
}

.filter-select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

/* Table */
.table-container {
  padding: 24px;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.content-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  background: #f7fafc;
}

.content-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.content-title h4 {
  margin: 0 0 5px 0;
  color: #2d3748;
  font-size: 15px;
}

.content-preview {
  margin: 0;
  color: #718096;
  font-size: 13px;
  line-height: 1.4;
}

/* Badges */
.category-badge,
.difficulty-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.category-navigation {
  background: #e6fffa;
  color: #234e52;
}
.category-ar {
  background: #fef5e7;
  color: #744210;
}
.category-campus {
  background: #e0e7ff;
  color: #3730a3;
}
.category-safety {
  background: #fecaca;
  color: #7f1d1d;
}
.category-accessibility {
  background: #d1fae5;
  color: #14532d;
}
.category-general {
  background: #f3e8ff;
  color: #581c87;
}

.difficulty-beginner {
  background: #d1fae5;
  color: #14532d;
}
.difficulty-intermediate {
  background: #fef3c7;
  color: #92400e;
}
.difficulty-advanced {
  background: #fecaca;
  color: #7f1d1d;
}

.status-badge.active {
  background: #d1fae5;
  color: #14532d;
}
.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

/* Learning Stats */
.learning-stats {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
}

.learning-stats small {
  color: #718096;
  font-size: 12px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-edit:hover {
  background: #c7d2fe;
}

.btn-toggle {
  background: #fef3c7;
  color: #92400e;
}

.btn-toggle:hover {
  background: #fde68a;
}

.btn-delete {
  background: #fecaca;
  color: #7f1d1d;
}

.btn-delete:hover {
  background: #fca5a5;
}

/* No Content State */
.no-content {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.no-content-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-content h3 {
  margin: 0 0 8px 0;
  color: #4a5568;
}

/* Analytics */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px;
}

.analytics-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.analytics-card h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 16px;
}

/* Popular Content */
.popular-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.popular-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.popular-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2d3748;
}

.popular-info p {
  margin: 0;
  font-size: 12px;
  color: #718096;
}

.popular-progress {
  width: 80px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  /* Ensure no transitions on container */
  transition: none !important;
  animation: none !important;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Completely disable all transitions and animations */
  transition: none !important;
  animation: none !important;
}

/* Category Stats */
.category-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-stat {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.category-name {
  font-weight: 600;
  color: #2d3748;
  text-transform: capitalize;
}

.category-count {
  font-size: 12px;
  color: #718096;
}

.category-metrics small {
  color: #718096;
  font-size: 11px;
}

/* Recent Activity */
.recent-activity {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.activity-info p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2d3748;
}

.activity-info small {
  color: #718096;
  font-size: 12px;
}

.no-activity {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

/* Streak Stats */
.streak-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.streak-item {
  text-align: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.streak-item h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
}

.streak-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  color: #4299e1;
  margin-bottom: 20px;
}

.loading-state h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
}

.loading-state p {
  margin: 0;
  color: #718096;
}

/* Responsive Design */
@media (max-width: 768px) {
  .learning-management {
    padding: 15px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tab-navigation {
    flex-wrap: wrap;
  }

  .form-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 10px;
  }

  .search-box input {
    min-width: 200px;
  }

  .content-table {
    font-size: 12px;
  }

  .content-table th,
  .content-table td {
    padding: 8px;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }
}
</style>
