/**
 * AI Quiz Generator Service
 * Generates quiz questions automatically from learning content
 * Can use either local generation or AI APIs
 */

/**
 * Generate quiz questions automatically from content
 * This uses a rule-based approach that works without external APIs
 * @param {Object} content - Learning content object
 * @returns {Array} Array of generated quiz questions
 */
export function generateQuestionsFromContent(content) {
  const questions = [];

  // Extract key information
  const title = content.title || "";
  const mainContent = content.content || "";
  const detailedContent = content.detailedContent || "";
  const category = content.category || "general";
  const difficulty = content.difficulty || "beginner";

  // Generate Question 1: About the main concept
  const question1 = generateMainConceptQuestion(title, mainContent, category);
  if (question1) questions.push(question1);

  // Generate Question 2: About details or application
  const question2 = generateDetailQuestion(
    mainContent,
    detailedContent,
    category,
    difficulty
  );
  if (question2) questions.push(question2);

  // If we couldn't generate enough questions, add generic ones
  while (questions.length < 2) {
    questions.push(generateGenericQuestion(title, category));
  }

  return questions;
}

/**
 * Generate a question about the main concept
 */
function generateMainConceptQuestion(title, content, category) {
  const question = {
    question: `What is the main topic of "${title}"?`,
    options: [
      formatCategoryName(category),
      "General Information",
      "System Settings",
      "User Profile",
    ],
    correctAnswer: 0,
    explanation: `This content focuses on ${formatCategoryName(
      category
    ).toLowerCase()}.`,
  };

  return question;
}

/**
 * Generate a question about content details
 */
function generateDetailQuestion(
  content,
  detailedContent,
  category,
  difficulty
) {
  // Extract key phrases from content
  const fullText = content + " " + detailedContent;

  // Try to find actionable information
  const actionableWords = [
    "should",
    "must",
    "need to",
    "important to",
    "recommended",
    "best",
  ];
  const hasActionable = actionableWords.some((word) =>
    fullText.toLowerCase().includes(word)
  );

  if (hasActionable) {
    // Generate a "what should you do" question
    const question = {
      question: `Based on this content, what is recommended?`,
      options: generateOptionsFromContent(fullText, category),
      correctAnswer: 0,
      explanation: `This is the key recommendation from the content about ${formatCategoryName(
        category
      ).toLowerCase()}.`,
    };
    return question;
  }

  // Generate a comprehension question
  return {
    question: `What is an important aspect of this topic?`,
    options: generateGenericOptions(category),
    correctAnswer: 0,
    explanation: `This is a key point covered in the content.`,
  };
}

/**
 * Generate generic question as fallback
 */
function generateGenericQuestion(title, category) {
  return {
    question: `Which category best describes "${title}"?`,
    options: [
      formatCategoryName(category),
      "Unrelated Topic",
      "System Configuration",
      "User Preferences",
    ],
    correctAnswer: 0,
    explanation: `This content belongs to the ${formatCategoryName(
      category
    )} category.`,
  };
}

/**
 * Generate answer options from content
 */
function generateOptionsFromContent(content, category) {
  const options = [];

  // Extract first meaningful sentence as correct answer
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  if (sentences.length > 0) {
    const correctAnswer = sentences[0].trim().substring(0, 100);
    options.push(correctAnswer);
  } else {
    options.push(
      `Follow the guidelines for ${formatCategoryName(category).toLowerCase()}`
    );
  }

  // Add distractors
  options.push("Ignore all safety precautions");
  options.push("This is not important");
  options.push("You don't need to know this");

  return options;
}

/**
 * Generate generic options
 */
function generateGenericOptions(category) {
  return [
    `Understanding ${formatCategoryName(category).toLowerCase()}`,
    "Ignoring the instructions",
    "Skipping this section",
    "It doesn't matter",
  ];
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
  const categoryNames = {
    navigation: "Navigation Tips",
    ar: "AR Technology",
    safety: "Safety Guidelines",
    accessibility: "Accessibility Features",
    campus: "Campus Information",
    general: "General Information",
    nature: "Nature Facts",
    animal: "Animal Facts",
  };
  return categoryNames[category] || category;
}

/**
 * Generate quiz questions using AI API (OpenAI/Gemini)
 * This is an enhanced version that uses AI for better questions
 * @param {Object} content - Learning content
 * @param {string} apiKey - API key for AI service
 * @param {string} provider - 'openai' or 'gemini'
 * @returns {Promise<Array>} Generated quiz questions
 */
export async function generateQuestionsWithAI(
  content,
  apiKey = null,
  provider = "gemini"
) {
  // If no API key provided, fall back to rule-based generation
  if (!apiKey) {
    console.log("No API key provided, using rule-based generation");
    return generateQuestionsFromContent(content);
  }

  try {
    if (provider === "gemini") {
      return await generateWithGemini(content, apiKey);
    } else if (provider === "openai") {
      return await generateWithOpenAI(content, apiKey);
    } else {
      throw new Error("Unsupported AI provider");
    }
  } catch (error) {
    console.error("AI generation failed, falling back to rule-based:", error);
    return generateQuestionsFromContent(content);
  }
}

/**
 * Generate questions using Google Gemini AI
 */
async function generateWithGemini(content, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const prompt = createQuizPrompt(content);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;

  return parseAIResponse(generatedText);
}

/**
 * Generate questions using OpenAI
 */
async function generateWithOpenAI(content, apiKey) {
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const prompt = createQuizPrompt(content);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a quiz generator that creates educational multiple-choice questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  return parseAIResponse(generatedText);
}

/**
 * Create prompt for AI quiz generation
 */
function createQuizPrompt(content) {
  return `Generate 2 multiple-choice quiz questions based on the following learning content.

Title: ${content.title}
Category: ${content.category}
Difficulty: ${content.difficulty}

Content: ${content.content}

${content.detailedContent ? `Detailed Content: ${content.detailedContent}` : ""}

Requirements:
- Generate exactly 2 questions
- Each question should have 4 answer options (A, B, C, D)
- Mark which option is correct
- Provide a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Make the questions relevant to the content's main points

Format your response as JSON:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct"
  }
]`;
}

/**
 * Parse AI response into quiz questions
 */
function parseAIResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);

      // Validate the questions
      if (Array.isArray(questions) && questions.length >= 2) {
        return questions.slice(0, 2).map((q) => ({
          question: q.question || "",
          options:
            Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer:
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          explanation:
            q.explanation || "This is the correct answer based on the content.",
        }));
      }
    }

    // If parsing fails, fall back to rule-based
    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw error;
  }
}

/**
 * Validate quiz questions
 */
export function validateQuizQuestions(questions) {
  if (!Array.isArray(questions)) {
    return { valid: false, error: "Questions must be an array" };
  }

  if (questions.length < 2) {
    return { valid: false, error: "At least 2 questions are required" };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (!q.question || q.question.trim().length < 10) {
      return {
        valid: false,
        error: `Question ${i + 1}: Question text is too short`,
      };
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return {
        valid: false,
        error: `Question ${i + 1}: Must have exactly 4 options`,
      };
    }

    if (
      typeof q.correctAnswer !== "number" ||
      q.correctAnswer < 0 ||
      q.correctAnswer > 3
    ) {
      return {
        valid: false,
        error: `Question ${i + 1}: correctAnswer must be 0-3`,
      };
    }

    if (!q.explanation || q.explanation.trim().length < 10) {
      return {
        valid: false,
        error: `Question ${i + 1}: Explanation is too short`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get default quiz questions for new content
 */
export function getDefaultQuizQuestions(category = "general") {
  return [
    {
      question: "What is the main purpose of this content?",
      options: [
        `To learn about ${formatCategoryName(category).toLowerCase()}`,
        "To test the system",
        "To waste time",
        "Nothing specific",
      ],
      correctAnswer: 0,
      explanation: `This content is designed to help you understand ${formatCategoryName(
        category
      ).toLowerCase()}.`,
    },
    {
      question: "Why is this information important?",
      options: [
        "It helps improve your knowledge and skills",
        "It's not important",
        "Just for entertainment",
        "No particular reason",
      ],
      correctAnswer: 0,
      explanation:
        "Understanding this content helps you use the system more effectively.",
    },
  ];
}
