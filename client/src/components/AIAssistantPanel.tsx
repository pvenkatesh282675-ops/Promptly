import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Copy,
  RotateCw,
  Search,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const WRITING_PROMPTS = [
  {
    id: 1,
    category: "Business",
    title: "Email Response",
    description: "Draft a professional email response",
    icon: "📧",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 2,
    category: "Marketing",
    title: "Social Media Post",
    description: "Create engaging social content",
    icon: "📱",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: 3,
    category: "Communication",
    title: "Meeting Summary",
    description: "Summarize key points from meetings",
    icon: "📋",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: 4,
    category: "Creative",
    title: "Blog Introduction",
    description: "Write an engaging blog intro",
    icon: "✍️",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: 5,
    category: "Education",
    title: "Generate Study Plan",
    description: "Generate a study plan for a student with the time given",
    icon: "💻",
    gradient: "from-green-500/20 to-green-500/20",
  },
  {
    id: 6,
    category: "Research",
    title: "Reasearch on a topic",
    description: "Get a detailed research on any topic",
    icon: "🔍",
    gradient: "from-yellow-500/20 to-purple-500/20",
  },
];

import type { IChatMetadata } from "@/types/chat";

export default function AIAssistantPanel({
  onMetadata,
  initialData,
  userId,
}: {
  onMetadata?: (metadata: IChatMetadata) => void;
  initialData?: any;
  userId?: string;
}) {
  const [prompt, setPrompt] = useState(initialData?.prompt || "");
  const [response, setResponse] = useState(initialData?.response || "");
  const [loading, setLoading] = useState(false);
  const [includeSearch, setIncludeSearch] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setResponse("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, includeSearch, userId }),
        },
      );

      const data = await res.json();
      setResponse(data.text || "No response generated");
      if (data.metadata && onMetadata) {
        onMetadata(data.metadata);
      }
    } catch (error) {
      console.error(error);
      setResponse("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = (template: (typeof WRITING_PROMPTS)[0]) => {
    setPrompt(`${template.description}: `);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Premium Header */}
      <div className="relative p-6 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-ai-secondary/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-ai-secondary shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold gradient-text">Assistant</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Intelligence Engine
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
        {/* Quick Prompts */}
        {!response && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              Creative Templates
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {WRITING_PROMPTS.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleUsePrompt(template)}
                  className={cn(
                    "premium-card group p-4 cursor-pointer relative overflow-hidden",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 opacity-10 bg-gradient-to-br",
                      template.gradient,
                    )}
                  />
                  <div className="relative flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-sm">
                      {template.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-sm tracking-tight">
                          {template.title}
                        </h4>
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground font-bold border border-border/50">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {template.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {(loading || response) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Assistant Output
                </h3>
                {response && !loading && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="rounded-xl h-9 px-4 text-xs font-bold hover:bg-primary/10 hover:text-primary"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-2 text-green-500" />{" "}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-2" /> Copy Output
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "ai-message min-h-[100px] transition-all duration-500",
                  loading && "animate-pulse border-primary/30",
                )}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-ai-secondary animate-pulse-glow" />
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-white animate-float" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm tracking-tight mb-1">
                        Processing Neural Request
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {includeSearch
                          ? "Accessing Web Knowledge"
                          : "Generating Synthetic Context"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 font-medium">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                )}
              </div>

              {response && !loading && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setResponse("");
                    setPrompt("");
                  }}
                  className="w-full h-12 rounded-2xl border border-border/50 text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-all"
                >
                  <RotateCw className="h-3.5 w-3.5 mr-2" />
                  New Synthesis
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Input Area - Fixed at bottom */}
      <div className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-xl relative z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Content Strategy
            </h3>
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                  includeSearch
                    ? "bg-primary border-primary shadow-lg shadow-primary/20"
                    : "border-border group-hover:border-primary/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={includeSearch}
                  onChange={(e) => setIncludeSearch(e.target.checked)}
                  className="sr-only"
                />
                <AnimatePresence>
                  {includeSearch && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                  Deep Discovery
                </span>
              </div>
            </motion.label>
          </div>

          <div className="relative group">
            <Textarea
              placeholder="Describe what you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] max-h-[200px] resize-none rounded-3xl border-border/50 bg-muted/20 p-5 input-glow transition-all duration-300 placeholder:text-muted-foreground/40 font-medium text-sm leading-relaxed"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={cn(
              "w-full py-7 rounded-2xl font-bold transition-all duration-300",
              "btn-primary-glow text-white shadow-xl shadow-primary/20",
              "disabled:opacity-50 disabled:shadow-none",
            )}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="tracking-wide">Synthesizing Logic...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="tracking-wide text-md">Begin Generation</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
