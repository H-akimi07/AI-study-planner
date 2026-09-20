/*    AI STUDY PLANNER
 */

/*    STATE
 */

let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

let studyPlan = JSON.parse(localStorage.getItem("studyPlan")) || null;

/*    DOM ELEMENTS
 */

const plannerForm = document.getElementById("plannerForm");

const subjectInput = document.getElementById("subjectInput");

const addSubjectBtn = document.getElementById("addSubject");

const subjectList = document.getElementById("subjectList");

const hoursInput = document.getElementById("hours");

const hoursValue = document.getElementById("hoursValue");

const planSection = document.getElementById("planSection");

const scheduleContainer = document.getElementById("scheduleContainer");

const themeToggle = document.getElementById("themeToggle");

/*    INITIALIZE
 */

document.addEventListener("DOMContentLoaded", () => {
  renderSubjects();

  updateStats();

  if (studyPlan) {
    renderPlan(studyPlan);
  }

  loadTheme();
});

/*    SUBJECTS
 */

addSubjectBtn.addEventListener("click", addSubject);

subjectInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    addSubject();
  }
});

function addSubject() {
  const value = subjectInput.value.trim();

  if (!value) {
    showToast("Please enter a subject.");

    return;
  }

  if (subjects.includes(value)) {
    showToast("This subject already exists.");

    return;
  }

  subjects.push(value);

  localStorage.setItem("subjects", JSON.stringify(subjects));

  subjectInput.value = "";

  renderSubjects();
}

function removeSubject(index) {
  subjects.splice(index, 1);

  localStorage.setItem("subjects", JSON.stringify(subjects));

  renderSubjects();
}

function renderSubjects() {
  subjectList.innerHTML = "";

  subjects.forEach((subject, index) => {
    const tag = document.createElement("div");

    tag.className = "subject-tag";

    tag.innerHTML = `
            ${escapeHTML(subject)}

            <button
                type="button"
                onclick="removeSubject(${index})"
                aria-label="Remove subject"
            >
                <i class="bi bi-x"></i>
            </button>
        `;

    subjectList.appendChild(tag);
  });
}

/*    HOURS
 */

hoursInput.addEventListener("input", () => {
  hoursValue.textContent = hoursInput.value;
});

/*    FORM SUBMISSION
 */

plannerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const goal = document.getElementById("goal").value.trim();

  const hours = Number(hoursInput.value);

  const level = document.querySelector('input[name="level"]:checked').value;

  const duration = Number(document.getElementById("duration").value);

  if (!goal) {
    showToast("Please describe your study goal.");

    return;
  }

  if (subjects.length === 0) {
    showToast("Please add at least one subject.");

    return;
  }

  setLoading(true);

  try {
    /*
     * In a real AI version, this function
     * will call the AI API.
     */

    const plan = await generateStudyPlan({
      goal,
      subjects,
      hours,
      level,
      duration,
    });

    studyPlan = plan;

    localStorage.setItem("studyPlan", JSON.stringify(plan));

    renderPlan(plan);

    showToast("Your personalized study plan is ready!");
  } catch (error) {
    console.error(error);

    showToast("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
});

/*    GENERATE STUDY PLAN
 */

async function generateStudyPlan(data) {
  /*
   * This is the AI concept we are practicing:
   *
   * User Input
   *      ↓
   * Prompt
   *      ↓
   * API Request
   *      ↓
   * JSON Response
   *
   * For now, we create a smart local plan.
   * Later we will replace this section
   * with the real AI API request.
   */

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const schedule = [];

  for (let i = 0; i < 7; i++) {
    const day = days[i];

    const subject = data.subjects[i % data.subjects.length];

    schedule.push({
      day,

      tasks: [
        {
          title: `Study ${subject}`,

          time: `${Math.min(60, data.hours * 60)} min`,

          completed: false,
        },

        {
          title: i % 2 === 0 ? "Active Recall" : "Practice & Review",

          time: "30 min",

          completed: false,
        },
      ],
    });
  }

  return {
    goal: data.goal,

    subjects: data.subjects,

    hours: data.hours,

    level: data.level,

    duration: data.duration,

    recommendation: getRecommendation(data.level),

    schedule,
  };
}

/*    AI RECOMMENDATION
 */

function getRecommendation(level) {
  if (level === "Beginner") {
    return "Focus on understanding the fundamentals first. Use short study sessions, active recall, and simple practice exercises.";
  }

  if (level === "Intermediate") {
    return "Combine active recall with practice projects. Review difficult topics and test yourself regularly.";
  }

  return "Focus on advanced problem solving, projects, and spaced repetition. Spend more time applying what you learn.";
}

/*    RENDER PLAN
 */

function renderPlan(plan) {
  planSection.classList.remove("d-none");

  document.getElementById("planSummary").textContent =
    `${plan.subjects.length} subjects · ${plan.hours} hours/day · ${plan.level} level`;

  document.getElementById("recommendation").textContent = plan.recommendation;

  scheduleContainer.innerHTML = "";

  plan.schedule.forEach((day, dayIndex) => {
    const dayCard = document.createElement("div");

    dayCard.className = "day-card";

    if (dayIndex === new Date().getDay() - 1) {
      dayCard.classList.add("today");
    }

    let tasksHTML = "";

    day.tasks.forEach((task, taskIndex) => {
      tasksHTML += `

                        <div
                            class="task ${task.completed ? "completed" : ""}"
                            onclick="toggleTask(
                                ${dayIndex},
                                ${taskIndex}
                            )"
                        >

                            <div class="task-title">
                                ${escapeHTML(task.title)}
                            </div>

                            <div class="task-time">
                                <i class="bi bi-clock"></i>
                                ${task.time}
                            </div>

                        </div>
                    `;
    });

    dayCard.innerHTML = `

                <div class="day-name">
                    ${day.day}
                </div>

                <div class="day-date">
                    Day ${dayIndex + 1}
                </div>

                ${tasksHTML}

            `;

    scheduleContainer.appendChild(dayCard);
  });

  updateProgress();

  planSection.scrollIntoView({
    behavior: "smooth",
  });
}

/*    TASK COMPLETION
 */

function toggleTask(dayIndex, taskIndex) {
  studyPlan.schedule[dayIndex].tasks[taskIndex].completed =
    !studyPlan.schedule[dayIndex].tasks[taskIndex].completed;

  localStorage.setItem("studyPlan", JSON.stringify(studyPlan));

  renderPlan(studyPlan);

  updateStats();
}

/*    PROGRESS
 */

function updateProgress() {
  if (!studyPlan) {
    return;
  }

  let total = 0;

  let completed = 0;

  studyPlan.schedule.forEach((day) => {
    day.tasks.forEach((task) => {
      total++;

      if (task.completed) {
        completed++;
      }
    });
  });

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progressPercent").textContent = `${percentage}%`;

  document.getElementById("progressBar").style.width = `${percentage}%`;

  document.getElementById("progressText").textContent =
    `${completed} of ${total} tasks completed`;
}

/*    RESET PROGRESS
 */

document.getElementById("resetProgress").addEventListener("click", () => {
  if (!studyPlan) return;

  studyPlan.schedule.forEach((day) => {
    day.tasks.forEach((task) => {
      task.completed = false;
    });
  });

  localStorage.setItem("studyPlan", JSON.stringify(studyPlan));

  renderPlan(studyPlan);

  showToast("Progress has been reset.");
});

/*    REGENERATE
 */

document.getElementById("regenerateBtn").addEventListener("click", () => {
  document.getElementById("plannerForm").scrollIntoView({
    behavior: "smooth",
  });
});

/*    THEME
 */

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const isLight = document.body.classList.contains("light-mode");

  localStorage.setItem("theme", isLight ? "light" : "dark");

  themeToggle.innerHTML = isLight
    ? '<i class="bi bi-sun"></i>'
    : '<i class="bi bi-moon-stars"></i>';
});

function loadTheme() {
  const theme = localStorage.getItem("theme");

  if (theme === "light") {
    document.body.classList.add("light-mode");

    themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
  }
}

/*    LOADING STATE
 */

function setLoading(isLoading) {
  const generateText = document.getElementById("generateText");

  const loadingSpinner = document.getElementById("loadingSpinner");

  const button = document.getElementById("generateBtn");

  if (isLoading) {
    generateText.classList.add("d-none");

    loadingSpinner.classList.remove("d-none");

    button.disabled = true;
  } else {
    generateText.classList.remove("d-none");

    loadingSpinner.classList.add("d-none");

    button.disabled = false;
  }
}

/*    TOAST
 */

function showToast(message) {
  document.getElementById("toastMessage").textContent = message;

  const toastElement = document.getElementById("appToast");

  const toast = new bootstrap.Toast(toastElement);

  toast.show();
}

/*    SECURITY
 */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

/*    STATS
 */

function updateStats() {
  if (!studyPlan) {
    document.getElementById("studyDays").textContent = "0";

    document.getElementById("weeklyHours").textContent = "0h";

    document.getElementById("completedTasks").textContent = "0";

    return;
  }

  const days = studyPlan.schedule.length;

  const weeklyHours = studyPlan.hours * 7;

  let completed = 0;

  studyPlan.schedule.forEach((day) => {
    day.tasks.forEach((task) => {
      if (task.completed) {
        completed++;
      }
    });
  });

  document.getElementById("studyDays").textContent = days;

  document.getElementById("weeklyHours").textContent = `${weeklyHours}h`;

  document.getElementById("completedTasks").textContent = completed;

  document.getElementById("studyStreak").textContent =
    completed > 0 ? `${Math.min(completed, 7)} days` : "0 days";
}
