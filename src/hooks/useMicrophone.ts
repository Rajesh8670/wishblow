import { useState, useCallback, useRef, useEffect } from "react";

interface UseMicrophoneReturn {
  isListening: boolean;
  blowDetected: boolean;
  blowStrength: number;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  micSupported: boolean;
}

export const useMicrophone = (
  onBlowDetected?: () => void,
  threshold = 0.35,
  sustainedMs = 600
): UseMicrophoneReturn => {
  const [isListening, setIsListening] = useState(false);
  const [blowDetected, setBlowDetected] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0);
  const [micSupported] = useState(() => !!navigator.mediaDevices?.getUserMedia);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const blowStartRef = useRef<number>(0);
  const detectedRef = useRef(false);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(async (): Promise<boolean> => {
    if (!micSupported) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      detectedRef.current = false;

      const checkBlow = () => {
        if (!analyserRef.current || detectedRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Focus on lower frequencies (blowing sound is low freq)
        const lowFreqSlice = dataArray.slice(0, 20);
        const avg = lowFreqSlice.reduce((a, b) => a + b, 0) / lowFreqSlice.length / 255;

        setBlowStrength(avg);

        if (avg > threshold) {
          if (blowStartRef.current === 0) blowStartRef.current = Date.now();
          if (Date.now() - blowStartRef.current > sustainedMs) {
            detectedRef.current = true;
            setBlowDetected(true);
            onBlowDetected?.();
            stopListening();
            return;
          }
        } else {
          blowStartRef.current = 0;
        }

        animFrameRef.current = requestAnimationFrame(checkBlow);
      };

      setIsListening(true);
      checkBlow();
      return true;
    } catch {
      return false;
    }
  }, [micSupported, onBlowDetected, stopListening, threshold, sustainedMs]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return {
    isListening,
    blowDetected,
    blowStrength,
    startListening,
    stopListening,
    micSupported,
  };
};
