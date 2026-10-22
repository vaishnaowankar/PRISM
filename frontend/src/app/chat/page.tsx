"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Terminal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatMode() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      if (!response.body) return;
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = aiContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col glass-card overflow-hidden animate-in fade-in duration-700">
      <div className="p-4 border-b border-border bg-black bg-opacity-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Bot size={18} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold">CyberIntel Assistant</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active • Llama 3.2</p>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-500">SECURE CHANNEL</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Ask about vulnerabilities, exploits, or defense strategies.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={cn(
            "flex gap-4 max-w-4xl",
            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              msg.role === "user" ? "bg-primary text-black" : "bg-purple-500 text-white"
            )}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-primary bg-opacity-10 border border-primary border-opacity-20 text-gray-200" 
                : "bg-white bg-opacity-5 border border-white border-opacity-5 text-gray-300"
            )}>
              {msg.content || (isLoading && idx === messages.length - 1 ? <Loader2 className="animate-spin" size={16} /> : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-black bg-opacity-20">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Query security database..."
              className="w-full bg-black bg-opacity-50 border border-border rounded-xl px-5 py-3 pr-12 focus:border-primary outline-none transition-all text-sm"
            />
            <Terminal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
          </div>
          <button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
