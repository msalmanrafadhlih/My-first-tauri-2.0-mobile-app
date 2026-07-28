import React, { useState } from "react";
import {
  GeminiConfig,
  AVAILABLE_MODELS,
  validateGeminiApiKey,
} from "../services/gemini";
import {
  Key,
  Sparkles,
  Eye,
  EyeOff,
  Bot,
  ArrowRight,
  ShieldCheck,
  Cpu,
  X,
} from "lucide-react";

interface ApiKeyFormProps {
  initialConfig: GeminiConfig;
  onSave: (config: GeminiConfig) => void;
  onClose?: () => void; // Tambahan prop onClose
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({
  initialConfig,
  onSave,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(initialConfig.apiKey || "");
  const [model, setModel] = useState(
    initialConfig.model || "gemini-3-flash-preview",
  );
  const [customModel, setCustomModel] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(
    initialConfig.systemInstruction || "",
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedModel = useCustomModel ? customModel.trim() : model;

    if (!apiKey.trim()) {
      setError("Harap masukkan API Key Gemini Anda.");
      return;
    }

    if (!selectedModel) {
      setError("Harap pilih atau tuliskan nama Model Gemini.");
      return;
    }

    setIsValidating(true);

    try {
      // Validate key against Google API
      await validateGeminiApiKey(apiKey, selectedModel);

      onSave({
        apiKey: apiKey.trim(),
        model: selectedModel,
        systemInstruction: systemInstruction.trim(),
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Gagal memverifikasi API Key. Pastikan API key benar dan aktif.",
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Tambahkan class 'relative' pada container ini */}
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/5 relative">
        {/* Tombol Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mb-4 shadow-lg shadow-cyan-500/20 text-white">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Gemini AI Setup
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Masukkan API Key Gemini dan pilih model sebelum memulai percakapan.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-start space-x-3">
            <span className="font-bold text-red-400">⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Key Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                API Key Gemini <span className="text-red-400">*</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                Dapatkan API Key Gratis
              </a>
            </div>

            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-4 pr-10 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                title={showApiKey ? "Sembunyikan" : "Tampilkan"}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              API Key Anda tersimpan aman hanya di browser/client lokal
              (localStorage).
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Pilih Model Gemini <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-1 gap-2.5 max-h-40 overflow-y-auto pr-1">
              {AVAILABLE_MODELS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setModel(item.id);
                    setUseCustomModel(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    !useCustomModel && model === item.id
                      ? "bg-cyan-950/40 border-cyan-500/70 ring-0.7 ring-cyan-500/40"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !useCustomModel && model === item.id
                        ? "border-cyan-400 bg-cyan-500"
                        : "border-slate-600"
                    }`}
                  >
                    {!useCustomModel && model === item.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Model Toggle */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setUseCustomModel(!useCustomModel)}
                className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
              >
                {useCustomModel
                  ? "← Pilih dari daftar model standar"
                  : "+ Tuliskan nama model kustom"}
              </button>

              {useCustomModel && (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Contoh: gemini-2.5-flash-lite"
                  className="mt-2 w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              )}
            </div>
          </div>

          {/* System Instruction Optional */}
          <div className="hidden">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              Instruksi Sistem (Opsional)
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Contoh: Kamu adalah asisten AI pemrograman senior yang selalu memberikan contoh kode yang rapi dan respons teknis ringkas."
              rows={2}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isValidating}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi API Key...</span>
              </>
            ) : (
              <>
                <span>Mulai Chat Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
