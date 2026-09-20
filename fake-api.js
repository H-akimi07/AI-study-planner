/*

* AI Study Planner - Fake API
*
* This file simulates communication with an AI backend.
* It does NOT connect to a real AI model or external API.
*
* Later, this file can be replaced with real API requests.
  */

// Simulate network delay
function fakeDelay(milliseconds = 1200) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// ============================================================
// FAKE STUDY PLAN API
// ============================================================

async function fakeStudyPlanAPI(data) {
  // Simulate an API/network request
  await fakeDelay(1500);

  const { goal, subjects, dailyHours, level, duration } = data;

  // Basic validation
  if (!goal || !subjects || subjects.length === 0) {
    throw new Error("Please provide a study goal and at least one subject.");
  }

  // Calculate approximate daily session length
  const minutesPerDay = Math.max(30, Math.round(Number(dailyHours) * 60));

  const sessionCount = Math.max(1, Math.min(subjects.length, 4));

  const minutesPerSession = Math.round(minutesPerDay / sessionCount);

  // Create fake AI-generated tasks
  const tasks = subjects.slice(0, 4).map((subject, index) => {
    const taskTypes = [
      `Study ${subject} concepts and fundamentals`,
      `Practice ${subject} with exercises`,
      `Review your ${subject} notes`,
      `Test yourself on ${subject}`,
    ];

    return {
      subject: subject,
      duration: minutesPerSession,
      task: taskTypes[index % taskTypes.length],
    };
  });

  // Fake recommendation based on level
  let recommendation;

  if (level === "Beginner") {
    recommendation =
      "Focus on understanding the fundamentals before moving to advanced topics.";
  } else if (level === "Intermediate") {
    recommendation =
      "Combine concept review with practical exercises and regular self-testing.";
  } else {
    recommendation =
      "Focus on advanced practice, projects, and identifying your weakest areas.";
  }

  // Simulated API response
  return {
    success: true,

    data: {
      goal: goal,
      level: level,
      duration: duration,
      dailyHours: dailyHours,

      tasks: tasks,

      recommendation: recommendation,

      message: `A personalized ${duration} study plan has been created for your goal: "${goal}".`,
    },
  };
}

// ============================================================
// FAKE CHATBOT API
// ============================================================

async function fakeChatAPI(message, context = {}) {
  // Simulate AI/network response time
  await fakeDelay(1000 + Math.random() * 1000);

  const userMessage = message.toLowerCase().trim();

  if (!userMessage) {
    return {
      success: false,
      message: "Please type a message first.",
    };
  }

  // --------------------------------------------------------
  // Greetings
  // --------------------------------------------------------

  if (
    userMessage.includes("hello") ||
    userMessage.includes("hi") ||
    userMessage.includes("hey")
  ) {
    return {
      success: true,
      message:
        "Hello! 👋 I'm your AI Study Assistant. I can help you create study plans, organize your time, improve your focus, and prepare for exams.",
    };
  }

  // --------------------------------------------------------
  // Study plan
  // --------------------------------------------------------

  if (
    userMessage.includes("study plan") ||
    userMessage.includes("plan my study") ||
    userMessage.includes("schedule")
  ) {
    return {
      success: true,
      message:
        "Absolutely! 📚 Start by choosing your most important subject, then divide your available time into focused study sessions. Try 45–50 minutes of study followed by a 10-minute break.",
    };
  }

  // --------------------------------------------------------
  // Focus
  // --------------------------------------------------------

  if (userMessage.includes("focus") || userMessage.includes("concentrate")) {
    return {
      success: true,
      message:
        "To improve your focus, remove distractions, choose one task at a time, and use focused sessions such as 50 minutes of study followed by a 10-minute break. Keep your phone away during the session. 🎯",
    };
  }

  // --------------------------------------------------------
  // Breaks
  // --------------------------------------------------------

  if (userMessage.includes("break") || userMessage.includes("pomodoro")) {
    return {
      success: true,
      message:
        "Try this schedule: study for 50 minutes, take a 10-minute break, and repeat. After 3–4 sessions, take a longer 20–30 minute break. ☕",
    };
  }

  // --------------------------------------------------------
  // Exam preparation
  // --------------------------------------------------------

  if (userMessage.includes("exam") || userMessage.includes("test")) {
    return {
      success: true,
      message:
        "For exam preparation, divide your subjects into smaller topics, review difficult areas first, practice with questions, and reserve the final days for revision and mock tests. 📝",
    };
  }

  // --------------------------------------------------------
  // Motivation
  // --------------------------------------------------------

  if (
    userMessage.includes("motivat") ||
    userMessage.includes("lazy") ||
    userMessage.includes("tired")
  ) {
    return {
      success: true,
      message:
        "Don't wait for motivation to appear. Start with just 10 minutes. Once you begin, continuing usually becomes easier. Focus on today's small progress rather than the entire journey. 💪",
    };
  }

  // --------------------------------------------------------
  // Time management
  // --------------------------------------------------------

  if (userMessage.includes("time") || userMessage.includes("manage")) {
    return {
      success: true,
      message:
        "Try planning your three most important tasks before starting your day. Give difficult subjects your highest-energy hours and leave lighter review tasks for later. ⏰",
    };
  }

  // --------------------------------------------------------
  // Current study information
  // --------------------------------------------------------

  if (userMessage.includes("my goal") || userMessage.includes("my subjects")) {
    if (context.goal) {
      return {
        success: true,
        message: `Your current goal is "${context.goal}". Keep your study sessions aligned with this goal and prioritize the subjects that contribute most directly to it. 🎓`,
      };
    }

    return {
      success: true,
      message:
        "You haven't created a study goal yet. Set your goal in the Study Planner and I'll be able to give you more personalized suggestions.",
    };
  }

  // --------------------------------------------------------
  // Help
  // --------------------------------------------------------

  if (userMessage.includes("help") || userMessage.includes("what can you do")) {
    return {
      success: true,
      message:
        "I can help you with study planning, time management, focus techniques, exam preparation, study breaks, motivation, and general learning strategies. 📚",
    };
  }

  // --------------------------------------------------------
  // Default response
  // --------------------------------------------------------

  return {
    success: true,
    message:
      "That's a good question! 📚 Try telling me more about what you're studying, your goal, how much time you have each day, or what you're struggling with, and I'll suggest a study strategy.",
  };
}
