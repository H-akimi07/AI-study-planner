// STUDY AI - REAL AI CHAT

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

  const avatar = sender === "user" ? "👤" : "🤖";
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

    const response = await fetch("/api/chat", {
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
