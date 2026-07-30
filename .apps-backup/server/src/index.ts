import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamText } from "hono/streaming";
import { GoogleGenAI } from "@google/genai";

const app = new Hono();

// Allow client (web and Tauri) to fetch from here
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
  })
);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment!");
}

const ai = new GoogleGenAI({ apiKey });

interface ChatHistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}

app.post("/api/chat", async (c) => {
  try {
    const body = await c.req.json<{
      message: string;
      history?: ChatHistoryItem[];
      model?: string;
      systemPrompt?: string;
    }>();

    const modelName = body.model || "gemini-3-flash-preview";
    const systemInstruction = body.systemPrompt || "You are a helpful and friendly AI Assistant.";
    const history = body.history || [];
    const messageContent = body.message;

    if (!apiKey) {
      return c.json(
        {
          error: "API Key Gemini belum diset. Silakan tambahkan GEMINI_API_KEY di file .env server.",
        },
        500
      );
    }

    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    return streamText(c, async (stream) => {
      try {
        const chat = ai.chats.create({
          model: modelName,
          history: history,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        const responseStream = await chat.sendMessageStream({
          message: messageContent,
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            await stream.write(chunk.text);
          }
        }
      } catch (streamError) {
        console.error("Error during streaming:", streamError);
        await stream.write(`\n[ERROR: ${(streamError as Error).message}]`);
      }
    });
  } catch (err) {
    console.error("Handler error:", err);
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.get("/health", (c) => c.text("ok"));

export default {
  fetch: app.fetch,
};
