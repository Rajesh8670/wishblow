import { useEffect, useRef } from "react";

const COLORS = [
  "#ff6b9d", "#c44dff", "#ffd93d", "#6bffb8",
  "#6bc5ff", "#ff9a6b", "#ff6bef", "#ffd700",
  "#ff4d6d", "#a855f7", "#22d3ee", "#fb923c",
];

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
}

interface Particle {
  x: number; y: number; w: number; h: number;
  color: string; vx: number; vy: number;
  rotation: number; rotSpeed: number; opacity: number; shape: number;
}

export const ConfettiCanvas = ({ burst = false }: { burst?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars: Star[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));

    // Confetti
    const count = burst ? 200 : 35;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: burst ? canvas.width / 2 + (Math.random() - 0.5) * 200 : Math.random() * canvas.width,
      y: burst ? canvas.height / 2 : -10 - Math.random() * canvas.height,
      w: 5 + Math.random() * 8, h: 8 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: burst ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 2,
      vy: burst ? -Math.random() * 18 - 5 : 0.8 + Math.random() * 2,
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1, shape: Math.floor(Math.random() * 3),
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      const time = Date.now() / 1000;
      for (const s of stars) {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * s.twinkleSpeed + s.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw confetti
      for (const p of particles) {
        p.x += p.vx; p.vy += burst ? 0.25 : 0; p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (burst) p.opacity = Math.max(0, p.opacity - 0.004);
        if (!burst && p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        if (p.shape === 0) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 2);
          ctx.lineTo(p.w / 2, p.h / 2);
          ctx.lineTo(-p.w / 2, p.h / 2);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [burst]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-10" />;
};
