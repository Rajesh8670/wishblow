import { motion } from "framer-motion";

const BALLOONS = [
  { color: "#ff6b9d", x: "8%", delay: 0, size: 48 },
  { color: "#c44dff", x: "20%", delay: 0.5, size: 42 },
  { color: "#ffd93d", x: "35%", delay: 1.0, size: 50 },
  { color: "#6bffb8", x: "50%", delay: 0.3, size: 44 },
  { color: "#6bc5ff", x: "65%", delay: 0.8, size: 46 },
  { color: "#ff9a6b", x: "78%", delay: 1.3, size: 40 },
  { color: "#ff6bef", x: "88%", delay: 0.6, size: 52 },
  { color: "#ffd700", x: "15%", delay: 1.5, size: 38 },
  { color: "#22d3ee", x: "72%", delay: 0.2, size: 44 },
];

export const FloatingBalloons = () => (
  <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
    {BALLOONS.map((b, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ left: b.x, bottom: "-80px" }}
        animate={{
          y: [0, -(window.innerHeight + 200)],
          x: [0, Math.sin(i) * 40, 0],
        }}
        transition={{
          duration: 10 + Math.random() * 6,
          delay: b.delay,
          repeat: Infinity,
          ease: "easeOut",
        }}
      >
        <svg width={b.size} height={b.size * 1.4} viewBox="0 0 40 56">
          <defs>
            <radialGradient id={`bg${i}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <ellipse cx="20" cy="20" rx="18" ry="22" fill={`url(#bg${i})`} />
          <ellipse cx="14" cy="14" rx="4" ry="6" fill="white" opacity="0.3" transform="rotate(-20 14 14)" />
          <polygon points="20,42 17,48 23,48" fill={b.color} opacity="0.7" />
          <path d={`M20,48 Q${18 + Math.sin(i) * 4},52 20,56`} stroke="#999" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>
    ))}
  </div>
);
