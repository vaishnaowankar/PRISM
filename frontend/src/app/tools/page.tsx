"use client";
import { useState, useEffect } from "react";
import { Wrench, CheckCircle2, XCircle, RefreshCw, Box, ShieldCheck, Terminal } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function ToolStatus() {
  const [tools, setTools] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/tools/status");
      setTools(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold glow-text">Environment Health</h2>
          <p className="text-gray-400">Status of security tools and containerized environments.</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={async () => {
              // This is a mock; in a real app, you'd trigger a backend pull
              alert("Pulling Kali Linux image... Please wait a few minutes and refresh.");
            }}
            className="flex items-center gap-2 text-xs px-3 py-1 rounded bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
          >
            <RefreshCw size={14} /> INITIALIZE DOCKER
          </button>
          <button 
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            REFRESH STATUS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusSection 
          title="Offensive Tools" 
          icon={<Terminal className="text-red-500" />} 
          tools={tools}
          filter={["nmap", "msfconsole", "sqlmap", "gobuster", "nikto", "hydra"]}
        />
        <StatusSection 
          title="Defensive & Analysis" 
          icon={<ShieldCheck className="text-blue-500" />} 
          tools={tools}
          filter={["suricata", "tshark", "wireshark", "john", "nuclei"]}
        />
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Box className="text-primary" />
            <h3 className="font-bold">Container Status</h3>
          </div>
          <div className="space-y-4">
            <ContainerItem name="Kali Linux Node" status="RUNNING" />
            <ContainerItem name="OWASP Juice Shop" status="ACTIVE" />
            <ContainerItem name="Metasploitable V2" status="IDLE" />
          </div>
          <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
            <strong>Pro Tip:</strong> Ensure Docker Desktop is running on Windows to enable the full Kali toolset.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusSection({ title, icon, tools, filter }: any) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="space-y-3">
        {filter.map((tool: string) => (
          <ToolItem key={tool} name={tool} active={tools[tool]} />
        ))}
      </div>
    </div>
  );
}

function ToolItem({ name, active }: { name: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
      <span className="text-sm font-mono capitalize">{name}</span>
      {active ? (
        <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
          <CheckCircle2 size={14} /> ACTIVE
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-600 text-xs font-bold">
          <XCircle size={14} /> MISSING
        </div>
      )}
    </div>
  );
}

function ContainerItem({ name, status }: { name: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-border">
      <span className="text-sm">{name}</span>
      <div className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold",
        status === "RUNNING" || status === "ACTIVE" ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
      )}>
        {status}
      </div>
    </div>
  );
}
