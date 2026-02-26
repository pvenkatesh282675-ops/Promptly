import { useState, useEffect } from "react";
import {
  MessageSquare,
  PlusCircle,
  Hash,
  LogOut,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  collapsed: boolean;
  userProfile?: any;
  onLogout: () => void;
  onNewConversation: () => void;
  onSelectHistory: (data: any) => void;
}

export function Sidebar({
  collapsed,
  userProfile,
  onLogout,
  onNewConversation,
  onSelectHistory,
}: SidebarProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!userProfile?.userId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
          }/api/history/${userProfile.userId}`,
        );
        const data = await res.json();
        if (res.ok) setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // Polling for updates
    return () => clearInterval(interval);
  }, [userProfile?.userId]);

  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Header & Logo */}
      <div className="p-6">
        <div
          className={cn(
            "flex items-center gap-4 mb-8",
            collapsed && "justify-center mb-6",
          )}
        >
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-ai-secondary shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl animate-pulse-glow bg-primary/20 -z-10" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold gradient-text tracking-tight">
                Promptly
              </h1>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                AI Workspace
              </span>
            </motion.div>
          )}
        </div>

        {/* New Conversation Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewConversation}
                className={cn(
                  "w-full rounded-2xl font-bold text-sm transition-all duration-300 group shadow-xl shadow-primary/10",
                  "btn-primary-glow text-white",
                  collapsed ? "px-0 h-12" : "py-7",
                )}
              >
                <PlusCircle
                  className={cn(
                    "h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-300",
                    !collapsed && "mr-3",
                  )}
                />
                {!collapsed && (
                  <span className="tracking-wide">New Session</span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="font-bold">
                New Session
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation / History */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar">
        <div className="space-y-3">
          {!collapsed && (
            <h4 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-3">
              Active Streams
            </h4>
          )}
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => (
                <TooltipProvider key={item._id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        key={item._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectHistory(item)}
                        className={cn(
                          "w-full group px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 relative overflow-hidden",
                          "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-background transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        {!collapsed && (
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-bold truncate tracking-tight">
                              {item.prompt}
                            </p>
                            <p className="text-[9px] font-medium text-muted-foreground/70 uppercase">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {!collapsed && (
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="font-bold">
                        {item.prompt}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </AnimatePresence>
            {history.length === 0 && !collapsed && (
              <div className="px-3 py-10 text-center">
                <div className="inline-flex p-3 rounded-2xl bg-muted/30 mb-3">
                  <Hash className="h-5 w-5 text-muted-foreground/30" />
                </div>
                <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                  No active streams
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Profile */}
      <div className="p-4 mt-auto border-t border-border/50 bg-background/20 backdrop-blur-sm">
        <div
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-2xl transition-all",
            collapsed
              ? "justify-center"
              : "bg-muted/30 border border-border/50",
          )}
        >
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 ring-2 ring-background border border-primary/10 shadow-lg">
              <AvatarImage src={userProfile?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-ai-secondary text-white text-xs font-bold uppercase">
                {userProfile?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success ring-2 ring-background shadow-sm animate-pulse" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate tracking-tight">
                {userProfile?.name || "Specialist"}
              </p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-ai-secondary" />
                Pro Active
              </p>
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="mt-5 flex items-center justify-between px-2">
            <div className="scale-90 origin-left">
              <ThemeToggle />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Promptly
              </span>
              <span className="text-[8px] font-bold text-primary/50 uppercase tracking-widest">
                v2.5.0
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
