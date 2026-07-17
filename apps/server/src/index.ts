import { Hono } from "hono";
import { cors } from "hono/cors";
import { GoogleGenAI } from "@google/genai";

const app = new Hono();

// Izinkan client (web, dan nanti Tauri) untuk fetch ke sini
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin, // sesuaikan whitelist di production
  })
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/chat", async (c) => {
  const body = await c.req.json<{ message: string }>();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: body.message,
  });

  return c.json({ reply: response.text });
});

app.get("/health", (c) => c.text("ok"));

export default {
  port: 3001,
  fetch: app.fetch,
};
