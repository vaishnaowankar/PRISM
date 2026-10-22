"use client";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { Shield, Target, AlertTriangle, Activity, Zap } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:8000/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold glow-text">Security Command Center</h2>
          <p className="text-gray-400">Real-time telemetry and agentic performance metrics.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last Assessment</p>
          <p className="font-mono text-primary">May 03, 15:20:05</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Threat Score (DTS)" 
          value={stats.dts} 
          icon={<Shield className="text-primary" />} 
          subtitle="Residual risk"
        />
        <StatCard 
          title="Detection Rate" 
          value={`${stats.detection_rate}%`} 
          icon={<Target className="text-green-500" />} 
          subtitle="Blue Team performance"
        />
        <StatCard 
          title="Mutation Success" 
          value={`${stats.mutation_success_rate}%`} 
          icon={<Zap className="text-yellow-500" />} 
          subtitle="Red Team adaptability"
        />
        <StatCard 
          title="MTTD Reduction" 
          value={stats.mttd} 
          icon={<Activity className="text-purple-500" />} 
          subtitle="Detection speedup"
        />
        <StatCard 
          title="Total Findings" 
          value={stats.vulnerabilities.reduce((acc: any, curr: any) => acc + curr.count, 0)} 
          icon={<AlertTriangle className="text-red-500" />} 
          subtitle="Critical exposures"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Threat vs. Detection Evolution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.history}>
              <defs>
                <linearGradient id="colorDts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9d50bb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9d50bb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis 
                dataKey="time" 
                stroke="#4b5563" 
                label={{ value: 'Timeline (UTC)', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 12 }}
              />
              <YAxis 
                stroke="#4b5563" 
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e" }}
                itemStyle={{ color: "#e0e0e0" }}
              />
              <Area type="monotone" name="Threat Score" dataKey="dts" stroke="#00d2ff" fillOpacity={1} fill="url(#colorDts)" />
              <Area type="monotone" name="Detection Rate" dataKey="detection" stroke="#9d50bb" fillOpacity={1} fill="url(#colorDet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Findings by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.vulnerabilities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis 
                dataKey="name" 
                stroke="#4b5563" 
                label={{ value: 'Severity Level', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 12 }}
              />
              <YAxis 
                stroke="#4b5563" 
                label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: "#0d0d1a", border: "1px solid #1a1a2e" }}
              />
              <Bar dataKey="count" name="Vulnerabilities" fill="#00d2ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: any) {
  return (
    <div className="glass-card p-6 hover:border-primary transition-colors cursor-default">
      <div className="flex justify-between items-start mb-4">
        {icon}
        <span className="text-xs font-mono text-gray-500">REALTIME</span>
      </div>
      <h4 className="text-gray-400 text-sm">{title}</h4>
      <p className="text-3xl font-bold my-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
