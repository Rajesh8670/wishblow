import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Home, PartyPopper, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBirthday } from "@/contexts/BirthdayContext";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

// Convert Google Drive link to direct image URL
const convertToDirectImageUrl = (url: string): string => {
  // Google Drive format: https://drive.google.com/uc?export=view&id=FILE_ID
  // or https://drive.google.com/file/d/FILE_ID/view
  if (url.includes("drive.google.com")) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
};

// Gentle nostalgic piano melody
const playNostalgicMelody = (): { stop: () => void } => {
  try {
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.1;
    masterGain.connect(ctx.destination);

    const convolver = ctx.createConvolver();
    const reverbLen = ctx.sampleRate * 2;
    const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuf.getChannelData(ch);
      for (let i = 0; i < reverbLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.6));
      }
    }
    convolver.buffer = reverbBuf;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.7;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;
    dryGain.connect(masterGain);
    convolver.connect(wetGain);
    wetGain.connect(masterGain);

    const notes: [number, number, number][] = [
      [523, 1.2, 0], [659, 1.0, 1.3], [587, 0.8, 2.4], [523, 1.5, 3.3],
      [440, 1.2, 5.0], [494, 0.8, 6.3], [523, 1.8, 7.2], [659, 1.0, 9.2],
      [784, 1.5, 10.3], [698, 1.0, 12.0], [659, 1.2, 13.1], [587, 0.8, 14.4],
      [523, 2.0, 15.3], [440, 1.0, 17.5], [523, 1.2, 18.6], [587, 0.8, 19.9],
      [659, 1.5, 20.8], [523, 1.0, 22.5], [494, 0.8, 23.6], [440, 2.0, 24.5],
    ];

    const oscillators: OscillatorNode[] = [];
    const startTime = ctx.currentTime + 0.2;

    for (const [freq, dur, delay] of notes) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = startTime + delay;
      noteGain.gain.setValueAtTime(0, t);
      noteGain.gain.linearRampToValueAtTime(0.4, t + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.15, t + dur * 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      osc.connect(noteGain);
      noteGain.connect(dryGain);
      noteGain.connect(convolver);
      osc.start(t);
      osc.stop(t + dur + 0.1);
      oscillators.push(osc);

      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.type = "sine";
      harm.frequency.value = freq / 2;
      harmGain.gain.setValueAtTime(0, t);
      harmGain.gain.linearRampToValueAtTime(0.1, t + 0.1);
      harmGain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      harm.connect(harmGain);
      harmGain.connect(dryGain);
      harm.start(t);
      harm.stop(t + dur + 0.1);
      oscillators.push(harm);
    }

    return {
      stop: () => {
        oscillators.forEach(o => { try { o.stop(); } catch {} });
        ctx.close();
      },
    };
  } catch {
    return { stop: () => {} };
  }
};

const MemoryCard = ({ src, index, total }: { src: string; index: number; total: number }) => {
  const rotation = (index % 2 === 0 ? 1 : -1) * (2 + (index * 0.8) % 4);
  const directUrl = convertToDirectImageUrl(src);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.7, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      transition={{ delay: 0.8 + index * 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
      className="relative"
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
        className="group relative mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-3 pb-12 shadow-[0_10px_50px_rgba(255,107,157,0.2),0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-500"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Sparkle decorations */}
        <motion.div
          className="absolute -top-2 -right-2 text-accent"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Star className="h-5 w-5 fill-accent" />
        </motion.div>
        
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
          <img
            src={directUrl}
            alt={`Memory ${index + 1}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Fallback to original URL if conversion fails
              if (img.src !== src) {
                img.src = src;
              }
            }}
          />
          {/* Beautiful overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
          
          {/* Floating hearts effect */}
          <motion.div
            className="absolute bottom-3 right-3"
            animate={{ y: [-5, 5, -5], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="h-6 w-6 fill-primary/80 text-primary drop-shadow-lg" />
          </motion.div>
        </div>
        
        {/* Beautiful tape effect */}
        <div className="absolute -top-2 left-1/2 h-8 w-16 -translate-x-1/2 rotate-[-2deg] rounded-sm bg-gradient-to-r from-accent/40 via-accent/30 to-accent/40 backdrop-blur-sm shadow-sm" />
        
        <p className="mt-3 text-center font-display text-sm font-bold text-foreground/60">
          Memory {index + 1} of {total} 💫
        </p>
      </motion.div>
    </motion.div>
  );
};

// Beautiful sparkle particles
const MagicalSparkles = () => (
  <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
    {Array.from({ length: 40 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${-5 + Math.random() * 105}%`,
          width: `${3 + Math.random() * 4}px`,
          height: `${3 + Math.random() * 4}px`,
          background: [
            "hsl(var(--primary))",
            "hsl(var(--accent))",
            "hsl(var(--secondary))",
            "hsl(45, 100%, 70%)",
            "hsl(180, 70%, 60%)",
          ][i % 5],
          boxShadow: `0 0 ${6 + Math.random() * 8}px currentColor`,
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, (Math.random() - 0.5) * 30, 0],
          opacity: [0, 0.9, 0],
          scale: [0.3, 1.4, 0.3],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const WishSenderSignature = ({
  senderName,
  relationshipTag,
}: {
  senderName?: string;
  relationshipTag?: string;
}) => {
  if (!senderName && !relationshipTag) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mt-5 flex justify-center"
    >
      <div className="relative overflow-hidden rounded-[1.4rem] border border-white/15 bg-gradient-to-r from-primary/18 via-white/8 to-accent/18 px-5 py-3 shadow-[0_14px_35px_rgba(255,107,157,0.18)] backdrop-blur-xl">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {relationshipTag && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent">
              {relationshipTag}
            </span>
          )}
          {senderName && (
            <span className="text-gradient font-display text-lg font-bold drop-shadow-[0_2px_14px_rgba(255,107,157,0.25)]">
              From {senderName}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WishRevealPage = () => {
  const navigate = useNavigate();
  const { data } = useBirthday();
  const musicRef = useRef<{ stop: () => void } | null>(null);
  const [showContent, setShowContent] = useState(false);
  const wishAudioPath = "/happy-birthday.webm";
  const wishVolume = 0.35;
  useBackgroundMusic(wishAudioPath, Boolean(data), wishVolume);

  useEffect(() => {
    if (!data) {
      navigate("/");
      return;
    }
    const timer = window.setTimeout(() => {
      if (!data.bgmUrl) {
        musicRef.current = playNostalgicMelody();
      }
    }, 600);
    const contentTimer = setTimeout(() => setShowContent(true), 300);

    return () => {
      window.clearTimeout(timer);
      clearTimeout(contentTimer);
      musicRef.current?.stop();
    };
  }, [data, navigate]);

  if (!data) return null;

  const memoryPhotos = data.memoryPhotos || [];
  const wishText = data.wishText || data.message;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[hsl(280,50%,8%)] via-[hsl(300,40%,12%)] to-[hsl(260,45%,8%)]">
      {/* Beautiful ambient glow */}
      <MagicalSparkles />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[180px]" />
        <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-accent/12 blur-[120px]" />
        <div className="absolute bottom-40 right-10 h-64 w-64 rounded-full bg-secondary/12 blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 h-48 w-48 rounded-full bg-[hsl(var(--gold))]/10 blur-[100px]" />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-20 mx-auto w-full max-w-md px-4 pb-16 pt-12"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-10 text-center"
            >
              <motion.div 
                className="mb-4 flex items-center justify-center gap-3"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-accent drop-shadow-[0_0_8px_hsl(var(--accent))]" />
                <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-sm font-extrabold uppercase tracking-[0.25em] text-transparent">
                  A Special Wish For You
                </span>
                <Sparkles className="h-5 w-5 text-accent drop-shadow-[0_0_8px_hsl(var(--accent))]" />
              </motion.div>

              {/* Profile photo with rainbow ring */}
              {data.photoUrl && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 120 }}
                  className="mx-auto mb-8 flex justify-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full md:h-28 md:w-28">
                    {/* Rainbow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "conic-gradient(from 0deg, hsl(330 85% 60%), hsl(45 100% 65%), hsl(270 60% 65%), hsl(180 70% 55%), hsl(330 85% 60%))",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Inner background ring */}
                    <div className="absolute inset-[3px] rounded-full bg-[hsl(280,50%,8%)]" />
                    {/* Photo */}
                    <img 
                      src={convertToDirectImageUrl(data.photoUrl)} 
                      alt={data.name}
                      className="absolute inset-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full object-cover shadow-[0_0_40px_rgba(255,107,157,0.4)]"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Floating stars positioned outside the photo container */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        top: `${-8 + Math.sin(i * 1.57) * 24}px`,
                        left: `calc(50% + ${Math.cos(i * 1.57) * 90}px)`,
                      }}
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                    >
                      <Star className="h-4 w-4 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <h1 className="text-gradient font-display text-5xl font-extrabold drop-shadow-[0_2px_20px_rgba(255,107,157,0.3)]">
                Happy Birthday
              </h1>
              <motion.p 
                className="mt-2 font-display text-4xl font-extrabold text-accent drop-shadow-[0_2px_15px_hsl(var(--accent)/0.4)]"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {data.name}! 🎂
              </motion.p>
              <p className="mt-3 text-xl font-bold text-primary/90">
                Turning {data.age} today! <motion.span className="inline-block" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>🎉</motion.span>
              </p>
              <WishSenderSignature senderName={data.senderName} relationshipTag={data.relationshipTag} />
            </motion.div>

            {/* Beautiful Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mx-auto mb-10 h-1 w-3/4 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />

            {/* Memory Photos */}
            {memoryPhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6 text-center"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-2 font-display text-lg font-bold text-foreground/80 backdrop-blur-sm">
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                    Our Beautiful Memories
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </span>
                </motion.div>

                <div className={`grid gap-6 ${
                  memoryPhotos.length === 1 ? "grid-cols-1 max-w-[300px] mx-auto" :
                  "grid-cols-2"
                }`}>
                  {memoryPhotos.map((photo, i) => (
                    <MemoryCard key={i} src={photo} index={i} total={memoryPhotos.length} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Beautiful Wish Text Card */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2 + memoryPhotos.length * 0.2, duration: 0.8, type: "spring" }}
              className="relative mb-12"
            >
              {/* Soft glow */}
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl" />
              
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-br from-[hsl(280,60%,15%)] via-[hsl(300,50%,12%)] to-[hsl(320,50%,14%)] shadow-[0_20px_80px_rgba(255,107,157,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)]">
                {/* Top decorative gradient bar */}
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                
                {/* Corner decorations */}
                <div className="absolute left-4 top-6 text-2xl opacity-30">✦</div>
                <div className="absolute right-4 top-6 text-2xl opacity-30">✦</div>
                
                <div className="px-8 pb-8 pt-6 text-center">
                  {/* Quote marks */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    transition={{ delay: 1.4 + memoryPhotos.length * 0.2 }}
                    className="font-display text-6xl leading-none text-primary/40"
                  >
                    "
                  </motion.div>
                  
                  {/* Wish text with golden gradient */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + memoryPhotos.length * 0.2 }}
                    className="font-display text-xl leading-relaxed sm:text-2xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(45 100% 72%), hsl(35 100% 65%), hsl(50 100% 78%), hsl(40 90% 60%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "none",
                      filter: "drop-shadow(0 2px 8px rgba(255,200,50,0.3))",
                    }}
                  >
                    {wishText}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    transition={{ delay: 1.6 + memoryPhotos.length * 0.2 }}
                    className="font-display text-6xl leading-none text-primary/40"
                  >
                    "
                  </motion.div>

                  {/* Decorative heart divider */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="my-4"
                  >
                    <Heart className="mx-auto h-8 w-8 fill-primary/60 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                  </motion.div>
                  {(data.senderName || data.relationshipTag) && (
                    <p className="mb-4 text-sm font-semibold tracking-[0.12em] text-foreground/65">
                      {data.relationshipTag ? `${data.relationshipTag} ` : ""}
                      {data.senderName ? `From ${data.senderName}` : ""}
                    </p>
                  )}
                  
                  {/* Emojis */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 + memoryPhotos.length * 0.2 }}
                    className="flex justify-center gap-4 text-3xl"
                  >
                    {["💖", "🎂", "🥳", "✨", "🎁"].map((e, i) => (
                      <motion.span
                        key={i}
                        className="drop-shadow-lg"
                        animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity }}
                      >
                        {e}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                
                {/* Bottom decorative gradient bar */}
                <div className="h-2 bg-gradient-to-r from-secondary via-accent to-primary" />
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="rounded-full border-primary/40 bg-primary/15 px-6 font-bold text-foreground hover:bg-primary/25 backdrop-blur-sm"
                >
                  <Home className="mr-2 h-4 w-4" /> Home
                </Button>
                <Button
                  onClick={() => navigate("/create")}
                  className="btn-glow rounded-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] px-6 font-bold shadow-xl animate-[gradient-shift_3s_ease-in-out_infinite]"
                >
                  <PartyPopper className="mr-2 h-4 w-4" /> Create My Own
                </Button>
              </div>
              <p className="text-xs text-foreground/40">Made with 💖</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishRevealPage;
