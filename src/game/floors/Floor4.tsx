'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';
import { useHorrorStore } from '@/stores/horrorStore';

const FLOOR_COLOR = '#1a1a1a';
const WALL_H = 0.5;

function ParapetWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>
  );
}

function Helipad() {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.intensity = 1.5 + Math.sin(t * 2) * 0.3;
  });

  return (
    <group position={[0, 0.02, -8]}>
      <mesh position={[-0.8, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.8, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.2, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.5, 0]} color="#ffffff" distance={8} decay={2} intensity={1.5} />
    </group>
  );
}

function SupplyCrate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 1, 0.8]} />
        <meshStandardMaterial color="#4a3a20" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.25, 0.1, 0.85]} />
        <meshStandardMaterial color="#3a2a15" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0.41]} castShadow>
        <boxGeometry args={[0.1, 1, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
      </mesh>
    </group>
  );
}

// ===== ENHANCED RAIN - more particles, wind-affected =====
function RainParticles() {
  const count = 1500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const windAngle = useRef(0.3); // Wind direction angle

  const positionsRef = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: Math.random() * 20,
      z: (Math.random() - 0.5) * 50,
      speed: 10 + Math.random() * 8,
    }))
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const positions = positionsRef.current;
    const windDrift = Math.sin(windAngle.current) * 2 * delta; // Wind pushes rain sideways

    for (let i = 0; i < count; i++) {
      positions[i].y -= positions[i].speed * delta;
      positions[i].x += windDrift; // Wind effect

      if (positions[i].y < 0) {
        positions[i].y = 20;
        positions[i].x = (Math.random() - 0.5) * 50;
        positions[i].z = (Math.random() - 0.5) * 50;
      }

      dummy.position.set(positions[i].x, positions[i].y, positions[i].z);
      // Tilt rain slightly due to wind
      dummy.rotation.set(0, 0, windAngle.current * 0.3);
      dummy.scale.set(0.02, 0.4, 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#8899bb" transparent opacity={0.25} />
    </instancedMesh>
  );
}

// ===== PUDDLE REFLECTIONS ON GROUND =====
function RooftopPuddles() {
  const puddles = useMemo(
    () => [
      { pos: [-5, 0.005, 3] as [number, number, number], size: 2.0 + Math.random() * 1 },
      { pos: [8, 0.005, -5] as [number, number, number], size: 1.5 + Math.random() * 0.8 },
      { pos: [-10, 0.005, -10] as [number, number, number], size: 2.5 + Math.random() * 1 },
      { pos: [3, 0.005, 10] as [number, number, number], size: 1.8 + Math.random() * 0.5 },
      { pos: [12, 0.005, -3] as [number, number, number], size: 1.2 + Math.random() * 0.6 },
      { pos: [-3, 0.005, -8] as [number, number, number], size: 1.0 + Math.random() * 0.5 },
    ],
    []
  );

  return (
    <>
      {puddles.map((puddle, i) => (
        <mesh key={i} position={puddle.pos} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[puddle.size, 32]} />
          <meshStandardMaterial
            color="#111122"
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== ENHANCED LIGHTNING - brighter, with thunder screen shake =====
function LightningFlash() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const nextFlash = useRef(Math.random() * 15 + 5);
  const timer = useRef(0);
  const flashDuration = useRef(0);
  const addScreenShake = useHorrorStore((s) => s.addScreenShake);

  useFrame((_, delta) => {
    if (!lightRef.current) return;

    timer.current += delta;

    if (flashDuration.current > 0) {
      flashDuration.current -= delta;
      // Brighter flash with more dramatic decay
      lightRef.current.intensity = 50 * Math.pow(flashDuration.current / 0.2, 0.5);
    } else {
      lightRef.current.intensity = 0;
    }

    if (timer.current >= nextFlash.current) {
      timer.current = 0;
      nextFlash.current = Math.random() * 20 + 8;
      flashDuration.current = 0.2; // Longer duration

      // Thunder screen shake
      addScreenShake(0.15, 0.3);

      // Double flash sometimes
      if (Math.random() > 0.4) {
        setTimeout(() => {
          flashDuration.current = 0.15;
        }, 150);
      }
      // Triple flash rarely
      if (Math.random() > 0.8) {
        setTimeout(() => {
          flashDuration.current = 0.1;
        }, 400);
      }
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[5, 25, 5]}
      intensity={0}
      color="#ddeeff"
      castShadow
    />
  );
}

// ===== WIND DEBRIS =====
function WindDebris() {
  const count = 30;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const debrisRef = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: 0.2 + Math.random() * 2,
      z: (Math.random() - 0.5) * 40,
      speedX: 2 + Math.random() * 3,
      speedY: (Math.random() - 0.5) * 0.5,
      rotSpeed: Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const debris = debrisRef.current;

    for (let i = 0; i < count; i++) {
      const d = debris[i];
      d.x += d.speedX * delta;
      d.y += d.speedY * delta + Math.sin(d.phase + d.x * 0.5) * delta * 0.3;
      d.phase += delta;

      // Wrap around
      if (d.x > 25) {
        d.x = -25;
        d.z = (Math.random() - 0.5) * 40;
      }
      if (d.y < 0.1) d.y = 0.1 + Math.random() * 0.5;
      if (d.y > 3) d.y = 3;

      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(d.phase * d.rotSpeed, d.phase * d.rotSpeed * 0.7, d.phase * d.rotSpeed * 0.3);
      dummy.scale.set(0.05, 0.05, 0.01);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#444433" transparent opacity={0.5} side={THREE.DoubleSide} roughness={1} />
    </instancedMesh>
  );
}

// ===== CRASHED HELICOPTER =====
function CrashedHelicopter() {
  const rotorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rotorRef.current) return;
    const t = state.clock.elapsedTime;
    // Bent rotor slowly spinning with wind
    rotorRef.current.rotation.y = t * 0.3;
  });

  return (
    <group position={[-12, 0.5, -12]} rotation={[0.2, 0.5, 0.15]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.2, 4]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Cockpit - broken glass */}
      <mesh position={[0, 0.3, 1.8]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#224433" roughness={0.3} metalness={0.5} transparent opacity={0.6} />
      </mesh>
      {/* Tail boom - bent */}
      <mesh position={[0.3, 0.2, -3.5]} rotation={[0, 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.4, 3]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Tail rotor - broken */}
      <mesh position={[0.3, 0.2, -5]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.05, 0.1]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Main rotor - bent, slowly spinning */}
      <group ref={rotorRef} position={[0, 0.8, 0]} rotation={[0.1, 0, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[5, 0.05, 0.3]} />
          <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Second blade - bent at angle */}
        <mesh rotation={[0, Math.PI / 2, 0.3]} castShadow>
          <boxGeometry args={[4, 0.05, 0.3]} />
          <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      {/* Skid - broken */}
      <mesh position={[-0.5, -0.5, 0.5]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Fire/smoke point - glowing ember */}
      <pointLight position={[0.5, 0.5, 1]} color="#ff4400" distance={5} decay={2} intensity={1.5} />
      {/* Scorch marks on ground */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 16]} />
        <meshStandardMaterial color="#0a0808" roughness={1} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ===== SATELLITE DISHES AND ANTENNA =====
function SatelliteDishes() {
  const dish1Ref = useRef<THREE.Group>(null);
  const dish2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dish1Ref.current) {
      dish1Ref.current.rotation.y = t * 0.05;
    }
    if (dish2Ref.current) {
      dish2Ref.current.rotation.y = -t * 0.03;
    }
  });

  return (
    <>
      {/* Satellite dish 1 */}
      <group position={[15, 0, -15]}>
        {/* Base pole */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 3, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Dish */}
        <group ref={dish1Ref} position={[0, 3, 0]} rotation={[0.5, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
            <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          {/* Receiver arm */}
          <mesh position={[0, 0.3, 0.6]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
        {/* Blinking light on top */}
        <pointLight position={[0, 3.5, 0]} color="#ff0000" distance={3} decay={2} intensity={0.5} />
      </group>

      {/* Satellite dish 2 - smaller */}
      <group position={[-8, 0, -16]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 2, 8]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
        </mesh>
        <group ref={dish2Ref} position={[0, 2, 0]} rotation={[0.7, 0, 0.2]}>
          <mesh castShadow>
            <sphereGeometry args={[0.7, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Antenna array */}
      <group position={[10, 0, 16]}>
        {/* Central mast */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 4, 6]} />
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Cross bars */}
        {[1, 2, 3].map((h) => (
          <mesh key={h} position={[0, h, 0]} rotation={[0, h * 0.5, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 1.5, 4]} />
            <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Blinking light at top */}
        <pointLight position={[0, 4.2, 0]} color="#ff0000" distance={4} decay={2} intensity={0.8} />
      </group>
    </>
  );
}

// ===== ENHANCED MOON - larger, more detailed =====
function MoonLight() {
  return (
    <>
      <directionalLight
        position={[-10, 15, 5]}
        intensity={0.2}
        color="#aabbdd"
        castShadow
      />
      {/* Moon - larger and more detailed */}
      <group position={[-15, 25, -10]}>
        {/* Main moon body */}
        <mesh>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial color="#ddeeff" />
        </mesh>
        {/* Crater details - darker patches */}
        <mesh position={[-1, 0.5, 3.5]} rotation={[0, 0, 0.3]}>
          <circleGeometry args={[0.8, 16]} />
          <meshBasicMaterial color="#bbc8dd" />
        </mesh>
        <mesh position={[1.5, -0.5, 3.8]} rotation={[0, 0, -0.2]}>
          <circleGeometry args={[0.5, 12]} />
          <meshBasicMaterial color="#bcc9dd" />
        </mesh>
        <mesh position={[-0.5, -1.2, 3.6]} rotation={[0, 0, 0.5]}>
          <circleGeometry args={[0.6, 12]} />
          <meshBasicMaterial color="#b5c5d8" />
        </mesh>
        <mesh position={[0.8, 1, 3.9]} rotation={[0, 0, -0.4]}>
          <circleGeometry args={[0.3, 8]} />
          <meshBasicMaterial color="#bcc9dd" />
        </mesh>
        {/* Moon glow */}
        <mesh>
          <sphereGeometry args={[5.5, 32, 32]} />
          <meshBasicMaterial color="#aabbcc" transparent opacity={0.08} />
        </mesh>
      </group>
    </>
  );
}

// ===== CITY SKYLINE =====
function CitySkyline() {
  const buildings = useMemo(
    () => [
      // Left cluster
      { pos: [-35, 8, -25] as [number, number, number], size: [6, 16, 6] as [number, number, number], windows: true },
      { pos: [-28, 12, -30] as [number, number, number], size: [5, 24, 5] as [number, number, number], windows: true },
      { pos: [-22, 6, -28] as [number, number, number], size: [7, 12, 6] as [number, number, number], windows: true },
      { pos: [-38, 5, -20] as [number, number, number], size: [4, 10, 5] as [number, number, number], windows: true },
      { pos: [-32, 10, -18] as [number, number, number], size: [5, 20, 4] as [number, number, number], windows: true },
      // Center-left
      { pos: [-15, 7, -32] as [number, number, number], size: [6, 14, 5] as [number, number, number], windows: true },
      { pos: [-8, 15, -30] as [number, number, number], size: [4, 30, 4] as [number, number, number], windows: true },
      // Center
      { pos: [0, 9, -35] as [number, number, number], size: [8, 18, 6] as [number, number, number], windows: true },
      { pos: [5, 6, -30] as [number, number, number], size: [5, 12, 5] as [number, number, number], windows: true },
      // Center-right
      { pos: [12, 11, -28] as [number, number, number], size: [6, 22, 5] as [number, number, number], windows: true },
      { pos: [18, 7, -32] as [number, number, number], size: [5, 14, 4] as [number, number, number], windows: true },
      // Right cluster
      { pos: [25, 13, -25] as [number, number, number], size: [5, 26, 5] as [number, number, number], windows: true },
      { pos: [32, 6, -22] as [number, number, number], size: [7, 12, 6] as [number, number, number], windows: true },
      { pos: [35, 9, -28] as [number, number, number], size: [4, 18, 4] as [number, number, number], windows: true },
      { pos: [38, 5, -18] as [number, number, number], size: [5, 10, 5] as [number, number, number], windows: true },
    ],
    []
  );

  return (
    <>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {/* Building body */}
          <mesh>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color="#0a0a12" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Lit windows - random patches of emissive material on the face */}
          {Array.from({ length: Math.floor(Math.random() * 6 + 3) }, (_, wi) => {
            const wx = (Math.random() - 0.5) * b.size[0] * 0.8;
            const wy = (Math.random() - 0.3) * b.size[1] * 0.8;
            const windowColor = Math.random() > 0.7 ? '#ffcc66' : Math.random() > 0.5 ? '#aaccff' : '#44aaff';
            return (
              <mesh key={wi} position={[wx, wy, b.size[2] / 2 + 0.01]}>
                <planeGeometry args={[0.4, 0.5]} />
                <meshStandardMaterial
                  color={windowColor}
                  emissive={windowColor}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.6 + Math.random() * 0.3}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </>
  );
}

function BossArena() {
  return (
    <group position={[0, 0, 5]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 6.2, 32]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.1, 32]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.sin(angle) * 7;
        const z = Math.cos(angle) * 7;
        return (
          <mesh key={i} position={[x, 0.5, z]} castShadow>
            <boxGeometry args={[0.4, 1, 0.4]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function RooftopStairwell() {
  return (
    <group position={[0, 0, 19]}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#333340" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1, -1.55]} castShadow>
        <boxGeometry args={[1.5, 2.2, 0.1]} />
        <meshStandardMaterial color="#444450" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 2.5, -1.8]} color="#ffcc88" distance={5} decay={2} intensity={1} />
    </group>
  );
}

function Floor4Spawner() {
  const spawnZombies = useZombieStore((s) => s.spawnZombies);
  const zombies = useZombieStore((s) => s.zombies);
  const hasSpawned = useRef(false);

  useEffect(() => {
    if (hasSpawned.current) return;
    hasSpawned.current = true;

    const configs: ZombieSpawnConfig[] = [
      {
        type: 'walker',
        count: 5,
        positions: [
          [-10, 0, -5],
          [10, 0, -5],
          [-8, 0, 8],
          [8, 0, 8],
          [0, 0, -12],
        ],
      },
      {
        type: 'runner',
        count: 4,
        positions: [
          [-12, 0, 0],
          [12, 0, 0],
          [0, 0, 5],
          [-5, 0, -8],
        ],
      },
      {
        type: 'crawler',
        count: 2,
        positions: [
          [6, 0, -12],
          [-6, 0, -12],
        ],
      },
      {
        type: 'boss_alpha',
        count: 1,
        positions: [[0, 0, 5]],
      },
    ];

    spawnZombies(configs);
  }, [spawnZombies, zombies.length]);

  return null;
}

export default function Floor4() {
  return (
    <group>
      {/* Floor - rooftop surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Parapet walls */}
      <ParapetWall position={[0, WALL_H / 2, -20]} size={[40, WALL_H, 0.3]} />
      <ParapetWall position={[0, WALL_H / 2, 20]} size={[40, WALL_H, 0.3]} />
      <ParapetWall position={[-20, WALL_H / 2, 0]} size={[0.3, WALL_H, 40]} />
      <ParapetWall position={[20, WALL_H / 2, 0]} size={[0.3, WALL_H, 40]} />

      {/* Helipad */}
      <Helipad />

      {/* Supply crates */}
      <SupplyCrate position={[-17, 0, -17]} />
      <SupplyCrate position={[-16, 0, -15]} />
      <SupplyCrate position={[17, 0, -17]} />
      <SupplyCrate position={[16, 0, -15]} />
      <SupplyCrate position={[-17, 0, 15]} />
      <SupplyCrate position={[17, 0, 15]} />
      <SupplyCrate position={[-15, 0, 17]} />
      <SupplyCrate position={[15, 0, 17]} />

      {/* Boss arena */}
      <BossArena />

      {/* Stairwell back to building */}
      <RooftopStairwell />

      {/* Moonlight - enhanced */}
      <MoonLight />

      {/* Enhanced rain - more particles, wind-affected */}
      <RainParticles />

      {/* NEW: Puddle reflections */}
      <RooftopPuddles />

      {/* Enhanced lightning - brighter, with thunder screen shake */}
      <LightningFlash />

      {/* NEW: Wind debris */}
      <WindDebris />

      {/* NEW: Crashed helicopter */}
      <CrashedHelicopter />

      {/* NEW: Satellite dishes and antenna */}
      <SatelliteDishes />

      {/* NEW: City skyline in distance */}
      <CitySkyline />

      {/* Ambient lights - very dim */}
      <ambientLight intensity={0.03} color="#445566" />

      {/* Rooftop lights */}
      <pointLight position={[-10, 2, 0]} color="#ffcc66" distance={8} decay={2} intensity={0.5} />
      <pointLight position={[10, 2, 0]} color="#ffcc66" distance={8} decay={2} intensity={0.5} />

      <Floor4Spawner />
    </group>
  );
}
