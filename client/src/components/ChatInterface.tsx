import { useState } from "react";
import {
  Terminal,
  Globe,
  Clock,
  ExternalLink,
  Search,
  Cpu,
  Inbox,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import type { IChatMetadata } from "@/types/chat";

export default function ChatInterface({
  metadata,
}: {
  metadata: IChatMetadata | null;
}) {
  const [activeTab, setActiveTab] = useState<"logic" | "sources">("logic");

  if (!metadata) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10 text-center space-y-6 bg-background/30 backdrop-blur-xl">
        <div className="relative">
          <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center border border-border/50">
            <Inbox className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
            Awaiting Neural Input
          </h3>
          <p className="text-xs text-muted-foreground/40 max-w-[200px] font-medium leading-relaxed">
            Generate insights to populate this workspace with intelligence
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background/30 backdrop-blur-xl">
      {/* Dynamic Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Intelligence Feed
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Live Contextual Analysis
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-foreground/70 tracking-tight">
              {metadata.processingTime}s
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-muted/50 border border-border/50">
          {[
            { id: "logic", label: "Neural Logic", icon: BrainCircuit },
            { id: "sources", label: "Web Intelligence", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm shadow-primary/5 border border-primary/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon
                className={cn(
                  "h-3.5 w-3.5",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground/50",
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "logic" ? (
            <motion.div
              key="logic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                  Synthetic Highlights
                </h4>
                <div className="grid gap-3">
                  {metadata.highlights.length > 0 ? (
                    metadata.highlights.map((highlight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card p-4 border border-border/50 bg-muted/10 group hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="flex gap-4">
                          <div className="mt-1 h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
                            {highlight}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                      <Cpu className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        No highlights extracted
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                  Validated Sources
                </h4>
                <div className="grid gap-3">
                  {metadata.sources.length > 0 ? (
                    metadata.sources.map((source, i) => (
                      <motion.a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card p-4 flex items-center justify-between group hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-[14px] bg-muted/50 flex items-center justify-center border border-border/50 group-hover:border-primary/20 group-hover:bg-background transition-all">
                            <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight truncate max-w-[180px]">
                              {source.title}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground lowercase">
                              {source.url.split("/")[2]}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </motion.a>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                      <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        No external sources used
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Domains Section */}
              {metadata.domains.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                    Searched Domains
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.domains.map((domain, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider"
                      >
                        {domain}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Infrastructure Note */}
      <div className="p-6 pt-0 border-t border-border/30 bg-muted/10 backdrop-blur-sm">
        <div className="mt-4 flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 p-3 rounded-xl border border-border/50">
          <Search className="h-3 w-3 text-primary animate-pulse" />
          <span>Real-time Discovery Engine Optimized</span>
        </div>
      </div>
    </div>
  );
}
