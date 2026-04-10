const express = require("express");

const router = express.Router();

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const resolveGeminiModel = () => {
  const configuredModel = String(process.env.GEMINI_ASSISTANT_MODEL || "").trim();
  return configuredModel.startsWith("gemini-") ? configuredModel : "gemini-2.5-flash";
};

const DEFAULT_MODEL = resolveGeminiModel();

const buildSystemInstruction = (language) => {
  const languageRule =
    language === "english"
      ? "Reply only in clear English."
      : "Reply in a bilingual Hindi-English style, using simple mixed language that Indian learners understand easily.";

  return [
    "You are CEA AI Tutor for Computer Excellence Academy.",
    "You help students with computer basics, MS Office, typing, internet, Tally, web development, coding, exams, and course guidance.",
    "Be supportive, accurate, concise, and educational.",
    "When the user shares an image, analyze what is visible and explain it clearly.",
    "If the question is outside study/help scope, politely redirect toward education and student support.",
    languageRule,
    "Use step-by-step answers when needed.",
  ].join(" ");
};

const extractGeminiText = (data) => {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const textParts = [];

  candidates.forEach((candidate) => {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    parts.forEach((part) => {
      if (part?.text) {
        textParts.push(part.text);
      }
    });
  });

  return textParts.join("\n").trim();
};

const parseDataUrl = (imageData) => {
  const match = String(imageData || "").match(/^data:(.+?);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    data: match[2],
  };
};

router.post("/chat", async (req, res) => {
  try {
    const { message = "", language = "bilingual", history = [], imageData = "" } = req.body || {};

    const trimmedMessage = String(message || "").trim();
    if (!trimmedMessage && !imageData) {
      return res.status(400).json({ success: false, message: "Message or image is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: true,
        data: {
          answer:
            language === "english"
              ? "AI assistant route is ready, but GEMINI_API_KEY is not configured on the server yet. Add the key in server/.env to enable real answers."
              : "AI assistant route ready hai, lekin server me GEMINI_API_KEY abhi configure nahi hai. Real answers ke liye key ko server/.env me add kariye.",
          provider: "fallback",
          model: DEFAULT_MODEL,
        },
      });
    }

    const historyText = Array.isArray(history)
      ? history
          .slice(-8)
          .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text || ""}`)
          .join("\n")
      : "";

    const userParts = [];

    if (trimmedMessage) {
      userParts.push({
        text: trimmedMessage,
      });
    }

    if (imageData) {
      const parsedImage = parseDataUrl(imageData);
      if (parsedImage) {
        userParts.push({
          inline_data: {
            mime_type: parsedImage.mimeType,
            data: parsedImage.data,
          },
        });
      }
    }

    if (historyText) {
      userParts.unshift({
        text: `Conversation context:\n${historyText}`,
      });
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/${DEFAULT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction(language) }],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 900,
        },
        contents: [
          {
            role: "user",
            parts: userParts,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.error?.message || "Gemini assistant request failed.",
      });
    }

    return res.json({
      success: true,
      data: {
        answer:
          extractGeminiText(data) ||
          (language === "english"
            ? "The assistant could not generate a text response."
            : "Assistant text response generate nahi kar paya."),
        provider: "gemini",
        model: DEFAULT_MODEL,
      },
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    return res.status(500).json({ success: false, message: "Assistant server error." });
  }
});

module.exports = router;
