import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cake, PartyPopper, Sparkles, Music, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfettiCanvas } from "@/components/birthday/ConfettiCanvas";
import { FloatingBalloons } from "@/components/birthday/FloatingBalloons";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="gradient-bg relative flex min-h-screen items-center justify-center overflow-hidden">
      <ConfettiCanvas />
      <FloatingBalloons />

      {/* Glowing orbs in background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 mx-4 max-w-xl text-center"
      >
        {/* Animated cake icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 shadow-[0_0_40px_rgba(255,107,157,0.3)]"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Cake className="h-14 w-14 text-accent" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 font-display text-5xl font-extrabold leading-tight md:text-7xl"
        >
          <span className="text-gradient">Virtual Birthday</span>
          <br />
          <span className="text-gradient-gold">Celebration</span>
          <motion.span
            className="ml-2 inline-block"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎉
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mb-10 max-w-md text-lg font-medium text-muted-foreground"
        >
          Create a magical birthday experience with an interactive 3D cake,
          blow-out candles, and dazzling celebrations!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            size="lg"
            onClick={() => navigate("/create")}
            className="btn-glow group rounded-full bg-gradient-to-r from-primary to-secondary px-10 py-7 font-display text-xl font-bold shadow-2xl transition-all hover:scale-105"
          >
            <PartyPopper className="mr-3 h-6 w-6 transition-transform group-hover:rotate-12" />
            Create Birthday Cake
            <Sparkles className="ml-3 h-6 w-6 animate-pulse" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-14 flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: "🎂", label: "3D Cake", color: "from-primary/20 to-primary/5" },
            { icon: "🎤", label: "Blow Candles", color: "from-secondary/20 to-secondary/5" },
            { icon: "🔪", label: "Cut Cake", color: "from-accent/20 to-accent/5" },
            { icon: "🎆", label: "Fireworks", color: "from-sky/20 to-sky/5" },
          ].map((item) => (
            <motion.span
              key={item.label}
              whileHover={{ scale: 1.08, y: -2 }}
              className={`glass-card flex items-center gap-2 bg-gradient-to-br ${item.color} px-4 py-2 text-sm font-semibold text-foreground`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
