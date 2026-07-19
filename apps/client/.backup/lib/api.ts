const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function sendChatMessage(message: string) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Gagal menghubungi server");
  return res.json() as Promise<{ reply: string }>;
}

