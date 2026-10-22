"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Zap, Play, Shield, Terminal, 
  ChevronRight, Brain, AlertCircle, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function AgentMode() {
  const [target, setTarget] = useState("192.168.91.135");
  const [objective, setObjective] = useState("Perform full VAPT process on target");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isStopping, setIsStopping] = useState(false);
  const stopSignal = useRef(false);

  const startEngagement = async () => {
    setIsRunning(true);
    setIsStopping(false);
    stopSignal.current = false;
    setLogs([]);
    try {
      await axios.post("http://localhost:8000/agent/start", { target, objective });
      runStep();
    } catch (error) {
      console.error(error);
      setIsRunning(false);
    }
  };

  const stopEngagement = () => {
    setIsStopping(true);
    stopSignal.current = true;
  };

  const runStep = async () => {
    if (stopSignal.current) {
      setIsRunning(false);
      setIsStopping(false);
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/agent/step");
      setLogs(prev => [...prev, res.data]);
      if (res.data.phase !== "Blue Team Review" && !stopSignal.current) {
        setTimeout(runStep, 2000); // Poll next step
      } else {
        setIsRunning(false);
        setIsStopping(false);
      }
    } catch (error) {
      console.error(error);
      setIsRunning(false);
      setIsStopping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Target Address</label>
          <input 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all"
            placeholder="IP or Hostname"
          />
        </div>
        <div className="flex-[2] space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Objective</label>
          <input 
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full bg-black bg-opacity-50 border border-border rounded-md px-4 py-2 focus:border-primary outline-none transition-all"
            placeholder="e.g. Find vulnerabilities on web server"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={startEngagement}
            disabled={isRunning}
            className="cyber-button disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {isRunning ? <Zap className="animate-spin" size={18} /> : <Play size={18} />}
            {isRunning ? "ORCHESTRATING..." : "START PURPLE TEAM"}
          </button>
          {isRunning && (
            <button 
              onClick={stopEngagement}
              disabled={isStopping}
              className="px-6 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-all"
            >
              STOP
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-black bg-opacity-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-primary" />
            <span className="text-sm font-mono uppercase tracking-widest">Multi-Agent Orchestration Log</span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="text-xs animate-pulse text-primary font-bold">LIVE SESSION</span>
            </div>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {logs.length === 0 && !isRunning && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <Brain size={48} className="mb-4 opacity-20" />
              <p>Initialize a session to see agent collaboration.</p>
            </div>
          )}

          {logs.map((step, idx) => (
            <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-border" />
                <span className="text-xs font-mono px-4 py-1 rounded-full border border-[var(--border)] bg-black">
                  PHASE: {step.phase}
                </span>
                <div className="h-[1px] flex-1 bg-border" />
              </div>

              {/* Coordinator */}
              <AgentBubble 
                role="COORDINATOR" 
                color="text-primary" 
                content={step.red.thoughts}
                icon={<Shield size={16} />}
              />

              {/* Red Agent */}
              <div className="space-y-4 ml-8 border-l-2 border-red-500/20 pl-6 py-2">
                <AgentBubble 
                  role="RED AGENT" 
                  color="text-red-500" 
                  content={`Executing TTP: ${step.red.rationale}`}
                  icon={<Zap size={16} />}
                />
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm border border-red-500/20">
                  {step.results.map((res: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="text-gray-500">$ {res.command}</div>
                      <div className="text-red-400/80 whitespace-pre-wrap mt-1">{res.output.slice(0, 500)}...</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue Agent */}
              <div className="space-y-4 ml-8 border-l-2 border-blue-500/20 pl-6 py-2">
                <AgentBubble 
                  role="BLUE AGENT" 
                  color="text-blue-500" 
                  content={step.blue.thoughts}
                  icon={<Shield size={16} />}
                />
                <div className="flex gap-4">
                  {step.blue.detections.map((det: string, i: number) => (
                    <div key={i} className="px-3 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-2">
                      <AlertCircle size={12} /> {det}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Loop Result */}
              <div className="flex justify-center">
                <div className={cn(
                  "px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 border",
                  step.loop_decision === "MUTATE" 
                    ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" 
                    : "bg-green-500/10 border-green-500/50 text-green-500"
                )}>
                  {step.loop_decision === "MUTATE" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  LOOP DECISION: {step.loop_decision}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ role, color, content, icon }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className={cn("mt-1 p-2 rounded-md bg-black border border-[var(--border)]", color)}>
        {icon}
      </div>
      <div>
        <h5 className={cn("text-xs font-bold mb-1 tracking-tighter", color)}>{role}</h5>
        <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
