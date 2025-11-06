<template>
  <!-- Main UI only renders when visible is true -->
  <div v-if="visible" class="learning-progress-tracker">
    <!-- Learning Stats Header -->
    <div class="learning-header">
      <div class="streak-display">
        <div class="streak-flame">
          <i class="bx bxs-flame" :class="{ active: currentStreak > 0 }"></i>
        </div>
        <div class="streak-info">
          <span class="streak-number">{{ currentStreak }}</span>
          <span class="streak-label">Day Streak</span>
        </div>
      </div>

      <div class="learning-stats">
        <div class="stat-item">
          <span class="stat-number">{{ learnedCount }}</span>
          <span class="stat-label">Learned</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalAvailable }}</span>
          <span class="stat-label">Available</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ progressPercentage }}%</span>
          <span class="stat-label">Progress</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <span class="progress-text">
        {{ learnedCount }} of {{ totalAvailable }} tips learned
      </span>
    </div>

    <!-- Achievement Badges -->
    <div v-if="recentAchievements.length > 0" class="achievements-section">
      <h3>Recent Achievements</h3>
      <div class="achievements-list">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-badge"
          :class="achievement.type">
          <i :class="achievement.icon"></i>
          <span>{{ achievement.title }}</span>
        </div>
      </div>
    </div>

    <!-- Learning Content -->
    <div class="learning-content">
      <!-- Category Filter -->
      <div class="filter-section">
        <h3>Learning Content</h3>
        <div class="category-filters">
          <button
            v-for="category in categories"
            :key="category"
            :class="['category-btn', { active: selectedCategory === category }]"
            @click="
              selectedCategory = selectedCategory === category ? '' : category
            ">
            <i :class="getCategoryIcon(category)"></i>
            {{ formatCategoryName(category) }}
          </button>
        </div>
      </div>

      <!-- Tips List -->
      <div class="tips-container">
        <div
          v-for="tip in filteredTips"
          :key="tip.id"
          class="tip-card"
          :class="{
            learned: isLearned(tip.id),
            featured: tip.isFeatured,
            expanded: expandedTip === tip.id,
          }">
          <div class="tip-header" @click="toggleTipExpansion(tip.id)">
            <div class="tip-info">
              <div class="tip-category">
                <span :class="`category-${tip.category}`">{{
                  tip.category
                }}</span>
                <span :class="`difficulty-${tip.difficulty}`">{{
                  tip.difficulty
                }}</span>
                <i v-if="tip.isFeatured" class="bx bxs-star featured-star"></i>
              </div>
              <h4 class="tip-title">{{ tip.title }}</h4>
              <p class="tip-preview">{{ tip.content }}</p>
            </div>
            <div class="tip-actions">
              <button
                v-if="!isLearned(tip.id)"
                @click.stop="markAsLearned(tip.id)"
                class="learn-btn"
                :disabled="isMarkingLearned">
                <i class="bx bx-check"></i>
                Mark as Learned
              </button>
              <div v-else class="learned-indicator">
                <i class="bx bxs-check-circle"></i>
                <span>Learned</span>
              </div>
              <button
                class="expand-btn"
                :class="{ expanded: expandedTip === tip.id }">
                <i class="bx bx-chevron-down"></i>
              </button>
            </div>
          </div>

          <!-- Expanded Content -->
          <div v-if="expandedTip === tip.id" class="tip-expanded-content">
            <div v-if="tip.detailedContent" class="detailed-content">
              <div class="detailed-content-header">
                <h5>Detailed Information:</h5>
                <!-- Voice Reading Controls - only for detailed content -->
                <div class="voice-controls">
                  <button
                    @click="toggleVoiceReading(tip)"
                    :class="['voice-btn', { active: isReading && currentReadingTip?.id === tip.id }]"
                    :disabled="!speechSupported">
                    <i :class="isReading && currentReadingTip?.id === tip.id ? 'bx bx-stop' : 'bx bx-volume-full'"></i>
                    {{ isReading && currentReadingTip?.id === tip.id ? 'Stop Reading' : 'Read Details' }}
                  </button>
                  <span v-if="!speechSupported" class="voice-unsupported">
                    Voice reading not supported in this browser
                  </span>
                </div>
              </div>
              <p>{{ tip.detailedContent }}</p>
            </div>

            <div class="tip-metadata">
              <div class="metadata-item">
                <i class="bx bx-time"></i>
                <span>{{ tip.estimatedReadTime || 5 }} min read</span>
              </div>
              <div v-if="tip.tags && tip.tags.length > 0" class="metadata-item">
                <i class="bx bx-tag"></i>
                <div class="tags">
                  <span v-for="tag in tip.tags" :key="tag" class="tag">{{
                    tag
                  }}</span>
                </div>
              </div>
            </div>

            <div v-if="isLearned(tip.id)" class="learned-info">
              <i class="bx bx-calendar"></i>
              <span>Learned on {{ formatLearnedDate(tip.id) }}</span>
            </div>
          </div>
        </div>

        <!-- No Content State -->
        <div v-if="filteredTips.length === 0" class="no-content">
          <div class="no-content-icon">
            <i class="bx bx-book-open"></i>
          </div>
          <h3>No learning content found</h3>
          <p>
            {{
              selectedCategory
                ? "Try selecting a different category"
                : "Check back later for new content"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Daily Challenge -->
    <div v-if="dailyChallenge" class="daily-challenge">
      <div class="challenge-header">
        <h3>
          <i class="bx bxs-trophy"></i>
          Daily Challenge
        </h3>
        <span class="challenge-reward"
          >+{{ dailyChallenge.points }} points</span
        >
      </div>
      <div class="challenge-content">
        <p>{{ dailyChallenge.description }}</p>
        <button
          v-if="!isDailyChallengeCompleted"
          @click="completeDailyChallenge"
          class="challenge-btn"
          :disabled="isCompletingChallenge">
          <i class="bx bx-check"></i>
          Complete Challenge
        </button>
        <div v-else class="challenge-completed">
          <i class="bx bxs-check-circle"></i>
          <span>Challenge Completed!</span>
        </div>
      </div>
    </div>
  </div>

  <!-- New Tips Modal -->
  <div v-if="showNewTipsModal" class="modal-overlay" @click="closeNewTipsModal">
    <div class="new-tips-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title">
          <i class="bx bxs-bulb modal-icon"></i>
          <h3>🎓 New Learning Tip Available!</h3>
        </div>
        <div class="modal-progress">
          {{ modalProgress.current }} of {{ modalProgress.total }}
        </div>
        <button class="modal-close" @click="closeNewTipsModal">
          <i class="bx bx-x"></i>
        </button>
      </div>

      <div v-if="currentNewTip" class="modal-content">
        <div class="tip-category-badge">
          <i :class="getCategoryIcon(currentNewTip.category)"></i>
          {{ formatCategoryName(currentNewTip.category) }}
          <span
            class="difficulty-badge"
            :class="`difficulty-${currentNewTip.difficulty}`">
            {{ currentNewTip.difficulty }}
          </span>
        </div>

        <h4 class="tip-title">{{ currentNewTip.title }}</h4>

        <div class="tip-content">
          <p>{{ currentNewTip.content }}</p>
          <div v-if="currentNewTip.detailedContent" class="detailed-content">
            <p>{{ currentNewTip.detailedContent }}</p>
          </div>
        </div>

        <div class="tip-metadata">
          <div class="metadata-item">
            <i class="bx bx-time"></i>
            <span>{{ currentNewTip.estimatedReadTime || 5 }} min read</span>
          </div>
          <div
            v-if="currentNewTip.tags && currentNewTip.tags.length > 0"
            class="metadata-item">
            <i class="bx bx-tag"></i>
            <div class="tags">
              <span v-for="tag in currentNewTip.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button
          v-if="modalProgress.current > 1"
          @click="goToPreviousTip"
          class="btn-secondary">
          <i class="bx bx-chevron-left"></i>
          Previous
        </button>

        <button @click="markCurrentTipAsLearned" class="btn-primary">
          <i class="bx bx-check"></i>
          Mark as Learned & Continue
        </button>

        <button
          v-if="modalProgress.current < modalProgress.total"
          @click="goToNextTip"
          class="btn-secondary">
          Next
          <i class="bx bx-chevron-right"></i>
        </button>

        <button v-else @click="closeNewTipsModal" class="btn-secondary">
          <i class="bx bx-x"></i>
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { db } from "@/firebase/config";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  // When false, component won't attach Firestore listeners (useful for secondary instance)
  listen: {
    type: Boolean,
    default: true,
  },
});

// Reactive state
const isLoading = ref(true);
const learningContent = ref([]);
const userProgress = ref([]);
const userStats = ref({
  currentStreak: 0,
  totalLearned: 0,
  lastLearningDate: null,
  achievements: [],
});

const selectedCategory = ref("");
const expandedTip = ref(null);
const isMarkingLearned = ref(false);
const isCompletingChallenge = ref(false);

// Daily Challenge
const dailyChallenge = ref(null);
const isDailyChallengeCompleted = ref(false);

// Achievement tracking
const recentAchievements = ref([]);

// Voice reading state
const isReading = ref(false);
const currentReadingTip = ref(null);
const speechSupported = ref(typeof window !== 'undefined' && 'speechSynthesis' in window);

// Real-time listeners storage
const unsubscribeFunctions = ref([]);

// Modal state for new tips
const showNewTipsModal = ref(false);
const newTipsToShow = ref([]);
const currentTipIndex = ref(0);
const lastContentCount = ref(0);
const didInitialContentLoad = ref(false);

// Computed properties
const currentStreak = computed(() => userStats.value.currentStreak || 0);

const learnedCount = computed(() => userProgress.value.length);

const totalAvailable = computed(() => {
  const activeItems = learningContent.value.filter(
    (item) => item.isActive !== false // Include items without isActive field or where isActive is true
  );
  console.log(
    "Total available learning content:",
    activeItems.length,
    activeItems
  );
  return activeItems.length;
});

const progressPercentage = computed(() => {
  if (totalAvailable.value === 0) return 0;
  return Math.round((learnedCount.value / totalAvailable.value) * 100);
});

const categories = computed(() => {
  const allCategories = [
    ...new Set(learningContent.value.map((item) => item.category)),
  ];
  console.log("Available categories:", allCategories);
  return allCategories.filter((category) => category);
});

const filteredTips = computed(() => {
  console.log("Filtering from learningContent.value:", learningContent.value);

  // Include all content that's not explicitly inactive
  let filtered = learningContent.value.filter(
    (item) => item.isActive !== false
  );

  console.log("After isActive filter:", filtered);

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (item) => item.category === selectedCategory.value
    );
    console.log("After category filter:", filtered);
  }

  // Sort by: featured first, then unlearned, then by priority
  const sorted = filtered.sort((a, b) => {
    // Featured content first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;

    // Unlearned content next
    const aLearned = isLearned(a.id);
    const bLearned = isLearned(b.id);
    if (!aLearned && bLearned) return -1;
    if (aLearned && !bLearned) return 1;

    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;

    return aPriority - bPriority;
  });

  console.log("Final filtered tips:", sorted);
  return sorted;
});

// Methods
onMounted(async () => {
  if (props.listen) {
    await setupRealtimeListeners();
  }
  // User-specific data is optional for modal popups; keep it when visible instance
  if (props.visible) {
    await loadUserProgress();
    await loadDailyChallenge();
  }
  isLoading.value = false;
});

onUnmounted(() => {
  // Clean up all real-time listeners
  unsubscribeFunctions.value.forEach((unsubscribe) => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  });
  unsubscribeFunctions.value = [];
  
  // Stop any ongoing speech synthesis
  stopVoiceReading();
});

// Voice Reading Methods
function toggleVoiceReading(tip) {
  if (!speechSupported.value) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  if (isReading.value && currentReadingTip.value?.id === tip.id) {
    stopVoiceReading();
  } else {
    startVoiceReading(tip);
  }
}

function startVoiceReading(tip) {
  // Stop any current reading
  stopVoiceReading();
  
  // Only read the detailed content if it exists
  if (!tip.detailedContent) {
    console.warn('No detailed content available to read');
    return;
  }
  
  // Prepare only the detailed information to read
  let textToRead = tip.detailedContent;

  // Create and configure speech utterance
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.9; // Slightly slower for better comprehension
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Set up event listeners
  utterance.onstart = () => {
    isReading.value = true;
    currentReadingTip.value = tip;
    console.log('Voice reading started for:', tip.title);
  };
  
  utterance.onend = () => {
    isReading.value = false;
    currentReadingTip.value = null;
    console.log('Voice reading completed');
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
    isReading.value = false;
    currentReadingTip.value = null;
  };

  // Start speaking
  window.speechSynthesis.speak(utterance);
}

function stopVoiceReading() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  isReading.value = false;
  currentReadingTip.value = null;
}

async function setupRealtimeListeners() {
  console.log("Setting up real-time listeners for learning content...");

  try {
    // Real-time listener for learning content
    let contentQuery;
    try {
      contentQuery = query(
        collection(db, "learningContent"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
    } catch (indexError) {
      console.log("Index error, using fallback query:", indexError);
      contentQuery = query(
        collection(db, "learningContent"),
        where("isActive", "==", true)
      );
    }

    const unsubscribeContent = onSnapshot(
      contentQuery,
      (snapshot) => {
        console.log("Real-time update: Learning content changed");

        const newContent = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        learningContent.value = newContent;

        // On first snapshot, just initialize counts and skip modal
        if (!didInitialContentLoad.value) {
          didInitialContentLoad.value = true;
          lastContentCount.value = newContent.length;
          console.log(
            `Initial load with ${newContent.length} items. Skipping modal.`
          );
          return;
        }

        // Detect newly added docs only
        const addedTips = snapshot
          .docChanges()
          .filter((change) => change.type === "added")
          .map((change) => ({ id: change.doc.id, ...change.doc.data() }))
          .filter((item) => item.isActive !== false);

        if (addedTips.length > 0) {
          console.log(
            `Detected ${addedTips.length} newly added tips:`,
            addedTips.map((t) => t.title)
          );
          showNewContentNotification(addedTips);
        }

        lastContentCount.value = newContent.length;
      },
      (error) => {
        console.error("Real-time listener error, trying fallback:", error);

        // Fallback to basic query without orderBy
        const fallbackQuery = collection(db, "learningContent");
        const unsubscribeFallback = onSnapshot(fallbackQuery, (snapshot) => {
          console.log("Fallback real-time update: Learning content changed");

          const allContent = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((item) => item.isActive !== false);

          learningContent.value = allContent;

          if (!didInitialContentLoad.value) {
            didInitialContentLoad.value = true;
            lastContentCount.value = allContent.length;
            console.log(
              `Initial load (fallback) with ${allContent.length} items. Skipping modal.`
            );
            return;
          }

          const addedTips = snapshot
            .docChanges()
            .filter((change) => change.type === "added")
            .map((change) => ({ id: change.doc.id, ...change.doc.data() }))
            .filter((item) => item.isActive !== false);

          if (addedTips.length > 0) {
            console.log(
              `Detected ${addedTips.length} newly added tips (fallback):`,
              addedTips.map((t) => t.title)
            );
            showNewContentNotification(addedTips);
          }

          lastContentCount.value = allContent.length;
        });

        unsubscribeFunctions.value.push(unsubscribeFallback);
      }
    );

    unsubscribeFunctions.value.push(unsubscribeContent);
  } catch (error) {
    console.error("Error setting up real-time listeners:", error);

    // Final fallback - load content once
    await loadLearningContentFallback();
  }
}

async function loadLearningContent() {
  try {
    console.log("Loading learning content...");

    // First try with orderBy, if it fails, try without orderBy
    let querySnapshot;
    try {
      const q = query(
        collection(db, "learningContent"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.log("Index error, trying without orderBy:", indexError);
      // Fallback query without orderBy if index doesn't exist
      const q = query(
        collection(db, "learningContent"),
        where("isActive", "==", true)
      );
      querySnapshot = await getDocs(q);
    }

    learningContent.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `Loaded ${learningContent.value.length} learning items:`,
      learningContent.value
    );
  } catch (error) {
    console.error("Error loading learning content:", error);

    // Final fallback - load all learning content without filters
    try {
      console.log("Trying fallback query - loading all content...");
      const allQuery = collection(db, "learningContent");
      const allSnapshot = await getDocs(allQuery);

      learningContent.value = allSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.isActive !== false); // Include items without isActive field

      console.log(
        `Fallback loaded ${learningContent.value.length} learning items:`,
        learningContent.value
      );
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      learningContent.value = [];
    }
  }
}

async function loadLearningContentFallback() {
  try {
    console.log("Loading learning content (fallback)...");
    const allQuery = collection(db, "learningContent");
    const allSnapshot = await getDocs(allQuery);

    learningContent.value = allSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((item) => item.isActive !== false);

    console.log(
      `Fallback loaded ${learningContent.value.length} learning items:`,
      learningContent.value
    );
  } catch (error) {
    console.error("Fallback content loading failed:", error);
    learningContent.value = [];
  }
}

function showNewContentNotification(addedItems) {
  if (!addedItems || addedItems.length === 0) return;
  // Only show active items
  const items = addedItems.filter((i) => i.isActive !== false);
  if (items.length === 0) return;

  // Show the modal with only the new items (sorted newest first if createdAt exists)
  const sorted = [...items].sort((a, b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bTime - aTime;
  });

  newTipsToShow.value = sorted;
  currentTipIndex.value = 0;
  showNewTipsModal.value = true;

  console.log(
    "Opening modal for new tips:",
    sorted.map((t) => t.title)
  );
}

// Debug function to test modal - remove this later
function testModal() {
  console.log(
    "Testing modal with current learning content:",
    learningContent.value
  );
  if (learningContent.value.length > 0) {
    newTipsToShow.value = learningContent.value.slice(0, 3); // Show first 3 items
    currentTipIndex.value = 0;
    showNewTipsModal.value = true;
    console.log("Force opening modal for testing");
  } else {
    console.log("No content to show in modal");
  }
}

// Expose testModal globally for console testing
window.testModal = testModal;

async function loadUserProgress() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Set up real-time listener for user's learning progress
    const progressQuery = query(
      collection(db, "learningProgress"),
      where("userId", "==", currentUser.uid),
      orderBy("learnedAt", "desc")
    );

    const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
      console.log("Real-time update: User progress changed");
      userProgress.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(`User has learned ${userProgress.value.length} items`);
    });

    unsubscribeFunctions.value.push(unsubscribeProgress);

    // Set up real-time listener for user learning stats
    const statsQuery = query(
      collection(db, "userLearningStats"),
      where("userId", "==", currentUser.uid),
      limit(1)
    );

    const unsubscribeStats = onSnapshot(statsQuery, (snapshot) => {
      console.log("Real-time update: User stats changed");
      if (!snapshot.empty) {
        userStats.value = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
      }
    });

    unsubscribeFunctions.value.push(unsubscribeStats);

    // Load recent achievements with real-time updates
    await setupRealtimeAchievements();
  } catch (error) {
    console.error("Error loading user progress:", error);
  }
}

async function setupRealtimeAchievements() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const achievementsQuery = query(
      collection(db, "userAchievements"),
      where("userId", "==", currentUser.uid),
      where("isRecent", "==", true),
      orderBy("earnedAt", "desc"),
      limit(3)
    );

    const unsubscribeAchievements = onSnapshot(
      achievementsQuery,
      (snapshot) => {
        console.log("Real-time update: User achievements changed");
        recentAchievements.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    );

    unsubscribeFunctions.value.push(unsubscribeAchievements);
  } catch (error) {
    console.error("Error setting up achievements listener:", error);
  }
}

async function loadDailyChallenge() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const challengeQuery = query(
      collection(db, "dailyChallenges"),
      where("date", "==", today),
      where("isActive", "==", true),
      limit(1)
    );

    const challengeSnapshot = await getDocs(challengeQuery);
    if (!challengeSnapshot.empty) {
      dailyChallenge.value = {
        id: challengeSnapshot.docs[0].id,
        ...challengeSnapshot.docs[0].data(),
      };

      // Check if user has completed today's challenge
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const completedQuery = query(
          collection(db, "challengeCompletions"),
          where("userId", "==", currentUser.uid),
          where("challengeId", "==", dailyChallenge.value.id),
          limit(1)
        );

        const completedSnapshot = await getDocs(completedQuery);
        isDailyChallengeCompleted.value = !completedSnapshot.empty;
      }
    }
  } catch (error) {
    console.error("Error loading daily challenge:", error);
  }
}

function isLearned(contentId) {
  return userProgress.value.some(
    (progress) => progress.contentId === contentId
  );
}

function formatLearnedDate(contentId) {
  const progress = userProgress.value.find((p) => p.contentId === contentId);
  if (!progress || !progress.learnedAt) return "";

  const date = progress.learnedAt.toDate();
  return date.toLocaleDateString();
}

async function markAsLearned(contentId) {
  if (isMarkingLearned.value) return;

  try {
    isMarkingLearned.value = true;

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const content = learningContent.value.find((item) => item.id === contentId);
    if (!content) {
      throw new Error("Content not found");
    }

    // Add to learning progress
    const progressData = {
      userId: currentUser.uid,
      contentId: contentId,
      contentTitle: content.title,
      contentCategory: content.category,
      learnedAt: serverTimestamp(),
      userEmail: currentUser.email,
    };

    await addDoc(collection(db, "learningProgress"), progressData);

    // Update user stats
    await updateUserStats();

    // Check for achievements
    await checkAchievements();

    // No need to reload user progress since we have real-time listeners
    // The UI will automatically update when Firestore data changes

    // Show success feedback
    showLearningFeedback(content);
  } catch (error) {
    console.error("Error marking as learned:", error);
  } finally {
    isMarkingLearned.value = false;
  }
}

async function updateUserStats() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate streak
    let newStreak = 1;
    if (userStats.value.lastLearningDate) {
      const lastDate = userStats.value.lastLearningDate.toDate();
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, keep current streak
        newStreak = userStats.value.currentStreak || 1;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak = (userStats.value.currentStreak || 0) + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    }

    const updatedStats = {
      userId: currentUser.uid,
      currentStreak: newStreak,
      totalLearned: (userStats.value.totalLearned || 0) + 1,
      lastLearningDate: serverTimestamp(),
      longestStreak: Math.max(newStreak, userStats.value.longestStreak || 0),
      updatedAt: serverTimestamp(),
    };

    if (userStats.value.id) {
      // Update existing stats
      await updateDoc(
        doc(db, "userLearningStats", userStats.value.id),
        updatedStats
      );
    } else {
      // Create new stats document
      updatedStats.createdAt = serverTimestamp();
      const docRef = await addDoc(
        collection(db, "userLearningStats"),
        updatedStats
      );
      userStats.value.id = docRef.id;
    }

    // Update local state
    userStats.value = { ...userStats.value, ...updatedStats };
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

async function checkAchievements() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newAchievements = [];

    // First learning achievement
    if (userProgress.value.length === 0) {
      newAchievements.push({
        type: "first_learn",
        title: "First Steps",
        description: "Completed your first learning item!",
        icon: "bx bxs-star",
        points: 10,
      });
    }

    // Streak achievements
    const newStreak = userStats.value.currentStreak + 1;
    if (newStreak === 3) {
      newAchievements.push({
        type: "streak_3",
        title: "3-Day Streak",
        description: "Learning for 3 consecutive days!",
        icon: "bx bxs-flame",
        points: 15,
      });
    } else if (newStreak === 7) {
      newAchievements.push({
        type: "streak_7",
        title: "Week Warrior",
        description: "Learning for a full week!",
        icon: "bx bxs-crown",
        points: 25,
      });
    } else if (newStreak === 30) {
      newAchievements.push({
        type: "streak_30",
        title: "Monthly Master",
        description: "Learning for 30 consecutive days!",
        icon: "bx bxs-trophy",
        points: 50,
      });
    }

    // Learning count achievements
    const totalLearned = userProgress.value.length + 1;
    if (totalLearned === 5) {
      newAchievements.push({
        type: "count_5",
        title: "Knowledge Seeker",
        description: "Learned 5 different tips!",
        icon: "bx bxs-book",
        points: 20,
      });
    } else if (totalLearned === 10) {
      newAchievements.push({
        type: "count_10",
        title: "Learning Enthusiast",
        description: "Learned 10 different tips!",
        icon: "bx bxs-graduation",
        points: 30,
      });
    }

    // Save new achievements
    for (const achievement of newAchievements) {
      await addDoc(collection(db, "userAchievements"), {
        ...achievement,
        userId: currentUser.uid,
        earnedAt: serverTimestamp(),
        isRecent: true,
      });
    }

    if (newAchievements.length > 0) {
      await loadRecentAchievements();
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

async function completeDailyChallenge() {
  if (isCompletingChallenge.value || !dailyChallenge.value) return;

  try {
    isCompletingChallenge.value = true;

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Mark challenge as completed
    await addDoc(collection(db, "challengeCompletions"), {
      userId: currentUser.uid,
      challengeId: dailyChallenge.value.id,
      completedAt: serverTimestamp(),
      pointsEarned: dailyChallenge.value.points || 10,
    });

    isDailyChallengeCompleted.value = true;

    // Add points to user stats (you can implement a points system)
    showChallengeFeedback();
  } catch (error) {
    console.error("Error completing daily challenge:", error);
  } finally {
    isCompletingChallenge.value = false;
  }
}

function toggleTipExpansion(tipId) {
  expandedTip.value = expandedTip.value === tipId ? null : tipId;
}

function getCategoryIcon(category) {
  const icons = {
    navigation: "bx bx-navigation",
    ar: "bx bx-camera",
    campus: "bx bx-building",
    safety: "bx bx-shield",
    accessibility: "bx bx-accessibility",
    general: "bx bx-info-circle",
  };
  return icons[category] || "bx bx-info-circle";
}

function formatCategoryName(category) {
  return (
    category.charAt(0).toUpperCase() +
    category.slice(1).replace(/([A-Z])/g, " $1")
  );
}

function showLearningFeedback(content) {
  // You can implement a toast notification system here
  console.log(`Congratulations! You learned: ${content.title}`);
}

function showChallengeFeedback() {
  // You can implement a toast notification system here
  console.log("Daily challenge completed! You earned points!");
}

// Modal Functions for New Tips
function closeNewTipsModal() {
  showNewTipsModal.value = false;
  newTipsToShow.value = [];
  currentTipIndex.value = 0;
}

function goToNextTip() {
  if (currentTipIndex.value < newTipsToShow.value.length - 1) {
    currentTipIndex.value++;
  } else {
    closeNewTipsModal();
  }
}

function goToPreviousTip() {
  if (currentTipIndex.value > 0) {
    currentTipIndex.value--;
  }
}

function markCurrentTipAsLearned() {
  const currentTip = newTipsToShow.value[currentTipIndex.value];
  if (currentTip) {
    markAsLearned(currentTip.id);
    // Go to next tip or close modal
    if (currentTipIndex.value < newTipsToShow.value.length - 1) {
      currentTipIndex.value++;
    } else {
      closeNewTipsModal();
    }
  }
}

// Computed properties for modal
const currentNewTip = computed(() => {
  if (newTipsToShow.value.length === 0) return null;
  return newTipsToShow.value[currentTipIndex.value];
});

const modalProgress = computed(() => {
  if (newTipsToShow.value.length === 0) return { current: 0, total: 0 };
  return {
    current: currentTipIndex.value + 1,
    total: newTipsToShow.value.length,
  };
});

// Watch for visibility changes
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      if (learningContent.value.length === 0 && props.listen) {
        loadLearningContent();
      }
      loadUserProgress();
      loadDailyChallenge();
    }
  }
);
</script>

<style scoped>
.learning-progress-tracker {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

/* Learning Header */
.learning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.streak-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.streak-flame {
  font-size: 32px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.streak-flame.active {
  opacity: 1;
  color: #ffd700;
  animation: flicker 2s infinite alternate;
}

@keyframes flicker {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.streak-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.streak-number {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.streak-label {
  font-size: 12px;
  opacity: 0.9;
}

.learning-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
}

/* Progress Bar */
.progress-container {
  margin-bottom: 25px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.6s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 13px;
  color: #718096;
}

/* Achievements */
.achievements-section {
  margin-bottom: 25px;
}

.achievements-section h3 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
}

.achievements-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  animation: slideInDown 0.5s ease;
}

.achievement-badge.first_learn,
.achievement-badge.count_5,
.achievement-badge.count_10 {
  background: #e0e7ff;
  color: #3730a3;
}

.achievement-badge.streak_3,
.achievement-badge.streak_7,
.achievement-badge.streak_30 {
  background: #fed7d7;
  color: #c53030;
}

/* Filter Section */
.filter-section {
  margin-bottom: 20px;
}

.filter-section h3 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.category-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: #cbd5e0;
}

.category-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* Tips Container */
.tips-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Tip Card */
.tip-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.tip-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tip-card.learned {
  border-color: #68d391;
  background: #f0fff4;
}

.tip-card.featured {
  border-color: #ffd700;
  position: relative;
}

.tip-card.featured::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ffd700, #ff8c00);
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  cursor: pointer;
}

.tip-info {
  flex: 1;
  margin-right: 15px;
}

.tip-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tip-category span {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
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

.featured-star {
  color: #ffd700;
  font-size: 14px;
}

.tip-title {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.tip-preview {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

/* Tip Actions */
.tip-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}

.learn-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.learn-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
}

.learn-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.learned-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #38a169;
  font-size: 12px;
  font-weight: 600;
}

.expand-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #718096;
}

.expand-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.expand-btn.expanded {
  transform: rotate(180deg);
  border-color: #667eea;
  color: #667eea;
}

/* Expanded Content */
.tip-expanded-content {
  padding: 0 16px 16px 16px;
  border-top: 1px solid #e2e8f0;
  animation: expandContent 0.3s ease;
}

@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detailed-content {
  margin-bottom: 15px;
}

.detailed-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 10px;
}

.detailed-content h5 {
  margin: 0;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.detailed-content p {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.6;
}

/* Voice Controls */
.voice-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.voice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.voice-btn.active {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  animation: pulse 2s infinite;
}

.voice-btn.active:hover {
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4);
}

.voice-unsupported {
  font-size: 12px;
  color: #a0aec0;
  font-style: italic;
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
  }
}

.tip-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 6px;
  background: #edf2f7;
  border-radius: 8px;
  font-size: 10px;
  color: #4a5568;
}

.learned-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #38a169;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 12px;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #c6f6d5;
}

/* Daily Challenge */
.daily-challenge {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.challenge-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.challenge-reward {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.challenge-content p {
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.5;
}

.challenge-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.challenge-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.challenge-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.challenge-completed {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
}

/* No Content State */
.no-content {
  text-align: center;
  padding: 40px 20px;
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
  font-size: 18px;
}

.no-content p {
  margin: 0;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .learning-progress-tracker {
    padding: 15px;
  }

  .learning-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .learning-stats {
    gap: 15px;
  }

  .category-filters {
    justify-content: center;
  }

  .tip-header {
    flex-direction: column;
    gap: 15px;
  }

  .tip-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .challenge-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* New Tips Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.new-tips-modal {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 28px;
  color: #ffd700;
  animation: pulse 2s infinite;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-progress {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 28px;
}

.tip-category-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

.difficulty-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
}

.difficulty-beginner {
  background: #dcfce7;
  color: #16a34a;
}

.difficulty-intermediate {
  background: #fef3c7;
  color: #d97706;
}

.difficulty-advanced {
  background: #fecaca;
  color: #dc2626;
}

.modal-content .tip-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.3;
}

.tip-content {
  margin-bottom: 24px;
}

.tip-content p {
  margin: 0 0 12px 0;
  font-size: 16px;
  line-height: 1.6;
  color: #4a5568;
}

.detailed-content {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-top: 12px;
}

.detailed-content p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.tip-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

.metadata-item i {
  color: #a0aec0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 28px 28px;
  border-top: 1px solid #e2e8f0;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Mobile responsiveness for modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .new-tips-modal {
    max-height: 90vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 20px 20px 16px;
    border-radius: 16px 16px 0 0;
  }

  .modal-title h3 {
    font-size: 18px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-content .tip-title {
    font-size: 20px;
  }

  .modal-actions {
    padding: 16px 20px 20px;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
    padding: 14px 20px;
  }
}
</style>
