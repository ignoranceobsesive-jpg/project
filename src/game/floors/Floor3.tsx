'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';

const WALL_H = 4;
const WALL_COLOR = '#1a1a22';
const FLOOR_COLOR = '#121215';

function StrobeLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime + phase;
    // Strobe pattern - rapid on/off
    const strobe = Math.sin(t * 8) > 0.6 ? 1 : 0.05;
    lightRef.current.intensity = 3 * strobe;
  });

  return (
    <>
      <pointLight ref={lightRef} position={position} color="#ff0000" distance={15} decay={2} />
      <mesh position={position}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </>
  );
}

function SpecimenTank({ position, liquidColor }: { position: [number, number, number]; liquidColor: string }) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!liquidRef.current) return;
    const t = state.clock.elapsedTime;
    liquidRef.current.position.y = 1 + Math.sin(t * 1.5 + phase) * 0.05;
  });

  return (
    <group position={position}>
      {/* Glass cylinder */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 2, 16, 1, true]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.15} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Liquid inside */}
      <mesh ref={liquidRef} position={[0, 1, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 1.6, 16]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={0.6}
          emissive={liquidColor}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.1, 16]} />
        <meshStandardMaterial color="#444455" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.1, 16]} />
        <meshStandardMaterial color="#444455" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ChemicalSpillZone({ position, size = 3 }: { position: [number, number, number]; size?: number }) {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.intensity = 1 + Math.sin(t * 2) * 0.3;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size, 24]} />
        <meshStandardMaterial
          color="#003300"
          emissive="#00ff44"
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.5, 0]} color="#00ff44" distance={5} decay={2} intensity={1} />
    </group>
  );
}

function ArmoryDoor() {
  return (
    <group position={[0, 0, -19.7]}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[2.5, 4, 0.15]} />
        <meshStandardMaterial color="#333340" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2, 0.08]} castShadow>
        <boxGeometry args={[2.2, 3.8, 0.08]} />
        <meshStandardMaterial color="#444450" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Lock */}
      <mesh position={[0.8, 1.8, 0.15]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffaa00" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Lock indicator red */}
      <mesh position={[-0.8, 2.5, 0.12]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function OperatingRoom() {
  return (
    <group position={[12, 0, 10]}>
      {/* Operating table */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2, 0.1, 0.8]} />
        <meshStandardMaterial color="#666670" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Table legs */}
      {[[-0.8, 0.4, -0.3], [0.8, 0.4, -0.3], [-0.8, 0.4, 0.3], [0.8, 0.4, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#555560" metalness={0.6} />
        </mesh>
      ))}
      {/* Blood on table */}
      <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 0.5]} />
        <meshStandardMaterial color="#6b0000" transparent opacity={0.8} roughness={1} />
      </mesh>
      {/* Surgical light */}
      <pointLight position={[0, 3.5, 0]} color="#ffffff" intensity={2} distance={6} decay={2} />
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Trays and instruments */}
      <mesh position={[-1.5, 0.7, 0.5]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#888890" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BossArena() {
  return (
    <group position={[0, 0, -12]}>
      {/* Arena boundaries - pillars */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.sin(angle) * 8;
        const z = Math.cos(angle) * 8 - 12;
        return (
          <mesh key={i} position={[x, 2, z]} castShadow>
            <boxGeometry args={[0.6, 4, 0.6]} />
            <meshStandardMaterial color="#2a2a35" metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}
      {/* Arena floor marking */}
      <mesh position={[0, 0.01, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5, 5.2, 32]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function DarkRoom({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
    </mesh>
  );
}

function FlickeringLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => Math.random() * 100, []);

  useFrame(() => {
    if (!lightRef.current) return;
    const t = performance.now() * 0.001;
    const flicker = Math.sin(t * 4 + phase) * 0.5 + Math.sin(t * 11 + phase) * 0.3;
    const blackout = Math.sin(t * 0.8 + phase) > 0.9 ? 0 : 1;
    lightRef.current.intensity = 1 * (0.3 + flicker * 0.3) * blackout;
  });

  return <pointLight ref={lightRef} position={position} color="#aabbcc" distance={10} decay={2} />;
}

function Floor3Spawner() {
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
          [-10, 0, -5],
          [10, 0, -5],
          [-5, 0, 8],
          [5, 0, 8],
          [-12, 0, 15],
          [12, 0, 15],
        ],
      },
      {
        type: 'runner',
        count: 3,
        positions: [
          [0, 0, -10],
          [-8, 0, 0],
          [8, 0, 0],
        ],
      },
      {
        type: 'crawler',
        count: 3,
        positions: [
          [-15, 0, -8],
          [15, 0, -8],
          [0, 0, 5],
        ],
      },
      {
        type: 'boss_scientist',
        count: 1,
        positions: [[0, 0, -12]],
      },
    ];

    spawnZombies(configs);
  }, [spawnZombies, zombies.length]);

  return null;
}

export default function Floor3() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.95} />
      </mesh>

      {/* Outer walls */}
      <mesh position={[0, WALL_H / 2, -20]} castShadow>
        <boxGeometry args={[40, WALL_H, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[0, WALL_H / 2, 20]} castShadow>
        <boxGeometry args={[40, WALL_H, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[-20, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[0.2, WALL_H, 40]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[20, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[0.2, WALL_H, 40]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} />
      </mesh>

      {/* Specimen tanks */}
      <SpecimenTank position={[-8, 0, -5]} liquidColor="#00ff88" />
      <SpecimenTank position={[-6, 0, -5]} liquidColor="#ff0066" />
      <SpecimenTank position={[-4, 0, -5]} liquidColor="#4488ff" />
      <SpecimenTank position={[6, 0, -5]} liquidColor="#ff8800" />
      <SpecimenTank position={[8, 0, -5]} liquidColor="#aa00ff" />
      <SpecimenTank position={[4, 0, -5]} liquidColor="#00ffcc" />

      {/* Chemical spill zones */}
      <ChemicalSpillZone position={[-10, 0, 5]} size={2.5} />
      <ChemicalSpillZone position={[10, 0, 5]} size={3} />
      <ChemicalSpillZone position={[0, 0, 0]} size={1.5} />

      {/* Armory door */}
      <ArmoryDoor />

      {/* Operating room */}
      <OperatingRoom />

      {/* Boss arena */}
      <BossArena />

      {/* Interior walls / dark rooms */}
      <DarkRoom position={[-14, WALL_H / 2, -14]} size={[8, WALL_H, 0.2]} />
      <DarkRoom position={[-14, WALL_H / 2, -8]} size={[0.2, WALL_H, 6]} />
      <DarkRoom position={[14, WALL_H / 2, -14]} size={[8, WALL_H, 0.2]} />
      <DarkRoom position={[14, WALL_H / 2, -8]} size={[0.2, WALL_H, 6]} />

      {/* Red strobe lights */}
      <StrobeLight position={[-10, 3.5, -14]} />
      <StrobeLight position={[10, 3.5, -14]} />
      <StrobeLight position={[0, 3.5, -18]} />
      <StrobeLight position={[-15, 3.5, 5]} />
      <StrobeLight position={[15, 3.5, 5]} />

      {/* Dim flickering lights */}
      <FlickeringLight position={[-8, 3.5, 5]} />
      <FlickeringLight position={[8, 3.5, 5]} />
      <FlickeringLight position={[0, 3.5, 15]} />
      <FlickeringLight position={[12, 3.5, 12]} />

      {/* Elevator zone */}
      <mesh position={[0, 0.02, 19]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      <Floor3Spawner />
    </group>
  );
}
