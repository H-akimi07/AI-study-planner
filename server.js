const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve your existing frontend files
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question.",
      });
    }

    const systemPrompt = `
You are StudyAI, an intelligent and supportive AI study assistant.

Your job is to help students:
- understand difficult concepts
- create realistic study plans
- prepare for exams
- improve learning strategies
- manage study time
- identify weaknesses
- stay motivated
- answer academic questions clearly

Give practical, specific answers.
Do not just give generic motivational advice.

Student context:
Goal: ${context?.goal || "Not provided"}
Subjects: ${context?.subjects?.join(", ") || "Not provided"}
Daily study time: ${context?.dailyHours || "Not provided"} hours
Current level: ${context?.level || "Not provided"}

Use this information when it is relevant.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          "The AI service could not process your request.",
      });
    }

    const aiMessage = data?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return res.status(500).json({
        success: false,
        message: "The AI returned an empty response.",
      });
    }

    res.json({
      success: true,
      message: aiMessage,
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while contacting the AI.",
    });
  }
});

// Default page

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Study Planner backend is running",
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/study-plan", async (req, res) => {
  try {
    const { goal, subjects, dailyHours, level, duration } = req.body;

    if (!goal || !subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a goal and at least one subject.",
      });
    }

    const prompt = `
Create a personalized study plan for a student.

Student information:
Goal: ${goal}
Subjects: ${subjects.join(", ")}
Daily study time: ${dailyHours} hours
Current level: ${level}
Study duration: ${duration}

Create a realistic and balanced plan.

Return ONLY valid JSON in exactly this structure:

{
  "recommendation": "A short personalized recommendation",
  "schedule": [
    {
      "day": 1,
      "tasks": [
        {
          "subject": "Subject name",
          "task": "Specific study task",
          "duration": 45
        }
      ]
    }
  ]
}

Rules:
- duration must be in minutes.
- Make tasks specific, not generic.
- Respect the student's daily study time.
- Gradually increase difficulty when appropriate.
- Include review and practice.
- Do not create an unrealistic workload.
- Create one entry for every day of the requested duration.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "You are an expert academic study planner. Always follow the requested JSON structure.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          "The AI service could not create the study plan.",
      });
    }

    let aiMessage = data?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return res.status(500).json({
        success: false,
        message: "The AI returned an empty response.",
      });
    }

    aiMessage = aiMessage
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let plan;

    try {
      plan = JSON.parse(aiMessage);
    } catch (error) {
      console.error("Invalid AI JSON:", aiMessage);

      return res.status(500).json({
        success: false,
        message: "The AI returned an invalid study plan.",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Study plan error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the study plan.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`StudyAI server running at http://localhost:${PORT}`);
});
