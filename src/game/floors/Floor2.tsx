'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';

const WALL_H = 3.5;
const WALL_THICK = 0.15;
const WALL_COLOR = '#2a2a30';
const FLOOR_COLOR = '#1e1c1a';

function CubicleWall({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 1.5, WALL_THICK]} />
      <meshStandardMaterial color="#3a3840" roughness={0.8} />
    </mesh>
  );
}

function CubicleMaze() {
  const cubicles = useMemo(
    () => [
      // Row 1
      { pos: [-12, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [-8, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -12] as [number, number, number], rot: 0 },
      // Row 2
      { pos: [-12, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -7] as [number, number, number], rot: 0 },
      // Row 3
      { pos: [-12, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [-8, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -2] as [number, number, number], rot: 0 },
      // Right side cubicles
      { pos: [8, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [8, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [8, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -2] as [number, number, number], rot: 0 },
      // Cross walls to create corridors
      { pos: [-10, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
      { pos: [-6, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
      { pos: [10, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
    ],
    []
  );

  return (
    <group>
      {cubicles.map((c, i) => (
        <CubicleWall key={i} position={c.pos} rotation={c.rot} />
      ))}
      {/* Desk surfaces in cubicles */}
      {cubicles.slice(0, 14).map((c, i) => (
        <mesh key={`desk-${i}`} position={[c.pos[0], 0.75, c.pos[2] + 0.8]} castShadow>
          <boxGeometry args={[1.2, 0.05, 0.6]} />
          <meshStandardMaterial color="#4a4035" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function VendingMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 0.8]} />
        <meshStandardMaterial color="#2a4a3a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Glass front */}
      <mesh position={[0, 1, 0.41]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial color="#1a3a2a" transparent opacity={0.4} metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Dispensing light */}
      <mesh position={[0.3, 0.3, 0.42]}>
        <boxGeometry args={[0.15, 0.08, 0.02]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function BreakRoom() {
  return (
    <group position={[14, 0, 8]}>
      {/* Table */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 0.08, 1]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
      </mesh>
      {/* Chairs */}
      {[
        [-0.7, 0.4, 0.6],
        [0.7, 0.4, 0.6],
        [-0.7, 0.4, -0.6],
        [0.7, 0.4, -0.6],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.4, 0.8, 0.4]} />
          <meshStandardMaterial color="#3a3530" roughness={0.8} />
        </mesh>
      ))}
      <VendingMachine position={[2.5, 0, 0]} />
      <VendingMachine position={[2.5, 0, 1.5]} />
    </group>
  );
}

function ServerRoom() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    lightRef.current.intensity = 0.5 + Math.sin(t * 4) * 0.2;
  });

  return (
    <group position={[-15, 0, 8]}>
      {/* Server racks */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[-1.5 + i * 1.2, 1.25, 0]} castShadow>
          <boxGeometry args={[0.6, 2.5, 0.8]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Terminal */}
      <mesh position={[2, 1, 1]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[2, 1.3, 1.15]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      {/* Server room light */}
      <pointLight ref={lightRef} position={[0, 3, 0]} color="#4488ff" distance={8} decay={2} />
    </group>
  );
}

function Bathroom() {
  return (
    <group position={[15, 0, -10]}>
      {/* Mirror */}
      <mesh position={[0, 1.5, -3.4]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#88aacc" metalness={0.9} roughness={0.05} envMapIntensity={1} />
      </mesh>
      {/* Sink */}
      <mesh position={[0, 0.8, -3.2]} castShadow>
        <boxGeometry args={[1, 0.1, 0.5]} />
        <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Stall dividers */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.25, -1]} castShadow>
          <boxGeometry args={[WALL_THICK, 2.5, 1.8]} />
          <meshStandardMaterial color="#4a4a50" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function ManagerOffice() {
  return (
    <group position={[-15, 0, -14]}>
      {/* Large desk */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#4a3020" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Chair */}
      <mesh position={[0, 0.5, 1.2]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.7]} />
        <meshStandardMaterial color="#2a1a1a" roughness={0.8} />
      </mesh>
      {/* Bookshelf */}
      <mesh position={[-2.5, 1.5, -2]} castShadow>
        <boxGeometry args={[1.5, 3, 0.4]} />
        <meshStandardMaterial color="#3a2820" roughness={0.8} />
      </mesh>
      {/* Filing cabinet */}
      <mesh position={[2.5, 0.6, -2]} castShadow>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function RedEmergencyLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    // Pulsing red
    lightRef.current.intensity = 1 + Math.sin(t * 2) * 0.5;
  });

  return (
    <>
      <pointLight ref={lightRef} position={position} color="#ff2200" distance={10} decay={2} intensity={1} />
      <mesh position={position}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>
    </>
  );
}

function FlickeringLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => Math.random() * 100, []);

  useFrame(() => {
    if (!lightRef.current) return;
    const t = performance.now() * 0.001;
    const flicker = Math.sin(t * 3 + phase) * 0.4 + Math.sin(t * 7.3 + phase) * 0.2;
    const blackout = Math.sin(t * 0.5 + phase * 2) > 0.93 ? 0 : 1;
    lightRef.current.intensity = 1.5 * (0.6 + flicker * 0.4) * blackout;
  });

  return (
    <pointLight ref={lightRef} position={position} color="#ccddff" distance={12} decay={2} />
  );
}

function Floor2Spawner() {
  const spawnZombies = useZombieStore((s) => s.spawnZombies);
  const zombies = useZombieStore((s) => s.zombies);
  const hasSpawned = useRef(false);

  useEffect(() => {
    if (hasSpawned.current) return;
    hasSpawned.current = true;

    const configs: ZombieSpawnConfig[] = [
      {
        type: 'walker',
        count: 8,
        positions: [
          [-10, 0, -10],
          [-6, 0, -5],
          [-10, 0, 0],
          [10, 0, -10],
          [10, 0, -5],
          [14, 0, 8],
          [-14, 0, 10],
          [0, 0, 5],
        ],
      },
      {
        type: 'runner',
        count: 3,
        positions: [
          [0, 0, -10],
          [-8, 0, 8],
          [12, 0, 5],
        ],
      },
      {
        type: 'crawler',
        count: 2,
        positions: [
          [15, 0, -8],
          [-15, 0, -5],
        ],
      },
    ];

    spawnZombies(configs);
  }, [spawnZombies, zombies.length]);

  return null;
}

export default function Floor2() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.95} />
      </mesh>

      {/* Outer walls */}
      <mesh position={[0, WALL_H / 2, -20]} castShadow receiveShadow>
        <boxGeometry args={[40, WALL_H, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[0, WALL_H / 2, 20]} castShadow>
        <boxGeometry args={[40, WALL_H, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[-20, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICK, WALL_H, 40]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[20, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICK, WALL_H, 40]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>

      {/* Sections */}
      <CubicleMaze />
      <BreakRoom />
      <ServerRoom />
      <Bathroom />
      <ManagerOffice />

      {/* Lights */}
      <FlickeringLight position={[-10, 3.2, -10]} />
      <FlickeringLight position={[0, 3.2, -10]} />
      <FlickeringLight position={[10, 3.2, -10]} />
      <FlickeringLight position={[-10, 3.2, 5]} />
      <FlickeringLight position={[10, 3.2, 5]} />
      <FlickeringLight position={[0, 3.2, 10]} />

      {/* Red emergency lights */}
      <RedEmergencyLight position={[0, 3, -18]} />
      <RedEmergencyLight position={[-18, 3, 0]} />
      <RedEmergencyLight position={[18, 3, 0]} />

      {/* Elevator zone */}
      <mesh position={[0, 0.02, -19]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      <Floor2Spawner />
    </group>
  );
}
