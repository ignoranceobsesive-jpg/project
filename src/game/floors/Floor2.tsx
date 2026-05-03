'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';

const ROOM_W = 40;
const ROOM_D = 40;
const WALL_H = 4;
const WALL_THICKNESS = 0.2;

// ===== WALL COMPONENT =====
function Wall({ position, size, color = '#35333a' }: { position: [number, number, number]; size: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

// ===== FLUORESCENT LIGHT FIXTURE WITH FLICKER =====
function FluorescentLight({ position, broken = false }: { position: [number, number, number]; broken?: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * 100, []);
  const flickerSpeed = useMemo(() => 2 + Math.random() * 5, []);

  useFrame(() => {
    if (!lightRef.current || !meshRef.current) return;
    const t = performance.now() * 0.001;

    if (broken) {
      // Broken light - mostly off, rare flicker
      const spark = Math.sin(t * 0.3 + phase * 2) > 0.97 ? 1 : 0;
      lightRef.current.intensity = 0.2 * spark;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = spark * 2;
    } else {
      // Working light with occasional flicker
      const flicker = Math.sin(t * flickerSpeed + phase) * 0.5
        + Math.sin(t * flickerSpeed * 3.7 + phase) * 0.3
        + Math.sin(t * 0.7 + phase) * 0.2;
      const blackout = Math.sin(t * 0.3 + phase * 2) > 0.95 ? 0 : 1;
      const intensity = 2.5 * (0.6 + flicker * 0.4) * blackout;
      lightRef.current.intensity = intensity;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + flicker * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Fixture housing */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.08, 0.25]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Light tube */}
      <mesh ref={meshRef} position={[0, -0.05, 0]}>
        <boxGeometry args={[1.0, 0.03, 0.12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ccddff"
          emissiveIntensity={0.5}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, -0.2, 0]}
        color="#ccddff"
        distance={14}
        decay={2}
        castShadow
        intensity={2.5}
      />
    </group>
  );
}

// ===== RED EMERGENCY LIGHT =====
function RedEmergencyLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lightRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Pulsing red emergency
    const pulse = 1.5 + Math.sin(t * 2) * 0.5;
    lightRef.current.intensity = pulse;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5;
  });

  return (
    <group position={position}>
      {/* Light housing */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.2, 0.15]} />
        <meshStandardMaterial color="#440000" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Red lens */}
      <mesh ref={meshRef} position={[0, -0.08, 0.08]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={1.5} />
      </mesh>
      <pointLight ref={lightRef} position={[0, -0.3, 0.3]} color="#ff2200" distance={10} decay={2} intensity={1.5} />
    </group>
  );
}

// ===== EMERGENCY EXIT SIGN =====
function EmergencyExitSign({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    // Occasional flicker
    const flicker = Math.sin(t * 3 + Math.sin(t * 17) * 2) > -0.8 ? 1 : 0.2;
    glowRef.current.intensity = 1.5 * flicker;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Sign body */}
      <mesh>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#004400" emissive="#00ff44" emissiveIntensity={1} />
      </mesh>
      {/* Arrow indicator */}
      <mesh position={[0.25, 0, 0.03]}>
        <boxGeometry args={[0.15, 0.15, 0.01]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ff44" emissiveIntensity={2} />
      </mesh>
      {/* Mount brackets */}
      <mesh position={[-0.35, 0.15, -0.03]}>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.15, -0.03]}>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
      </mesh>
      <pointLight ref={glowRef} position={[0, -0.3, 0.5]} color="#00ff44" distance={5} decay={2} intensity={1.5} />
    </group>
  );
}

// ===== OFFICE DESK WITH MONITOR =====
function OfficeDesk({ position, rotation = 0, overturned = false }: { position: [number, number, number]; rotation?: number; overturned?: boolean }) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!screenRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    // Flickering screen
    mat.emissiveIntensity = 0.8 + Math.sin(t * 12 + position[0]) * 0.2 + Math.sin(t * 31 + position[2]) * 0.1;
  });

  if (overturned) {
    return (
      <group position={position} rotation={[0.4 + Math.random() * 0.3, rotation, 1.2 + Math.random() * 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <meshStandardMaterial color="#4a4035" roughness={0.7} />
        </mesh>
        <mesh position={[0.3, 0.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.35, 0.04]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.7]} />
        <meshStandardMaterial color="#4a4035" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Desk legs */}
      {[[-0.6, 0.375, -0.28], [0.6, 0.375, -0.28], [-0.6, 0.375, 0.28], [0.6, 0.375, 0.28]].map((leg, i) => (
        <mesh key={i} position={leg as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.75, 0.04]} />
          <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.04]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Monitor screen - blue glow */}
      <mesh ref={screenRef} position={[0, 1.1, -0.17]}>
        <planeGeometry args={[0.48, 0.32]} />
        <meshStandardMaterial
          color="#004488"
          emissive="#0066cc"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.88, -0.2]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Monitor base */}
      <mesh position={[0, 0.79, -0.22]} castShadow>
        <boxGeometry args={[0.25, 0.02, 0.15]} />
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.8, 0.05]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.6} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.28, 0.79, 0.05]} castShadow>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <meshStandardMaterial color="#222222" roughness={0.6} />
      </mesh>
      {/* Screen glow light */}
      <pointLight position={[0, 1.1, -0.05]} color="#0066cc" distance={3} decay={2} intensity={0.4} />
    </group>
  );
}

// ===== OFFICE CHAIR =====
function OfficeChair({ position, rotation = 0, tipped = false }: { position: [number, number, number]; rotation?: number; tipped?: boolean }) {
  if (tipped) {
    return (
      <group position={position} rotation={[0.8, rotation, 1.5]}>
        {/* Seat */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.8} />
        </mesh>
        {/* Back */}
        <mesh position={[0, 0.3, -0.24]} castShadow>
          <boxGeometry args={[0.48, 0.5, 0.04]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.8} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.85, -0.22]} castShadow>
        <boxGeometry args={[0.48, 0.55, 0.04]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.8} />
      </mesh>
      {/* Center post */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Wheel base - 5 spokes */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh position={[Math.sin(angle) * 0.2, 0.03, Math.cos(angle) * 0.2]} rotation={[0, -angle, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.22, 4]} />
              <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Wheel */}
            <mesh position={[Math.sin(angle) * 0.3, 0.025, Math.cos(angle) * 0.3]} castShadow>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ===== FILING CABINET =====
function FilingCabinet({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 0.45]} />
        <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Drawers */}
      {[0.35, 0.7, 1.05].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0.23]} castShadow>
            <boxGeometry args={[0.42, 0.28, 0.02]} />
            <meshStandardMaterial color="#606068" metalness={0.65} roughness={0.25} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, y + 0.05, 0.25]}>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ===== BOOKSHELF WITH BOOKS =====
function Bookshelf({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const bookColors = useMemo(
    () => ['#8b0000', '#003366', '#2d5016', '#4a2060', '#8b4513', '#1a3a3a', '#663300', '#330033'],
    []
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Shelf frame */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.2, 1.8, 0.35]} />
        <meshStandardMaterial color="#3a2820" roughness={0.8} />
      </mesh>
      {/* Shelves */}
      {[0.3, 0.7, 1.1, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.15, 0.03, 0.33]} />
          <meshStandardMaterial color="#3a2820" roughness={0.8} />
        </mesh>
      ))}
      {/* Books on each shelf */}
      {[0.45, 0.85, 1.25, 1.65].map((y, shelfIdx) => (
        <group key={shelfIdx}>
          {Array.from({ length: 5 + Math.floor(Math.random() * 4) }, (_, bookIdx) => {
            const xOff = -0.45 + bookIdx * 0.15 + Math.random() * 0.05;
            const height = 0.18 + Math.random() * 0.12;
            const color = bookColors[(shelfIdx * 3 + bookIdx) % bookColors.length];
            return (
              <mesh key={bookIdx} position={[xOff, y, 0.02]} castShadow>
                <boxGeometry args={[0.1, height, 0.22]} />
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// ===== WATER COOLER =====
function WaterCooler({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.elapsedTime;
    // Gentle water wobble
    const mat = waterRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.1;
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.35, 0.6, 0.35]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Water bottle */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.6, 12]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.3} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Blue water inside */}
      <mesh ref={waterRef} position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.4, 10]} />
        <meshStandardMaterial
          color="#0088cc"
          emissive="#0044aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
          roughness={0.2}
        />
      </mesh>
      {/* Tap */}
      <mesh position={[0.18, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Drip tray */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.3]} />
        <meshStandardMaterial color="#bbbbbb" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ===== WHITEBOARD ON WALL =====
function Whiteboard({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* White surface */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[1.65, 1.05]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Red marker marks */}
      <mesh position={[-0.4, 0.3, 0.03]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[0.5, 0.04]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.2} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.03]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.35, 0.03]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.2} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, -0.2, 0.03]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[0.25, 0.03]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.2} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -0.6, 0.04]}>
        <boxGeometry args={[1.4, 0.06, 0.08]} />
        <meshStandardMaterial color="#999999" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ===== BLOOD HANDPRINTS =====
function BloodHandprints() {
  const handprints = useMemo(
    () => [
      { pos: [19.8, 1.5, -5] as [number, number, number], rot: [0, -Math.PI / 2, 0.1] as [number, number, number], scale: 0.4 },
      { pos: [19.8, 1.2, 8] as [number, number, number], rot: [0, -Math.PI / 2, -0.15] as [number, number, number], scale: 0.35 },
      { pos: [-19.8, 1.8, -12] as [number, number, number], rot: [0, Math.PI / 2, 0.2] as [number, number, number], scale: 0.45 },
      { pos: [-5, 1.4, -19.8] as [number, number, number], rot: [0, 0, 0.1] as [number, number, number], scale: 0.5 },
      { pos: [8, 1.6, 19.8] as [number, number, number], rot: [0, Math.PI, -0.1] as [number, number, number], scale: 0.3 },
      { pos: [-19.8, 1.0, 15] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], scale: 0.55 },
      { pos: [12, 1.3, -19.8] as [number, number, number], rot: [0, 0, -0.2] as [number, number, number], scale: 0.38 },
      { pos: [-19.8, 2.0, -3] as [number, number, number], rot: [0, Math.PI / 2, 0.15] as [number, number, number], scale: 0.42 },
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

// ===== BLOOD TRAIL =====
function BloodTrail() {
  const positions = useMemo(
    () => [
      [2, 0.01, -15],
      [1, 0.01, -12],
      [-0.5, 0.01, -9],
      [-1.5, 0.01, -6],
      [-1, 0.01, -3],
      [0, 0.01, 0],
      [1.5, 0.01, 3],
      [2, 0.01, 6],
      [1, 0.01, 9],
      [-0.5, 0.01, 12],
    ] as [number, number, number][],
    []
  );

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[0.2 + Math.random() * 0.4, 12]} />
          <meshStandardMaterial color="#6b0000" emissive="#330000" emissiveIntensity={0.3} transparent opacity={0.7} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ===== SCATTERED PAPERS (INSTANCED) =====
function ScatteredPapers() {
  const count = 25;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const paperData = useMemo(
    () => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 36,
      z: (Math.random() - 0.5) * 36,
      rot: Math.random() * Math.PI,
      scaleX: 0.15 + Math.random() * 0.15,
      scaleY: 0.2 + Math.random() * 0.15,
    })),
    []
  );

  useEffect(() => {
    if (!meshRef.current) return;
    paperData.forEach((p, i) => {
      dummy.position.set(p.x, 0.01, p.z);
      dummy.rotation.set(-Math.PI / 2, 0, p.rot);
      dummy.scale.set(p.scaleX, p.scaleY, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [paperData, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#d4c5a9" roughness={1} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ===== BROKEN GLASS SHARDS =====
function BrokenGlass() {
  const shards = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      position: [
        8 + (Math.random() - 0.5) * 8,
        0.005,
        10 + (Math.random() - 0.5) * 8,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      size: 0.08 + Math.random() * 0.15,
    })),
    []
  );

  return (
    <>
      {shards.map((shard, i) => (
        <mesh key={i} position={shard.position} rotation={[-Math.PI / 2, 0, shard.rotation]}>
          <planeGeometry args={[shard.size, shard.size * 1.4]} />
          <meshStandardMaterial
            color="#aaccdd"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== HANGING CEILING TILES =====
function HangingCeilingTiles() {
  const tiles = useMemo(
    () => [
      { pos: [-6, 3.4, 4] as [number, number, number], rot: [0.3, 0, 0.1] as [number, number, number], size: [1.2, 0.04, 0.6] as [number, number, number] },
      { pos: [10, 3.2, -8] as [number, number, number], rot: [-0.2, 0.1, -0.15] as [number, number, number], size: [0.8, 0.04, 0.6] as [number, number, number] },
      { pos: [-3, 3.5, -12] as [number, number, number], rot: [0.4, -0.1, 0.2] as [number, number, number], size: [1.0, 0.04, 0.6] as [number, number, number] },
    ],
    []
  );

  return (
    <>
      {tiles.map((tile, i) => (
        <group key={i}>
          <mesh position={tile.pos} rotation={tile.rot} castShadow>
            <boxGeometry args={tile.size} />
            <meshStandardMaterial color="#ccccbb" roughness={0.95} />
          </mesh>
          {/* Wires holding tile */}
          <mesh position={[tile.pos[0] - 0.3, (tile.pos[1] + WALL_H) / 2, tile.pos[2]]}>
            <cylinderGeometry args={[0.005, 0.005, WALL_H - tile.pos[1], 3]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ===== FLOOR FOG =====
function FloorFog() {
  const fogPlanes = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 36,
        0.1 + Math.random() * 0.4,
        (Math.random() - 0.5) * 36,
      ] as [number, number, number],
      scale: 4 + Math.random() * 6,
      opacity: 0.06 + Math.random() * 0.08,
    })),
    []
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = fogPlanes[i].opacity + Math.sin(t * 0.5 + i) * 0.02;
      mesh.position.x = fogPlanes[i].position[0] + Math.sin(t * 0.2 + i * 1.5) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {fogPlanes.map((fog, i) => (
        <mesh key={i} position={fog.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[fog.scale, fog.scale]} />
          <meshStandardMaterial
            color="#334455"
            transparent
            opacity={fog.opacity}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ===== DUST PARTICLES =====
function DustParticles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 36,
      y: 0.5 + Math.random() * 3,
      z: (Math.random() - 0.5) * 36,
      speedY: 0.02 + Math.random() * 0.05,
      driftX: (Math.random() - 0.5) * 0.02,
      driftZ: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const p = particles.current;

    for (let i = 0; i < count; i++) {
      p[i].y += p[i].speedY * 0.3;
      p[i].x += p[i].driftX + Math.sin(t * 0.3 + p[i].phase) * 0.005;
      p[i].z += p[i].driftZ + Math.cos(t * 0.2 + p[i].phase) * 0.005;

      if (p[i].y > WALL_H) {
        p[i].y = 0.2;
        p[i].x = (Math.random() - 0.5) * 36;
        p[i].z = (Math.random() - 0.5) * 36;
      }

      dummy.position.set(p[i].x, p[i].y, p[i].z);
      dummy.scale.setScalar(0.015);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#aaaaaa" transparent opacity={0.3} roughness={1} />
    </instancedMesh>
  );
}

// ===== DRIPPING WATER =====
function DrippingWater() {
  const count = 15;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: Math.random() * WALL_H,
      z: (Math.random() - 0.5) * 30,
      speed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const d = drops.current;

    for (let i = 0; i < count; i++) {
      d[i].y -= d[i].speed * delta;

      if (d[i].y < 0) {
        d[i].y = WALL_H - 0.2;
        d[i].x = (Math.random() - 0.5) * 30;
        d[i].z = (Math.random() - 0.5) * 30;
      }

      dummy.position.set(d[i].x, d[i].y, d[i].z);
      dummy.scale.set(0.02, 0.05, 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#6688aa" transparent opacity={0.4} roughness={0.2} metalness={0.3} />
    </instancedMesh>
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

// ===== ELEVATOR DOOR =====
function ElevatorDoor() {
  return (
    <group position={[0, 0, -19.8]}>
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
      {/* Indicator light */}
      <mesh position={[0, 3.8, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
      {/* Floor indicator panel */}
      <mesh position={[0, 0.3, 0.12]}>
        <boxGeometry args={[0.8, 0.3, 0.01]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ===== CUBICLE WALLS =====
function CubicleWalls() {
  const walls = useMemo(
    () => [
      // Left office section - row 1
      { pos: [-12, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [-8, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -12] as [number, number, number], rot: 0 },
      // Left office section - row 2
      { pos: [-12, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -7] as [number, number, number], rot: 0 },
      // Left office section - row 3
      { pos: [-12, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [-8, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [-4, 0.75, -2] as [number, number, number], rot: 0 },
      // Right office section
      { pos: [8, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -12] as [number, number, number], rot: 0 },
      { pos: [8, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -7] as [number, number, number], rot: 0 },
      { pos: [8, 0.75, -2] as [number, number, number], rot: 0 },
      { pos: [12, 0.75, -2] as [number, number, number], rot: 0 },
      // Cross walls creating corridors
      { pos: [-10, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
      { pos: [-6, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
      { pos: [10, 0.75, -4.5] as [number, number, number], rot: Math.PI / 2 },
      // Corridor dividers
      { pos: [0, 0.75, -16] as [number, number, number], rot: Math.PI / 2 },
      { pos: [0, 0.75, 5] as [number, number, number], rot: Math.PI / 2 },
    ],
    []
  );

  return (
    <group>
      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} rotation={[0, w.rot, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 1.5, 0.08]} />
          <meshStandardMaterial color="#3a3840" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ===== SERVER ROOM =====
function ServerRoom() {
  const lightRef = useRef<THREE.PointLight>(null);
  const screenRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    lightRef.current.intensity = 0.5 + Math.sin(t * 4) * 0.2;

    screenRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const mat = ref.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t * (5 + i * 2)) * 0.15;
    });
  });

  return (
    <group position={[-15, 0, 8]}>
      {/* Room walls */}
      <mesh position={[0, WALL_H / 2, -3]} castShadow receiveShadow>
        <boxGeometry args={[8, WALL_H, 0.15]} />
        <meshStandardMaterial color="#222230" roughness={0.85} />
      </mesh>
      <mesh position={[0, WALL_H / 2, 3]} castShadow receiveShadow>
        <boxGeometry args={[8, WALL_H, 0.15]} />
        <meshStandardMaterial color="#222230" roughness={0.85} />
      </mesh>

      {/* Server racks */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <mesh position={[-2.5 + i * 1.4, 1.25, 0]} castShadow>
            <boxGeometry args={[0.6, 2.5, 0.8]} />
            <meshStandardMaterial color="#1a1a22" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Rack LEDs */}
          {[0.5, 1.0, 1.5, 2.0].map((y, j) => (
            <mesh
              key={j}
              ref={(el) => { screenRefs.current[i * 4 + j] = el; }}
              position={[-2.5 + i * 1.4, y, 0.41]}
            >
              <boxGeometry args={[0.08, 0.03, 0.01]} />
              <meshStandardMaterial
                color={j % 2 === 0 ? '#00ff44' : '#ff4400'}
                emissive={j % 2 === 0 ? '#00ff44' : '#ff4400'}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Terminal */}
      <mesh position={[3, 0.75, 2]} castShadow>
        <boxGeometry args={[0.8, 0.06, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[3, 1.05, 1.85]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.04]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[3, 1.05, 1.82]}>
        <planeGeometry args={[0.42, 0.32]} />
        <meshStandardMaterial color="#003300" emissive="#00ff44" emissiveIntensity={0.3} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 3, 0]} color="#4488ff" distance={8} decay={2} />
    </group>
  );
}

// ===== BREAK ROOM =====
function BreakRoom() {
  return (
    <group position={[14, 0, 10]}>
      {/* Room walls */}
      <mesh position={[0, WALL_H / 2, -3]} castShadow receiveShadow>
        <boxGeometry args={[7, WALL_H, 0.15]} />
        <meshStandardMaterial color="#35333a" roughness={0.85} />
      </mesh>
      <mesh position={[-3.5, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, WALL_H, 6]} />
        <meshStandardMaterial color="#35333a" roughness={0.85} />
      </mesh>

      {/* Table */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 0.08, 1]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
      </mesh>
      {/* Table legs */}
      {[[-0.85, 0.375, -0.4], [0.85, 0.375, -0.4], [-0.85, 0.375, 0.4], [0.85, 0.375, 0.4]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color="#3a3020" roughness={0.8} />
        </mesh>
      ))}
      {/* Chairs */}
      {[
        [-0.7, 0, 0.7],
        [0.7, 0, 0.7],
        [-0.7, 0, -0.7],
        [0.7, 0, -0.7],
      ].map((pos, i) => (
        <OfficeChair key={i} position={pos as [number, number, number]} rotation={i < 2 ? Math.PI : 0} />
      ))}
      {/* Vending machines */}
      <VendingMachine position={[2.5, 0, 0]} />
      <VendingMachine position={[2.5, 0, 1.5]} />
    </group>
  );
}

// ===== VENDING MACHINE =====
function VendingMachine({ position }: { position: [number, number, number] }) {
  const dispenseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!dispenseRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = dispenseRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3;
  });

  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 0.8]} />
        <meshStandardMaterial color="#2a4a3a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1, 0.41]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial color="#1a3a2a" transparent opacity={0.4} metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh ref={dispenseRef} position={[0.3, 0.3, 0.42]}>
        <boxGeometry args={[0.15, 0.08, 0.02]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// ===== MANAGER OFFICE =====
function ManagerOffice() {
  return (
    <group position={[-15, 0, -14]}>
      {/* Room walls */}
      <mesh position={[0, WALL_H / 2, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[7, WALL_H, 0.15]} />
        <meshStandardMaterial color="#35333a" roughness={0.85} />
      </mesh>
      <mesh position={[3.5, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, WALL_H, 7]} />
        <meshStandardMaterial color="#35333a" roughness={0.85} />
      </mesh>

      {/* Large desk */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#4a3020" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Desk legs */}
      {[[-1.1, 0.375, -0.5], [1.1, 0.375, -0.5], [-1.1, 0.375, 0.5], [1.1, 0.375, 0.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.75, 0.06]} />
          <meshStandardMaterial color="#3a2515" roughness={0.7} />
        </mesh>
      ))}
      {/* Executive chair */}
      <OfficeChair position={[0, 0, 1.2]} rotation={Math.PI} />
      {/* Bookshelf */}
      <Bookshelf position={[-2.5, 0, -2.5]} rotation={0} />
      {/* Filing cabinet */}
      <FilingCabinet position={[2.5, 0, -2]} rotation={0} />
    </group>
  );
}

// ===== BATHROOM =====
function Bathroom() {
  return (
    <group position={[15, 0, -10]}>
      {/* Room walls */}
      <mesh position={[0, WALL_H / 2, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[6, WALL_H, 0.15]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.85} />
      </mesh>
      <mesh position={[-3, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, WALL_H, 7]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.85} />
      </mesh>

      {/* Mirror */}
      <mesh position={[0, 1.5, -3.4]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#88aacc" metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Sink */}
      <mesh position={[0, 0.8, -3.2]} castShadow>
        <boxGeometry args={[1, 0.1, 0.5]} />
        <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Stall dividers */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.25, -1]} castShadow>
          <boxGeometry args={[0.08, 2.5, 1.8]} />
          <meshStandardMaterial color="#4a4a50" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ===== CEILING DAMAGE & EXPOSED PIPES =====
function CeilingDamage() {
  return (
    <>
      {/* Broken ceiling tiles - dark patches */}
      {[
        { pos: [-8, WALL_H - 0.05, 5] as [number, number, number], size: [2, 3] as [number, number] },
        { pos: [12, WALL_H - 0.05, -8] as [number, number, number], size: [1.5, 2] as [number, number] },
        { pos: [0, WALL_H - 0.05, 12] as [number, number, number], size: [2.5, 1.5] as [number, number] },
      ].map((d, i) => (
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
      {/* Hanging wires */}
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

// ===== WALL STAINS =====
function WallStains() {
  const stains = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() > 0.5 ? 19.7 : -19.7) * (0.8 + Math.random() * 0.2),
        0.5 + Math.random() * 2.5,
        (Math.random() - 0.5) * 35,
      ] as [number, number, number],
      rotation: [0, Math.random() > 0.5 ? -Math.PI / 2 : Math.PI / 2, 0] as [number, number, number],
      size: 0.3 + Math.random() * 0.5,
    })),
    []
  );

  return (
    <>
      {stains.map((stain, i) => (
        <mesh key={i} position={stain.position} rotation={stain.rotation}>
          <circleGeometry args={[stain.size, 12]} />
          <meshStandardMaterial
            color="#2a2a1a"
            transparent
            opacity={0.4}
            roughness={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== GLOBAL LIGHT FLICKER =====
function GlobalLightFlicker() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    const t = performance.now() * 0.001;
    // Rare total blackout flicker
    const globalFlicker = Math.sin(t * 0.1) > 0.98 ? 0.1 : 1;
    lightRef.current.intensity = 0.15 * globalFlicker;
  });

  return <pointLight ref={lightRef} position={[0, 3.5, 0]} color="#ccddff" distance={40} decay={1} intensity={0.15} />;
}

// ===== SPAWNER =====
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

// ===== MAIN FLOOR2 COMPONENT =====
export default function Floor2() {
  const halfW = ROOM_W / 2;
  const halfD = ROOM_D / 2;

  return (
    <group>
      {/* Floor - dark carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#1e1c1a" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.95} />
      </mesh>

      {/* Outer walls - office wallpaper color */}
      <Wall position={[0, WALL_H / 2, -halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} color="#35333a" />
      <Wall position={[0, WALL_H / 2, halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} color="#35333a" />
      <Wall position={[-halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} color="#35333a" />
      <Wall position={[halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} color="#35333a" />

      {/* Cubicle maze */}
      <CubicleWalls />

      {/* Office desks - 8+ desks throughout the floor */}
      <OfficeDesk position={[-11, 0, -12.5]} rotation={0} />
      <OfficeDesk position={[-7, 0, -12.5]} rotation={0} />
      <OfficeDesk position={[-3, 0, -12.5]} rotation={0} />
      <OfficeDesk position={[-11, 0, -7.5]} rotation={0} />
      <OfficeDesk position={[-3, 0, -7.5]} rotation={0} />
      <OfficeDesk position={[9, 0, -12.5]} rotation={0} />
      <OfficeDesk position={[13, 0, -12.5]} rotation={0} />
      <OfficeDesk position={[9, 0, -7.5]} rotation={0} />
      <OfficeDesk position={[13, 0, -7.5]} rotation={0} />
      <OfficeDesk position={[-11, 0, -2.5]} rotation={0} />
      <OfficeDesk position={[-7, 0, -2.5]} rotation={0} />
      <OfficeDesk position={[-3, 0, -2.5]} rotation={0} />
      <OfficeDesk position={[9, 0, -2.5]} rotation={0} />
      <OfficeDesk position={[13, 0, -2.5]} rotation={0} />

      {/* Overturned desks */}
      <OfficeDesk position={[5, 0.3, 8]} rotation={0.5} overturned />
      <OfficeDesk position={[-5, 0.4, 15]} rotation={-0.3} overturned />

      {/* Office chairs */}
      <OfficeChair position={[-10, 0, -11.5]} rotation={0} />
      <OfficeChair position={[-6, 0, -11.5]} rotation={0.2} />
      <OfficeChair position={[-2, 0, -11.5]} rotation={-0.1} />
      <OfficeChair position={[10, 0, -11.5]} rotation={0.3} />
      <OfficeChair position={[14, 0, -11.5]} rotation={0} />
      <OfficeChair position={[10, 0, -6.5]} rotation={0.1} />
      <OfficeChair position={[14, 0, -6.5]} rotation={-0.2} />
      <OfficeChair position={[-10, 0, -1.5]} rotation={0} />
      {/* Tipped chairs */}
      <OfficeChair position={[3, 0, 12]} rotation={0.5} tipped />
      <OfficeChair position={[-8, 0, 14]} rotation={-0.3} tipped />

      {/* Filing cabinets */}
      <FilingCabinet position={[16, 0, -5]} rotation={Math.PI / 2} />
      <FilingCabinet position={[16, 0, -3]} rotation={Math.PI / 2} />
      <FilingCabinet position={[-16, 0, 5]} rotation={-Math.PI / 2} />
      <FilingCabinet position={[-16, 0, 7]} rotation={-Math.PI / 2} />

      {/* Bookshelves */}
      <Bookshelf position={[-16, 0, -5]} rotation={Math.PI / 2} />
      <Bookshelf position={[16, 0, 8]} rotation={-Math.PI / 2} />

      {/* Water cooler */}
      <WaterCooler position={[5, 0, 5]} />
      <WaterCooler position={[-3, 0, 10]} />

      {/* Whiteboards */}
      <Whiteboard position={[19.7, 1.8, -8]} rotation={-Math.PI / 2} />
      <Whiteboard position={[-19.7, 1.8, 3]} rotation={Math.PI / 2} />

      {/* Rooms */}
      <ServerRoom />
      <BreakRoom />
      <ManagerOffice />
      <Bathroom />

      {/* Fluorescent ceiling lights */}
      <FluorescentLight position={[-10, WALL_H - 0.15, -10]} />
      <FluorescentLight position={[0, WALL_H - 0.15, -10]} />
      <FluorescentLight position={[10, WALL_H - 0.15, -10]} broken />
      <FluorescentLight position={[-10, WALL_H - 0.15, 5]} />
      <FluorescentLight position={[10, WALL_H - 0.15, 5]} broken />
      <FluorescentLight position={[0, WALL_H - 0.15, 10]} />

      {/* Red emergency lights */}
      <RedEmergencyLight position={[0, 3.5, -18]} />
      <RedEmergencyLight position={[-18, 3.5, 0]} />
      <RedEmergencyLight position={[18, 3.5, 0]} />

      {/* Dim corridor lights */}
      <pointLight position={[-5, 3.5, 0]} color="#887766" distance={8} decay={2} intensity={0.4} />
      <pointLight position={[5, 3.5, 0]} color="#887766" distance={8} decay={2} intensity={0.3} />
      <pointLight position={[0, 3.5, 15]} color="#887766" distance={8} decay={2} intensity={0.4} />

      {/* Emergency exit signs */}
      <EmergencyExitSign position={[18, 3, -18]} rotation={Math.PI / 4} />
      <EmergencyExitSign position={[-18, 3, 18]} rotation={-Math.PI * 0.75} />
      <EmergencyExitSign position={[18, 3, 5]} rotation={0} />

      {/* Elevator door */}
      <ElevatorDoor />

      {/* Horror details */}
      <BloodTrail />
      <BloodHandprints />
      <ScatteredPapers />
      <BrokenGlass />

      {/* Water puddles */}
      <WaterPuddles />

      {/* Ceiling damage */}
      <CeilingDamage />
      <HangingCeilingTiles />

      {/* Wall stains */}
      <WallStains />

      {/* Environmental effects */}
      <FloorFog />
      <DustParticles />
      <DrippingWater />
      <GlobalLightFlicker />

      {/* Elevator zone marker */}
      <mesh position={[0, 0.02, -19]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Save point glowstick */}
      <group position={[5, 0, 10]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} />
        </mesh>
        <pointLight position={[0, 0.3, 0]} color="#00ff44" distance={6} decay={2} intensity={1.5} />
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 24]} />
          <meshStandardMaterial color="#003311" emissive="#00ff44" emissiveIntensity={0.3} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Spawn zombies */}
      <Floor2Spawner />
    </group>
  );
}
