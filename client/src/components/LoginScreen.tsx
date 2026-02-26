import { useState } from "react";
import { Users, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LoginScreenProps {
  onLogin: (
    userId: string,
    userName: string,
    password: string,
    isRegistering: boolean,
  ) => Promise<void>;
  isConnecting: boolean;
}

export function LoginScreen({ onLogin, isConnecting }: LoginScreenProps) {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (userId.trim() && password.trim()) {
      onLogin(userId, userName || userId, password, isRegistering);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ai-secondary/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-panel p-10 rounded-[2.5rem] shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-ai-secondary shadow-xl shadow-primary/20 mb-6"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isRegistering ? "Join the Future" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {isRegistering
                ? "Experience the next generation of AI workspace"
                : "Sign in to continue your creative journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
                Your ID
              </label>
              <input
                type="text"
                placeholder="Enter your unique ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-border/50 bg-muted/20 text-foreground placeholder:text-muted-foreground/30 input-glow transition-all focus:outline-none text-sm font-medium"
              />
            </div>

            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-1.5 text-left overflow-hidden"
                >
                  <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="How should we call you?"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-border/50 bg-muted/20 text-foreground placeholder:text-muted-foreground/30 input-glow transition-all focus:outline-none text-sm font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
                Enter your password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-border/50 bg-muted/20 text-foreground placeholder:text-muted-foreground/30 input-glow transition-all focus:outline-none text-sm font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={!userId.trim() || !password.trim() || isConnecting}
              className={cn(
                "w-full py-7 rounded-2xl font-bold text-md transition-all duration-300 mt-4",
                "btn-primary-glow text-white shadow-xl shadow-primary/20",
                "disabled:opacity-50 disabled:shadow-none disabled:transform-none",
              )}
            >
              {isConnecting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Establishing Connection...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isRegistering ? (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Start Your Journey</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5" />
                      <span>Continue Workspace</span>
                    </>
                  )}
                </div>
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                {isRegistering
                  ? "Already have a workspace? Sign in"
                  : "Need a new workspace? Create one here"}
              </button>
            </div>
          </form>

          {/* Security Badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-t border-border/30 pt-6">
            <ShieldCheck className="h-3.5 w-3.5 text-success/70" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
