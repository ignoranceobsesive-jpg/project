'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore, SURVIVORS, type SurvivorId } from '@/stores/playerStore';

interface SurvivorModelProps {
  survivorId?: SurvivorId;
  color?: string;
  position?: [number, number, number];
  rotation?: number;
  showAbilityEffect?: boolean;
}

/* ─── Character-specific skin/hair/clothing palettes ─── */
const PALETTES: Record<SurvivorId, {
  skin: string; hair: string; pants: string; boots: string; shirt: string;
  vest: string; belt: string; eyeColor: string; detail: string;
}> = {
  marcus: {
    skin: '#c4956a', hair: '#2a2a2a', pants: '#3d4f3a', boots: '#1f1a14',
    shirt: '#4a7c59', vest: '#2d3d2d', belt: '#3a2a1a', eyeColor: '#3a2a1a', detail: '#5a6a5a',
  },
  elena: {
    skin: '#dbb89a', hair: '#5a3a2a', pants: '#4a4a5a', boots: '#3a3a4a',
    shirt: '#7c4a6e', vest: '#e8e8f0', belt: '#5a4a3a', eyeColor: '#4a6a4a', detail: '#cc3333',
  },
  viktor: {
    skin: '#c9a882', hair: '#5a4a3a', pants: '#4a4a3a', boots: '#3a3020',
    shirt: '#6e7c4a', vest: '#c8b830', belt: '#4a3a2a', eyeColor: '#3a3a3a', detail: '#8a8a6a',
  },
  sara: {
    skin: '#d4a87a', hair: '#1a1a2a', pants: '#2a2a3a', boots: '#1a1a2a',
    shirt: '#4a5e7c', vest: '#3a3a4a', belt: '#2a2a2a', eyeColor: '#5a8a5a', detail: '#6a6a8a',
  },
  dexter: {
    skin: '#b88a6a', hair: '#1a0a0a', pants: '#3a2a1a', boots: '#2a1a0a',
    shirt: '#7c5a4a', vest: '#4a3020', belt: '#2a1a0a', eyeColor: '#5a2a1a', detail: '#8a4a2a',
  },
};

/* ─── Fixed spike rotations for Dexter's hair (avoid Math.random in render) ─── */
const DEXTER_SPIKE_ROTATIONS = [
  [0.12, 0, -0.08],
  [-0.15, 0, 0.1],
  [0.05, 0, 0.18],
  [-0.08, 0, -0.14],
  [0.18, 0, 0.05],
  [-0.2, 0, -0.1],
  [0.1, 0, 0.15],
  [-0.05, 0, -0.18],
  [0.14, 0, -0.06],
  [-0.1, 0, 0.12],
];

/* ─── Shared eye component (positions relative to head center) ─── */
function Eyes({ eyeColor }: { eyeColor: string }) {
  return (
    <group>
      {/* Left eye */}
      <group position={[-0.065, 0.04, 0.12]}>
        <mesh castShadow>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color={eyeColor} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <sphereGeometry args={[0.007, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>
      </group>
      {/* Right eye */}
      <group position={[0.065, 0.04, 0.12]}>
        <mesh castShadow>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color={eyeColor} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <sphereGeometry args={[0.007, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Shared eyebrows (positions relative to head center) ─── */
function Eyebrows({ color = '#2a2a2a' }: { color?: string }) {
  return (
    <group>
      <mesh position={[-0.065, 0.08, 0.13]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.06, 0.012, 0.015]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.065, 0.08, 0.13]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.06, 0.012, 0.015]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Marcus head details (relative to head center at y=1.58) ─── */
function MarcusHeadDetails() {
  return (
    <group>
      {/* Military helmet - half sphere + brim */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.21, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.23, 0.02, 16]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Helmet brim */}
      <mesh position={[0, 0.13, 0.12]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.01, 0.08]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Scar on face */}
      <mesh position={[0.06, -0.01, 0.14]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.008, 0.008]} />
        <meshStandardMaterial color="#8a2020" roughness={0.7} emissive="#4a1010" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Marcus body details (relative to body origin) ─── */
function MarcusBodyDetails() {
  return (
    <group>
      {/* Tactical vest front plates */}
      <mesh position={[0, 1.22, 0.125]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.03]} />
        <meshStandardMaterial color="#2d3d2d" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.06, 0.125]} castShadow>
        <boxGeometry args={[0.28, 0.12, 0.03]} />
        <meshStandardMaterial color="#2d3d2d" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Vest back plate */}
      <mesh position={[0, 1.14, -0.125]} castShadow>
        <boxGeometry args={[0.3, 0.38, 0.03]} />
        <meshStandardMaterial color="#2d3d2d" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Ammo belt across chest - diagonal */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`ammo-${i}`}
          position={[-0.12 + i * 0.05, 1.28 - i * 0.04, 0.155]}
          rotation={[0.5, 0.2, 0]}
          castShadow
        >
          <boxGeometry args={[0.025, 0.04, 0.025]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      {/* Knife sheath on left thigh */}
      <mesh position={[-0.17, 0.38, 0.04]} castShadow>
        <boxGeometry args={[0.03, 0.18, 0.04]} />
        <meshStandardMaterial color="#2a2018" roughness={0.8} />
      </mesh>
      {/* Knife blade */}
      <mesh position={[-0.17, 0.46, 0.04]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.02]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Shoulder pads */}
      <mesh position={[-0.28, 1.36, 0]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.14]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0.28, 1.36, 0]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.14]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Elena head details (relative to head center) ─── */
function ElenaHeadDetails() {
  return (
    <group>
      {/* Ponytail extending backward */}
      <mesh position={[0, 0.08, -0.18]} rotation={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.02, 0.28, 8]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
      </mesh>
      {/* Hair tie */}
      <mesh position={[0, 0.12, -0.1]} castShadow>
        <torusGeometry args={[0.035, 0.008, 6, 12]} />
        <meshStandardMaterial color="#cc3333" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Elena body details (relative to body origin) ─── */
function ElenaBodyDetails() {
  return (
    <group>
      {/* Medical cross on chest - white background */}
      <mesh position={[0, 1.22, 0.125]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.005]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      {/* Cross vertical */}
      <mesh position={[0, 1.22, 0.13]} castShadow>
        <boxGeometry args={[0.035, 0.1, 0.005]} />
        <meshStandardMaterial color="#cc2222" roughness={0.4} emissive="#cc2222" emissiveIntensity={0.3} />
      </mesh>
      {/* Cross horizontal */}
      <mesh position={[0, 1.22, 0.13]} castShadow>
        <boxGeometry args={[0.1, 0.035, 0.005]} />
        <meshStandardMaterial color="#cc2222" roughness={0.4} emissive="#cc2222" emissiveIntensity={0.3} />
      </mesh>
      {/* Medical bag on right hip */}
      <group position={[0.2, 0.72, 0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.1, 0.08]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <boxGeometry args={[0.025, 0.06, 0.003]} />
          <meshStandardMaterial color="#cc2222" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <boxGeometry args={[0.06, 0.025, 0.003]} />
          <meshStandardMaterial color="#cc2222" roughness={0.4} />
        </mesh>
      </group>
      {/* Rolled-up sleeve rings - left forearm (approx position) */}
      <mesh position={[-0.26, 0.98, 0]} castShadow>
        <torusGeometry args={[0.05, 0.012, 6, 12]} />
        <meshStandardMaterial color="#e8e8f0" roughness={0.6} />
      </mesh>
      {/* Rolled-up sleeve rings - right forearm */}
      <mesh position={[0.26, 0.98, 0]} castShadow>
        <torusGeometry args={[0.05, 0.012, 6, 12]} />
        <meshStandardMaterial color="#e8e8f0" roughness={0.6} />
      </mesh>
      {/* Syringe on belt */}
      <group position={[0.12, 0.78, 0.1]} rotation={[0.3, 0, 0.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.1, 6]} />
          <meshStandardMaterial color="#d0e8f0" roughness={0.3} metalness={0.1} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.055, 0]} castShadow>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshStandardMaterial color="#cc3333" roughness={0.5} />
        </mesh>
      </group>
      {/* Shoulder pads - softer medical style */}
      <mesh position={[-0.26, 1.34, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.12]} />
        <meshStandardMaterial color="#e8e8f0" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 1.34, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.12]} />
        <meshStandardMaterial color="#e8e8f0" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Viktor head details (relative to head center) ─── */
function ViktorHeadDetails() {
  return (
    <group>
      {/* Hard hat - flat cylinder + dome */}
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
        <meshStandardMaterial color="#d4aa20" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.21, 0]} castShadow>
        <sphereGeometry args={[0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4aa20" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Hard hat brim */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.015, 16]} />
        <meshStandardMaterial color="#d4aa20" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Beard on chin */}
      <mesh position={[0, -0.12, 0.12]} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.03]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.02, -0.14, 0.12]} castShadow>
        <boxGeometry args={[0.03, 0.04, 0.02]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0.02, -0.14, 0.12]} castShadow>
        <boxGeometry args={[0.03, 0.04, 0.02]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Viktor body details (relative to body origin) ─── */
function ViktorBodyDetails() {
  return (
    <group>
      {/* Safety vest overlay */}
      <mesh position={[0, 1.14, 0.13]} castShadow>
        <boxGeometry args={[0.34, 0.42, 0.005]} />
        <meshStandardMaterial color="#c8b830" roughness={0.7} transparent opacity={0.7} />
      </mesh>
      {/* Safety vest reflective stripes */}
      <mesh position={[0, 1.24, 0.135]} castShadow>
        <boxGeometry args={[0.36, 0.025, 0.003]} />
        <meshStandardMaterial color="#e8e8c0" roughness={0.2} metalness={0.5} emissive="#e8e8c0" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 1.06, 0.135]} castShadow>
        <boxGeometry args={[0.36, 0.025, 0.003]} />
        <meshStandardMaterial color="#e8e8c0" roughness={0.2} metalness={0.5} emissive="#e8e8c0" emissiveIntensity={0.2} />
      </mesh>
      {/* Tool belt with wrench on left hip */}
      <group position={[-0.16, 0.78, 0.08]} rotation={[0.2, 0, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.02, 0.15, 0.04]} />
          <meshStandardMaterial color="#7a7a7a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.08, 0]} castShadow>
          <boxGeometry args={[0.05, 0.025, 0.025]} />
          <meshStandardMaterial color="#7a7a7a" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      {/* Hammer on right hip */}
      <group position={[0.16, 0.78, 0.06]} rotation={[0.2, 0, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.09, 0]} castShadow>
          <boxGeometry args={[0.035, 0.04, 0.025]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>
      {/* Knee patch on left knee */}
      <mesh position={[-0.1, 0.42, 0.08]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#5a5a4a" roughness={0.8} />
      </mesh>
      {/* Shoulder pads - yellow safety */}
      <mesh position={[-0.27, 1.34, 0]} castShadow>
        <boxGeometry args={[0.08, 0.05, 0.13]} />
        <meshStandardMaterial color="#c8b830" roughness={0.6} />
      </mesh>
      <mesh position={[0.27, 1.34, 0]} castShadow>
        <boxGeometry args={[0.08, 0.05, 0.13]} />
        <meshStandardMaterial color="#c8b830" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Sara head details (relative to head center) ─── */
function SaraHeadDetails() {
  return (
    <group>
      {/* Hood - thin curved shell over head */}
      <mesh position={[0, 0.12, -0.02]} castShadow>
        <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Hood brim */}
      <mesh position={[0, 0.06, 0.14]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.01, 0.06]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      {/* Night vision goggles on forehead */}
      <group position={[0, 0.14, 0.14]}>
        {/* Strap */}
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.03, 0.01]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
        {/* Left lens housing */}
        <mesh position={[-0.05, 0, 0.02]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
          <meshStandardMaterial color="#1a2a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Right lens housing */}
        <mesh position={[0.05, 0, 0.02]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
          <meshStandardMaterial color="#1a2a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Lens glow - green */}
        <mesh position={[-0.05, 0, 0.04]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#33ff66" emissive="#33ff66" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0.05, 0, 0.04]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#33ff66" emissive="#33ff66" emissiveIntensity={1.5} />
        </mesh>
        {/* Bridge between lenses */}
        <mesh position={[0, 0, 0.015]} castShadow>
          <boxGeometry args={[0.04, 0.015, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Sara body details (relative to body origin) ─── */
function SaraBodyDetails() {
  return (
    <group>
      {/* Holster on right thigh */}
      <group position={[0.17, 0.4, 0.04]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.12, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
        {/* Gun grip visible */}
        <mesh position={[0, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.025, 0.06, 0.025]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
      {/* Sleek shoulder pads */}
      <mesh position={[-0.24, 1.33, 0]} castShadow>
        <boxGeometry args={[0.06, 0.035, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 1.33, 0]} castShadow>
        <boxGeometry args={[0.06, 0.035, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ─── Dexter head details (relative to head center) ─── */
function DexterHeadDetails() {
  return (
    <group>
      {/* Wild spiky hair - upward-pointing cones */}
      {[
        [0, 0.22, 0],
        [-0.08, 0.2, 0.04],
        [0.08, 0.2, 0.04],
        [-0.05, 0.21, -0.06],
        [0.06, 0.21, -0.06],
        [-0.12, 0.18, 0],
        [0.12, 0.18, 0],
        [0, 0.2, 0.08],
        [-0.04, 0.23, -0.02],
        [0.04, 0.23, -0.02],
      ].map(([x, y, z], i) => (
        <mesh key={`spike-${i}`} position={[x, y, z]} rotation={DEXTER_SPIKE_ROTATIONS[i] as [number, number, number]} castShadow>
          <coneGeometry args={[0.03, 0.12, 5]} />
          <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Dexter body details (relative to body origin) ─── */
function DexterBodyDetails() {
  return (
    <group>
      {/* Bandolier of grenades across chest */}
      {[0, 1, 2, 3].map((i) => (
        <group key={`grenade-${i}`} position={[-0.1 + i * 0.07, 1.2 - i * 0.05, 0.15]} rotation={[0.3, 0.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 6]} />
            <meshStandardMaterial color="#3a4a2a" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.035, 0]} castShadow>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#5a6a3a" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Leather jacket collar - upturned boxes at neck */}
      <mesh position={[-0.08, 1.42, 0.02]} rotation={[0.2, 0, 0.15]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
        <meshStandardMaterial color="#3a2018" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0.08, 1.42, 0.02]} rotation={[0.2, 0, -0.15]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
        <meshStandardMaterial color="#3a2018" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Shotgun shells on belt */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={`shell-${i}`} position={[-0.12 + i * 0.05, 0.8, 0.1]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.04, 5]} />
          <meshStandardMaterial color="#cc3333" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* Shoulder pads - leather */}
      <mesh position={[-0.28, 1.35, 0]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.13]} />
        <meshStandardMaterial color="#3a2018" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0.28, 1.35, 0]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.13]} />
        <meshStandardMaterial color="#3a2018" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Ability particle ring ─── */
function AbilityRing({ color }: { color: string }) {
  const ringRef = useRef<THREE.Group>(null);
  const particleCount = 24;

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    ringRef.current.rotation.y = t * 2;
    ringRef.current.position.y = 0.6 + Math.sin(t * 3) * 0.1;
  });

  return (
    <group ref={ringRef} position={[0, 0.6, 0]}>
      {Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 0.6;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
          >
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={3}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Main component ─── */
export default function SurvivorModel({
  survivorId,
  color: colorOverride,
  position = [0, 0, 0],
  rotation = 0,
  showAbilityEffect = false,
}: SurvivorModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const glowSphereRef = useRef<THREE.Mesh>(null);

  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const abilityActive = usePlayerStore((s) => s.abilityActive);

  const id = survivorId ?? selectedSurvivor;
  const survivor = SURVIVORS[id];
  const color = colorOverride ?? survivor.color;
  const palette = PALETTES[id];

  // Sara is sleeker profile
  const bodyScale = id === 'sara' ? 0.92 : 1;

  // Animation state refs for smooth lerp
  const animState = useRef({
    leftArmAngle: 0,
    rightArmAngle: 0,
    leftForearmAngle: 0,
    rightForearmAngle: 0,
    leftLegAngle: 0,
    rightLegAngle: 0,
    leftShinAngle: 0,
    rightShinAngle: 0,
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const delta = Math.min(state.clock.getDelta(), 0.05); // cap delta

    // Breathing animation
    const breathAmt = Math.sin(t * 1.8) * 0.008;
    if (torsoRef.current) {
      torsoRef.current.position.y = breathAmt;
    }

    // Idle head sway
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.02;
    }

    // Walking animation - arms and legs swing with sine waves
    const walkSpeed = 4;
    const armSwing = 0.4;
    const legSwing = 0.35;

    const targetLeftArm = Math.sin(t * walkSpeed) * armSwing;
    const targetRightArm = Math.sin(t * walkSpeed + Math.PI) * armSwing;
    const targetLeftForearm = Math.max(0, Math.sin(t * walkSpeed) * 0.3);
    const targetRightForearm = Math.max(0, Math.sin(t * walkSpeed + Math.PI) * 0.3);
    const targetLeftLeg = Math.sin(t * walkSpeed + Math.PI) * legSwing;
    const targetRightLeg = Math.sin(t * walkSpeed) * legSwing;
    const targetLeftShin = Math.max(0, -Math.sin(t * walkSpeed + Math.PI) * 0.4);
    const targetRightShin = Math.max(0, -Math.sin(t * walkSpeed) * 0.4);

    // Smooth lerp transitions
    const lerpSpeed = delta * 8;
    animState.current.leftArmAngle = THREE.MathUtils.lerp(animState.current.leftArmAngle, targetLeftArm, lerpSpeed);
    animState.current.rightArmAngle = THREE.MathUtils.lerp(animState.current.rightArmAngle, targetRightArm, lerpSpeed);
    animState.current.leftForearmAngle = THREE.MathUtils.lerp(animState.current.leftForearmAngle, targetLeftForearm, lerpSpeed);
    animState.current.rightForearmAngle = THREE.MathUtils.lerp(animState.current.rightForearmAngle, targetRightForearm, lerpSpeed);
    animState.current.leftLegAngle = THREE.MathUtils.lerp(animState.current.leftLegAngle, targetLeftLeg, lerpSpeed);
    animState.current.rightLegAngle = THREE.MathUtils.lerp(animState.current.rightLegAngle, targetRightLeg, lerpSpeed);
    animState.current.leftShinAngle = THREE.MathUtils.lerp(animState.current.leftShinAngle, targetLeftShin, lerpSpeed);
    animState.current.rightShinAngle = THREE.MathUtils.lerp(animState.current.rightShinAngle, targetRightShin, lerpSpeed);

    // Apply arm rotations
    if (leftUpperArmRef.current) leftUpperArmRef.current.rotation.x = animState.current.leftArmAngle;
    if (rightUpperArmRef.current) rightUpperArmRef.current.rotation.x = animState.current.rightArmAngle;
    if (leftForearmRef.current) leftForearmRef.current.rotation.x = -animState.current.leftForearmAngle;
    if (rightForearmRef.current) rightForearmRef.current.rotation.x = -animState.current.rightForearmAngle;

    // Apply leg rotations
    if (leftThighRef.current) leftThighRef.current.rotation.x = animState.current.leftLegAngle;
    if (rightThighRef.current) rightThighRef.current.rotation.x = animState.current.rightLegAngle;
    if (leftShinRef.current) leftShinRef.current.rotation.x = animState.current.leftShinAngle;
    if (rightShinRef.current) rightShinRef.current.rotation.x = animState.current.rightShinAngle;

    // Ability glow pulsing
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(t * 6) * 1.5;
    }
    if (glowSphereRef.current) {
      const mat = glowSphereRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.15 + Math.sin(t * 4) * 0.1;
      mat.emissiveIntensity = 2 + Math.sin(t * 5) * 1;
    }
  });

  // Determine custom boot style per character
  const bootStyle = id === 'marcus' ? 'military' : id === 'sara' ? 'sleek' : 'default';

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={bodyScale}>
      {/* ─── TORSO GROUP (breathing animated) ─── */}
      <group ref={torsoRef}>
        {/* Upper torso / chest */}
        <mesh position={[0, 1.18, 0]} castShadow>
          <boxGeometry args={[0.38, 0.32, 0.22]} />
          <meshStandardMaterial color={palette.shirt} roughness={0.7} metalness={0.15} />
        </mesh>

        {/* Lower torso / abdomen */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.32, 0.18, 0.2]} />
          <meshStandardMaterial color={palette.shirt} roughness={0.7} metalness={0.15} />
        </mesh>

        {/* Chest plate/vest front detail */}
        <mesh position={[0, 1.18, 0.115]} castShadow>
          <boxGeometry args={[0.34, 0.28, 0.01]} />
          <meshStandardMaterial color={palette.vest} roughness={0.75} metalness={0.2} />
        </mesh>

        {/* Chest plate/vest back detail */}
        <mesh position={[0, 1.18, -0.115]} castShadow>
          <boxGeometry args={[0.34, 0.28, 0.01]} />
          <meshStandardMaterial color={palette.vest} roughness={0.75} metalness={0.2} />
        </mesh>

        {/* Collar */}
        <mesh position={[0, 1.38, 0]} castShadow>
          <boxGeometry args={[0.24, 0.04, 0.18]} />
          <meshStandardMaterial color={palette.shirt} roughness={0.7} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.34, 0.04, 0.22]} />
          <meshStandardMaterial color={palette.belt} roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Belt buckle */}
        <mesh position={[0, 0.82, 0.115]} castShadow>
          <boxGeometry args={[0.05, 0.035, 0.01]} />
          <meshStandardMaterial color="#c0a030" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Pockets - left */}
        <mesh position={[-0.1, 1.06, 0.115]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.01]} />
          <meshStandardMaterial color={palette.detail} roughness={0.8} />
        </mesh>
        {/* Pockets - right */}
        <mesh position={[0.1, 1.06, 0.115]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.01]} />
          <meshStandardMaterial color={palette.detail} roughness={0.8} />
        </mesh>

        {/* ─── NECK ─── */}
        <mesh position={[0, 1.44, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.08, 8]} />
          <meshStandardMaterial color={palette.skin} roughness={0.6} />
        </mesh>

        {/* ─── HEAD ─── */}
        <group ref={headRef} position={[0, 1.58, 0]}>
          {/* Head - rounded box approximation */}
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.26, 0.22]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Round top of head */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Jaw line */}
          <mesh position={[0, -0.1, 0.02]} castShadow>
            <boxGeometry args={[0.2, 0.08, 0.18]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Chin */}
          <mesh position={[0, -0.14, 0.06]} castShadow>
            <boxGeometry args={[0.08, 0.03, 0.06]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Ears - left */}
          <mesh position={[-0.13, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.07, 0.04]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Ears - right */}
          <mesh position={[0.13, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.07, 0.04]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>

          {/* Eyes */}
          <Eyes eyeColor={palette.eyeColor} />

          {/* Eyebrows */}
          <Eyebrows color={palette.hair} />

          {/* Mouth line */}
          <mesh position={[0, -0.07, 0.115]} castShadow>
            <boxGeometry args={[0.07, 0.006, 0.008]} />
            <meshStandardMaterial color="#4a3030" roughness={0.8} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.02, 0.125]} castShadow>
            <boxGeometry args={[0.03, 0.04, 0.02]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>

          {/* Hair base on top (for characters with flat hair) */}
          {id !== 'dexter' && (
            <mesh position={[0, 0.12, -0.02]} castShadow>
              <boxGeometry args={[0.22, 0.06, 0.22]} />
              <meshStandardMaterial color={palette.hair} roughness={0.85} />
            </mesh>
          )}
          {/* Dexter has no flat hair base - spiky cones instead */}

          {/* ─── CHARACTER-SPECIFIC HEAD DETAILS ─── */}
          {id === 'marcus' && <MarcusHeadDetails />}
          {id === 'elena' && <ElenaHeadDetails />}
          {id === 'viktor' && <ViktorHeadDetails />}
          {id === 'sara' && <SaraHeadDetails />}
          {id === 'dexter' && <DexterHeadDetails />}
        </group>

        {/* ─── LEFT ARM ─── */}
        <group ref={leftUpperArmRef} position={[-0.24, 1.32, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.1]} />
            <meshStandardMaterial color={palette.shirt} roughness={0.7} metalness={0.15} />
          </mesh>
          {/* Elbow joint sphere */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Forearm group */}
          <group ref={leftForearmRef} position={[0, -0.28, 0]}>
            <mesh position={[0, -0.13, 0]} castShadow>
              <boxGeometry args={[0.09, 0.26, 0.09]} />
              <meshStandardMaterial color={id === 'dexter' ? '#3a2018' : palette.skin} roughness={id === 'dexter' ? 0.65 : 0.6} metalness={id === 'dexter' ? 0.15 : 0} />
            </mesh>
            {/* Hand */}
            <group position={[0, -0.29, 0]}>
              {id === 'dexter' ? (
                /* Heavy gloves for Dexter */
                <mesh castShadow>
                  <boxGeometry args={[0.1, 0.1, 0.07]} />
                  <meshStandardMaterial color="#3a2018" roughness={0.65} metalness={0.15} />
                </mesh>
              ) : (
                <>
                  <mesh castShadow>
                    <boxGeometry args={[0.07, 0.06, 0.04]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  {/* Fingers */}
                  <mesh position={[-0.02, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.03, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.035, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[0.02, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.03, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  {/* Thumb */}
                  <mesh position={[-0.04, -0.02, 0.01]} rotation={[0, 0, 0.5]} castShadow>
                    <boxGeometry args={[0.012, 0.025, 0.025]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                </>
              )}
            </group>
          </group>
        </group>

        {/* ─── RIGHT ARM ─── */}
        <group ref={rightUpperArmRef} position={[0.24, 1.32, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.1]} />
            <meshStandardMaterial color={palette.shirt} roughness={0.7} metalness={0.15} />
          </mesh>
          {/* Elbow joint sphere */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={palette.skin} roughness={0.6} />
          </mesh>
          {/* Forearm group */}
          <group ref={rightForearmRef} position={[0, -0.28, 0]}>
            <mesh position={[0, -0.13, 0]} castShadow>
              <boxGeometry args={[0.09, 0.26, 0.09]} />
              <meshStandardMaterial color={id === 'dexter' ? '#3a2018' : palette.skin} roughness={id === 'dexter' ? 0.65 : 0.6} metalness={id === 'dexter' ? 0.15 : 0} />
            </mesh>
            {/* Hand */}
            <group position={[0, -0.29, 0]}>
              {id === 'dexter' ? (
                <mesh castShadow>
                  <boxGeometry args={[0.1, 0.1, 0.07]} />
                  <meshStandardMaterial color="#3a2018" roughness={0.65} metalness={0.15} />
                </mesh>
              ) : (
                <>
                  <mesh castShadow>
                    <boxGeometry args={[0.07, 0.06, 0.04]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[-0.02, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.03, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.035, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[0.02, -0.04, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.03, 0.035]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                  <mesh position={[0.04, -0.02, 0.01]} rotation={[0, 0, -0.5]} castShadow>
                    <boxGeometry args={[0.012, 0.025, 0.025]} />
                    <meshStandardMaterial color={palette.skin} roughness={0.6} />
                  </mesh>
                </>
              )}
            </group>
          </group>
        </group>

        {/* ─── CHARACTER-SPECIFIC BODY DETAILS (in torso group so they breathe with body) ─── */}
        {id === 'marcus' && <MarcusBodyDetails />}
        {id === 'elena' && <ElenaBodyDetails />}
        {id === 'viktor' && <ViktorBodyDetails />}
        {id === 'sara' && <SaraBodyDetails />}
        {id === 'dexter' && <DexterBodyDetails />}
      </group>

      {/* ─── LEGS (outside torso group so they don't breathe) ─── */}
      {/* Left leg */}
      <group ref={leftThighRef} position={[-0.1, 0.78, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.13, 0.36, 0.13]} />
          <meshStandardMaterial color={palette.pants} roughness={0.75} metalness={0.1} />
        </mesh>
        {/* Knee joint */}
        <mesh position={[0, -0.36, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={palette.pants} roughness={0.7} />
        </mesh>
        {/* Shin group */}
        <group ref={leftShinRef} position={[0, -0.36, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.11]} />
            <meshStandardMaterial color={palette.pants} roughness={0.75} metalness={0.1} />
          </mesh>
          {/* Boots */}
          {bootStyle === 'military' && (
            <group position={[0, -0.35, 0]}>
              <mesh position={[0, 0.05, 0]} castShadow>
                <boxGeometry args={[0.14, 0.06, 0.16]} />
                <meshStandardMaterial color="#2a2018" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.01, 0.02]} castShadow>
                <boxGeometry args={[0.14, 0.08, 0.2]} />
                <meshStandardMaterial color="#1f1a14" roughness={0.9} metalness={0.1} />
              </mesh>
            </group>
          )}
          {bootStyle === 'sleek' && (
            <mesh position={[0, -0.35, 0.015]} castShadow>
              <boxGeometry args={[0.11, 0.06, 0.17]} />
              <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
            </mesh>
          )}
          {bootStyle === 'default' && (
            <mesh position={[0, -0.35, 0.02]} castShadow>
              <boxGeometry args={[0.13, 0.1, 0.18]} />
              <meshStandardMaterial color={palette.boots} roughness={0.85} metalness={0.1} />
            </mesh>
          )}
        </group>
      </group>

      {/* Right leg */}
      <group ref={rightThighRef} position={[0.1, 0.78, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.13, 0.36, 0.13]} />
          <meshStandardMaterial color={palette.pants} roughness={0.75} metalness={0.1} />
        </mesh>
        {/* Knee joint */}
        <mesh position={[0, -0.36, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={palette.pants} roughness={0.7} />
        </mesh>
        {/* Shin group */}
        <group ref={rightShinRef} position={[0, -0.36, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.11]} />
            <meshStandardMaterial color={palette.pants} roughness={0.75} metalness={0.1} />
          </mesh>
          {/* Boots */}
          {bootStyle === 'military' && (
            <group position={[0, -0.35, 0]}>
              <mesh position={[0, 0.05, 0]} castShadow>
                <boxGeometry args={[0.14, 0.06, 0.16]} />
                <meshStandardMaterial color="#2a2018" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.01, 0.02]} castShadow>
                <boxGeometry args={[0.14, 0.08, 0.2]} />
                <meshStandardMaterial color="#1f1a14" roughness={0.9} metalness={0.1} />
              </mesh>
            </group>
          )}
          {bootStyle === 'sleek' && (
            <mesh position={[0, -0.35, 0.015]} castShadow>
              <boxGeometry args={[0.11, 0.06, 0.17]} />
              <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
            </mesh>
          )}
          {bootStyle === 'default' && (
            <mesh position={[0, -0.35, 0.02]} castShadow>
              <boxGeometry args={[0.13, 0.1, 0.18]} />
              <meshStandardMaterial color={palette.boots} roughness={0.85} metalness={0.1} />
            </mesh>
          )}
        </group>
      </group>

      {/* ─── ABILITY ACTIVATION EFFECT ─── */}
      {(showAbilityEffect || abilityActive) && (
        <>
          <pointLight
            ref={glowRef}
            position={[0, 1.0, 0]}
            color={color}
            distance={6}
            decay={2}
            intensity={3}
          />
          <mesh ref={glowSphereRef} position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Inner glow core */}
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.08}
            />
          </mesh>
          {/* Particle ring */}
          <AbilityRing color={color} />
        </>
      )}
    </group>
  );
}
