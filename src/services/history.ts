import { GeminiMessage } from "./gemini";

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: GeminiMessage[];
}

const SESSIONS_STORAGE_KEY = "gemini_chat_sessions_v2";
const ACTIVE_SESSION_KEY = "gemini_active_session_id_v2";

export function loadChatSessions(): ChatSession[] {
  const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((session: any) => ({
      ...session,
      messages: (session.messages || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    }));
  } catch (e) {
    console.error("Gagal membaca riwayat percakapan dari localStorage", e);
    return [];
  }
}

export function saveChatSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Gagal menyimpan riwayat percakapan ke localStorage", e);
  }
}

export function loadActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function saveActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export function createNewSession(model: string, initialWelcomeText?: string): ChatSession {
  const now = new Date().toISOString();
  const id = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  
  const initialMessages: GeminiMessage[] = initialWelcomeText
    ? [
        {
          id: "welcome_" + Date.now(),
          role: "model",
          text: initialWelcomeText,
          timestamp: new Date()
        }
      ]
    : [];

  return {
    id,
    title: "Percakapan Baru",
    model,
    createdAt: now,
    updatedAt: now,
    messages: initialMessages
  };
}
