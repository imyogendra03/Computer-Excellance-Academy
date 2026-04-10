const pdfParse = require("pdf-parse");

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const resolveGeminiModel = () => {
  const configuredModel = String(process.env.GEMINI_ASSISTANT_MODEL || "").trim();
  return configuredModel.startsWith("gemini-") ? configuredModel : "gemini-2.5-flash";
};

const DEFAULT_MODEL = resolveGeminiModel();
const MAX_PDF_TEXT_LENGTH = 12000;

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

const extractJsonPayload = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;

  return JSON.parse(candidate);
};

const normalizeCorrectAnswer = (item) => {
  const raw = String(item.correctAnswer || item.answer || "").trim();
  const upper = raw.toUpperCase();

  if (["A", "B", "C", "D"].includes(upper)) {
    return upper;
  }

  const optionEntries = [
    ["A", item.optionA],
    ["B", item.optionB],
    ["C", item.optionC],
    ["D", item.optionD],
  ];

  const matchedOption = optionEntries.find(([, optionValue]) => {
    return String(optionValue || "").trim().toLowerCase() === raw.toLowerCase();
  });

  return matchedOption ? matchedOption[0] : "";
};

const sanitizeQuestionDrafts = (items, subjectId, sourceType, sourceFileName) => {
  if (!Array.isArray(items)) {
    throw new Error("AI output was not a valid question list.");
  }

  const normalized = items
    .map((item) => {
      const question = String(item?.question || "").trim();
      const optionA = String(item?.optionA || "").trim();
      const optionB = String(item?.optionB || "").trim();
      const optionC = String(item?.optionC || "").trim();
      const optionD = String(item?.optionD || "").trim();
      const correctAnswer = normalizeCorrectAnswer({
        ...item,
        optionA,
        optionB,
        optionC,
        optionD,
      });

      if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        return null;
      }

      return {
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        subject: subjectId,
        sourceType,
        sourceFileName: sourceFileName || "",
      };
    })
    .filter(Boolean);

  const uniqueByQuestion = [];
  const seen = new Set();

  normalized.forEach((item) => {
    const key = item.question.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueByQuestion.push(item);
    }
  });

  return uniqueByQuestion;
};

const buildPrompt = ({ pdfText, subjectName, questionLimit }) => {
  return [
    "You are extracting multiple-choice exam questions from study material.",
    `Subject: ${subjectName}.`,
    `Return up to ${questionLimit} clean MCQ items.`,
    "Keep output compact to save tokens.",
    "Return valid JSON only with this shape:",
    '{"questions":[{"question":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A"}]}',
    "Rules:",
    "- Use only clear MCQs from the source text.",
    "- If the answer is not clearly inferable from the source or options, skip that item.",
    "- correctAnswer must be only A, B, C, or D.",
    "- Do not include markdown or explanations.",
    "Source text:",
    pdfText,
  ].join("\n");
};

const requestGeminiJson = async (prompt, maxOutputTokens = 1800) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in server/.env.");
  }

  const response = await fetch(
    `${GEMINI_API_BASE}/${DEFAULT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini request failed.");
  }

  return extractJsonPayload(extractGeminiText(data));
};

const extractQuestionsFromPdf = async ({ pdfBuffer, subjectId, subjectName, sourceFileName, questionLimit = 10 }) => {
  const pdfResult = await pdfParse(pdfBuffer);
  const pdfText = String(pdfResult?.text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PDF_TEXT_LENGTH);

  if (!pdfText) {
    throw new Error("Could not read any text from the uploaded PDF.");
  }

  const parsed = await requestGeminiJson(
    buildPrompt({
      pdfText,
      subjectName,
      questionLimit: Math.min(Math.max(Number(questionLimit) || 10, 1), 30),
    })
  );

  const questions = sanitizeQuestionDrafts(parsed?.questions || parsed, subjectId, "ai-pdf", sourceFileName);

  if (!questions.length) {
    throw new Error("No valid MCQ questions could be extracted from this PDF.");
  }

  return questions;
};

const buildTopicPrompt = ({ subjectName, topic, questionLimit, difficulty }) => {
  return [
    "You are generating clean multiple-choice questions for a student exam system.",
    `Subject: ${subjectName}.`,
    `Topic: ${topic}.`,
    `Difficulty: ${difficulty}.`,
    `Return exactly ${questionLimit} MCQ items if possible.`,
    "Keep wording concise to save tokens.",
    "Return valid JSON only with this shape:",
    '{"questions":[{"question":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A"}]}',
    "Rules:",
    "- Each question must have 4 distinct options.",
    "- correctAnswer must be only A, B, C, or D.",
    "- Avoid duplicate questions.",
    "- No markdown, no explanation, no extra text.",
  ].join("\n");
};

const generateQuestionsByTopic = async ({
  subjectId,
  subjectName,
  topic,
  questionLimit = 10,
  difficulty = "medium",
}) => {
  const safeLimit = Math.min(Math.max(Number(questionLimit) || 10, 1), 20);
  const parsed = await requestGeminiJson(
    buildTopicPrompt({
      subjectName,
      topic,
      questionLimit: safeLimit,
      difficulty,
    }),
    1600
  );

  const questions = sanitizeQuestionDrafts(parsed?.questions || parsed, subjectId, "ai-topic", topic);

  if (!questions.length) {
    throw new Error("No valid topic-based MCQs could be generated.");
  }

  return questions;
};

module.exports = {
  extractQuestionsFromPdf,
  generateQuestionsByTopic,
};
