import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    try {
      const res = await sendChatMessage("halo dari client");
      setReply(res.reply);
    } catch (err) {
      setReply(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <Button onClick={handleTest} disabled={loading}>
        {loading ? "Mengirim..." : "Test koneksi ke server"}
      </Button>
      {reply && <p className="mt-4">{reply}</p>}
    </div>
  );
}
