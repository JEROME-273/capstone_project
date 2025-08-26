import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  limit,
} from "firebase/firestore";
import {
  sampleLearningContent,
  sampleDailyChallenges,
} from "./LearningContentService.js";

/**
 * Initialize the learning system with sample data
 * This should be run once to populate the database with initial content
 */
export async function initializeLearningSystem() {
  try {
    console.log("🎓 Initializing learning system...");

    // Check if learning content already exists
    const existingContent = await getDocs(
      query(collection(db, "learningContent"), limit(1))
    );

    if (existingContent.empty) {
      console.log("📚 Adding sample learning content...");

      // Add sample learning content
      for (const content of sampleLearningContent) {
        const contentWithTimestamps = {
          ...content,
          learnedCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "learningContent"), contentWithTimestamps);
      }

      console.log(`✅ Added ${sampleLearningContent.length} learning items`);
    } else {
      console.log(
        "📚 Learning content already exists, skipping initialization"
      );
    }

    // Check if daily challenges exist
    const existingChallenges = await getDocs(
      query(collection(db, "dailyChallenges"), limit(1))
    );

    if (existingChallenges.empty) {
      console.log("🏆 Adding sample daily challenges...");

      // Add sample daily challenges
      for (const challenge of sampleDailyChallenges) {
        const challengeWithTimestamps = {
          ...challenge,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(
          collection(db, "dailyChallenges"),
          challengeWithTimestamps
        );
      }

      console.log(`✅ Added ${sampleDailyChallenges.length} daily challenges`);
    } else {
      console.log("🏆 Daily challenges already exist, skipping initialization");
    }

    console.log("🎉 Learning system initialization complete!");
    return {
      success: true,
      message: "Learning system initialized successfully",
    };
  } catch (error) {
    console.error("❌ Error initializing learning system:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Add a new daily challenge
 */
export async function addDailyChallenge(challengeData) {
  try {
    const challenge = {
      ...challengeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "dailyChallenges"), challenge);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding daily challenge:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Get learning statistics
 */
export async function getLearningStatistics() {
  try {
    // Get total learning content count
    const contentSnapshot = await getDocs(collection(db, "learningContent"));
    const totalContent = contentSnapshot.size;

    // Get total users with learning progress
    const progressSnapshot = await getDocs(collection(db, "learningProgress"));
    const uniqueUsers = new Set(
      progressSnapshot.docs.map((doc) => doc.data().userId)
    ).size;

    // Get total learning interactions
    const totalLearning = progressSnapshot.size;

    // Get user stats
    const statsSnapshot = await getDocs(collection(db, "userLearningStats"));
    const allStreaks = statsSnapshot.docs.map(
      (doc) => doc.data().currentStreak || 0
    );
    const activeStreaks = allStreaks.filter((streak) => streak > 0).length;
    const averageStreak =
      allStreaks.length > 0
        ? Math.round(allStreaks.reduce((a, b) => a + b, 0) / allStreaks.length)
        : 0;
    const longestStreak = allStreaks.length > 0 ? Math.max(...allStreaks) : 0;

    return {
      success: true,
      stats: {
        totalContent,
        uniqueUsers,
        totalLearning,
        activeStreaks,
        averageStreak,
        longestStreak,
      },
    };
  } catch (error) {
    console.error("Error getting learning statistics:", error);
    return { success: false, message: error.message };
  }
}
