import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { chatWithAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm MediBot, your medical assistant. How can I help you today? You can ask me about your symptoms, medications, or reports.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithAI([...messages, userMsg]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
              MediBot
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Always Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
            AI Powered
          </Badge>
          <Sparkles className="w-4 h-4 text-primary opacity-50" />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col gap-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}>
              {msg.role === "assistant" && (
                <Avatar className="w-8 h-8 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none font-medium"
                    : "bg-muted text-foreground rounded-bl-none border border-border/50"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-3">
              <Avatar className="w-8 h-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-5 py-3 rounded-2xl rounded-bl-none border border-border/50 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            placeholder="Ask me anything about health..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="rounded-xl h-12 border-border/60 focus:border-primary/50 focus:ring-primary/20 shadow-inner"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} className="h-12 w-12 rounded-xl p-0 shadow-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-widest opacity-60">
          MediBot can make mistakes. Consult a doctor for serious concerns.
        </p>
      </div>
    </div>
  );
};

const Badge = ({ children, variant, className }: any) => (
  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

export default Chatbot;
