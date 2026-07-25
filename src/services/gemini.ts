export interface GeminiMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  systemInstruction?: string;
}

export const AVAILABLE_MODELS = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Model flagship terbaru, sangat cepat & cerdas",
    badge: "Terbaru & Diatur"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    description: "Model penalaran tingkat tinggi untuk tugas kompleks",
    badge: "Reasoning"
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    description: "Sangat cepat, cocok untuk percakapan sehari-hari",
    badge: "Fast"
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    description: "Ringan & efisien dengan konteks besar",
    badge: "Standard"
  }
];

export async function sendMessageToGeminiStream(
  messages: GeminiMessage[],
  config: GeminiConfig,
  onChunk: (chunk: string) => void
): Promise<string> {
  const { apiKey, model, systemInstruction } = config;

  if (!apiKey || !apiKey.trim()) {
    throw new Error("API Key Gemini belum diisi!");
  }

  // Format messages into Gemini API structure
  const formattedContents = messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const payload: any = {
    contents: formattedContents
  };

  if (systemInstruction && systemInstruction.trim()) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction.trim() }]
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const parsedErr = JSON.parse(errorText);
      if (parsedErr.error?.message) {
        errorMessage = parsedErr.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Response body dari Gemini kosong.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const jsonStr = trimmed.substring(6);
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const candidateText =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            fullText += candidateText;
            onChunk(fullText);
          }
        } catch (e) {
          // ignore stream parse errors
        }
      }
    }
  }

  return fullText;
}

export async function validateGeminiApiKey(apiKey: string, model: string = "gemini-3-flash-preview"): Promise<boolean> {
  if (!apiKey || !apiKey.trim()) return false;
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "ping" }] }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || `API Key tidak valid (Status: ${response.status})`);
  }

  return true;
}
