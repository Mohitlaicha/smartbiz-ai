import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Bot, User, Sparkles, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { businessAPI } from "@/api/client";

const suggestions = [
  "How can I improve my cash flow?",
  "Analyze my top customers",
  "Suggest ways to reduce expenses",
  "Help me plan next quarter's goals",
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const { data: invoicesRes } = useQuery({
    queryKey: ["invoices"],
    queryFn: businessAPI.getInvoices,
  });

  const invoices = invoicesRes?.data || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + Number(inv.amount || inv.total || 0),
      0
    );

    const reply = `
### SmartBiz AI Advice

Based on your current business data:

- Total invoice revenue: **$${totalRevenue.toLocaleString()}**
- Total invoices recorded: **${invoices.length}**

**Suggestion:**
- Track unpaid invoices regularly.
- Monitor expenses weekly.
- Focus on repeat customers.
- Keep inventory updated.
- Review sales reports every month.

This is currently a local AI demo response. Later we can connect it to a real AI API.
`;

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 700);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] sm:h-[calc(100vh-6rem)]">
      <PageHeader
        title="AI Business Advisor"
        subtitle="Get AI-powered insights and advice for your business"
        actions={
          messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" /> New Chat
            </Button>
          )
        }
      />

      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>

              <h2 className="text-lg sm:text-2xl font-heading font-bold mb-2">
                How can I help your business?
              </h2>

              <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md text-sm">
                I can analyze your data, provide business insights, and suggest
                strategies to grow your SME.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-left p-4 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-5 py-2 sm:py-3",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border/50"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>

                  <div className="bg-muted/50 border border-border/50 rounded-2xl px-5 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-border/50">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business..."
              className="flex-1"
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={!input.trim() || loading}
              size="icon"
              className="w-10 h-10 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}