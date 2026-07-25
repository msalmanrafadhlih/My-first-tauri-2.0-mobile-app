import React, { useState, useRef, useEffect } from "react";
import { GeminiConfig, GeminiMessage, sendMessageToGeminiStream } from "../services/gemini";
import { Send, Settings, Trash2, Bot, User, Sparkles, Copy, Check, Cpu } from "lucide-react";

interface ChatInterfaceProps {
  config: GeminiConfig;
  onOpenSettings: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, onOpenSettings }) => {
  const [messages, setMessages] = useState<GeminiMessage[]>(() => {
    const saved = localStorage.getItem("gemini_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch {
        // ignore parse error
      }
    }
    return [
      {
        id: "welcome-msg",
        role: "model",
        text: `Halo! Saya adalah Gemini AI menggunakan model **${config.model}**. Ada yang bisa saya bantu hari ini?`,
        timestamp: new Date()
      }
    ];
  });

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Persist message history
  useEffect(() => {
    localStorage.setItem("gemini_chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isGenerating) return;

    const userMessage: GeminiMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsGenerating(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: GeminiMessage = {
      id: assistantMsgId,
      role: "model",
      text: "",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      await sendMessageToGeminiStream(newMessages, config, (chunkText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: chunkText } : msg
          )
        );
      });
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: `❌ Error: ${err?.message || "Terjadi kesalahan saat menghubungi Gemini API."}`,
                isError: true
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?")) {
      const resetMsg: GeminiMessage = {
        id: Date.now().toString(),
        role: "model",
        text: `Riwayat percakapan telah dibersihkan. Siap untuk pertanyaan berikutnya!`,
        timestamp: new Date()
      };
      setMessages([resetMsg]);
      localStorage.removeItem("gemini_chat_history");
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              Gemini Chat App
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                <Cpu className="w-3 h-3" />
                {config.model}
              </span>
            </h1>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition"
            title="Hapus Percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition"
            title="Pengaturan Model & API Key"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Main Chat Stream Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${
                  isUser
                    ? "bg-slate-700 text-slate-200"
                    : "bg-gradient-to-tr from-cyan-500 to-blue-600"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? "bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-900/20"
                    : msg.isError
                    ? "bg-red-950/80 border border-red-800/80 text-red-200 rounded-tl-none"
                    : "bg-slate-900/80 border border-slate-800/90 text-slate-100 rounded-tl-none shadow-sm"
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap break-words">
                  {msg.text || (
                    <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      Gemini sedang berpikir...
                    </span>
                  )}
                </div>

                {/* Copy & Timestamp Bar */}
                <div className={`mt-2 flex items-center justify-between text-[10px] opacity-70 ${isUser ? "text-cyan-100" : "text-slate-400"}`}>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  {!isUser && msg.text && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="ml-2 hover:opacity-100 transition p-0.5 rounded"
                      title="Salin Teks"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar Area */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky bottom-0">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan sesuatu pada Gemini... (Shift+Enter untuk baris baru)"
            rows={1}
            disabled={isGenerating}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none max-h-40 transition disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="absolute right-2.5 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-30 disabled:hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20 active:scale-95"
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4 font-bold" />
          </button>
        </div>
      </footer>

    </div>
  );
};
