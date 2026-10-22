"use client";
import { useState } from "react";
import { Map, Send, Download, Layers, Globe, Network, Smartphone, Cpu } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

const planTypes = [
  { id: "web", name: "Web Application", icon: Globe, description: "OWASP Top 10, API security, and frontend vulnerabilities." },
  { id: "network", name: "Network Infrastructure", icon: Network, description: "Port scanning, service enumeration, and protocol analysis." },
  { id: "mobile", name: "Mobile App", icon: Smartphone, description: "Static/Dynamic analysis of iOS and Android applications." },
  { id: "api", name: "API & Cloud", icon: Cpu, description: "OAuth, JWT, and cloud misconfiguration testing." },
];

export default function PlanMode() {
  const [selectedType, setSelectedType] = useState("web");
  const [target, setTarget] = useState("");
  const [plan, setPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    if (!target) return;
    setIsGenerating(true);
    setPlan("");
    try {
      const res = await axios.post("http://localhost:8000/plan/generate", { 
        target, 
        objective: `Generate a detailed ${selectedType} pentest plan for ${target}` 
      });
      setPlan(res.data.plan);
    } catch (error) {
      console.error(error);
      setPlan("Error generating plan. Is the backend running?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold glow-text">Strategic Planner</h2>
        <p className="text-gray-400">Generate and customize AI-driven security assessment strategies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {planTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={cn(
              "glass-card p-6 text-left transition-all hover:scale-[1.02]",
              selectedType === type.id ? "border-primary bg-primary bg-opacity-5" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
            )}
          >
            <type.icon className={cn("mb-4", selectedType === type.id ? "text-primary" : "text-gray-400")} size={24} />
            <h4 className="font-bold mb-1">{type.name}</h4>
            <p className="text-xs text-gray-500 leading-tight">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Target Scope</label>
            <input 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all"
              placeholder="e.g. example.com or 10.0.0.1/24"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={generatePlan}
              disabled={isGenerating || !target}
              className="cyber-button disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <Layers className="animate-spin" size={18} /> : <Send size={18} />}
              {isGenerating ? "CRAFTING STRATEGY..." : "GENERATE PLAN"}
            </button>
            {isGenerating && (
              <button 
                onClick={() => setIsGenerating(false)}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-all"
              >
                STOP
              </button>
            )}
          </div>
        </div>

        <div className="relative min-h-[400px] bg-black bg-opacity-30 rounded-xl border border-border p-8">
          {!plan && !isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
              <Map size={48} className="mb-4 opacity-20" />
              <p>Define target scope to generate a strategic plan.</p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
            </div>
          )}

          {plan && (
            <div className="prose prose-invert max-w-none animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono px-3 py-1 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-30 rounded-full uppercase">
                  {selectedType} Strategy Document
                </span>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <Download size={16} /> Export PDF
                </button>
              </div>
              <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                {plan}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
