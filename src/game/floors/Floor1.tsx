'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';

const ROOM_W = 40;
const ROOM_D = 40;
const WALL_H = 4;
const WALL_THICKNESS = 0.3;

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#2a2520" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

function FlickeringLight({ position, baseIntensity = 2, color = '#ccddff' }: { position: [number, number, number]; baseIntensity?: number; color?: string }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => Math.random() * 100, []);
  const flickerSpeed = useMemo(() => 2 + Math.random() * 5, []);

  useFrame(() => {
    if (!lightRef.current) return;
    const t = performance.now() * 0.001;
    const flicker = Math.sin(t * flickerSpeed + phase) * 0.5
      + Math.sin(t * flickerSpeed * 3.7 + phase) * 0.3
      + Math.sin(t * 0.7 + phase) * 0.2;
    const blackout = Math.sin(t * 0.3 + phase * 2) > 0.95 ? 0 : 1;
    lightRef.current.intensity = baseIntensity * (0.6 + flicker * 0.4) * blackout;
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        position={position}
        color={color}
        distance={12}
        decay={2}
        castShadow
      />
      <mesh position={position}>
        <boxGeometry args={[0.6, 0.1, 0.2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
}

// ===== EMERGENCY EXIT SIGN =====
function EmergencyExitSign({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.intensity = 1.5 + Math.sin(t * 2) * 0.2;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Sign body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#004400" emissive="#00ff44" emissiveIntensity={1} />
      </mesh>
      {/* Arrow */}
      <mesh position={[0.25, 0, 0.03]}>
        <boxGeometry args={[0.15, 0.15, 0.01]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ff44" emissiveIntensity={2} />
      </mesh>
      {/* Illumination */}
      <pointLight ref={glowRef} position={[0, -0.3, 0.5]} color="#00ff44" distance={5} decay={2} intensity={1.5} />
    </group>
  );
}

// ===== BLOOD HANDPRINTS ON WALLS =====
function BloodHandprints() {
  const handprints = useMemo(
    () => [
      { pos: [19.7, 1.5, -5] as [number, number, number], rot: [0, -Math.PI / 2, 0.1] as [number, number, number], scale: 0.4 },
      { pos: [19.7, 1.2, 8] as [number, number, number], rot: [0, -Math.PI / 2, -0.15] as [number, number, number], scale: 0.35 },
      { pos: [-19.7, 1.8, -12] as [number, number, number], rot: [0, Math.PI / 2, 0.2] as [number, number, number], scale: 0.45 },
      { pos: [-5, 1.4, -19.7] as [number, number, number], rot: [-Math.PI / 2, 0, 0.1] as [number, number, number], scale: 0.5 },
      { pos: [8, 1.6, 19.7] as [number, number, number], rot: [Math.PI / 2, 0, -0.1] as [number, number, number], scale: 0.3 },
      { pos: [-19.7, 1.0, 15] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], scale: 0.55 },
    ],
    []
  );

  return (
    <>
      {handprints.map((hp, i) => (
        <group key={i} position={hp.pos} rotation={hp.rot}>
          {/* Palm */}
          <mesh position={[0, 0, 0.01]} scale={[hp.scale, hp.scale, hp.scale]}>
            <circleGeometry args={[0.3, 12]} />
            <meshStandardMaterial color="#440000" emissive="#220000" emissiveIntensity={0.5} transparent opacity={0.7} roughness={1} side={THREE.DoubleSide} />
          </mesh>
          {/* Fingers */}
          {[0.12, 0.06, -0.06, -0.12].map((xOff, j) => (
            <mesh key={j} position={[xOff * hp.scale, 0.35 * hp.scale, 0.01]} scale={[hp.scale, hp.scale, hp.scale]}>
              <planeGeometry args={[0.07, 0.25]} />
              <meshStandardMaterial color="#440000" emissive="#220000" emissiveIntensity={0.5} transparent opacity={0.65} roughness={1} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ===== WATER PUDDLES =====
function WaterPuddles() {
  const puddles = useMemo(
    () => [
      { pos: [-5, 0.005, 3] as [number, number, number], size: 1.2 + Math.random() * 0.5 },
      { pos: [8, 0.005, -3] as [number, number, number], size: 0.8 + Math.random() * 0.4 },
      { pos: [-12, 0.005, 10] as [number, number, number], size: 1.5 + Math.random() * 0.5 },
      { pos: [15, 0.005, 12] as [number, number, number], size: 0.9 + Math.random() * 0.3 },
      { pos: [3, 0.005, 15] as [number, number, number], size: 1.1 + Math.random() * 0.4 },
      { pos: [-8, 0.005, -8] as [number, number, number], size: 0.7 + Math.random() * 0.3 },
    ],
    []
  );

  return (
    <>
      {puddles.map((puddle, i) => (
        <mesh key={i} position={puddle.pos} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[puddle.size, 24]} />
          <meshStandardMaterial
            color="#1a2030"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== POWER BOX WITH SPARKING =====
function PowerBox() {
  const sparkLightRef = useRef<THREE.PointLight>(null);
  const sparkTimerRef = useRef(0);
  const nextSparkRef = useRef(Math.random() * 3 + 1);

  useFrame((_, delta) => {
    if (!sparkLightRef.current) return;
    sparkTimerRef.current += delta;

    if (sparkTimerRef.current >= nextSparkRef.current) {
      sparkTimerRef.current = 0;
      nextSparkRef.current = Math.random() * 4 + 0.5;
      sparkLightRef.current.intensity = 5;
    }

    if (sparkLightRef.current.intensity > 0) {
      sparkLightRef.current.intensity *= 0.85;
      if (sparkLightRef.current.intensity < 0.1) sparkLightRef.current.intensity = 0;
    }
  });

  return (
    <group position={[-19.5, 2.5, -8]}>
      {/* Box body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Open panel */}
      <mesh position={[0, 0.1, 0.16]} rotation={[0.8, 0, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.02]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Exposed wires */}
      <mesh position={[0.1, -0.1, 0.18]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.1, -0.15, 0.18]} rotation={[-0.2, 0, -0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.25, 4]} />
        <meshStandardMaterial color="#2244ff" emissive="#2244ff" emissiveIntensity={0.2} />
      </mesh>
      {/* Spark light */}
      <pointLight ref={sparkLightRef} position={[0, 0, 0.3]} color="#ffaa44" distance={4} decay={2} intensity={0} />
      {/* Warning sign */}
      <mesh position={[0, 0.55, 0.16]}>
        <boxGeometry args={[0.3, 0.15, 0.01]} />
        <meshStandardMaterial color="#ccaa00" emissive="#ccaa00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ===== CEILING DAMAGE =====
function CeilingDamage() {
  const damages = useMemo(
    () => [
      { pos: [-8, WALL_H - 0.05, 5] as [number, number, number], size: [2, 3] as [number, number] },
      { pos: [12, WALL_H - 0.05, -8] as [number, number, number], size: [1.5, 2] as [number, number] },
      { pos: [0, WALL_H - 0.05, 12] as [number, number, number], size: [2.5, 1.5] as [number, number] },
    ],
    []
  );

  return (
    <>
      {/* Broken ceiling tiles - dark patches */}
      {damages.map((d, i) => (
        <mesh key={`ceil-${i}`} position={d.pos} rotation={[Math.PI / 2, 0, Math.random() * 0.3]}>
          <planeGeometry args={d.size} />
          <meshStandardMaterial color="#0f0d0a" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Exposed pipes */}
      <mesh position={[-8, WALL_H - 0.3, 5]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#666655" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[12, WALL_H - 0.25, -8]} rotation={[0, -0.3, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
        <meshStandardMaterial color="#556655" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Dripping pipe joint */}
      <mesh position={[-8, WALL_H - 0.2, 7]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#556655" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Hanging wire from ceiling */}
      <mesh position={[5, WALL_H - 0.4, -3]} rotation={[0.1, 0, 0.2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.8, 4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[5, WALL_H - 0.8, -3]} rotation={[0.3, 0, 0.1]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </>
  );
}

// ===== BROKEN CHAIRS =====
function BrokenChairs() {
  const chairs = useMemo(
    () => [
      { pos: [6, 0.3, 12] as [number, number, number], rot: [0.5, 0.8, 1.2] as [number, number, number] },
      { pos: [-10, 0.25, 5] as [number, number, number], rot: [0.3, -0.4, 0.9] as [number, number, number] },
      { pos: [15, 0.2, -3] as [number, number, number], rot: [-0.2, 1.2, 0.5] as [number, number, number] },
    ],
    []
  );

  return (
    <>
      {chairs.map((chair, i) => (
        <group key={i} position={chair.pos} rotation={chair.rot}>
          {/* Seat */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.05, 0.5]} />
            <meshStandardMaterial color="#3d3529" roughness={0.85} />
          </mesh>
          {/* Back - broken, leaning */}
          <mesh position={[0, 0.25, -0.22]} rotation={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.04]} />
            <meshStandardMaterial color="#3d3529" roughness={0.85} />
          </mesh>
          {/* Broken leg */}
          <mesh position={[0.2, -0.15, 0.2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
            <meshStandardMaterial color="#2a2015" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ===== KNOCKED OVER PLANT POTS =====
function KnockedPlantPots() {
  const pots = useMemo(
    () => [
      { pos: [10, 0.15, 8] as [number, number, number], rot: [0, 0, Math.PI / 3] as [number, number, number] },
      { pos: [-5, 0.12, -10] as [number, number, number], rot: [0, 0, Math.PI / 2.5] as [number, number, number] },
    ],
    []
  );

  return (
    <>
      {pots.map((pot, i) => (
        <group key={i} position={pot.pos} rotation={pot.rot}>
          {/* Pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.25, 8]} />
            <meshStandardMaterial color="#5a3a20" roughness={0.9} />
          </mesh>
          {/* Spilled dirt */}
          <mesh position={[0.2, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 12]} />
            <meshStandardMaterial color="#2a1f10" roughness={1} />
          </mesh>
          {/* Dead plant stem */}
          <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0.2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
            <meshStandardMaterial color="#2a3a1a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ===== SCATTERED FILES =====
function ScatteredFiles() {
  const files = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        position: [
          -2 + (Math.random() - 0.5) * 6,
          0.01,
          8 + (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        rotation: Math.random() * Math.PI,
      })),
    []
  );

  return (
    <>
      {files.map((file, i) => (
        <mesh key={i} position={file.position} rotation={[-Math.PI / 2, 0, file.rotation]}>
          <planeGeometry args={[0.22, 0.3]} />
          <meshStandardMaterial color="#d4c5a9" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ===== BLOOD TRAIL =====
function BloodTrail() {
  const positions = useMemo(
    () => [
      [0, 0.01, 5],
      [-1, 0.01, 7],
      [-2.5, 0.01, 10],
      [-3, 0.01, 13],
      [-2, 0.01, 16],
      [-0.5, 0.01, 18],
      [1, 0.01, 20],
    ] as [number, number, number][],
    []
  );

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[0.3 + Math.random() * 0.5, 12]} />
          <meshStandardMaterial color="#6b0000" transparent opacity={0.7} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ===== ENHANCED RECEPTION DESK =====
function ReceptionDesk() {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!screenRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    // Flickering screen effect
    mat.emissiveIntensity = 1 + Math.sin(t * 15) * 0.2 + Math.sin(t * 37) * 0.1;
  });

  return (
    <group position={[0, 0, 5]}>
      {/* Main desk surface */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.15, 1.2]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Desk front panel */}
      <mesh position={[0, 0.45, 0.55]} castShadow>
        <boxGeometry args={[4, 0.9, 0.1]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
      </mesh>
      {/* Computer monitor */}
      <mesh position={[-1, 1.2, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Computer screen - glowing */}
      <mesh ref={screenRef} position={[-1, 1.2, -0.17]}>
        <planeGeometry args={[0.5, 0.32]} />
        <meshStandardMaterial
          color="#004488"
          emissive="#0066cc"
          emissiveIntensity={1}
          roughness={0.2}
        />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[-1, 1.0, -0.15]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Monitor base */}
      <mesh position={[-1, 0.93, -0.2]} castShadow>
        <boxGeometry args={[0.3, 0.03, 0.2]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[-1, 0.98, 0]} castShadow>
        <boxGeometry args={[0.4, 0.03, 0.15]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Coffee mug */}
      <mesh position={[0.8, 1.0, 0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Pen holder */}
      <mesh position={[1.2, 1.0, -0.1]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Papers on desk */}
      <mesh position={[0.5, 0.98, 0.2]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.2, 0.28]} />
        <meshStandardMaterial color="#d4c5a9" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Desk side panel left */}
      <mesh position={[-1.9, 0.45, 0]} castShadow>
        <boxGeometry args={[0.1, 0.9, 1.1]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
      </mesh>
      {/* Desk side panel right */}
      <mesh position={[1.9, 0.45, 0]} castShadow>
        <boxGeometry args={[0.1, 0.9, 1.1]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function OverturnedFurniture() {
  const items = useMemo(
    () => [
      { pos: [8, 0.4, 10] as [number, number, number], rot: [0.4, 0.5, 1.2] as [number, number, number], size: [1.2, 0.8, 0.6] as [number, number, number] },
      { pos: [-10, 0.3, 15] as [number, number, number], rot: [0.2, -0.3, 0.8] as [number, number, number], size: [1.5, 0.6, 0.5] as [number, number, number] },
      { pos: [12, 0.35, -5] as [number, number, number], rot: [-0.3, 1.0, 0.5] as [number, number, number], size: [0.8, 0.7, 0.5] as [number, number, number] },
    ],
    []
  );

  return (
    <>
      {items.map((item, i) => (
        <mesh key={i} position={item.pos} rotation={item.rot} castShadow>
          <boxGeometry args={item.size} />
          <meshStandardMaterial color="#3d3529" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

function ElevatorDoor() {
  return (
    <group position={[0, 0, -19.7]}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3, 4, 0.15]} />
        <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.65, 2, 0.08]} castShadow>
        <boxGeometry args={[1.2, 3.8, 0.05]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, 2, 0.08]} castShadow>
        <boxGeometry args={[1.2, 3.8, 0.05]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.8, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.3, 0.12]}>
        <boxGeometry args={[0.8, 0.3, 0.01]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function SecurityDoor() {
  return (
    <group position={[-19.7, 0, 0]}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[2, 4, 0.15]} />
        <meshStandardMaterial color="#333333" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2, 0.08]} castShadow>
        <boxGeometry args={[1.8, 3.8, 0.08]} />
        <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.7, 2, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 3.5, 0.1]}>
        <boxGeometry args={[0.6, 0.2, 0.01]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function GlowstickSavePoint() {
  const glowRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.intensity = 1.5 + Math.sin(t * 3) * 0.3;
  });

  return (
    <group position={[5, 0, -10]}>
      <mesh ref={meshRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.3, 0]} color="#00ff44" distance={6} decay={2} intensity={1.5} />
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 24]} />
        <meshStandardMaterial color="#003311" emissive="#00ff44" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function ScatteredPapers() {
  const papers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 35,
          0.01,
          (Math.random() - 0.5) * 35,
        ] as [number, number, number],
        rotation: Math.random() * Math.PI,
      })),
    []
  );

  return (
    <>
      {papers.map((paper, i) => (
        <mesh key={i} position={paper.position} rotation={[-Math.PI / 2, 0, paper.rotation]}>
          <planeGeometry args={[0.2 + Math.random() * 0.15, 0.28 + Math.random() * 0.1]} />
          <meshStandardMaterial color="#d4c5a9" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function BrokenGlass() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        position: [
          5 + (Math.random() - 0.5) * 6,
          0.01,
          10 + (Math.random() - 0.5) * 6,
        ] as [number, number, number],
        rotation: Math.random() * Math.PI,
        size: 0.1 + Math.random() * 0.15,
      })),
    []
  );

  return (
    <>
      {pieces.map((piece, i) => (
        <mesh key={i} position={piece.position} rotation={[-Math.PI / 2, 0, piece.rotation]}>
          <planeGeometry args={[piece.size, piece.size * 1.3]} />
          <meshStandardMaterial
            color="#aaccdd"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

function Floor1Spawner() {
  const spawnZombies = useZombieStore((s) => s.spawnZombies);
  const zombies = useZombieStore((s) => s.zombies);
  const hasSpawned = useRef(false);

  useEffect(() => {
    if (hasSpawned.current) return;
    hasSpawned.current = true;

    const configs: ZombieSpawnConfig[] = [
      {
        type: 'walker',
        count: 6,
        positions: [
          [-12, 0, -10],
          [14, 0, -8],
          [-8, 0, 5],
          [10, 0, 12],
          [-15, 0, 15],
          [5, 0, -15],
        ],
      },
      {
        type: 'runner',
        count: 2,
        positions: [
          [16, 0, 0],
          [-10, 0, -15],
        ],
      },
    ];

    spawnZombies(configs);
  }, [spawnZombies, zombies.length]);

  return null;
}

export default function Floor1() {
  const halfW = ROOM_W / 2;
  const halfD = ROOM_D / 2;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#1a1714" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#1c1916" roughness={0.95} />
      </mesh>

      {/* Walls */}
      <Wall position={[0, WALL_H / 2, -halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} />
      <Wall position={[0, WALL_H / 2, halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} />
      <Wall position={[-halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} />
      <Wall position={[halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} />

      {/* Furniture */}
      <ReceptionDesk />
      <OverturnedFurniture />

      {/* NEW: Broken chairs */}
      <BrokenChairs />

      {/* NEW: Knocked over plant pots */}
      <KnockedPlantPots />

      {/* NEW: Scattered files */}
      <ScatteredFiles />

      {/* Flickering lights - varied colors */}
      <FlickeringLight position={[-10, 3.8, -10]} baseIntensity={2} />
      <FlickeringLight position={[10, 3.8, -10]} baseIntensity={2} />
      <FlickeringLight position={[-10, 3.8, 10]} baseIntensity={1.5} color="#aabbcc" />
      <FlickeringLight position={[10, 3.8, 10]} baseIntensity={2} />
      <FlickeringLight position={[0, 3.8, 0]} baseIntensity={2.5} />
      <FlickeringLight position={[0, 3.8, -15]} baseIntensity={1.5} />

      {/* NEW: Colored emergency lights in darker areas */}
      <FlickeringLight position={[-15, 3.8, -15]} baseIntensity={1} color="#ff4444" />
      <FlickeringLight position={[15, 3.8, 15]} baseIntensity={0.8} color="#ff8844" />
      {/* Dim area with almost no light */}
      <pointLight position={[-15, 3.8, 15]} color="#334455" distance={6} decay={2} intensity={0.3} />

      {/* Blood trail */}
      <BloodTrail />

      {/* NEW: Blood handprints on walls */}
      <BloodHandprints />

      {/* NEW: Water puddles with reflection */}
      <WaterPuddles />

      {/* NEW: Emergency exit signs */}
      <EmergencyExitSign position={[18, 3, -18]} rotation={Math.PI / 4} />
      <EmergencyExitSign position={[-18, 3, 18]} rotation={-Math.PI * 0.75} />
      <EmergencyExitSign position={[18, 3, 5]} rotation={0} />

      {/* NEW: Power box with sparking effect */}
      <PowerBox />

      {/* NEW: Ceiling damage */}
      <CeilingDamage />

      {/* Elevator door */}
      <ElevatorDoor />

      {/* Security room door */}
      <SecurityDoor />

      {/* Save point glowstick */}
      <GlowstickSavePoint />

      {/* Scattered papers */}
      <ScatteredPapers />

      {/* Broken glass */}
      <BrokenGlass />

      {/* Spawn zombies */}
      <Floor1Spawner />
    </group>
  );
}
