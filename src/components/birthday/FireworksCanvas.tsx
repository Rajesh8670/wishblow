import { useEffect, useRef } from "react";

const COLORS = [
  "#ff6b9d", "#c44dff", "#ffd93d", "#6bffb8",
  "#6bc5ff", "#ff9a6b", "#ff6bef", "#ffd700",
];

interface Spark {
  x: number; y: number; vx: number; vy: number;
  color: string; life: number; maxLife: number; size: number;
}

export const FireworksCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const sparks: Spark[] = [];
    let animId: number;

    const explode = (x: number, y: number) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const count = 70 + Math.random() * 40;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 5;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5),
          vy: Math.sin(angle) * speed + (Math.random() - 0.5),
          color,
          life: 0, maxLife: 35 + Math.random() * 35,
          size: 2 + Math.random() * 3,
        });
      }
    };

    let timer = 0;
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timer++;
      if (timer % 30 === 0) {
        explode(100 + Math.random() * (canvas.width - 200), 80 + Math.random() * (canvas.height * 0.4));
      }
      if (timer % 45 === 15) {
        explode(Math.random() * canvas.width, 60 + Math.random() * (canvas.height * 0.3));
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.vx *= 0.99; s.life++;
        const alpha = 1 - s.life / s.maxLife;
        if (alpha <= 0) { sparks.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />;
};
