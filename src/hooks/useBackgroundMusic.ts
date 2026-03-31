import { useEffect } from "react";

let globalAudio: HTMLAudioElement | null = null;
let pendingInteractionHandlerAttached = false;
let fallbackMusic: { start: () => Promise<void>; stop: () => void; isPlaying: () => boolean } | null = null;

const createFallbackMusic = () => {
  let ctx: AudioContext | null = null;
  let timers: number[] = [];
  let playing = false;

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const stop = () => {
    clearTimers();
    playing = false;
    if (ctx) {
      void ctx.close();
      ctx = null;
    }
  };

  const playNote = (frequency: number, startAt: number, duration: number) => {
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.04, startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.05);
  };

  const sequence = () => {
    if (!ctx || !playing) {
      return;
    }

    const notes = [392, 440, 523, 587, 523, 440];
    let cursor = ctx.currentTime + 0.05;

    notes.forEach((note, index) => {
      playNote(note, cursor, 0.28);
      cursor += index === notes.length - 1 ? 0.5 : 0.35;
    });

    timers.push(window.setTimeout(sequence, 2200));
  };

  const start = async () => {
    if (playing) {
      return;
    }

    stop();
    ctx = new AudioContext();
    await ctx.resume();
    playing = true;
    sequence();
  };

  return {
    start,
    stop,
    isPlaying: () => playing,
  };
};

const buildCandidatePaths = (audioPath: string) => {
  const fallbackAudioPath =
    audioPath.endsWith(".webm") && !audioPath.endsWith(".webm.webm")
      ? `${audioPath}.webm`
      : audioPath;

  return [audioPath, fallbackAudioPath].filter(
    (path, index, paths) => path.length > 0 && paths.indexOf(path) === index,
  );
};

const ensureAudio = () => {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.autoplay = true;
    globalAudio.loop = true;
    globalAudio.preload = "auto";
    globalAudio.volume = 0.3;
  }

  return globalAudio;
};

const attachInteractionFallback = () => {
  if (pendingInteractionHandlerAttached) {
    return;
  }

  pendingInteractionHandlerAttached = true;

  const playOnInteraction = () => {
    const tryMediaPlayback = globalAudio?.src
      ? globalAudio.play().catch(async () => {
          if (fallbackMusic) {
            await fallbackMusic.start();
          }
        })
      : fallbackMusic?.start();

    void tryMediaPlayback;
    pendingInteractionHandlerAttached = false;
    document.removeEventListener("click", playOnInteraction);
    document.removeEventListener("pointerdown", playOnInteraction);
    document.removeEventListener("touchstart", playOnInteraction);
    document.removeEventListener("keydown", playOnInteraction);
  };

  document.addEventListener("click", playOnInteraction, { once: true });
  document.addEventListener("pointerdown", playOnInteraction, { once: true });
  document.addEventListener("touchstart", playOnInteraction, { once: true });
  document.addEventListener("keydown", playOnInteraction, { once: true });
};

const applyAudioSource = (audioPath: string) => {
  const audio = ensureAudio();
  fallbackMusic ??= createFallbackMusic();
  fallbackMusic.stop();
  const candidatePaths = buildCandidatePaths(audioPath);
  let currentPathIndex = 0;

  const tryLoadCurrentSource = () => {
    const nextSource = candidatePaths[currentPathIndex];
    if (!nextSource) {
      return;
    }

    if (audio.src !== new URL(nextSource, window.location.origin).toString()) {
      audio.src = nextSource;
      audio.load();
    }

    audio.play().catch(() => {
      attachInteractionFallback();
    });
  };

  audio.onerror = () => {
    const nextPath = candidatePaths[currentPathIndex + 1];
    if (!nextPath) {
      fallbackMusic?.start().catch(() => {
        attachInteractionFallback();
      });
      return;
    }

    currentPathIndex += 1;
    audio.src = nextPath;
    audio.load();
    audio.play().catch(() => {
      attachInteractionFallback();
    });
  };

  tryLoadCurrentSource();
};

export const useBackgroundMusic = (
  audioPath: string = "/happy-birthday.webm",
  enabled = true,
  volume = 0.3,
) => {
  useEffect(() => {
    if (!enabled) {
      globalAudio?.pause();
      fallbackMusic?.stop();
      return;
    }

    ensureAudio().volume = Math.max(0, Math.min(1, volume));

    const tryAutoplay = () => {
      applyAudioSource(audioPath);
    };

    const timer = window.setTimeout(tryAutoplay, 100);
    window.addEventListener("load", tryAutoplay);
    window.addEventListener("pageshow", tryAutoplay);
    window.addEventListener("focus", tryAutoplay);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tryAutoplay();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", tryAutoplay);
      window.removeEventListener("pageshow", tryAutoplay);
      window.removeEventListener("focus", tryAutoplay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [audioPath, enabled, volume]);

  return {
    play: () => {
      if (globalAudio?.src) {
        return globalAudio.play().catch(async () => {
          fallbackMusic ??= createFallbackMusic();
          await fallbackMusic.start();
        });
      }

      fallbackMusic ??= createFallbackMusic();
      return fallbackMusic.start();
    },
    pause: () => {
      globalAudio?.pause();
      fallbackMusic?.stop();
    },
    setVolume: (volume: number) => {
      const audio = ensureAudio();
      audio.volume = Math.max(0, Math.min(1, volume));
    },
    isPlaying: () => Boolean((globalAudio && !globalAudio.paused) || fallbackMusic?.isPlaying()),
  };
};
