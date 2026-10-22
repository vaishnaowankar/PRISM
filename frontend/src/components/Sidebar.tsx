"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  MessageSquare, 
  Zap, 
  Map, 
  BarChart3, 
  Wrench, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { name: "Chat Mode", icon: MessageSquare, href: "/chat" },
  { name: "Agent Mode", icon: Zap, href: "/agent" },
  { name: "Plan Mode", icon: Map, href: "/plan" },
  { name: "Tool Status", icon: Wrench, href: "/tools" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="text-black" />
        </div>
        <h1 className="text-xl font-bold glow-text">PRISM</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              pathname === item.href
                ? "bg-primary bg-opacity-20 text-primary"
                : "text-gray-400 hover:bg-border hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="p-4 rounded-xl glass-card bg-opacity-20">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Local Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm">Llama 3.2 Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
