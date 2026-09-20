/*
AI CHATBOT */

const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");

// Get current study context
function getStudyContext() {
  return {
    goal: document.getElementById("goalInput")?.value || "",

    dailyHours: document.getElementById("hoursRange")?.value || "",

    level: document.getElementById("levelSelect")?.value || "",
  };
}

// Add message to chat
function addChatMessage(message, sender) {
  const wrapper = document.createElement("div");

  wrapper.className =
    sender === "user" ? "chat-message user-message" : "chat-message ai-message";

  const avatar = sender === "user" ? "👤" : "🤖";

  const name = sender === "user" ? "You" : "AI Assistant";

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

// Prevent HTML injection
function escapeChatHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// Show typing indicator
function showTyping() {
  typingIndicator.classList.remove("d-none");

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  typingIndicator.classList.add("d-none");
}

// Send message
async function sendChatMessage() {
  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  // Display user message
  addChatMessage(message, "user");

  // Clear input
  chatInput.value = "";

  // Disable input while AI responds
  chatInput.disabled = true;
  sendChatBtn.disabled = true;

  showTyping();

  try {
    // Call our fake API
    const response = await fakeChatAPI(message, getStudyContext());

    hideTyping();

    if (response.success) {
      addChatMessage(response.message, "ai");
    } else {
      addChatMessage(response.message || "Something went wrong.", "ai");
    }
  } catch (error) {
    hideTyping();

    addChatMessage("Sorry, I couldn't process your request.", "ai");

    console.error("Chatbot error:", error);
  } finally {
    chatInput.disabled = false;
    sendChatBtn.disabled = false;

    chatInput.focus();
  }
}

// Send button
if (sendChatBtn) {
  sendChatBtn.addEventListener("click", sendChatMessage);
}

// Enter key
if (chatInput) {
  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      sendChatMessage();
    }
  });
}

/*
AI CHATBOT */

// Get current study context
function getStudyContext() {
  return {
    goal: document.getElementById("goalInput")?.value || "",

    dailyHours: document.getElementById("hoursRange")?.value || "",

    level: document.getElementById("levelSelect")?.value || "",
  };
}

// Add message to chat
function addChatMessage(message, sender) {
  const wrapper = document.createElement("div");

  wrapper.className =
    sender === "user" ? "chat-message user-message" : "chat-message ai-message";

  const avatar = sender === "user" ? "👤" : "🤖";

  const name = sender === "user" ? "You" : "AI Assistant";

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

// Prevent HTML injection
function escapeChatHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// Show typing indicator
function showTyping() {
  typingIndicator.classList.remove("d-none");

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  typingIndicator.classList.add("d-none");
}

// Send message
async function sendChatMessage() {
  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  // Display user message
  addChatMessage(message, "user");

  // Clear input
  chatInput.value = "";

  // Disable input while AI responds
  chatInput.disabled = true;
  sendChatBtn.disabled = true;

  showTyping();

  try {
    // Call our fake API
    const response = await fakeChatAPI(message, getStudyContext());

    hideTyping();

    if (response.success) {
      addChatMessage(response.message, "ai");
    } else {
      addChatMessage(response.message || "Something went wrong.", "ai");
    }
  } catch (error) {
    hideTyping();

    addChatMessage("Sorry, I couldn't process your request.", "ai");

    console.error("Chatbot error:", error);
  } finally {
    chatInput.disabled = false;
    sendChatBtn.disabled = false;

    chatInput.focus();
  }
}

// Send button
if (sendChatBtn) {
  sendChatBtn.addEventListener("click", sendChatMessage);
}

// Enter key
if (chatInput) {
  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      sendChatMessage();
    }
  });
}
