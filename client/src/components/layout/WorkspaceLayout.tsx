import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WorkspaceLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  assistant: React.ReactNode;
}

export function WorkspaceLayout({
  sidebar,
  main,
  assistant,
}: WorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
        setAssistantCollapsed(true);
      } else {
        setSidebarCollapsed(false);
        setAssistantCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-ai-secondary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold gradient-text">Promptly</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-[70] shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="h-full pt-12">{sidebar}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar */}
      {!isMobile && (
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          className={cn(
            "relative flex flex-col border-r border-border/50 bg-sidebar-bg/50 backdrop-blur-xl z-20",
          )}
        >
          {sidebar}
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-3.5 top-8 z-30 h-7 w-7 rounded-full border border-border/50 bg-background shadow-sm hover:shadow-md hover:scale-110 transition-all"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex flex-1 flex-col overflow-hidden relative transition-all duration-300",
          isMobile && "pt-16",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.05),transparent_50%)] pointer-events-none" />
        {main}
      </main>

      {/* Right Assistant Panel */}
      {!isMobile && (
        <motion.div
          initial={false}
          animate={{
            width: assistantCollapsed ? 0 : 420,
            opacity: assistantCollapsed ? 0 : 1,
          }}
          className="relative flex flex-col border-l border-border/50 bg-background z-20"
        >
          <div className="h-full overflow-hidden w-[420px]">{assistant}</div>
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-3.5 top-8 z-30 h-7 w-7 rounded-full border border-border/50 bg-background shadow-sm hover:shadow-md hover:scale-110 transition-all"
            onClick={() => setAssistantCollapsed(!assistantCollapsed)}
          >
            {assistantCollapsed ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Mobile Floating Assistant Trigger */}
      {isMobile && !mobileMenuOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed right-6 bottom-6 z-40"
        >
          <Button
            className="h-14 w-14 rounded-2xl shadow-2xl btn-primary-glow"
            onClick={() => setAssistantCollapsed(!assistantCollapsed)}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </Button>
        </motion.div>
      )}

      {/* Mobile Assistant Overlay */}
      <AnimatePresence>
        {isMobile && !assistantCollapsed && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-[80] flex flex-col pt-4"
          >
            <div className="flex items-center justify-between px-6 mb-4">
              <span className="font-bold text-lg">AI Assistant</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAssistantCollapsed(true)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">{assistant}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
