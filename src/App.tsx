import { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Lightbulb,
  Mic,
  Star,
  Settings,
  ChevronRight,
  Hammer,
  Users,
  CheckCircle2,
  Undo2,
  Layers
} from "lucide-react";

// Structure definitions
interface Member {
  name: string;
  role: string;
  badge: string;
  color: string;
  bgGlow: string;
  photo: string;
}

interface Subdivision {
  id: number;
  name: string;
  englishTitle: string;
  icon: "creative" | "talent" | "technical";
  color: string; // Tailwind tint color e.g., 'red', 'amber', 'emerald'
  primaryClass: string; // text/border coloring rules
  glowClass: string;
  bgGradient: string;
  description: string;
  members: Member[];
}

const SUBDIVISIONS_DATA: Subdivision[] = [
  {
    id: 1,
    name: "Konseptor",
    englishTitle: "The Creative Architects",
    icon: "creative",
    color: "amber",
    primaryClass: "text-mario-yellow border-mario-yellow/30",
    glowClass: "shadow-[0_0_30px_rgba(253,184,19,0.25)] border-mario-yellow/40 hover:border-mario-yellow/70",
    bgGradient: "from-mario-yellow/10 to-transparent",
    description: "Merancang ide, tema, dan identitas acara sejak tahap awal. Menyusun arah cerita serta pengalaman yang ingin dibangun agar setiap kegiatan memiliki makna dan karakter yang kuat.",
    members: [
      { name: "Liora", role: "Esther Liora Bara", badge: "1", color: "text-mario-yellow", bgGlow: "bg-mario-yellow/5 border-mario-yellow/20", photo: "/photos/liora.jpg" },
      { name: "Nanay", role: "Nayla Novianti", badge: "2", color: "text-amber-300", bgGlow: "bg-amber-400/5 border-amber-500/20", photo: "/photos/nanay.jpg" },
      { name: "Siti", role: "Siti Nurhalimah", badge: "3", color: "text-yellow-300", bgGlow: "bg-yellow-400/5 border-yellow-500/20", photo: "/photos/siti.jpg" },
    ],
  },
  {
    id: 2,
    name: "Talent Management",
    englishTitle: "The Stage Conduits",
    icon: "talent",
    color: "red",
    primaryClass: "text-mario-red border-mario-red/30",
    glowClass: "shadow-[0_0_30px_rgba(230,36,41,0.25)] border-mario-red/40 hover:border-mario-red/70",
    bgGradient: "from-mario-red/10 to-transparent",
    description: "Mengelola performer dan kebutuhan panggung dengan koordinasi yang terarah. Menjaga komunikasi, ritme penampilan, dan kenyamanan agar seluruh talent dapat tampil maksimal.",
    members: [
      { name: "Radha", role: "Radha Falisha Khairina", badge: "1", color: "text-mario-red", bgGlow: "bg-mario-red/5 border-mario-red/20", photo: "/photos/radha.jpg" },
      { name: "Naima", role: "Naima Sahitya Andini", badge: "2", color: "text-rose-300", bgGlow: "bg-rose-400/5 border-rose-500/20", photo: "/photos/naima.jpg" },
      { name: "Dara", role: "Darasadiah Isnaini Salsabila", badge: "3", color: "text-orange-300", bgGlow: "bg-rose-400/5 border-rose-500/20", photo: "/photos/dara.jpg" },
    ],
  },
  {
    id: 3,
    name: "Teknis",
    englishTitle: "Flow Management",
    icon: "technical",
    color: "emerald",
    primaryClass: "text-mario-blue border-mario-blue/30",
    glowClass: "shadow-[0_0_30px_rgba(0,85,164,0.25)] border-mario-blue/40 hover:border-mario-blue/70",
    bgGradient: "from-mario-blue/10 to-transparent",
    description: "Mengawal sistem dan jalannya eksekusi di balik layar. Memastikan aspek teknis, alur operasional, dan kebutuhan lapangan berjalan presisi serta selaras dengan rancangan acara.",
    members: [
      { name: "Kaura", role: "Anandigita Khauralya Putri", badge: "1", color: "text-mario-blue", bgGlow: "bg-mario-blue/5 border-mario-blue/20", photo: "/photos/kaura.jpg" },
      { name: "Aldan", role: "Raden Muhammad Rizky Aldani", badge: "2", color: "text-sky-300", bgGlow: "bg-sky-400/5 border-sky-500/20", photo: "/photos/aldan.jpg" },
      { name: "Nayya", role: "Nayyara Varda Wistan", badge: "3", color: "text-blue-300", bgGlow: "bg-blue-400/5 border-blue-500/20", photo: "/photos/nayya.jpg" },
    ],
  },
];

export default function App() {
  // Navigation & Reveal state
  // 0: Hero Intro
  // 1: Prologue Teaser
  // 2: Interactive Subdivision Reveal
  // 3: Finale Hall of Fame
  const [scene, setScene] = useState<number>(0);
  const [revealedSubs, setRevealedSubs] = useState<number[]>([]);
  const [activeRevealingSubId, setActiveRevealingSubId] = useState<number | null>(null);
  const [memberPhotos, setMemberPhotos] = useState<{ [key: string]: string }>({});

  // Member cascading reveal trackers (how many members currently shown for each subdivision)
  const [revealedMemberCounts, setRevealedMemberCounts] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
  });

  // Sound configuration
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize audio helper
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Synthesize sound effects using Web Audio API
  const playSoundEffect = (type: "coin" | "jump" | "powerup" | "stamp" | "victory") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (type === "coin") {
        // High pitched lovely mario coin noise
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        osc2.frequency.setValueAtTime(987.77 * 2, now); // Harmonious octave
        osc2.frequency.setValueAtTime(1318.51 * 2, now + 0.08);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.42);
        osc2.stop(now + 0.42);
      } else if (type === "jump") {
        // Frequency sweep upwards
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.25);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === "powerup") {
        // Retro rapid arpeggio upward
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.07);

          gainNode.gain.setValueAtTime(0.08, now + index * 0.07);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.15);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + index * 0.07);
          osc.stop(now + index * 0.07 + 0.16);
        });
      } else if (type === "stamp") {
        // Heavy punchy thud noise
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.15);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "victory") {
        // Triumph gaming ditty
        const melody = [
          { f: 523.25, d: 0.1 }, // C5
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.1 },
          { f: 523.25, d: 0.2 },
          { f: 415.30, d: 0.2 }, // Ab4
          { f: 466.16, d: 0.2 }, // Bb4
          { f: 523.25, d: 0.4 }, // C5
        ];
        let currentStart = now;
        melody.forEach((note) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(note.f, currentStart);

          gainNode.gain.setValueAtTime(0.12, currentStart);
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentStart + note.d);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(currentStart);
          osc.stop(currentStart + note.d + 0.05);

          currentStart += note.d * 1.1;
        });
      }
    } catch (e) {
      console.warn("Sound generation block or error: ", e);
    }
  };

  // Automatically cycle member reveal once a subdivision is unlocked
  const triggerMembersSequentialReveal = (subId: number) => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedMemberCounts(prev => ({
        ...prev,
        [subId]: count
      }));
      playSoundEffect("coin");

      if (count >= 3) {
        clearInterval(interval);
      }
    }, 850);
  };

  // Handles clicking a locked subdivision block in Stage 2
  const handleRevealBlock = (subId: number) => {
    // Must reveal in order (Konseptor (1) -> Talent (2) -> Teknis (3))
    if (subId !== revealedSubs.length + 1) {
      playSoundEffect("stamp");
      return;
    }

    playSoundEffect("jump");
    setActiveRevealingSubId(subId);

    // After animation block delay, flip card
    setTimeout(() => {
      playSoundEffect("powerup");
      setRevealedSubs(prev => [...prev, subId]);
      setActiveRevealingSubId(null);
      // Wait another beat, then unfold members sequentially
      setTimeout(() => {
        triggerMembersSequentialReveal(subId);
      }, 300);
    }, 600);
  };

  // Next level sequence switcher
  const handleNextStage = () => {
    playSoundEffect("powerup");
    setScene(prev => prev + 1);
  };

  // Quick reset to play again
  const handleReset = () => {
    playSoundEffect("jump");
    setScene(0);
    setRevealedSubs([]);
    setActiveRevealingSubId(null);
    setRevealedMemberCounts({ 1: 0, 2: 0, 3: 0 });
  };
  const handlePhotoUpload = (
    memberName: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      playSoundEffect("coin");

      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setMemberPhotos((prev) => ({
            ...prev,
            [memberName]: reader.result,
          }));
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (memberName: string) => {
    playSoundEffect("stamp");

    setMemberPhotos((prev) => {
      const copy = { ...prev };
      delete copy[memberName];
      return copy;
    });
  };
  return (
    <div
      className="relative min-h-screen text-zinc-100 overflow-x-hidden font-sans flex flex-col justify-between selection:bg-mario-red selection:text-white"
      style={{
        background: "radial-gradient(circle at top right, rgba(230, 36, 41, 0.18), transparent), radial-gradient(circle at bottom left, rgba(0, 85, 164, 0.18), transparent)",
        backgroundColor: "#0F172A"
      }}
    >

      {/* Absolute Pixel Star/Cloud background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {/* Floating Clouds */}
        <div className="absolute w-24 h-8 bg-zinc-700/30 rounded-full blur-sm top-16 left-[10%] animate-float-gentle" style={{ animationDelay: "0.2s" }} />
        <div className="absolute w-32 h-10 bg-zinc-700/30 rounded-full blur-sm top-32 right-[20%] animate-float-gentle" style={{ animationDelay: "1.5s" }} />
        <div className="absolute w-20 h-6 bg-zinc-700/30 rounded-full blur-sm bottom-48 left-[25%] animate-float-gentle" style={{ animationDelay: "2.5s" }} />

        {/* Floating Sparkling Stars */}
        <div className="absolute top-12 left-1/3 text-amber-400 p-2 animate-bounce" style={{ animationDuration: "5s" }}>✦</div>
        <div className="absolute top-48 right-[15%] text-rose-500 p-2 animate-bounce" style={{ animationDuration: "7s" }}>✦</div>
        <div className="absolute bottom-24 left-[10%] text-sky-400 p-2 animate-bounce" style={{ animationDuration: "6s" }}>✦</div>
        <div className="absolute bottom-1/3 right-[30%] text-emerald-400 p-2 animate-bounce" style={{ animationDuration: "4s" }}>✦</div>
      </div>

      {/* Header controls (Persistent sound switch & elegant brand tag) */}
      <header className="relative z-50 px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-game text-white text-xs shadow-md border border-red-500 animate-pulse">
            S
          </div>
          <div>
            <span className="font-display font-bold tracking-tight text-white block text-sm">SPECTRA ACARA</span>

          </div>
        </div>

        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) {
              setTimeout(() => playSoundEffect("coin"), 100);
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider border transition-all duration-300 ${soundEnabled
            ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
          id="audio-toggle-btn"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4.5 h-4.5 text-amber-400 animate-bounce" />
              <span>SOUNDS ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4.5 h-4.5 text-zinc-500" />
              <span>MUTED</span>
            </>
          )}
        </button>
      </header>

      {/* Main Experience Arena */}
      <main className="relative flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-10">
        <AnimatePresence mode="wait">

          {/* SCENE 0: Hero Entrance / Press Start */}
          {scene === 0 && (
            <motion.div
              key="scene0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl text-center flex flex-col items-center"
            >
              {/* Spinning Retro Coin Logo */}
              <div className="relative mb-8 group cursor-pointer" onClick={() => playSoundEffect("coin")}>
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 border-[6px] border-amber-200 flex items-center justify-center shadow-lg transform transition-transform hover:scale-115 active:scale-95 animate-coin">
                  <div className="w-10 h-10 border-4 border-amber-600/30 rounded-full flex items-center justify-center">
                    <span className="font-game text-amber-900 text-2xl font-bold">$</span>
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <h1 className="font-display font-black tracking-tighter text-6xl md:text-8xl text-white uppercase select-none text-center leading-[0.9]">
                DIVISI ACARA
                <span className="block text-mario-red font-black font-display mt-2 drop-shadow-[0_4px_12px_rgba(230,36,41,0.3)]">
                  SPECTRA
                </span>
              </h1>

              <p className="font-display font-light text-xl md:text-2xl text-mario-yellow tracking-[8px] uppercase text-center mt-6">
                Subdivision Reveal
              </p>

              {/* Styled Interactive Instructions */}


              {/* Gaming styled beveled button */}
              <div className="mt-14 relative group">
                <button
                  onClick={handleNextStage}
                  className="px-10 py-5 text-white font-display font-black tracking-[2px] text-lg rounded-md transition-all duration-100 cursor-pointer flex items-center gap-3 select-none active:translate-y-[4px]"
                  style={{
                    backgroundColor: "#E62429",
                    boxShadow: "0 10px 0 #8B0000",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 0 #8B0000";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = "0 10px 0 #8B0000";
                  }}
                  id="start-reveal-btn"
                >
                  <Play className="w-5 h-5 fill-current text-white animate-pulse" />
                  <span>START REVEAL</span>
                </button>
              </div>

              {/* Gaming Footer Aesthetic Tags */}
              <div className="mt-14 flex gap-6 text-zinc-500 font-mono text-[10px] tracking-wider select-none">
                <span>SELECT SUB-OFFICE</span>
                <span>•</span>
                <span>ACARA SPECTRA 2026</span>
              </div>
            </motion.div>
          )}

          {/* SCENE 1: Teaser Slogan screen */}
          {scene === 1 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-center flex flex-col items-center py-6"
            >
              {/* Spinning Retro Star */}
              <div className="w-16 h-16 mb-8 text-amber-400 flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
                <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
              </div>

              {/* Glowing Ambient Box */}
              <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden max-w-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <h2 className="font-display text-2xl md:text-4xl font-light italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300 tracking-wide leading-relaxed">
                  "Pepatah Mengatakan: Kadiv Keren Maka Anaknya Juga Keren"
                </h2>

                <div className="w-14 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 mx-auto mt-6 rounded-full opacity-60" />
              </div>

              <div className="mt-12">
                <button
                  onClick={handleNextStage}
                  className="px-6 py-3.5 bg-zinc-950/40 hover:bg-white/5 hover:text-white border border-zinc-800 text-zinc-300 font-display font-medium rounded-2xl tracking-wide transition-all duration-300 flex items-center gap-3 cursor-pointer select-none text-sm group"
                  id="prolog-next-btn"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCENE 2: The Core Subdivision Reveal Stage */}
          {scene === 2 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl flex flex-col items-center"
            >
              {/* Stepper Progress Map */}
              <div className="w-full max-w-xl h-2.5 bg-zinc-900 border border-white/5 rounded-full mb-10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${(revealedSubs.length / 3) * 100}%` }}
                />
              </div>

              <div className="mb-10 text-center">
                <h2 className="font-display font-bold text-xs md:text-sm text-mario-yellow uppercase tracking-[4px] mb-2 font-black">
                  THE ARCHITECTS OF EXPERIENCE
                </h2>
                <h1 className="font-display font-black text-4xl md:text-5xl text-white tracking-tighter leading-tight uppercase">
                  SUB DIVISION REVEAL
                </h1>
                <p className="text-zinc-400 font-sans text-xs md:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                  Ketuk kotak bertanda <span className="text-mario-yellow font-bold">?</span> di bawah sesuai urutan kelap-kelip untuk memanggil tim Spectra!
                </p>
              </div>

              {/* The Mystery Box / Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-2">
                {SUBDIVISIONS_DATA.map((sub, index) => {
                  const isRevealed = revealedSubs.includes(sub.id);
                  const isInteractive = sub.id === revealedSubs.length + 1;
                  const isLocked = sub.id > revealedSubs.length + 1;
                  const isHovered = activeRevealingSubId === sub.id;

                  return (
                    <div key={sub.id} className="relative min-h-[460px] flex flex-col">
                      <AnimatePresence mode="wait">

                        {/* UNREVEALED / MYSTERY BOX STATE */}
                        {!isRevealed ? (
                          <motion.div
                            key="mystery"
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{
                              scale: 1,
                              opacity: isLocked ? 0.45 : 1,
                              y: isInteractive ? [0, -10, 0] : 0
                            }}
                            transition={{
                              y: {
                                repeat: Infinity,
                                duration: 2.22,
                                ease: "easeInOut",
                              },
                              scale: { duration: 0.3 }
                            }}
                            exit={{ scale: 0.92, opacity: 0, rotateY: 90 }}
                            className={`flex-grow flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed bg-black/30 backdrop-blur-sm shadow-xl transition-all duration-300 relative ${isInteractive
                              ? "border-amber-500/50 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.12)] bg-amber-500/[0.02]"
                              : isLocked
                                ? "border-zinc-800 cursor-not-allowed text-zinc-600"
                                : "border-zinc-700"
                              }`}
                            onClick={() => isInteractive && handleRevealBlock(sub.id)}
                            id={`mystery-box-${sub.id}`}
                          >
                            {/* Question box visual overlay */}
                            <div className="absolute inset-x-0 bottom-4 text-center">
                              <span className="font-mono text-[9px] text-zinc-500 tracking-wider">
                                {sub.name.toUpperCase()}
                              </span>
                            </div>

                            {/* Retro platform elements for active blocks */}
                            {isInteractive && (
                              <div className="absolute top-4 right-4 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                                <span className="text-[10px] font-mono text-amber-400/80 tracking-widest font-bold">READY</span>
                              </div>
                            )}

                            {/* The ? Box Centerpiece */}
                            <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transform transition-all duration-300 relative ${isInteractive
                              ? "bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-300 shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-0"
                              : "bg-zinc-900 border-4 border-zinc-800 text-zinc-700"
                              } ${isHovered ? "animate-bounce-block" : ""}`}>

                              <span className={`font-display text-4xl font-extrabold ${isInteractive ? "text-amber-950 font-game drop-shadow-md text-3xl" : "text-zinc-700"
                                }`}>?</span>

                              {/* Tiny dots in corners of Nintendo blocks */}
                              <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black/20 rounded-full" />
                              <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black/20 rounded-full" />
                              <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-black/20 rounded-full" />
                              <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-black/20 rounded-full" />
                            </div>

                            <p className={`mt-8 text-center text-xs font-mono max-w-[190px] ${isInteractive ? "text-amber-300/85 animate-pulse" : "text-zinc-600"
                              }`}>
                              {isInteractive
                                ? "Click Block to Reveal!"
                                : isLocked
                                  ? "Locked (Wait turn)"
                                  : "Completed"}
                            </p>
                          </motion.div>
                        ) : (

                          // REVEALED CARD STATE (PREMIUM MODERN SLATE CARD)
                          <motion.div
                            key="revealed"
                            initial={{ opacity: 0, rotateY: -90, scale: 0.9 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                            className={`flex-grow flex flex-col rounded-3xl border p-6 bg-zinc-900/95 backdrop-blur-md shadow-2xl relative overflow-hidden pt-8 ${sub.glowClass}`}
                            id={`revealed-card-${sub.id}`}
                          >
                            {/* Accent Top Line from Bold Typography specifications */}
                            <div className={`absolute top-0 inset-x-0 h-1.5 w-full ${sub.id === 1 ? "bg-mario-yellow" :
                              sub.id === 2 ? "bg-mario-red" :
                                "bg-mario-blue"
                              }`} />

                            {/* Inner ambient glow background */}
                            <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${sub.bgGradient} rounded-full blur-2xl pointer-events-none`} />

                            {/* Header details */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                {/* Theme dependent custom status light */}
                                <div className={`w-2.5 h-2.5 rounded-full ${sub.color === "amber" ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" :
                                  sub.color === "red" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                                    "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                                  }`} />
                                <span className={`text-[12px] font-mono tracking-widest font-semibold ${sub.primaryClass} uppercase`}>
                                  DIVISI ACARA
                                </span>
                              </div>

                              {/* Division Icons */}
                              <div className={`p-2.5 rounded-xl border ${sub.primaryClass} bg-white/5 backdrop-blur-lg`}>
                                {sub.icon === "creative" && <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />}
                                {sub.icon === "talent" && <Mic className="w-5 h-5 text-red-400" />}
                                {sub.icon === "technical" && <Settings className="w-5 h-5 text-emerald-400" />}
                              </div>
                            </div>

                            {/* Titles */}
                            <div>
                              <h3 className="font-display font-black text-3xl text-white tracking-tight leading-none uppercase">
                                {sub.name}
                              </h3>
                              <p className="font-mono text-[10px] text-zinc-500 tracking-wider uppercase mt-1">
                                {sub.englishTitle}
                              </p>
                            </div>

                            {/* Divider */}
                            <div className="w-12 h-1 bg-zinc-800 my-4 rounded-full" />

                            {/* Description text */}
                            <p className="text-zinc-400 text-xs tracking-wide leading-relaxed mb-6 font-sans">
                              {sub.description}
                            </p>

                            {/* Crew/Members Reveal list */}
                            <div className="mt-auto space-y-3">
                              <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-widest mb-1">
                                Para Orang - Orang Keren:
                              </span>

                              {sub.members.map((member, mIdx) => {
                                const isMemberShown = revealedMemberCounts[sub.id] > mIdx;

                                return (
                                  <div key={member.name} className="h-14">
                                    <AnimatePresence>
                                      {isMemberShown && (
                                        <motion.div
                                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                          animate={{ opacity: 1, x: 0, scale: 1 }}
                                          transition={{ duration: 0.4, type: "spring" }}
                                          className={`flex items-center justify-between p-3.5 rounded-2xl border bg-black/20 backdrop-blur-sm transition-all hover:translate-x-1.5 duration-250 ${member.bgGlow}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Beautiful abstract coin avatar */}
                                            <div className={`w-7 h-7 rounded-lg border-2 border-white/10 flex items-center justify-center font-mono text-xs font-semibold ${member.color}`}>
                                              {member.name[0]}
                                            </div>
                                            <div>
                                              <span className="font-display font-extrabold text-white block text-sm tracking-wide">
                                                {member.name}
                                              </span>
                                              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block -mt-0.5">
                                                {member.role}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Custom retro graphic badge marker */}
                                          <div className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-mono tracking-wide text-zinc-400">
                                            {member.badge}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Persistent Bottom helper navigation or CTA block */}
              <div className="mt-14 w-full max-w-xl flex flex-col items-center">

                {/* Next Unlocks hints container */}
                {revealedSubs.length === 0 && (
                  <button
                    onClick={() => handleRevealBlock(1)}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-display font-black tracking-wider rounded-2xl cursor-all-scroll shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                    id="trigger-sub1-btn"
                  >
                    <Lightbulb className="w-5 h-5 fill-current animate-bounce" />
                    <span>KETUK & REVEAL SUB DIVISI KAMU</span>
                  </button>
                )}

                {revealedSubs.length === 1 && revealedMemberCounts[1] >= 3 && (
                  <button
                    onClick={() => handleRevealBlock(2)}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-display font-black tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                    id="trigger-sub2-btn"
                  >
                    <Mic className="w-5 h-5 fill-current" />
                    <span>KETUK & REVEAL SUB DIVISI KAMU</span>
                  </button>
                )}

                {revealedSubs.length === 2 && revealedMemberCounts[2] >= 3 && (
                  <button
                    onClick={() => handleRevealBlock(3)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                    id="trigger-sub3-btn"
                  >
                    <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
                    <span>KETUK & REVEAL SUB DIVISI KAMU</span>
                  </button>
                )}

                {/* Finalized Experience stage switcher */}
                {revealedSubs.length === 3 && revealedMemberCounts[3] >= 3 && (
                  <div className="relative group w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-rose-500 to-sky-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
                    <button
                      onClick={() => {
                        playSoundEffect("victory");
                        handleNextStage();
                      }}
                      className="relative w-full py-4.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-display font-black tracking-widest rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-transform hover:scale-103 active:scale-97 cursor-all-scroll uppercase text-base"
                      id="finalize-reveal-btn"
                    >
                      <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
                      <span>FINALIZE THE EXPERIENCE</span>
                    </button>
                  </div>
                )}

                {/* Manual Skip options in case user gets grid stuck */}
                {revealedSubs.length > 0 && revealedSubs.length < 3 && (
                  <div className="mt-4 flex gap-1 items-center">
                    <span className="text-[10px] font-mono text-zinc-500">Wait for member countdown</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCENE 3: The Grand Finale Showcase! */}
          {scene === 3 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-6xl flex flex-col items-center py-4"
            >
              {/* Rain Star Emitters overlaying showcase header */}
              <div className="text-center mb-10 flex flex-col items-center">
                <div className="relative mb-5" onClick={() => playSoundEffect("victory")}>
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur opacity-25 animate-ping" />
                  <div className="relative w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl">
                    <Star className="w-8 h-8 fill-current text-yellow-400 animate-spin" style={{ animationDuration: "15s" }} />
                  </div>
                </div>

                <p className="font-game text-amber-400 text-[10px] md:text-xs tracking-widest uppercase animate-pulse mb-3">
                  ✦ Mission Assembled ✦
                </p>

                <h2 className="font-display font-black text-4xl md:text-6xl text-white uppercase tracking-tight leading-none text-center">
                  TOGETHER, WE CREATE
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400">
                    THE EXPERIENCE.
                  </span>
                </h2>

                <p className="font-sans font-light text-zinc-400 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                  Tim Divisi Acara Spectra 2026 telah bersatu padu! Dari gila ide konseptor, keserasian tata panggung talent, hingga baja ketangguhan teknisi di balik tirai. Siap mengguncang cakrawala kreativitas bersama.
                </p>
              </div>

              {/* Complete board of all subdivisions, presented proudly side-by-side! */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
                {SUBDIVISIONS_DATA.map((sub) => (
                  <div
                    key={sub.id}
                    className={`relative p-5 pt-8 rounded-2xl border bg-zinc-950/45 backdrop-blur-sm border-white/5 transition-transform hover:-translate-y-2 duration-300 overflow-hidden ${sub.glowClass}`}
                  >
                    <div
                      className={`absolute top-0 inset-x-0 h-1.5 w-full ${sub.id === 1
                        ? "bg-mario-yellow"
                        : sub.id === 2
                          ? "bg-mario-red"
                          : "bg-mario-blue"
                        }`}
                    />

                    <div className="flex justify-between items-center mb-3">
                      <span
                        className={`text-[10px] font-mono font-bold tracking-widest ${sub.primaryClass} uppercase`}
                      >
                        {sub.name}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">
                      {sub.description}
                    </p>

                    <div className="grid grid-cols-1 gap-5 mt-5">
                      {sub.members.map((member) => (
                        <div
                          key={member.name}
                          className="relative rounded-2xl bg-zinc-900/80 border border-white/10 p-3 overflow-hidden"
                        >
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/5 relative">
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onError={() => console.log("FAILED:", member.photo)}
                              onLoad={() => console.log("LOADED:", member.photo)}
                            />
                          </div>

                          <div className="mt-3 text-center">
                            <h4 className="font-display font-black text-sm text-white">
                              {member.name}
                            </h4>

                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action options */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-display font-medium text-xs rounded-xl tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
                  id="reset-experience-btn"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-400" />
                  <span>REPLAY EXPERIENCE</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Styled bottom game platform/fender visual (Professional retro layout decoration) */}
      <footer className="relative z-10 px-6 py-6 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row gap-4 justify-between items-center text-zinc-500 font-mono text-[10px] tracking-widest text-center sm:text-left select-none">
        <div className="flex items-center gap-2">

        </div>
        <div className="flex gap-4">

        </div>
      </footer>
    </div >
  );
}
