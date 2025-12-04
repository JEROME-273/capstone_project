// Sample learning content data for initialization
export const sampleLearningContent = [
  {
    title: "Using AR Navigation Effectively",
    content:
      "Hold your phone steady and upright when using AR navigation. The blue arrows will guide you to your destination by overlaying directions on your camera view.",
    detailedContent:
      "AR (Augmented Reality) navigation works best when your phone's camera has a clear view of your surroundings. Make sure to keep the camera lens clean and avoid covering it with your fingers. The system uses your phone's sensors to determine your orientation and position, so sudden movements can affect accuracy. For best results, walk at a normal pace and keep your phone relatively stable.",
    category: "ar",
    difficulty: "beginner",
    priority: "high",
    estimatedReadTime: 3,
    tags: ["ar", "navigation", "beginner", "mobile"],
    isActive: true,
    isFeatured: true,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question:
          "What is the best way to hold your phone when using AR navigation?",
        options: [
          "Hold it steady and upright",
          "Hold it sideways",
          "Hold it upside down",
          "It doesn't matter how you hold it",
        ],
        correctAnswer: 0,
        explanation:
          "Holding your phone steady and upright ensures the camera has a clear view and the AR system can accurately determine your orientation.",
      },
      {
        question:
          "Why should you avoid sudden movements while using AR navigation?",
        options: [
          "It saves battery",
          "It can affect positioning accuracy",
          "It makes the phone heavier",
          "It reduces internet speed",
        ],
        correctAnswer: 1,
        explanation:
          "The system uses your phone's sensors to determine orientation and position, so sudden movements can affect the accuracy of AR navigation.",
      },
    ],
  },
  {
    title: "Voice Commands During Navigation",
    content:
      "You can use voice commands during AR navigation! Tap the microphone icon and say commands like 'How far?', 'Where am I?', or 'Repeat instruction' for hands-free help.",
    detailedContent:
      "Voice commands make navigation more accessible and convenient, especially when your hands are busy. The system recognizes several commands: 'How far' tells you the distance to your destination, 'Where am I' provides your current location coordinates, 'Next instruction' repeats the current navigation direction, and 'End navigation' stops the current route. Speak clearly and wait for the system to process your command before speaking again.",
    category: "navigation",
    difficulty: "intermediate",
    priority: "high",
    estimatedReadTime: 4,
    tags: ["voice", "commands", "navigation", "accessibility"],
    isActive: true,
    isFeatured: true,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question:
          "Which voice command tells you the distance to your destination?",
        options: [
          "How far?",
          "Where am I?",
          "Next instruction",
          "End navigation",
        ],
        correctAnswer: 0,
        explanation:
          "The 'How far?' voice command provides the distance remaining to your destination.",
      },
      {
        question: "What should you do when speaking voice commands?",
        options: [
          "Speak very fast",
          "Speak clearly and wait for processing",
          "Speak multiple commands at once",
          "Speak while moving the phone",
        ],
        correctAnswer: 1,
        explanation:
          "You should speak clearly and wait for the system to process your command before speaking again for best results.",
      },
    ],
  },
  {
    title: "Campus Safety Guidelines",
    content:
      "Always be aware of your surroundings while using AR navigation. Look up from your phone regularly to watch for obstacles, other people, and vehicles.",
    detailedContent:
      "While AR navigation is designed to help you navigate safely, it's important to maintain situational awareness. Don't rely solely on your phone screen - regularly look up to check for obstacles like stairs, doors, or other people. Be especially careful in crowded areas or near vehicle traffic. If you're walking in a group, designate one person as the navigator to avoid everyone looking at their phones simultaneously. In emergency situations, always prioritize real-world awareness over digital directions.",
    category: "safety",
    difficulty: "beginner",
    priority: "high",
    estimatedReadTime: 5,
    tags: ["safety", "awareness", "campus", "walking"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question: "What should you prioritize in emergency situations?",
        options: [
          "Following digital directions",
          "Real-world awareness",
          "Checking your phone",
          "Taking photos",
        ],
        correctAnswer: 1,
        explanation:
          "In emergency situations, always prioritize real-world awareness over digital directions for your safety.",
      },
      {
        question: "When walking in a group, what is recommended?",
        options: [
          "Everyone should look at their phones",
          "No one should use navigation",
          "Designate one person as the navigator",
          "Walk separately",
        ],
        correctAnswer: 2,
        explanation:
          "It's best to designate one person as the navigator to avoid everyone looking at their phones simultaneously.",
      },
    ],
  },
  {
    title: "Understanding GPS Accuracy",
    content:
      "GPS accuracy can vary depending on your environment. Indoor locations, areas with tall buildings, or bad weather can affect positioning accuracy.",
    detailedContent:
      "Global Positioning System (GPS) signals can be affected by various factors. Indoor environments often have poor GPS reception because satellite signals are blocked by roofs and walls. Urban canyons created by tall buildings can cause signal reflection and multipath errors. Weather conditions like heavy cloud cover or storms can also impact accuracy. For the most accurate navigation, use the system outdoors with a clear view of the sky. If you're experiencing accuracy issues, try moving to a more open area or restarting the navigation.",
    category: "general",
    difficulty: "intermediate",
    priority: "medium",
    estimatedReadTime: 4,
    tags: ["gps", "accuracy", "technical", "troubleshooting"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question: "Why do indoor environments have poor GPS reception?",
        options: [
          "Too many people",
          "Satellite signals are blocked by roofs and walls",
          "Internet is slow",
          "Phones don't work indoors",
        ],
        correctAnswer: 1,
        explanation:
          "Indoor environments have poor GPS reception because satellite signals are blocked by roofs and walls.",
      },
      {
        question: "What should you do if experiencing GPS accuracy issues?",
        options: [
          "Buy a new phone",
          "Turn off the GPS",
          "Move to a more open area or restart navigation",
          "Close all apps",
        ],
        correctAnswer: 2,
        explanation:
          "If experiencing accuracy issues, try moving to a more open area with a clear view of the sky or restart the navigation.",
      },
    ],
  },
  {
    title: "Accessibility Features",
    content:
      "Our AR navigation system includes voice guidance, high contrast modes, and text-to-speech functionality to make navigation accessible for everyone.",
    detailedContent:
      "Accessibility is a core feature of our navigation system. Voice guidance provides audio directions and distance updates, which is helpful for users with visual impairments or when you can't look at your screen. The system supports high contrast visual modes for users with visual difficulties. Text-to-speech functionality reads out location names and instructions. You can adjust voice volume and speech rate in the settings. The interface is designed to work with screen readers and other assistive technologies. If you need additional accessibility accommodations, please contact support.",
    category: "accessibility",
    difficulty: "beginner",
    priority: "medium",
    estimatedReadTime: 6,
    tags: ["accessibility", "voice", "visual", "assistive"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question:
          "What accessibility features are included in the AR navigation system?",
        options: [
          "Only high contrast modes",
          "Voice guidance, high contrast modes, and text-to-speech",
          "Only voice guidance",
          "No accessibility features",
        ],
        correctAnswer: 1,
        explanation:
          "The system includes voice guidance, high contrast modes, and text-to-speech functionality to make navigation accessible for everyone.",
      },
      {
        question: "What can you adjust in the accessibility settings?",
        options: [
          "Only colors",
          "Voice volume and speech rate",
          "Only font size",
          "Nothing can be adjusted",
        ],
        correctAnswer: 1,
        explanation:
          "You can adjust voice volume and speech rate in the settings to customize your experience.",
      },
    ],
  },
  {
    title: "Campus Building Layout Tips",
    content:
      "Most campus buildings follow a logical numbering system. Odd numbers are usually on one side, even numbers on the other. Room numbers often indicate the floor level.",
    detailedContent:
      "Understanding campus building layouts can help you navigate more efficiently. Most buildings use a systematic room numbering approach: the first digit often indicates the floor (e.g., 201 is on the 2nd floor), and subsequent digits indicate the room position. Odd-numbered rooms are typically on one side of the hallway, while even-numbered rooms are on the opposite side. Main entrances usually lead to a central corridor or lobby with clear signage. Look for building maps near entrances, and remember that emergency exits are marked and can serve as orientation landmarks.",
    category: "campus",
    difficulty: "beginner",
    priority: "medium",
    estimatedReadTime: 4,
    tags: ["campus", "buildings", "room numbers", "layout"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question:
          "What does the first digit in a room number typically indicate?",
        options: [
          "The building number",
          "The floor level",
          "The section",
          "The department",
        ],
        correctAnswer: 1,
        explanation:
          "The first digit in a room number often indicates the floor level (e.g., room 201 is on the 2nd floor).",
      },
      {
        question: "Where are odd-numbered rooms typically located?",
        options: [
          "In the basement",
          "On one side of the hallway",
          "Near the entrance",
          "In the center",
        ],
        correctAnswer: 1,
        explanation:
          "Odd-numbered rooms are typically on one side of the hallway, while even-numbered rooms are on the opposite side.",
      },
    ],
  },
  {
    title: "Battery Conservation During Navigation",
    content:
      "AR navigation uses your camera, GPS, and display extensively. To conserve battery, lower screen brightness and close unused apps before starting navigation.",
    detailedContent:
      "AR navigation is battery-intensive because it continuously uses multiple device sensors and features. Your camera is active for AR overlay, GPS provides location tracking, the display stays on at high brightness, and various sensors monitor your orientation. To extend battery life: reduce screen brightness when possible, close background apps that aren't needed, enable battery saver mode if available, and consider bringing a portable charger for longer navigation sessions. The system is optimized to balance functionality with power consumption, but these steps can help extend your usage time.",
    category: "general",
    difficulty: "intermediate",
    priority: "low",
    estimatedReadTime: 5,
    tags: ["battery", "conservation", "mobile", "optimization"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question: "Why is AR navigation battery-intensive?",
        options: [
          "It only uses GPS",
          "It uses camera, GPS, display, and sensors continuously",
          "It downloads a lot of data",
          "It makes phone calls",
        ],
        correctAnswer: 1,
        explanation:
          "AR navigation is battery-intensive because it continuously uses multiple device sensors and features including camera, GPS, display, and orientation sensors.",
      },
      {
        question: "What is one way to conserve battery during AR navigation?",
        options: [
          "Use maximum brightness",
          "Lower screen brightness",
          "Keep all apps open",
          "Disable GPS",
        ],
        correctAnswer: 1,
        explanation:
          "Lowering screen brightness is an effective way to conserve battery during AR navigation sessions.",
      },
    ],
  },
  {
    title: "Advanced AR Features",
    content:
      "Explore advanced features like waypoint marking, route history, and custom navigation preferences to personalize your AR navigation experience.",
    detailedContent:
      "The AR navigation system includes several advanced features for power users. Waypoint marking lets you save frequently visited locations for quick access. Route history tracks your navigation patterns and can suggest efficient paths. Custom navigation preferences allow you to set walking speed, preferred route types, and notification frequencies. You can also customize AR visual elements like arrow size, color themes, and information display density. These features are accessible through the settings menu and can significantly enhance your navigation experience once you're comfortable with the basic functionality.",
    category: "ar",
    difficulty: "advanced",
    priority: "low",
    estimatedReadTime: 7,
    tags: ["advanced", "customization", "features", "settings"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question: "What does waypoint marking allow you to do?",
        options: [
          "Delete locations",
          "Save frequently visited locations for quick access",
          "Share your location",
          "Block certain areas",
        ],
        correctAnswer: 1,
        explanation:
          "Waypoint marking lets you save frequently visited locations for quick and easy access later.",
      },
      {
        question: "What can you customize in the AR navigation settings?",
        options: [
          "Only the language",
          "Arrow size, color themes, and information display density",
          "Only the volume",
          "Nothing can be customized",
        ],
        correctAnswer: 1,
        explanation:
          "You can customize AR visual elements like arrow size, color themes, and information display density in the settings.",
      },
    ],
  },
  {
    title: "Navigation in Different Weather",
    content:
      "Weather conditions can affect AR navigation. Rain can impact camera visibility, while bright sunlight might make the screen harder to see.",
    detailedContent:
      "Different weather conditions present unique challenges for AR navigation. Rain or snow can obstruct your camera lens, making AR overlays less accurate - keep your lens clean and dry. Bright sunlight can make your screen difficult to see, so consider increasing brightness or seeking shade when checking directions. Cold weather can drain battery faster and affect touch screen responsiveness - keep your phone warm when possible. Windy conditions might make it harder to hold your phone steady for AR tracking. In severe weather, prioritize safety and consider using traditional navigation methods if AR functionality is compromised.",
    category: "general",
    difficulty: "intermediate",
    priority: "medium",
    estimatedReadTime: 5,
    tags: ["weather", "conditions", "adaptability", "safety"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: false,
    quizQuestions: [
      {
        question: "How does rain affect AR navigation?",
        options: [
          "It improves accuracy",
          "It can obstruct the camera lens, making AR overlays less accurate",
          "It has no effect",
          "It speeds up the GPS",
        ],
        correctAnswer: 1,
        explanation:
          "Rain or snow can obstruct your camera lens, making AR overlays less accurate, so it's important to keep your lens clean and dry.",
      },
      {
        question:
          "What should you do in severe weather while using AR navigation?",
        options: [
          "Continue using AR at all costs",
          "Prioritize safety and consider traditional navigation methods",
          "Turn off your phone",
          "Walk faster",
        ],
        correctAnswer: 1,
        explanation:
          "In severe weather, always prioritize safety and consider using traditional navigation methods if AR functionality is compromised.",
      },
    ],
  },
  {
    title: "Understanding Location Markers",
    content:
      "Different types of locations have different colored markers and icons. Learn these visual cues to quickly identify facilities, offices, and amenities.",
    detailedContent:
      "The navigation system uses a color-coded and icon-based system to help you quickly identify different types of locations. Offices typically use blue markers with building icons, restrooms use green markers with appropriate symbols, food locations have orange markers with utensil icons, and emergency locations use red markers with warning symbols. Parking areas are marked in purple, while general facilities use gray markers. Understanding this visual language helps you quickly scan available destinations and find what you're looking for without reading every location name. You can customize these visual preferences in the settings menu.",
    category: "navigation",
    difficulty: "beginner",
    priority: "medium",
    estimatedReadTime: 4,
    tags: ["markers", "visual", "icons", "identification"],
    isActive: true,
    isFeatured: false,
    showOnFirstVisit: true,
    quizQuestions: [
      {
        question: "What color markers are used for emergency locations?",
        options: ["Blue", "Green", "Red", "Purple"],
        correctAnswer: 2,
        explanation:
          "Emergency locations use red markers with warning symbols to make them easily identifiable.",
      },
      {
        question: "What color markers indicate food locations?",
        options: ["Orange", "Blue", "Green", "Gray"],
        correctAnswer: 0,
        explanation:
          "Food locations have orange markers with utensil icons to help you quickly identify dining areas.",
      },
    ],
  },
];

// Sample daily challenges
export const sampleDailyChallenges = [
  {
    date: new Date().toISOString().split("T")[0], // Today
    title: "Navigation Explorer",
    description:
      "Use AR navigation to visit 3 different types of locations (e.g., office, restroom, food area) to complete today's challenge!",
    points: 15,
    isActive: true,
    type: "navigation",
    requirements: {
      navigations: 3,
      uniqueTypes: 3,
    },
  },
];

// Achievement definitions
export const achievementDefinitions = [
  {
    type: "first_learn",
    title: "First Steps",
    description: "Completed your first learning item!",
    icon: "bx bxs-star",
    points: 10,
  },
  {
    type: "streak_3",
    title: "3-Day Streak",
    description: "Learning for 3 consecutive days!",
    icon: "bx bxs-flame",
    points: 15,
  },
  {
    type: "streak_7",
    title: "Week Warrior",
    description: "Learning for a full week!",
    icon: "bx bxs-crown",
    points: 25,
  },
  {
    type: "streak_30",
    title: "Monthly Master",
    description: "Learning for 30 consecutive days!",
    icon: "bx bxs-trophy",
    points: 50,
  },
  {
    type: "count_5",
    title: "Knowledge Seeker",
    description: "Learned 5 different tips!",
    icon: "bx bxs-book",
    points: 20,
  },
  {
    type: "count_10",
    title: "Learning Enthusiast",
    description: "Learned 10 different tips!",
    icon: "bx bxs-graduation",
    points: 30,
  },
  {
    type: "category_master",
    title: "Category Master",
    description: "Learned all tips in a category!",
    icon: "bx bxs-medal",
    points: 40,
  },
];
