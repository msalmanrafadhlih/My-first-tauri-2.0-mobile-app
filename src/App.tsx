import React, { useState } from "react";
import { GeminiConfig } from "./services/gemini";
import { ApiKeyForm } from "./components/ApiKeyForm";
import { ChatInterface } from "./components/ChatInterface";

export const App: React.FC = () => {
  const [config, setConfig] = useState<GeminiConfig | null>(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    const savedModel = localStorage.getItem("gemini_model") || "gemini-3-flash-preview";
    const savedSystemInst = localStorage.getItem("gemini_system_instruction") || "";

    if (savedApiKey) {
      return {
        apiKey: savedApiKey,
        model: savedModel,
        systemInstruction: savedSystemInst
      };
    }
    return null;
  });

  const [isSettingMode, setIsSettingMode] = useState<boolean>(false);

  const handleSaveConfig = (newConfig: GeminiConfig) => {
    localStorage.setItem("gemini_api_key", newConfig.apiKey);
    localStorage.setItem("gemini_model", newConfig.model);
    if (newConfig.systemInstruction) {
      localStorage.setItem("gemini_system_instruction", newConfig.systemInstruction);
    } else {
      localStorage.removeItem("gemini_system_instruction");
    }

    setConfig(newConfig);
    setIsSettingMode(false);
  };

  if (!config || isSettingMode) {
    return (
      <ApiKeyForm
        initialConfig={
          config || {
            apiKey: "",
            model: "gemini-3-flash-preview",
            systemInstruction: ""
          }
        }
        onSave={handleSaveConfig}
        onClose={isSettingMode ? () => setIsSettingMode(false) : undefined}
      />
    );
  }

  return (
    <ChatInterface
      config={config}
      onOpenSettings={() => setIsSettingMode(true)}
    />
  );
};

export default App;
