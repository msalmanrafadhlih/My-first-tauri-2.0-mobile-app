import { useState, useEffect, useRef, FormEvent } from 'react'
import {
  Send,
  Plus,
  Trash2,
  Settings,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  Menu,
  X,
  Sparkles,
  Moon,
  Sun,
  Wrench,
  RotateCw,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

// API Server URL
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Message definition matching backend history structure
interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  model: string;
  createdAt: string;
}

const MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Model terbaru, performa terbaik untuk coding & tugas agentic (GA)' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', desc: 'Ringan, cepat, dan hemat biaya (GA)' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', desc: 'Penalaran paling mendalam untuk masalah kompleks' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', desc: 'Cepat dengan kemampuan agentic & coding yang kuat' },
];

const SUGGESTIONS = [
  { title: "💻 Coding Helper", prompt: "Tuliskan fungsi TypeScript untuk mengurutkan array objek berdasarkan kunci tertentu." },
  { title: "✍️ Brainstorming Ide", prompt: "Berikan 5 ide kreatif untuk nama aplikasi AI Chat saku (Pocket AI) beserta artinya." },
  { title: "📝 Buat Rangkuman", prompt: "Tolong jelaskan konsep dasar TanStack Router secara singkat untuk pemula." },
  { title: "🌐 Translator Santai", prompt: "Terjemahkan kalimat ini ke bahasa Inggris gaul: 'Gak usah terburu-buru, santai aja kali.'" }
];

const DEFAULT_CHATS: ChatSession[] = [
  {
    id: 'default-1',
    title: 'Obrolan Baru',
    messages: [
      {
        id: 'welcome-1',
        role: 'model',
        content: 'Halo! Aku adalah **Pocket AI**, asisten cerdas saku kamu. Tanyakan apa saja, dan aku siap membantumu hari ini! ✨',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ],
    systemPrompt: 'Kamu adalah Pocket AI, asisten yang cerdas, ramah, dan ringkas. Jawablah dalam bahasa Indonesia dengan santun.',
    model: 'gemini-3.5-flash',
    createdAt: new Date().toISOString()
  }
];

// --- Custom Markdown Parser ---
function Markdown({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-sm text-foreground leading-relaxed space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const firstLine = lines[0].replace('```', '').trim();
          const language = firstLine || 'code';
          const code = lines.slice(1, -1).join('\n');

          return <CodeBlock key={index} code={code} language={language} />;
        } else {
          return <TextPart key={index} text={part} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-zinc-950 text-zinc-50 dark:bg-black font-mono text-[13px] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors animate-fade-in"
        >
          {copied ? (
            <>
              <Check className="size-3 text-green-500" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextPart({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lIdx) => {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const itemText = line.replace(/^[\s*-]+/, '');
          return (
            <ul key={lIdx} className="list-disc pl-5 my-1 space-y-1">
              <li className="text-foreground">
                <InlineFormatter text={itemText} />
              </li>
            </ul>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
          const itemText = line.replace(/^\d+\.\s+/, '');
          return (
            <ol key={lIdx} className="list-decimal pl-5 my-1 space-y-1">
              <li className="text-foreground">
                <InlineFormatter text={itemText} />
              </li>
            </ol>
          );
        }
        if (line.trim().startsWith('#')) {
          const depth = (line.match(/^#+/) || [''])[0].length;
          const headingText = line.replace(/^#+/, '').trim();
          const Tag = depth === 1 ? 'h1' : depth === 2 ? 'h2' : depth === 3 ? 'h3' : 'h4' as any;
          const classes = depth === 1 ? 'text-lg font-bold text-indigo-500 dark:text-indigo-400 mt-4 mb-2' : 'text-base font-semibold mt-3 mb-1.5';
          return (
            <Tag key={lIdx} className={classes}>
              <InlineFormatter text={headingText} />
            </Tag>
          );
        }
        if (line.trim() === '') {
          return <div key={lIdx} className="h-2" />;
        }
        return (
          <p key={lIdx} className="my-1">
            <InlineFormatter text={line} />
          </p>
        );
      })}
    </>
  );
}

function InlineFormatter({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[13px] text-pink-600 dark:text-pink-400 font-semibold">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

// --- Main Chat Component ---
export function MessageScrollerDemo() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Settings values for active chat
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');

  const viewportRef = useRef<HTMLDivElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('pocket_ai_chats');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats) as ChatSession[];
        if (parsed.length > 0) {
          setChats(parsed);
          setActiveChatId(parsed[0].id);
          setCustomSystemPrompt(parsed[0].systemPrompt);
          setSelectedModel(parsed[0].model);
        } else {
          setChats(DEFAULT_CHATS);
          setActiveChatId(DEFAULT_CHATS[0].id);
        }
      } catch (e) {
        setChats(DEFAULT_CHATS);
        setActiveChatId(DEFAULT_CHATS[0].id);
      }
    } else {
      setChats(DEFAULT_CHATS);
      setActiveChatId(DEFAULT_CHATS[0].id);
    }
  }, []);

  // Save chats to localStorage on change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('pocket_ai_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Handle active chat changes
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    if (activeChat) {
      setCustomSystemPrompt(activeChat.systemPrompt);
      setSelectedModel(activeChat.model);
    }
  }, [activeChatId]);

  // Toggle Dark Mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages?.length, isGenerating]);

  // Check health endpoint of server on startup
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => {
        if (!res.ok) setConnectionError(true);
      })
      .catch(() => setConnectionError(true));
  }, []);

  // Action: Create New Chat
  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: 'Obrolan Baru',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          content: 'Halo! Aku adalah **Pocket AI**. Ada yang bisa kubantu hari ini? 🚀',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      systemPrompt: 'Kamu adalah Pocket AI, asisten yang cerdas, ramah, dan ringkas. Jawablah dalam bahasa Indonesia dengan santun.',
      model: 'gemini-3.5-flash',
      createdAt: new Date().toISOString()
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setIsSidebarOpen(false);
  };

  // Action: Delete Chat
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = chats.filter(c => c.id !== id);
    if (updatedChats.length === 0) {
      setChats(DEFAULT_CHATS);
      setActiveChatId(DEFAULT_CHATS[0].id);
    } else {
      setChats(updatedChats);
      if (activeChatId === id) {
        setActiveChatId(updatedChats[0].id);
      }
    }
  };

  // Action: Save Settings
  const handleSaveSettings = () => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          systemPrompt: customSystemPrompt,
          model: selectedModel
        };
      }
      return chat;
    }));
    setShowSettingsModal(false);
  };

  // Action: Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isGenerating) return;

    if (!textToSend) setInputValue('');

    // Form user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update local chats with user message and empty model message placeholder
    const assistantMsgId = `msg-reply-${Date.now()}`;
    const modelMsg: Message = {
      id: assistantMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let currentChatTitle = activeChat ? activeChat.title : 'Obrolan Baru';
    if (activeChat && activeChat.messages.length === 1 && activeChat.title === 'Obrolan Baru') {
      currentChatTitle = text.slice(0, 18) + (text.length > 18 ? '...' : '');
    }

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          title: currentChatTitle,
          messages: [...c.messages, userMsg, modelMsg]
        };
      }
      return c;
    }));

    setIsGenerating(true);
    setConnectionError(false);

    try {
      // Map frontend history array format to match backend expected schema
      const historyPayload = activeChat.messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          model: activeChat.model,
          systemPrompt: activeChat.systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        streamedText += chunk;

        // Check if stream contains custom error
        if (streamedText.includes('[ERROR:')) {
          setConnectionError(true);
        }

        // Live update the assistant message in chat
        setChats(prev => prev.map(c => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: streamedText };
                }
                return m;
              })
            };
          }
          return c;
        }));
      }

    } catch (err) {
      console.error(err);
      setConnectionError(true);
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: 'Error: Gagal menghubungi server AI. Pastikan server lokal berjalan dan API key di file `.env` sudah benar.'
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="relative flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none z-0" />

      {/* MOBILE BACKDROP FOR SIDEBAR */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
        />
      )}

      {/* LEFT PANEL: SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-955/85 backdrop-blur-xl border-r border-slate-800/60 z-50 flex flex-col transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-full ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-violet-500 to-indigo-500 p-2 rounded-xl text-white shadow-md shadow-violet-500/20">
              <Bot className="size-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">POCKET AI</h1>
              <p className="text-[10px] text-slate-400 font-medium">Gemini Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/40"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="size-4" />
            <span>Obrolan Baru</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-thin">
          <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Riwayat Obrolan</p>
          {chats.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveChatId(c.id);
                  setIsSidebarOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveChatId(c.id);
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full group flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 text-white border border-slate-700/50 shadow-md'
                    : 'text-slate-350 hover:bg-slate-900/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                  <MessageSquare className={`size-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 rounded transition-opacity"
                  title="Hapus obrolan"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
          {/* Theme & Dev Info */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-[11px] tracking-wide">TEMA GELAP</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
            </button>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-between">
            <span>TanStack Router + Hono</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT/MAIN PANEL: CHAT SCREEN */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40 backdrop-blur-sm z-10">
        {/* Chat Header */}
        <header className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-955/45 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-350 hover:text-white rounded-xl hover:bg-slate-800/40"
            >
              <Menu className="size-5" />
            </button>
            {activeChat && (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm text-white tracking-wide">{activeChat.title}</h2>
                  <span className="text-[9px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full uppercase shrink-0">
                    {activeChat.model}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-44 sm:max-w-xs md:max-w-md">
                  Prompt: {activeChat.systemPrompt ? activeChat.systemPrompt.slice(0, 45) + '...' : 'System default'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Warning indicator */}
            {connectionError && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl font-semibold animate-pulse">
                <AlertCircle className="size-3.5" />
                <span className="hidden sm:inline">Koneksi Error</span>
              </span>
            )}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 p-2 sm:px-3 text-xs font-semibold text-slate-350 hover:text-white rounded-xl border border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Setelan</span>
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 scrollbar-thin"
        >
          {activeChat && activeChat.messages.length <= 1 && activeChat.messages[0]?.content === 'Halo! Aku adalah **Pocket AI**, asisten cerdas saku kamu. Tanyakan apa saja, dan aku siap membantumu hari ini! ✨' ? (
            /* Welcome / Suggestion Screen */
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-6 py-8">
              <div className="bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-indigo-500/30 size-16 rounded-3xl flex items-center justify-center text-indigo-400 shadow-inner">
                <Sparkles className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Gemini AI Saku</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5">Mulai diskusi, coding, atau bertukar ide dengan model Gemini AI terbaik.</p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg pt-4">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.prompt)}
                    className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-950/70 text-left transition-all duration-200 group active:scale-[0.98]"
                  >
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                      {s.title}
                      <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{s.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeChat?.messages?.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div className={`size-8 rounded-full shrink-0 flex items-center justify-center shadow-md ${
                      isUser
                        ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-850 text-indigo-400'
                    }`}>
                      {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>

                    {/* Message Card */}
                    <div className="space-y-1">
                      <div className={`p-3.5 rounded-2xl shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-950/70 border border-slate-800/80 text-slate-100 rounded-tl-none'
                      }`}>
                        {msg.content === '' && isGenerating ? (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Loader2 className="size-4 animate-spin text-indigo-400" />
                            <span>Sedang mengetik...</span>
                          </div>
                        ) : (
                          <Markdown content={msg.content} />
                        )}
                      </div>
                      {/* Timestamp */}
                      <p className={`text-[9px] text-slate-500 font-semibold px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-4 md:px-8 border-t border-slate-800/60 bg-slate-950/30">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isGenerating}
                placeholder="Tanyakan apa saja ke Gemini AI..."
                className="w-full pl-4 pr-14 py-3.5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-sm placeholder-slate-500 text-slate-100 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isGenerating}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl shadow shadow-indigo-600/10 active:scale-95 transition-all"
              >
                {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
              Pocket AI terintegrasi Gemini API. Tanggapan dapat bervariasi.
            </p>
          </div>
        </footer>
      </main>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="size-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wide text-white">SETELAN GEMINI</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs font-semibold">
              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-slate-400">Pilih Model Gemini</label>
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all flex justify-between items-center ${
                        selectedModel === m.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/30 text-slate-350 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{m.desc}</div>
                      </div>
                      {selectedModel === m.id && <div className="size-2 rounded-full bg-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Instructions */}
              <div className="space-y-1.5">
                <label className="text-slate-400">Instruksi Sistem (Behavior)</label>
                <textarea
                  rows={4}
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="Contoh: Kamu adalah asisten ahli coding React. Berikan jawaban teknis dan singkat."
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none text-xs text-white placeholder-slate-600 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-transparent text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow shadow-indigo-600/10"
              >
                Simpan Setelan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
