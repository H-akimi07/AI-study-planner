// STUDY AI - REAL AI CHAT
const API_URL = "https://YOUR-RENDER-BACKEND.onrender.com";
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");

// GET STUDY CONTEXT

function getStudyContext() {
  const goal = document.getElementById("goal")?.value || "";

  const dailyHours = document.getElementById("hours")?.value || "";

  const level =
    document.querySelector('input[name="level"]:checked')?.value || "";

  const subjectElements = document.querySelectorAll(
    "#subjectList .subject-tag",
  );

  const subjects = Array.from(subjectElements).map((element) => {
    return element.textContent.replace("×", "").trim();
  });

  return {
    goal,
    subjects,
    dailyHours,
    level,
  };
}

// ADD MESSAGE

function addChatMessage(message, sender) {
  const wrapper = document.createElement("div");

  wrapper.className =
    sender === "user" ? "chat-message user-message" : "chat-message ai-message";

  const avatar =
    sender === "user"
      ? '<i class="bi bi-person"></i>'
      : '<i class="bi bi-stars"></i>';
  const name = sender === "user" ? "You" : "StudyAI";

  wrapper.innerHTML = `
    <div class="message-avatar">
      ${avatar}
    </div>

    <div class="message-content">

      <div class="message-name">
        ${name}
      </div>

      <div class="message-bubble">
        ${escapeChatHTML(message)}
      </div>

    </div>
  `;

  chatMessages.appendChild(wrapper);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ESCAPE HTML

function escapeChatHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// TYPING

function showTyping() {
  typingIndicator.classList.remove("d-none");

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  typingIndicator.classList.add("d-none");
}

// REAL AI REQUEST

async function sendChatMessage() {
  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  addChatMessage(message, "user");

  chatInput.value = "";

  chatInput.disabled = true;
  sendChatBtn.disabled = true;

  showTyping();

  try {
    const context = getStudyContext();

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
        context,
      }),
    });

    const data = await response.json();

    hideTyping();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "The AI could not process your request.");
    }

    addChatMessage(data.message, "ai");
  } catch (error) {
    hideTyping();

    console.error("AI error:", error);

    addChatMessage(
      "I couldn't connect to the AI right now. Please make sure the server is running and your API key is configured.",
      "ai",
    );
  } finally {
    chatInput.disabled = false;
    sendChatBtn.disabled = false;

    chatInput.focus();
  }
}

// SEND BUTTON

if (sendChatBtn) {
  sendChatBtn.addEventListener("click", sendChatMessage);
}

// ENTER KEY

if (chatInput) {
  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      sendChatMessage();
    }
  });
}

// AI STUDY PLAN GENERATOR

const plannerForm = document.getElementById("plannerForm");
const generateBtn = document.getElementById("generateBtn");
const planSection = document.getElementById("planSection");
const recommendation = document.getElementById("recommendation");
const scheduleContainer = document.getElementById("scheduleContainer");

if (plannerForm) {
  plannerForm.addEventListener("submit", generateStudyPlan);
}

async function generateStudyPlan(event) {
  event.preventDefault();

  const goal = document.getElementById("goal")?.value.trim();
  const dailyHours = document.getElementById("hours")?.value;
  const duration = document.getElementById("duration")?.value;
  const level =
    document.querySelector('input[name="level"]:checked')?.value || "";

  const subjectElements = document.querySelectorAll(
    "#subjectList .subject-tag",
  );

  const subjects = Array.from(subjectElements).map((element) =>
    element.textContent.replace("×", "").trim(),
  );

  if (!goal) {
    alert("Please enter your study goal.");
    return;
  }

  if (subjects.length === 0) {
    alert("Please add at least one subject.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2"></span>
    Creating your AI plan...
  `;

  try {
    const response = await fetch(`${API_URL}/api/study-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal,
        subjects,
        dailyHours,
        level,
        duration,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not generate your study plan.");
    }

    displayStudyPlan(data.plan);

    planSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Study plan error:", error);

    alert(
      error.message || "Something went wrong while generating your study plan.",
    );
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      Generate My Study Plan
    `;
  }
}

function displayStudyPlan(plan) {
  if (!plan) return;

  if (recommendation) {
    recommendation.textContent =
      plan.recommendation || "Your personalized plan is ready.";
  }

  if (!scheduleContainer) return;

  scheduleContainer.innerHTML = "";

  if (!Array.isArray(plan.schedule) || plan.schedule.length === 0) {
    scheduleContainer.innerHTML = `
      <div class="alert alert-warning">
        The AI did not return a valid schedule. Please try again.
      </div>
    `;
    return;
  }

  plan.schedule.forEach((day) => {
    const dayCard = document.createElement("div");

    dayCard.className = "schedule-day";

    const tasksHTML = Array.isArray(day.tasks)
      ? day.tasks
          .map(
            (task) => `
              <div class="schedule-task">
                <div class="schedule-task-info">
                  <strong>
                    ${escapeChatHTML(task.subject || "Study")}
                  </strong>

                  <p>
                    ${escapeChatHTML(task.task || "Study session")}
                  </p>
                </div>

                <span class="schedule-duration">
                  ${Number(task.duration) || 0} min
                </span>
              </div>
            `,
          )
          .join("")
      : "";

    dayCard.innerHTML = `
      <div class="schedule-day-header">
        <h4>Day ${Number(day.day) || ""}</h4>
      </div>

      <div class="schedule-tasks">
        ${tasksHTML}
      </div>
    `;

    scheduleContainer.appendChild(dayCard);
  });

  planSection?.classList.remove("d-none");
}
// SUBJECT MANAGEMENT

const subjectInput = document.getElementById("subjectInput");
const addSubjectBtn = document.getElementById("addSubject");
const subjectList = document.getElementById("subjectList");

if (addSubjectBtn) {
  addSubjectBtn.addEventListener("click", addSubject);
}

if (subjectInput) {
  subjectInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubject();
    }
  });
}

function addSubject() {
  const subject = subjectInput?.value.trim();

  if (!subject) {
    return;
  }

  const existingSubjects = Array.from(
    subjectList.querySelectorAll(".subject-tag"),
  ).map((element) => element.textContent.replace("×", "").trim().toLowerCase());

  if (existingSubjects.includes(subject.toLowerCase())) {
    subjectInput.value = "";
    return;
  }

  const subjectTag = document.createElement("span");

  subjectTag.className = "subject-tag";

  subjectTag.innerHTML = `
    ${escapeChatHTML(subject)}
    <button type="button" class="remove-subject" aria-label="Remove ${escapeChatHTML(subject)}">
      ×
    </button>
  `;

  subjectTag.querySelector(".remove-subject").addEventListener("click", () => {
    subjectTag.remove();
  });

  subjectList.appendChild(subjectTag);

  subjectInput.value = "";
  subjectInput.focus();
}
