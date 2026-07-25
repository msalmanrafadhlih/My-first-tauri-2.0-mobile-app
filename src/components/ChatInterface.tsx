import React, { useState, useRef, useEffect } from "react";
import { GeminiConfig, GeminiMessage, sendMessageToGeminiStream } from "../services/gemini";
import {
  ChatSession,
  loadChatSessions,
  saveChatSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createNewSession
} from "../services/history";
import { Sidebar } from "./Sidebar";
import { Send, Settings, Bot, User, Sparkles, Copy, Check, Cpu, PanelLeftOpen, Plus } from "lucide-react";

interface ChatInterfaceProps {
  config: GeminiConfig;
  onOpenSettings: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, onOpenSettings }) => {
  // Load initial sessions from localStorage or create a default session
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const loaded = loadChatSessions();
    if (loaded.length > 0) return loaded;

    const initial = createNewSession(
      config.model,
      `Halo! Saya adalah Gemini AI menggunakan model **${config.model}**. Ada yang bisa saya bantu hari ini?`
    );
    return [initial];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActiveId = loadActiveSessionId();
    if (savedActiveId && sessions.some((s) => s.id === savedActiveId)) {
      return savedActiveId;
    }
    return sessions[0]?.id || "";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active Session Object
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Persist sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveChatSessions(sessions);
    }
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    if (activeSessionId) {
      saveActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  // Create new session handler
  const handleNewSession = () => {
    const newSession = createNewSession(
      config.model,
      `Halo! Siap untuk percakapan baru dengan model **${config.model}**. Silakan ajukan pertanyaan!`
    );
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  // Select existing session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  // Delete single session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      handleClearAllSessions();
      return;
    }

    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SELURUH riwayat percakapan?")) {
      const freshSession = createNewSession(
        config.model,
        `Riwayat telah dibersihkan. Silakan ajukan pertanyaan baru!`
      );
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
      localStorage.removeItem("gemini_chat_sessions_v2");
      localStorage.removeItem("gemini_active_session_id_v2");
    }
  };

  // Send message handler
  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isGenerating || !currentSession) return;

    const userMessage: GeminiMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const isFirstUserMessage = !messages.some((m) => m.role === "user");
    const newTitle = isFirstUserMessage
      ? textToSend.length > 35
        ? textToSend.substring(0, 35) + "..."
        : textToSend
      : currentSession.title;

    const updatedMessages = [...messages, userMessage];

    // Update active session locally
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages
            }
          : s
      )
    );

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

    // Append streaming message placeholder
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              messages: [...updatedMessages, initialAssistantMsg]
            }
          : s
      )
    );

    try {
      await sendMessageToGeminiStream(updatedMessages, config, (chunkText) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSession.id
              ? {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, text: chunkText } : msg
                  )
                }
              : s
          )
        );
      });
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        text: `❌ Error: ${err?.message || "Terjadi kesalahan saat menghubungi Gemini API."}`,
                        isError: true
                      }
                    : msg
                )
              }
            : s
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

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* History Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3 min-w-0">
            
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              title="Buka/Tutup Riwayat Chat"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base text-slate-100 truncate flex items-center gap-2">
                <span className="truncate">{currentSession?.title || "Gemini Chat"}</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <Cpu className="w-3 h-3" />
                  {config.model}
                </span>
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleNewSession}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
              title="Mulai Percakapan Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chat Baru</span>
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

        {/* Main Message History Stream */}
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

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-900/20"
                      : msg.isError
                      ? "bg-red-950/80 border border-red-800/80 text-red-200 rounded-tl-none"
                      : "bg-slate-900/80 border border-slate-800/90 text-slate-100 rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* Content */}
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
    </div>
  );
};
