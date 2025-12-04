import { db } from "@/firebase/config";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";

/**
 * QuizService - Manages quiz functionality for learning content
 * Creates quizzes based on learned content to reinforce learning
 */

/**
 * Generate quiz questions from learned content
 * @param {Object} content - The learning content object
 * @returns {Array} Array of quiz questions
 */
export function generateQuizQuestions(content) {
  // Return the quiz questions from the content if available
  if (content.quizQuestions && Array.isArray(content.quizQuestions)) {
    return content.quizQuestions;
  }

  // Fallback: generate a basic comprehension question
  return [
    {
      question: `What is the main topic of "${content.title}"?`,
      options: [
        content.category,
        "General Information",
        "System Settings",
        "User Profile",
      ],
      correctAnswer: 0,
      explanation: `This content is about ${content.category}.`,
    },
  ];
}

/**
 * Validate quiz answers
 * @param {Array} questions - Array of quiz questions
 * @param {Array} userAnswers - Array of user's answers (indices)
 * @returns {Object} Quiz results
 */
export function validateQuizAnswers(questions, userAnswers) {
  let correctCount = 0;
  const results = [];

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    results.push({
      questionIndex: index,
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      explanation: question.explanation,
      selectedOption:
        userAnswer !== null ? question.options[userAnswer] : "Not answered",
      correctOption: question.options[question.correctAnswer],
    });
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 70; // 70% passing grade

  return {
    score: score,
    correctCount: correctCount,
    totalQuestions: questions.length,
    passed: passed,
    results: results,
  };
}

/**
 * Save quiz result to Firebase
 * @param {string} contentId - ID of the learning content
 * @param {Object} quizResult - Quiz validation result
 * @param {number} timeTaken - Time taken to complete quiz (seconds)
 */
export async function saveQuizResult(contentId, quizResult, timeTaken = 0) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const quizData = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      contentId: contentId,
      score: quizResult.score,
      correctCount: quizResult.correctCount,
      totalQuestions: quizResult.totalQuestions,
      passed: quizResult.passed,
      timeTaken: timeTaken,
      completedAt: serverTimestamp(),
      results: quizResult.results,
    };

    const docRef = await addDoc(collection(db, "quizResults"), quizData);

    console.log("Quiz result saved:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
}

/**
 * Get user's quiz history for specific content
 * @param {string} contentId - ID of the learning content
 * @returns {Array} Array of quiz attempts
 */
export async function getUserQuizHistory(contentId) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "quizResults"),
      where("userId", "==", currentUser.uid),
      where("contentId", "==", contentId),
      orderBy("completedAt", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const history = [];

    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return history;
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return [];
  }
}

/**
 * Get user's overall quiz statistics
 * @returns {Object} Quiz statistics
 */
export async function getUserQuizStats() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "quizResults"),
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    let totalQuizzes = 0;
    let totalScore = 0;
    let passedQuizzes = 0;
    let perfectScores = 0;

    console.log(`📊 Found ${querySnapshot.size} quiz results in database`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Quiz result:`, {
        id: doc.id,
        score: data.score,
        passed: data.passed,
        contentId: data.contentId,
        completedAt: data.completedAt,
      });
      totalQuizzes++;
      totalScore += data.score || 0;

      if (data.passed) {
        passedQuizzes++;
      }

      if (data.score === 100) {
        perfectScores++;
      }
    });

    const averageScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    console.log(`📈 Quiz Stats Summary:`, {
      totalQuizzes,
      averageScore,
      passedQuizzes,
      perfectScores,
    });

    return {
      totalQuizzes: totalQuizzes,
      averageScore: averageScore,
      passedQuizzes: passedQuizzes,
      perfectScores: perfectScores,
      passRate:
        totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0,
    };
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return {
      totalQuizzes: 0,
      averageScore: 0,
      passedQuizzes: 0,
      perfectScores: 0,
      passRate: 0,
    };
  }
}

/**
 * Check if user has taken quiz for specific content
 * @param {string} contentId - ID of the learning content
 * @returns {boolean} True if quiz has been taken
 */
export async function hasUserTakenQuiz(contentId) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return false;
    }

    const q = query(
      collection(db, "quizResults"),
      where("userId", "==", currentUser.uid),
      where("contentId", "==", contentId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking quiz status:", error);
    return false;
  }
}

/**
 * Get best quiz score for specific content
 * @param {string} contentId - ID of the learning content
 * @returns {number} Best score (0-100)
 */
export async function getBestQuizScore(contentId) {
  try {
    const history = await getUserQuizHistory(contentId);

    if (history.length === 0) {
      return 0;
    }

    const bestScore = Math.max(...history.map((attempt) => attempt.score || 0));
    return bestScore;
  } catch (error) {
    console.error("Error getting best score:", error);
    return 0;
  }
}
