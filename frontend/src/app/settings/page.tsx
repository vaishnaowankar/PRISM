"use client";
import { useState } from "react";
import { Settings, Save, Server, Cpu, Globe, Key } from "lucide-react";
import axios from "axios";

const MODELS = [
  { id: "llama3.2", name: "Llama 3.2 (Local/Ollama)", defaultUrl: "http://localhost:11434/v1" },
  { id: "mistral", name: "Mistral (Local/Ollama)", defaultUrl: "http://localhost:11434/v1" },
  { id: "qwen", name: "Qwen (Local/Ollama)", defaultUrl: "http://localhost:11434/v1" },
  { id: "gpt-4", name: "GPT-4 (OpenAI)", defaultUrl: "https://api.openai.com/v1" },
  { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet (Anthropic)", defaultUrl: "" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Google)", defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai/" },
];

export default function SettingsPage() {
  const [model, setModel] = useState("llama3.2");
  const [llmUrl, setLlmUrl] = useState("http://localhost:11434/v1");
  const [apiKey, setApiKey] = useState("");
  const [useDocker, setUseDocker] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setModel(selectedId);
    const selectedModel = MODELS.find(m => m.id === selectedId);
    if (selectedModel && selectedModel.defaultUrl !== "") {
      setLlmUrl(selectedModel.defaultUrl);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post("http://localhost:8000/settings/update", {
        base_url: llmUrl,
        api_key: apiKey,
        model: model,
        use_docker: useDocker
      });
      alert("Settings saved and updated in the backend!");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold glow-text">System Settings</h2>
        <p className="text-gray-400">Configure LLM endpoints, model parameters, and tool execution environments.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* LLM Configuration */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-primary" />
            <h3 className="font-bold">LLM Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Primary Model</label>
              <select 
                value={model}
                onChange={handleModelChange}
                className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all text-sm appearance-none"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Provider Endpoint URL</label>
              <input 
                value={llmUrl}
                onChange={(e) => setLlmUrl(e.target.value)}
                placeholder="Endpoint URL"
                className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Key size={14} /> API Key
            </label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave blank for local Ollama"
              className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Execution Environment */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Server className="text-primary" />
            <h3 className="font-bold">Execution Environment</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
            <div>
              <p className="font-bold text-sm">Use Dockerized Tools</p>
              <p className="text-xs text-gray-500">Run security tools inside a Kali Linux container for maximum compatibility.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={useDocker} 
                onChange={(e) => setUseDocker(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="cyber-button flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "SAVING..." : "SAVE CONFIGURATION"}
          </button>
        </div>
      </div>
    </div>
  );
}
