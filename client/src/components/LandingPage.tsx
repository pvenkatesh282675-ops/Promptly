import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Globe, Shield, ArrowRight, X, Lock, User, Cpu, Sparkles, Loader2, Eye, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onLogin: (userId: string, userName: string, password: string, isRegistering: boolean) => Promise<void>;
  isConnecting: boolean;
}

// Animated noise/grain overlay using canvas
function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 12;
    }
    ctx.putImageData(imageData, 0, 0);
  });
  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-40"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Magnetic cursor orb
function MagneticOrb({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-40 mix-blend-screen"
      animate={{ left: x - 200, top: y - 200 }}
      transition={{ type: "spring", mass: 0.1, stiffness: 120, damping: 15 }}
      style={{ width: 400, height: 400 }}
    >
      <div className="w-full h-full rounded-full bg-gradient-radial from-blue-500/30 via-violet-500/10 to-transparent blur-2xl" />
    </motion.div>
  );
}

// Animated grid lines background
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(148,163,184,0.04)" strokeWidth="1" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#fade)" />
      </svg>
    </div>
  );
}

// Floating particle system
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -60, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Typewriter effect
function Typewriter({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setCharIndex((c) => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex((c) => c - 1);
        } else {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? 45 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500">
      {words[wordIndex].slice(0, charIndex)}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-cyan-400"
      >|</motion.span>
    </span>
  );
}

// Counter animation
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 40;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); }
        }, 30);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage({ onLogin, isConnecting }: LandingPageProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim() && password.trim()) {
      await onLogin(userId, authMode === "register" ? userName || userId : userId, password, authMode === "register");
    }
  };

  const features = [
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "NEURAL ENGINE",
      title: "Superhuman Reasoning",
      description: "Dual core intelligence architecture that thinks faster, deeper, and further than anything you've used before.",
      accent: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      stat: "2.4x",
      statLabel: "faster than normal agents",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: "LIVE DISCOVERY",
      title: "Real Time Web Intel",
      description: "Not trained data from 2 years ago. Tavily powered live crawling means you're commanding today's knowledge.",
      accent: "from-violet-500 to-purple-700",
      glow: "shadow-violet-500/20",
      stat: "∞",
      statLabel: "knowledge freshness",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "VAULT SECURITY",
      title: "Zero Trust Architecture",
      description: "Bcrypt-hashed. JWT-sealed. Your sessions, your data, your sovereignty never negotiable.",
      accent: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      stat: "256-bit",
      statLabel: "encryption standard",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono-custom { font-family: 'DM Mono', monospace; }
        .bg-gradient-radial { background: radial-gradient(circle, var(--tw-gradient-stops)); }
        .text-stroke { -webkit-text-stroke: 1px rgba(148,163,184,0.3); color: transparent; }
        @keyframes orbit { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        .orbit-ring { animation: orbit 8s linear infinite; }
        .orbit-ring-2 { animation: orbit 12s linear infinite reverse; animation-delay: -4s; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .shimmer { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 3s infinite; }
      `}</style>

      <GrainOverlay />
      <GridBackground />
      <Particles />
      <MagneticOrb x={mousePos.x} y={mousePos.y} />

      {/* Ambient blobs */}
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-800/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-800/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed top-[40%] left-[30%] w-[40%] h-[40%] bg-cyan-900/8 blur-[140px] rounded-full pointer-events-none" />

      {/* NAV */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 opacity-90" />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 opacity-40 blur-md -z-10" />
          </div>
          <span className="font-display text-lg font-800 tracking-tight text-white">Promptly</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-full backdrop-blur-md">
          <button
            onClick={() => openAuth("login")}
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-full"
          >
            Sign in
          </button>
          <button
            onClick={() => openAuth("register")}
            className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full transition-all hover:opacity-90 shadow-lg shadow-blue-500/25"
          >
            Get early access
          </button>
        </div>
      </motion.nav>

      {/*HERO */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-12">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-medium text-slate-400 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono-custom tracking-wider">SYSTEM ONLINE — LIVE WEB ACCESS ACTIVE</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
          </div>
        </motion.div>

        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Ghost / outline large text */}
            <div className="font-display text-[clamp(4rem,10vw,9rem)] font-800 leading-[0.9] text-stroke select-none pointer-events-none mb-[-0.1em] tracking-tight">
              THINK
            </div>
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-800 leading-[0.95] tracking-tight mb-6 text-white">
              Beyond the <br />
              <Typewriter words={["Ordinary.", "Possible.", "Expected.", "Limit."]} />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light"
          >
            Promptly is the AI workspace that doesn't just <em className="text-slate-200 not-italic">answer</em> it{" "}
            <em className="text-slate-200 not-italic">discovers</em>. Live web intelligence meets state of the art reasoning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => openAuth("register")}
              className="group relative flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl overflow-hidden transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="absolute inset-0 shimmer" />
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
              <span className="relative z-10">Start for free</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => openAuth("login")}
              className="group flex items-center gap-2 px-8 py-4 border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/20 font-medium rounded-2xl backdrop-blur-sm transition-all"
            >
              <Eye className="w-4 h-4 opacity-60 group-hover:opacity-100" />
              Sign in
            </button>
          </motion.div>
        </div>

        {/*ORBIT VISUAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center mt-20 mb-4 h-72"
        >
          {/* Center core */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-8 h-8 text-white fill-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 opacity-40 blur-2xl -z-10 scale-150" />
          </div>

          {/* Orbit rings (purely decorative) */}
          {[100, 160, 220].map((r) => (
            <div key={r} className="absolute rounded-full border border-white/[0.06]" style={{ width: r * 2, height: r * 2 }} />
          ))}

          {/* Orbiting dots */}
          {[
            { r: 100, label: "AI", color: "bg-cyan-400", orbit: "orbit-ring", icon: <Cpu className="w-3 h-3" /> },
            { r: 160, label: "WEB", color: "bg-violet-400", orbit: "orbit-ring-2", icon: <Globe className="w-3 h-3" /> },
            { r: 220, label: "SEC", color: "bg-emerald-400", orbit: "orbit-ring", icon: <Shield className="w-3 h-3" /> },
          ].map(({ r, label, color, orbit }) => (
            <div
              key={label}
              className="absolute"
              style={{ width: 0, height: 0 }}
            >
              <div
                className={`${orbit} flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-[10px] font-mono-custom font-medium text-white shadow-lg`}
                style={{ ["--tw-translate-x" as any]: `${r}px` }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                {label}
              </div>
            </div>
          ))}

          {/* Stats floating */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[8%] top-[20%] px-4 py-3 bg-slate-900/90 border border-white/[0.08] rounded-2xl backdrop-blur-md"
          >
            <div className="font-display text-2xl font-800 text-white"><CountUp end={98} suffix="%" /></div>
            <div className="text-xs text-slate-500 font-mono-custom tracking-wider mt-0.5">ACCURACY</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[8%] bottom-[20%] px-4 py-3 bg-slate-900/90 border border-white/[0.08] rounded-2xl backdrop-blur-md"
          >
            <div className="font-display text-2xl font-800 text-cyan-400"><CountUp end={100} suffix="+" /></div>
            <div className="text-xs text-slate-500 font-mono-custom tracking-wider mt-0.5">DAILY QUERIES</div>
          </motion.div>
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-24"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              onHoverStart={() => setHoveredFeature(i)}
              onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative p-6 bg-white/[0.025] border border-white/[0.07] rounded-2xl overflow-hidden cursor-default group transition-shadow ${hoveredFeature === i ? f.glow + " shadow-2xl" : ""}`}
            >
              {/* Animated background on hover */}
              <AnimatePresence>
                {hoveredFeature === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 bg-gradient-to-br opacity-[0.04]`}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10">
                {/* Label */}
                <div className="font-mono-custom text-[10px] tracking-[0.2em] text-slate-600 mb-4 flex items-center gap-2">
                  <span className={`w-4 h-px bg-gradient-to-r ${f.accent}`} />
                  {f.label}
                </div>

                {/* Icon */}
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${f.accent} mb-4 text-white shadow-lg`}>
                  {f.icon}
                </div>

                <h3 className="font-display text-xl font-800 text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{f.description}</p>

                {/* Stat */}
                <div className="flex items-end gap-2 pt-4 border-t border-white/[0.06]">
                  <span className={`font-display text-3xl font-800 bg-gradient-to-r ${f.accent} bg-clip-text text-transparent`}>
                    {f.stat}
                  </span>
                  <span className="font-mono-custom text-[11px] text-slate-600 tracking-wider pb-1">{f.statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM MARQUEE / TRUST BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-20 border-t border-white/[0.06] pt-8 overflow-hidden relative"
        >
          <div className="flex gap-12 items-center text-slate-700 font-mono-custom text-xs tracking-widest whitespace-nowrap animate-none" style={{ animation: "none" }}>
            {["GOOGLE GEMINI POWERED", "TAVILY LIVE SEARCH", "JWT SESSIONS", "BCRYPT SECURITY", "ZERO DATA LOGGING", "AGENTIC WORKFLOWS", "REAL-TIME DISCOVERY"].map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </main>

      {/*AUTH MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(2,6,23,0.8)" }}
          >
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsAuthModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md z-10"
            >
              {/* Glow behind modal */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-3xl blur-3xl -z-10 scale-110" />

              <div className="bg-slate-950/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
                {/* Modal Header Gradient Strip */}
                <div className={`h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600`} />

                <div className="p-8">
                  {/* Close */}
                  <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="absolute top-6 right-6 p-2 text-slate-600 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-8">
                    {(["register", "login"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAuthMode(mode)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === mode ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        {mode === "register" ? "Create account" : "Sign in"}
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-800 text-white mb-1">
                      {authMode === "login" ? "Welcome back" : "Join Promptly"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {authMode === "login" ? "Access your intelligence workspace." : "Command the live web in seconds."}
                    </p>
                  </div>

                  <form className="space-y-3" onSubmit={handleAuthSubmit}>
                    {/* UserID */}
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="User ID(Atleast 4 letters long)"
                        required
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] focus:border-cyan-500/50 focus:bg-cyan-500/[0.03] rounded-xl outline-none transition-all text-white placeholder:text-slate-700 text-sm font-mono-custom"
                      />
                    </div>

                    {/* Display Name (register only) */}
                    <AnimatePresence>
                      {authMode === "register" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="relative group pt-0.5">
                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                              type="text"
                              placeholder="Display name (optional)"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] focus:border-cyan-500/50 focus:bg-cyan-500/[0.03] rounded-xl outline-none transition-all text-white placeholder:text-slate-700 text-sm"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Password */}
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] focus:border-cyan-500/50 focus:bg-cyan-500/[0.03] rounded-xl outline-none transition-all text-white placeholder:text-slate-700 text-sm font-mono-custom"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isConnecting}
                      className="group relative w-full py-4 mt-2 text-white font-semibold rounded-xl overflow-hidden disabled:opacity-50 transition-opacity"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                      <div className="absolute inset-0 shimmer" />
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Initializing...</span>
                          </>
                        ) : authMode === "login" ? (
                          "Access workspace"
                        ) : (
                          "Launch workspace"
                        )}
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}