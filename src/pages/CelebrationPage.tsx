import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wind, Scissors, Volume2, VolumeX, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBirthday } from "@/contexts/BirthdayContext";
import { BirthdayCake3D } from "@/components/birthday/BirthdayCake3D";
import { ConfettiCanvas } from "@/components/birthday/ConfettiCanvas";
import { FloatingBalloons } from "@/components/birthday/FloatingBalloons";
import { FireworksCanvas } from "@/components/birthday/FireworksCanvas";
import { useMicrophone } from "@/hooks/useMicrophone";
import { decodeBirthdayData } from "@/lib/shareUtils";

type Phase = "candles" | "blow" | "cut" | "celebration";

const playBirthdayMelody = (): { stop: () => void } => {
  try {
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;
    gainNode.connect(ctx.destination);

    const melody: [number, number][] = [
      [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [349, 0.6], [330, 1.0],
      [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [392, 0.6], [349, 1.0],
      [262, 0.3], [262, 0.3], [523, 0.6], [440, 0.6], [349, 0.6], [330, 0.6], [294, 1.0],
      [466, 0.3], [466, 0.3], [440, 0.6], [349, 0.6], [392, 0.6], [349, 1.0],
    ];

    let time = ctx.currentTime + 0.1;
    const oscillators: OscillatorNode[] = [];

    for (const [freq, dur] of melody) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      noteGain.gain.setValueAtTime(0, time);
      noteGain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, time + dur - 0.05);
      osc.connect(noteGain);
      noteGain.connect(gainNode);
      osc.start(time);
      osc.stop(time + dur);
      oscillators.push(osc);
      time += dur;
    }

    return {
      stop: () => {
        oscillators.forEach((o) => { try { o.stop(); } catch {} });
        ctx.close();
      },
    };
  } catch {
    return { stop: () => {} };
  }
};

const CelebrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, setData } = useBirthday();
  const [phase, setPhase] = useState<Phase>("candles");
  const [candlesLit, setCandlesLit] = useState(true);
  const [flickering, setFlickering] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showKnife, setShowKnife] = useState(false);
  const [cakeCut, setCakeCut] = useState(false);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const bgMusicRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!data) {
      const hashEncoded = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("d");
      const queryEncoded = searchParams.get("d");
      const encoded = hashEncoded || queryEncoded;

      if (encoded) {
        const decoded = decodeBirthdayData(encoded);
        if (decoded) {
          setData({
            name: decoded.name,
            age: decoded.age,
            message: decoded.message,
            photoUrl: decoded.photoUrl,
            memoryPhotos: decoded.memoryPhotos || [],
            wishText: decoded.wishText || decoded.message,
            audioUrl: null,
            bgmUrl: decoded.bgmUrl || null,
          });
          return;
        }
      }
      navigate("/");
    }
  }, [data, searchParams, setData, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data?.bgmUrl) {
        const audio = new Audio(data.bgmUrl);
        audio.loop = true;
        audio.volume = 0.3;
        audio.play().catch(() => {});
        bgMusicRef.current = { stop: () => { audio.pause(); audio.src = ""; } };
      } else {
        bgMusicRef.current = playBirthdayMelody();
      }
      setBgMusicPlaying(true);
    }, 500);
    return () => {
      clearTimeout(timer);
      bgMusicRef.current?.stop();
    };
  }, [data?.bgmUrl]);

  const handleBlowComplete = useCallback(() => {
    setFlickering(false);
    setCandlesLit(false);
    setShowSmoke(true);
    setTimeout(() => {
      setPhase("cut");
      setShowKnife(true);
      setShowSmoke(false);
    }, 2000);
  }, []);

  const { isListening, blowStrength, startListening, micSupported } = useMicrophone(handleBlowComplete);

  useEffect(() => {
    if (phase === "candles") {
      const timer = setTimeout(() => setPhase("blow"), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    setFlickering(blowStrength > 0.15);
  }, [blowStrength]);

  const handleStartMic = async () => { await startListening(); };

  const handleBlowButton = () => {
    setFlickering(true);
    setTimeout(() => handleBlowComplete(), 1500);
  };

  const handleKnifeClick = () => {
    if (cakeCut) return;
    setCakeCut(true);
    setTimeout(() => {
      navigate("/wish");
    }, 2500);
  };

  const toggleBgMusic = () => {
    if (bgMusicPlaying) {
      bgMusicRef.current?.stop();
      bgMusicRef.current = null;
      setBgMusicPlaying(false);
    } else {
      if (data?.bgmUrl) {
        const audio = new Audio(data.bgmUrl);
        audio.loop = true;
        audio.volume = 0.3;
        audio.play().catch(() => {});
        bgMusicRef.current = { stop: () => { audio.pause(); audio.src = ""; } };
      } else {
        bgMusicRef.current = playBirthdayMelody();
      }
      setBgMusicPlaying(true);
    }
  };

  if (!data) return null;

  return (
    <div className="gradient-bg-celebration relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {phase !== "celebration" && <FloatingBalloons />}
      {phase === "celebration" && (
        <>
          <FireworksCanvas />
          <ConfettiCanvas burst />
        </>
      )}

      <div className="absolute right-4 top-4 z-50">
        <Button variant="ghost" size="icon" onClick={toggleBgMusic}
          className="rounded-full bg-muted/30 text-foreground backdrop-blur-md hover:bg-muted/50">
          {bgMusicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      <div className="relative z-20 mx-auto max-w-4xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
          {data.photoUrl && (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary shadow-[0_0_30px_rgba(255,107,157,0.4)] md:h-28 md:w-28"
            >
              <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" />
            </motion.div>
          )}
          <div className="text-center">
            <h1 className="text-gradient font-display text-4xl font-extrabold md:text-5xl">
              {data.name}'s Birthday!
            </h1>
            <p className="mt-1 text-xl font-bold text-accent">
              Turning {data.age} <span className="inline-block animate-bounce">🎉</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <BirthdayCake3D
            name={data.name} age={data.age} candlesLit={candlesLit} flickering={flickering}
            showSmoke={showSmoke} showKnife={showKnife} cakeCut={cakeCut} onKnifeClick={handleKnifeClick}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "blow" && (
            <motion.div key="blow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 flex flex-col items-center gap-4">
              <p className="font-display text-2xl font-bold text-foreground">
                🌬️ Blow out the candles!
              </p>
              {isListening && (
                <div className="h-4 w-56 overflow-hidden rounded-full bg-muted/50 shadow-inner">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    animate={{ width: `${Math.min(blowStrength * 200, 100)}%` }}
                    transition={{ duration: 0.1 }} />
                </div>
              )}
              <div className="flex gap-3">
                {micSupported && !isListening && (
                  <Button onClick={handleStartMic} variant="outline"
                    className="btn-glow rounded-full border-primary/50 bg-primary/10 font-bold text-foreground hover:bg-primary/20">
                    <Mic className="mr-2 h-4 w-4" /> Use Microphone
                  </Button>
                )}
                <Button onClick={handleBlowButton}
                  className="btn-glow rounded-full bg-gradient-to-r from-primary to-secondary font-bold shadow-xl">
                  <Wind className="mr-2 h-5 w-5" /> Blow Candle
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "cut" && !cakeCut && (
            <motion.div key="cut" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 flex flex-col items-center gap-4">
              <p className="font-display text-2xl font-bold text-foreground">
                🔪 Time to cut the cake!
              </p>
              <Button onClick={handleKnifeClick}
                className="btn-glow animate-pulse rounded-full bg-gradient-to-r from-accent to-gold px-10 py-7 font-display text-xl font-bold text-accent-foreground shadow-2xl">
                <Scissors className="mr-3 h-6 w-6" /> Cut the Cake
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CelebrationPage;
