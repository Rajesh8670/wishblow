import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Cake layer component
const CakeLayer = ({
  position, radius, height, color, creamColor,
}: {
  position: [number, number, number]; radius: number; height: number; color: string; creamColor: string;
}) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, height / 2 + 0.02, 0]}>
      <cylinderGeometry args={[radius + 0.05, radius + 0.05, 0.07, 32]} />
      <meshStandardMaterial color={creamColor} roughness={0.3} />
    </mesh>
    {Array.from({ length: 14 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 14;
      return (
        <mesh key={i} position={[Math.cos(angle) * (radius + 0.01), height / 2 - 0.08, Math.sin(angle) * (radius + 0.01)]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={creamColor} roughness={0.25} />
        </mesh>
      );
    })}
    {/* Sprinkles */}
    {Array.from({ length: 20 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.8;
      const colors = ["#ff6b9d", "#ffd93d", "#6bffb8", "#c44dff", "#6bc5ff"];
      return (
        <mesh key={`sp${i}`} position={[Math.cos(angle) * r, height / 2 + 0.06, Math.sin(angle) * r]}
          rotation={[0, Math.random() * Math.PI, Math.random()]}>
          <boxGeometry args={[0.02, 0.06, 0.02]} />
          <meshStandardMaterial color={colors[i % colors.length]} />
        </mesh>
      );
    })}
  </group>
);

// Animated candle flame
const CandleFlame = ({ position, visible, flickering }: {
  position: [number, number, number]; visible: boolean; flickering: boolean;
}) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!outerRef.current || !visible) return;
    const t = clock.getElapsedTime();
    const flick = flickering ? Math.sin(t * 25) * 0.25 + Math.random() * 0.15 : 0;
    outerRef.current.scale.set(1 + Math.sin(t * 5) * 0.2 + flick, 1 + Math.sin(t * 7) * 0.15 + flick, 1);
    outerRef.current.position.x = position[0] + Math.sin(t * 8) * 0.008 + flick * 0.03;
    if (innerRef.current) {
      innerRef.current.scale.set(1 + Math.sin(t * 6) * 0.1, 1 + Math.sin(t * 9) * 0.1, 1);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(t * 6) * 0.8 + (flickering ? Math.random() * 1.2 : 0);
    }
  });

  if (!visible) return null;

  return (
    <group>
      <mesh ref={outerRef} position={position}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.9} />
      </mesh>
      <mesh ref={innerRef} position={[position[0], position[1] + 0.05, position[2]]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ffff33" transparent opacity={0.95} />
      </mesh>
      <pointLight ref={lightRef} position={position} color="#ff8800" intensity={2} distance={5} />
    </group>
  );
};

// Smoke particle
const SmokeParticle = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.006 + Math.random() * 0.012, []);
  const drift = useMemo(() => (Math.random() - 0.5) * 0.006, []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y += speed;
    ref.current.position.x += drift;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity -= 0.003;
    if (mat.opacity <= 0) {
      ref.current.position.set(position[0], position[1], position[2]);
      mat.opacity = 0.5;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color="#aaaaaa" transparent opacity={0.5} />
    </mesh>
  );
};

// Create smooth number outlines for candle shapes
const createNumberShape = (digit: string): THREE.Shape => {
  const shape = new THREE.Shape();
  
  // Smooth curved number paths
  const paths: Record<string, () => void> = {
    "0": () => {
      shape.ellipse(0, 0.5, 0.25, 0.5, 0, Math.PI * 2, false, 0);
    },
    "1": () => {
      shape.moveTo(-0.08, 0);
      shape.lineTo(0.12, 0);
      shape.lineTo(0.12, 0.85);
      shape.lineTo(0.02, 0.85);
      shape.lineTo(-0.12, 0.7);
      shape.lineTo(-0.05, 0.7);
      shape.lineTo(0.02, 0.78);
      shape.lineTo(0.02, 0);
      shape.lineTo(-0.08, 0);
    },
    "2": () => {
      shape.moveTo(-0.25, 0);
      shape.lineTo(0.25, 0);
      shape.lineTo(0.25, 0.12);
      shape.lineTo(-0.1, 0.5);
      shape.quadraticCurveTo(0.25, 0.5, 0.25, 0.75);
      shape.quadraticCurveTo(0.25, 1, 0, 1);
      shape.quadraticCurveTo(-0.25, 1, -0.25, 0.75);
      shape.lineTo(-0.12, 0.75);
      shape.quadraticCurveTo(-0.12, 0.88, 0, 0.88);
      shape.quadraticCurveTo(0.12, 0.88, 0.12, 0.75);
      shape.quadraticCurveTo(0.12, 0.62, -0.15, 0.38);
      shape.lineTo(-0.25, 0.12);
      shape.lineTo(-0.25, 0);
    },
    "3": () => {
      shape.moveTo(-0.2, 0.1);
      shape.quadraticCurveTo(-0.2, 0, 0, 0);
      shape.quadraticCurveTo(0.25, 0, 0.25, 0.22);
      shape.quadraticCurveTo(0.25, 0.42, 0.05, 0.48);
      shape.quadraticCurveTo(0.25, 0.54, 0.25, 0.75);
      shape.quadraticCurveTo(0.25, 1, 0, 1);
      shape.quadraticCurveTo(-0.2, 1, -0.2, 0.88);
      shape.lineTo(-0.08, 0.88);
      shape.quadraticCurveTo(-0.08, 0.88, 0, 0.88);
      shape.quadraticCurveTo(0.12, 0.88, 0.12, 0.75);
      shape.quadraticCurveTo(0.12, 0.58, -0.05, 0.55);
      shape.lineTo(-0.05, 0.42);
      shape.quadraticCurveTo(0.12, 0.4, 0.12, 0.25);
      shape.quadraticCurveTo(0.12, 0.12, 0, 0.12);
      shape.quadraticCurveTo(-0.08, 0.12, -0.08, 0.18);
      shape.lineTo(-0.2, 0.1);
    },
    "4": () => {
      shape.moveTo(0.15, 0);
      shape.lineTo(0.25, 0);
      shape.lineTo(0.25, 1);
      shape.lineTo(0.15, 1);
      shape.lineTo(0.15, 0.45);
      shape.lineTo(-0.25, 0.45);
      shape.lineTo(-0.25, 0.32);
      shape.lineTo(0.15, 0.9);
      shape.lineTo(0.15, 0);
    },
    "5": () => {
      shape.moveTo(-0.2, 0.1);
      shape.quadraticCurveTo(-0.2, 0, 0, 0);
      shape.quadraticCurveTo(0.25, 0, 0.25, 0.3);
      shape.quadraticCurveTo(0.25, 0.55, 0, 0.55);
      shape.lineTo(-0.15, 0.55);
      shape.lineTo(-0.15, 0.88);
      shape.lineTo(0.2, 0.88);
      shape.lineTo(0.2, 1);
      shape.lineTo(-0.25, 1);
      shape.lineTo(-0.25, 0.42);
      shape.lineTo(0, 0.42);
      shape.quadraticCurveTo(0.12, 0.42, 0.12, 0.28);
      shape.quadraticCurveTo(0.12, 0.12, 0, 0.12);
      shape.quadraticCurveTo(-0.08, 0.12, -0.08, 0.18);
      shape.lineTo(-0.2, 0.1);
    },
    "6": () => {
      shape.moveTo(0.15, 0.9);
      shape.quadraticCurveTo(0.05, 1, -0.1, 0.85);
      shape.quadraticCurveTo(-0.25, 0.7, -0.25, 0.3);
      shape.quadraticCurveTo(-0.25, 0, 0, 0);
      shape.quadraticCurveTo(0.25, 0, 0.25, 0.25);
      shape.quadraticCurveTo(0.25, 0.5, 0, 0.5);
      shape.quadraticCurveTo(-0.12, 0.5, -0.12, 0.32);
      shape.quadraticCurveTo(-0.12, 0.12, 0, 0.12);
      shape.quadraticCurveTo(0.12, 0.12, 0.12, 0.25);
      shape.quadraticCurveTo(0.12, 0.38, 0, 0.38);
      shape.lineTo(-0.08, 0.38);
      shape.lineTo(-0.12, 0.65);
      shape.quadraticCurveTo(-0.08, 0.88, 0.08, 0.82);
      shape.lineTo(0.15, 0.9);
    },
    "7": () => {
      shape.moveTo(-0.2, 0);
      shape.lineTo(0.05, 0.88);
      shape.lineTo(-0.25, 0.88);
      shape.lineTo(-0.25, 1);
      shape.lineTo(0.25, 1);
      shape.lineTo(0.25, 0.92);
      shape.lineTo(-0.08, 0);
      shape.lineTo(-0.2, 0);
    },
    "8": () => {
      shape.ellipse(0, 0.25, 0.22, 0.25, 0, Math.PI * 2, false, 0);
      shape.moveTo(0.18, 0.72);
      shape.ellipse(0, 0.72, 0.18, 0.22, 0, Math.PI * 2, false, 0);
    },
    "9": () => {
      shape.moveTo(-0.15, 0.1);
      shape.quadraticCurveTo(-0.05, 0, 0.1, 0.15);
      shape.quadraticCurveTo(0.25, 0.3, 0.25, 0.7);
      shape.quadraticCurveTo(0.25, 1, 0, 1);
      shape.quadraticCurveTo(-0.25, 1, -0.25, 0.75);
      shape.quadraticCurveTo(-0.25, 0.5, 0, 0.5);
      shape.quadraticCurveTo(0.12, 0.5, 0.12, 0.68);
      shape.quadraticCurveTo(0.12, 0.88, 0, 0.88);
      shape.quadraticCurveTo(-0.12, 0.88, -0.12, 0.75);
      shape.quadraticCurveTo(-0.12, 0.62, 0, 0.62);
      shape.lineTo(0.08, 0.62);
      shape.lineTo(0.12, 0.35);
      shape.quadraticCurveTo(0.08, 0.12, -0.08, 0.18);
      shape.lineTo(-0.15, 0.1);
    },
  };

  if (paths[digit]) {
    paths[digit]();
  } else {
    // Default fallback
    shape.ellipse(0, 0.5, 0.25, 0.5, 0, Math.PI * 2, false, 0);
  }

  return shape;
};

// Number-shaped candle component
const NumberShapedCandle = ({ digit, xOffset, flameVisible, flickering, showSmoke }: {
  digit: string; xOffset: number; flameVisible: boolean; flickering: boolean; showSmoke: boolean;
}) => {
  const geometry = useMemo(() => {
    const shape = createNumberShape(digit);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 4,
    });
    geo.center();
    return geo;
  }, [digit]);

  const colors = ["#ff6b9d", "#ffd93d", "#6bffb8", "#c44dff", "#6bc5ff", "#ff9f43", "#ff85a2", "#a8e6cf", "#ffaaa5", "#dcedc1"];
  const colorIndex = parseInt(digit) % colors.length;
  const stripeColor = ["#ffd93d", "#ff85a2", "#87ceeb", "#ffa07a", "#98fb98"][parseInt(digit) % 5];

  return (
    <group position={[xOffset, 1.7, 0]}>
      {/* Main number-shaped candle body - standing vertical */}
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial 
          color={colors[colorIndex]} 
          roughness={0.2} 
          metalness={0.05}
          emissive={colors[colorIndex]}
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Glossy front highlight */}
      <mesh geometry={geometry} scale={[0.95, 0.95, 0.6]} position={[0, 0, 0.02]}>
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15} 
          roughness={0.05}
        />
      </mesh>

      {/* Colored stripe bands */}
      {[-0.18, 0, 0.18].map((yOff, i) => (
        <mesh key={i} position={[0, yOff, 0.07]} scale={[0.35, 0.03, 0.01]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={stripeColor} roughness={0.2} transparent opacity={0.7 - i * 0.15} />
        </mesh>
      ))}

      {/* Wick on top */}
      <mesh position={[0, 0.55, 0.06]}>
        <cylinderGeometry args={[0.015, 0.01, 0.1, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>

      {/* Flame */}
      <CandleFlame 
        position={[0, 0.66, 0.06]} 
        visible={flameVisible} 
        flickering={flickering} 
      />

      {/* Smoke */}
      {showSmoke && [0, 1, 2].map((i) => (
        <SmokeParticle key={i} position={[0, 0.6 + i * 0.06, 0.06]} />
      ))}

      {/* Warm glow */}
      {flameVisible && (
        <pointLight 
          position={[0, 0.5, 0.15]} 
          color="#ff8800" 
          intensity={0.8} 
          distance={2} 
        />
      )}

      {/* Base glow */}
      <pointLight 
        position={[0, -0.2, 0.15]} 
        color={colors[colorIndex]} 
        intensity={0.2} 
        distance={1} 
      />
    </group>
  );
};

// Number Candles - creates candles in the shape of the age
const NumberCandles = ({ age, flameVisible, flickering, showSmoke }: {
  age: number; flameVisible: boolean; flickering: boolean; showSmoke: boolean;
}) => {
  const digits = age.toString().split("");
  const spacing = 0.6;
  const totalWidth = (digits.length - 1) * spacing;

  return (
    <group>
      {digits.map((digit, i) => (
        <NumberShapedCandle
          key={i}
          digit={digit}
          xOffset={-totalWidth / 2 + i * spacing}
          flameVisible={flameVisible}
          flickering={flickering}
          showSmoke={showSmoke}
        />
      ))}
    </group>
  );
};

// Create a filled wedge shape for cake slices
const createSliceShape = (radius: number, sliceAngle: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * sliceAngle;
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  shape.lineTo(0, 0);
  return shape;
};

// Solid cake slice layer using ExtrudeGeometry
const SliceLayer = ({ radius, height, yOffset, color, sliceAngle }: {
  radius: number; height: number; yOffset: number; color: string; sliceAngle: number;
}) => {
  const geometry = useMemo(() => {
    const shape = createSliceShape(radius, sliceAngle);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });
    // Rotate so extrusion goes up (Y axis)
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, yOffset, 0);
    return geo;
  }, [radius, height, yOffset, sliceAngle]);

  return (
    <mesh castShadow geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
};

// Realistic cake slice with solid filled layers
const CakeSlice = ({ index, total }: { index: number; total: number }) => {
  const angle = (Math.PI * 2 * index) / total;
  const nextAngle = (Math.PI * 2 * (index + 1)) / total;
  const midAngle = (angle + nextAngle) / 2;
  const spread = 0.45;
  const sliceAngle = (Math.PI * 2) / total;

  return (
    <group
      position={[Math.cos(midAngle) * spread, 0, Math.sin(midAngle) * spread]}
      rotation={[0.06, -angle, 0.04]}
    >
      {/* Bottom layer - chocolate */}
      <SliceLayer radius={0.4} height={0.22} yOffset={0} color="#8B4513" sliceAngle={sliceAngle} />
      {/* Cream layer 1 */}
      <SliceLayer radius={0.38} height={0.04} yOffset={0.22} color="#FFF8DC" sliceAngle={sliceAngle} />
      {/* Middle layer - vanilla */}
      <SliceLayer radius={0.36} height={0.18} yOffset={0.26} color="#DEB887" sliceAngle={sliceAngle} />
      {/* Cream layer 2 */}
      <SliceLayer radius={0.34} height={0.04} yOffset={0.44} color="#FFE4E1" sliceAngle={sliceAngle} />
      {/* Top layer - strawberry */}
      <SliceLayer radius={0.32} height={0.16} yOffset={0.48} color="#E8A0A0" sliceAngle={sliceAngle} />
      {/* Top frosting */}
      <SliceLayer radius={0.31} height={0.03} yOffset={0.64} color="#FFF0F5" sliceAngle={sliceAngle} />

      {/* Frosting drip on side */}
      <mesh position={[0.18, 0.4, 0.1]} rotation={[0.2, 0, 0.3]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.3} />
      </mesh>

      {/* Cherry on top */}
      <mesh position={[0.12, 0.7, 0.06]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#DC143C" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Sprinkles */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.08 + i * 0.06, 0.68, 0.04 - i * 0.02]} rotation={[0, i * 1.2, 0.5]}>
          <boxGeometry args={[0.015, 0.04, 0.015]} />
          <meshStandardMaterial color={["#FF69B4", "#FFD700", "#00CED1"][i]} />
        </mesh>
      ))}
    </group>
  );
};

// Knife
const Knife = ({ visible, cutting, onClick }: { visible: boolean; cutting: boolean; onClick: () => void; }) => {
  const ref = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !cutting) return;
    if (startTime.current === null) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    ref.current.position.y = 2.5 - Math.min(elapsed * 1.5, 3);
    ref.current.rotation.z = Math.sin(elapsed * 4) * 0.08;
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[1.8, 2.5, 0]} onClick={onClick}>
      {/* Blade */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.025, 0.7, 0.2]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.25, 0.1]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
      <pointLight position={[0, -0.2, 0]} color="#ffd700" intensity={1.5} distance={3} />
      <pointLight position={[0, 0, 0.3]} color="#ffffff" intensity={0.5} distance={2} />
    </group>
  );
};

// Scene
const CakeScene = ({
  name, age, candlesLit, flickering, showSmoke, showKnife, cakeCut, onKnifeClick,
}: {
  name: string; age: number; candlesLit: boolean; flickering: boolean; showSmoke: boolean;
  showKnife: boolean; cakeCut: boolean; onKnifeClick: () => void;
}) => {
  const sliceCount = 8;

  return (
    <>
      <ambientLight intensity={0.5} color="#ffeedd" />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow color="#ffffff" />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#ffd0e0" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#ffaa00" />

      <group position={[0, -0.5, 0]}>
        {/* Cake plate with gold rim */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.4, 1.4, 0.06, 32]} />
          <meshStandardMaterial color="#fafafa" metalness={0.2} roughness={0.1} />
        </mesh>

        {!cakeCut ? (
          <>
            <CakeLayer position={[0, 0.25, 0]} radius={1.15} height={0.55} color="#8B4513" creamColor="#fff5e6" />
            <CakeLayer position={[0, 0.72, 0]} radius={0.9} height={0.42} color="#DEB887" creamColor="#ffe0f0" />
            <CakeLayer position={[0, 1.15, 0]} radius={0.68} height={0.42} color="#E8A0A0" creamColor="#fff0f5" />

            {/* Cherry on top */}
            <mesh position={[0, 1.42, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#cc0033" roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Single number candle */}
            <NumberCandles age={age} flameVisible={candlesLit} flickering={flickering} showSmoke={showSmoke} />
          </>
        ) : (
          <>
            {Array.from({ length: sliceCount }).map((_, i) => (
              <CakeSlice key={i} index={i} total={sliceCount} />
            ))}
          </>
        )}
      </group>

      <Knife visible={showKnife} cutting={cakeCut} onClick={onKnifeClick} />

      <OrbitControls enableZoom={false} enablePan={false}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.2}
        autoRotate autoRotateSpeed={1.5} />

      {/* Background sphere */}
      <mesh>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#1a0a20" side={THREE.BackSide} />
      </mesh>
    </>
  );
};

// Error boundary for 3D canvas
class Canvas3DErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// 2D Fallback cake
const FallbackCake = ({ name, age }: { name: string; age: number }) => (
  <div className="flex h-[400px] w-full flex-col items-center justify-center md:h-[500px]">
    <div className="relative">
      {/* Single candle with age */}
      <div className="flex justify-center mb-1">
        <div className="flex flex-col items-center">
          <div className="h-4 w-4 rounded-full bg-yellow-400 shadow-[0_0_12px_#ffd700,0_0_24px_#ff8800] animate-pulse" />
          <div className="relative h-12 w-8 bg-gradient-to-b from-pink-300 to-pink-400 rounded-lg flex items-center justify-center">
            <span className="text-pink-700 font-bold text-lg">{age}</span>
          </div>
        </div>
      </div>
      {/* Cake layers */}
      <div className="mx-auto w-48 h-12 rounded-t-xl bg-gradient-to-r from-pink-400 to-pink-300 border-2 border-pink-200 shadow-lg" />
      <div className="mx-auto w-56 h-10 bg-gradient-to-r from-amber-200 to-amber-100 border-2 border-amber-100 shadow-lg" />
      <div className="mx-auto w-64 h-12 rounded-b-xl bg-gradient-to-r from-amber-700 to-amber-600 border-2 border-amber-500 shadow-lg" />
      {/* Plate */}
      <div className="mx-auto w-72 h-3 rounded-full bg-gray-100 shadow-md mt-0.5" />
    </div>
    <p className="mt-4 text-center font-display text-2xl font-bold text-gradient">{name}</p>
    <p className="text-center text-accent font-bold text-xl">Turning {age}! 🎂</p>
  </div>
);

interface BirthdayCake3DProps {
  name: string; age: number; candlesLit: boolean; flickering: boolean;
  showSmoke: boolean; showKnife: boolean; cakeCut: boolean; onKnifeClick: () => void;
}

export const BirthdayCake3D = (props: BirthdayCake3DProps) => (
  <Canvas3DErrorBoundary fallback={<FallbackCake name={props.name} age={props.age} />}>
    <div className="h-[400px] w-full md:h-[500px]">
      <Canvas camera={{ position: [0, 2.5, 6.5], fov: 38 }} shadows gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <CakeScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  </Canvas3DErrorBoundary>
);
