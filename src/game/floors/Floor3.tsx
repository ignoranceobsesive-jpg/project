'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useZombieStore, type ZombieSpawnConfig } from '@/stores/zombieStore';

const ROOM_W = 40;
const ROOM_D = 40;
const WALL_H = 4;
const WALL_THICKNESS = 0.2;
const WALL_COLOR = '#1a1a22';
const FLOOR_COLOR = '#121215';

// ===== WALL COMPONENT =====
function Wall({ position, size, color = WALL_COLOR }: { position: [number, number, number]; size: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

// ===== STROBE LIGHT (RED EMERGENCY) =====
function StrobeLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!lightRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime + phase;
    const strobe = Math.sin(t * 8) > 0.6 ? 1 : 0.05;
    lightRef.current.intensity = 3 * strobe;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 2 * strobe;
  });

  return (
    <>
      <pointLight ref={lightRef} position={position} color="#ff0000" distance={15} decay={2} />
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </>
  );
}

// ===== RED EMERGENCY LIGHT =====
function RedEmergencyLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lightRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 1.5 + Math.sin(t * 2) * 0.5;
    lightRef.current.intensity = pulse;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={1.5} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} color="#ff2200" distance={10} decay={2} intensity={1.5} />
    </group>
  );
}

// ===== FLICKERING LIGHT (COLD BLUE-WHITE) =====
function FlickeringLabLight({ position, color = '#aabbdd' }: { position: [number, number, number]; color?: string }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * 100, []);

  useFrame(() => {
    if (!lightRef.current || !meshRef.current) return;
    const t = performance.now() * 0.001;
    const flicker = Math.sin(t * 4 + phase) * 0.5 + Math.sin(t * 11 + phase) * 0.3;
    const blackout = Math.sin(t * 0.8 + phase) > 0.9 ? 0 : 1;
    const intensity = 2 * (0.3 + flicker * 0.3) * blackout;
    lightRef.current.intensity = intensity;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + flicker * 0.2;
  });

  return (
    <group position={position}>
      {/* Light fixture housing */}
      <mesh castShadow>
        <boxGeometry args={[1.0, 0.06, 0.2]} />
        <meshStandardMaterial color="#666670" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Light tube */}
      <mesh ref={meshRef} position={[0, -0.04, 0]}>
        <boxGeometry args={[0.85, 0.02, 0.1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, -0.2, 0]} color={color} distance={12} decay={2} castShadow intensity={2} />
    </group>
  );
}

// ===== RED PULSE LIGHT (ALARM) =====
function RedPulseLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!lightRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Sharp alarm pulse - fast on/off
    const pulse = Math.pow(Math.max(0, Math.sin(t * 4)), 8) * 4 + 0.3;
    lightRef.current.intensity = pulse;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = pulse * 0.5;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} color="#ff0000" distance={10} decay={2} intensity={1} />
    </group>
  );
}

// ===== SPECIMEN TANK WITH FLOATING BODY PARTS =====
function SpecimenTank({ position, liquidColor = '#00ff88' }: { position: [number, number, number]; liquidColor?: string }) {
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
          opacity={0.5}
          emissive={liquidColor}
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>
      {/* Floating body part silhouette */}
      <group position={[0, 0.9, 0]} rotation={[0.2, 0.3, 0.1]}>
        {/* Torso silhouette */}
        <mesh>
          <boxGeometry args={[0.2, 0.35, 0.12]} />
          <meshStandardMaterial color="#1a1a15" roughness={0.9} transparent opacity={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a15" roughness={0.9} transparent opacity={0.7} />
        </mesh>
        {/* Arm */}
        <mesh position={[0.2, 0.05, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.08, 0.3, 0.06]} />
          <meshStandardMaterial color="#1a1a15" roughness={0.9} transparent opacity={0.6} />
        </mesh>
      </group>
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
      {/* Green glow light */}
      <pointLight position={[0, 1, 0]} color={liquidColor} distance={4} decay={2} intensity={0.8} />
    </group>
  );
}

// ===== LAB TABLE WITH EQUIPMENT =====
function LabTable({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Table surface */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.06, 0.8]} />
        <meshStandardMaterial color="#888890" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Table legs */}
      {[[-0.9, 0.425, -0.35], [0.9, 0.425, -0.35], [-0.9, 0.425, 0.35], [0.9, 0.425, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.85, 0.04]} />
          <meshStandardMaterial color="#666670" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Microscope */}
      <group position={[-0.6, 0.91, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.2, 6]} />
          <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Eyepiece */}
        <mesh position={[0, 0.28, 0]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.025, 0.08, 6]} />
          <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>
      {/* Beaker */}
      <mesh position={[0.2, 0.95, 0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.12, 8, 1, true]} />
        <meshStandardMaterial color="#aaccee" transparent opacity={0.3} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Beaker liquid */}
      <mesh position={[0.2, 0.93, 0.15]}>
        <cylinderGeometry args={[0.035, 0.03, 0.06, 8]} />
        <meshStandardMaterial color="#00aaff" transparent opacity={0.5} emissive="#0066aa" emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      {/* Test tube rack */}
      <group position={[0.6, 0.91, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.04, 0.06]} />
          <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Test tubes */}
        {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
          <mesh key={i} position={[x, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.1, 6, 1, true]} />
            <meshStandardMaterial
              color={['#ff4444', '#44ff44', '#4444ff', '#ffff44'][i]}
              transparent
              opacity={0.5}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ===== COMPUTER TERMINAL =====
function ComputerTerminal({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!screenRef.current) return;
    const t = state.clock.elapsedTime;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(t * 8 + position[0]) * 0.15;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#444450" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Desk legs */}
      {[[-0.5, 0.375, -0.3], [0.5, 0.375, -0.3], [-0.5, 0.375, 0.3], [0.5, 0.375, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.75, 0.04]} />
          <meshStandardMaterial color="#555560" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.04]} />
        <meshStandardMaterial color="#111115" />
      </mesh>
      {/* Screen - green terminal glow */}
      <mesh ref={screenRef} position={[0, 1.1, -0.17]}>
        <planeGeometry args={[0.48, 0.32]} />
        <meshStandardMaterial
          color="#003300"
          emissive="#00ff44"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.87, -0.2]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#222225" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.8, 0.05]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.12]} />
        <meshStandardMaterial color="#222225" roughness={0.6} />
      </mesh>
      {/* Screen glow */}
      <pointLight position={[0, 1.1, 0]} color="#00ff44" distance={3} decay={2} intensity={0.3} />
    </group>
  );
}

// ===== CHEMICAL SHELF WITH BOTTLES =====
function ChemicalShelf({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const bottleColors = useMemo(
    () => ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8800', '#8800ff'],
    []
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Shelf frame */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.5, 2.0, 0.35]} />
        <meshStandardMaterial color="#3a3a45" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Shelves */}
      {[0.3, 0.8, 1.3, 1.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.45, 0.03, 0.33]} />
          <meshStandardMaterial color="#3a3a45" roughness={0.8} />
        </mesh>
      ))}
      {/* Bottles on each shelf */}
      {[0.4, 0.9, 1.4, 1.9].map((y, shelfIdx) => (
        <group key={shelfIdx}>
          {Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, bottleIdx) => {
            const xOff = -0.5 + bottleIdx * 0.25 + Math.random() * 0.05;
            const height = 0.12 + Math.random() * 0.08;
            const color = bottleColors[(shelfIdx * 3 + bottleIdx) % bottleColors.length];
            return (
              <mesh key={bottleIdx} position={[xOff, y, 0.02]} castShadow>
                <cylinderGeometry args={[0.03, 0.035, height, 6]} />
                <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.2} metalness={0.1} emissive={color} emissiveIntensity={0.1} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// ===== CENTRIFUGE MACHINE =====
function Centrifuge({ position }: { position: [number, number, number] }) {
  const rotorRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rotorRef.current) return;
    const t = state.clock.elapsedTime;
    rotorRef.current.rotation.y = t * 5;
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 12]} />
        <meshStandardMaterial color="#555560" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Top lid - partially open */}
      <mesh position={[0, 0.82, 0]} rotation={[0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 12]} />
        <meshStandardMaterial color="#666670" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Rotor inside (visible through open lid) */}
      <group ref={rotorRef} position={[0, 0.7, 0]}>
        {Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(angle) * 0.15, 0, Math.cos(angle) * 0.15]}>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 4]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.15} />
            </mesh>
          );
        })}
      </group>
      {/* Control panel */}
      <mesh position={[0, 0.5, 0.36]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshStandardMaterial color="#003300" emissive="#00ff44" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ===== AUTOPSY TABLE WITH BODY BAG =====
function AutopsyTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table surface */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#666670" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Table legs - adjustable height style */}
      {[[-0.95, 0.425, -0.35], [0.95, 0.425, -0.35], [-0.95, 0.425, 0.35], [0.95, 0.425, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.85, 0.05]} />
          <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Body bag - tied bundle */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[1.8, 0.2, 0.5]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.95} />
      </mesh>
      {/* Body bag ties */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0]} castShadow>
          <boxGeometry args={[0.06, 0.04, 0.52]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
      ))}
      {/* Blood on table */}
      <mesh position={[0.5, 0.89, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#6b0000" transparent opacity={0.8} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Drain hole at end */}
      <mesh position={[1.0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
        <meshStandardMaterial color="#333340" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Surgical light above */}
      <pointLight position={[0, 3.5, 0]} color="#ffffff" intensity={2} distance={6} decay={2} />
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Instrument tray */}
      <mesh position={[-1.5, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.3]} />
        <meshStandardMaterial color="#888890" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Tray stand */}
      <mesh position={[-1.5, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.75, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ===== CHEMICAL SPILL ZONE =====
function ChemicalSpillZone({ position, size = 3, color = '#00ff44' }: { position: [number, number, number]; size?: number; color?: string }) {
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
          color={color === '#00ff44' ? '#003300' : '#330000'}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.5, 0]} color={color} distance={5} decay={2} intensity={1} />
    </group>
  );
}

// ===== BIOHAZARD SIGN =====
function BiohazardSign({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Sign background */}
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <meshStandardMaterial color="#ccaa00" emissive="#ccaa00" emissiveIntensity={0.5} />
      </mesh>
      {/* Biohazard symbol - simplified circles */}
      {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
        <mesh key={i} position={[Math.sin(angle) * 0.12, Math.cos(angle) * 0.12 + 0.02, 0.015]} rotation={[0, 0, angle]}>
          <torusGeometry args={[0.08, 0.015, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>
      ))}
      {/* Center circle */}
      <mesh position={[0, 0.02, 0.015]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </mesh>
    </group>
  );
}

// ===== QUARANTINE TAPE =====
function QuarantineTape({ position, rotation = 0, width = 3 }: { position: [number, number, number]; rotation?: number; width?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Yellow tape strips */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[width, 0.08, 0.005]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[width, 0.08, 0.005]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Tape supports */}
      <mesh position={[-width / 2, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 4]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 4]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ===== BLOOD SPATTER =====
function BloodSpatter() {
  const spatters = useMemo(
    () => Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 36,
        i < 8 ? 0.01 : 1 + Math.random() * 2,
        (Math.random() - 0.5) * 36,
      ] as [number, number, number],
      isFloor: i < 8,
      wallSide: i % 2 === 0 ? -1 : 1,
      size: 0.1 + Math.random() * 0.3,
    })),
    []
  );

  return (
    <>
      {spatters.map((sp, i) => (
        <mesh
          key={i}
          position={sp.isFloor ? sp.position : [sp.wallSide * 19.8, sp.position[1], sp.position[2]]}
          rotation={
            sp.isFloor
              ? [-Math.PI / 2, 0, Math.random() * Math.PI]
              : [0, sp.wallSide > 0 ? -Math.PI / 2 : Math.PI / 2, 0]
          }
        >
          <circleGeometry args={[sp.size, 12]} />
          <meshStandardMaterial
            color="#6b0000"
            emissive="#330000"
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
            roughness={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

// ===== WALL SCRATCHES =====
function WallScratches() {
  const scratches = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      position: [
        (Math.random() > 0.5 ? 19.8 : -19.8),
        0.5 + Math.random() * 2,
        -15 + i * 5,
      ] as [number, number, number],
      rotation: [0, Math.random() > 0.5 ? -Math.PI / 2 : Math.PI / 2, 0.2 + Math.random() * 0.4] as [number, number, number],
    })),
    []
  );

  return (
    <>
      {scratches.map((scratch, i) => (
        <group key={i} position={scratch.position} rotation={scratch.rotation}>
          {/* 3 scratch lines close together */}
          {[-0.03, 0, 0.03].map((offset, j) => (
            <mesh key={j} position={[0, offset, 0.01]}>
              <planeGeometry args={[0.4, 0.01]} />
              <meshStandardMaterial color="#0a0a0a" roughness={1} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ===== OBSERVATION WINDOW =====
function ObservationWindow({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 2.0, 0.1]} />
        <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Glass pane */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.2, 1.7]} />
        <meshStandardMaterial
          color="#88aacc"
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>
      {/* Window frame dividers */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.04, 1.7, 0.02]} />
        <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[2.2, 0.04, 0.02]} />
        <meshStandardMaterial color="#555560" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Blood smear on glass */}
      <mesh position={[-0.3, 0.2, 0.08]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#6b0000" transparent opacity={0.5} roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ===== EXPOSED PIPES AND VENTS =====
function ExposedPipesAndVents() {
  return (
    <group>
      {/* Main pipe running along ceiling */}
      <mesh position={[0, WALL_H - 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 38, 8]} />
        <meshStandardMaterial color="#555560" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Secondary pipes */}
      <mesh position={[-8, WALL_H - 0.2, -8]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 12, 6]} />
        <meshStandardMaterial color="#4a4a50" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[8, WALL_H - 0.2, 8]} rotation={[0, -0.3, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 10, 6]} />
        <meshStandardMaterial color="#4a4a50" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Pipe joints */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <mesh key={i} position={[x, WALL_H - 0.3, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#666670" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Vent duct */}
      <mesh position={[12, WALL_H - 0.5, -12]} castShadow>
        <boxGeometry args={[3, 0.4, 0.4]} />
        <meshStandardMaterial color="#444450" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-12, WALL_H - 0.5, 12]} castShadow>
        <boxGeometry args={[2.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#444450" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Vent grate */}
      <mesh position={[12, WALL_H - 0.7, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.35]} />
        <meshStandardMaterial color="#333340" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Dripping green pipe */}
      <mesh position={[-5, WALL_H - 0.25, 10]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#336633" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ===== STEAM FROM FLOOR VENTS =====
function SteamFromVents() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: 11 + (Math.random() - 0.5) * 3,
      y: Math.random() * 1.5,
      z: -12 + (Math.random() - 0.5) * 1,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      ventIdx: Math.random() > 0.5 ? 0 : 1,
    }))
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const p = particles.current;

    for (let i = 0; i < count; i++) {
      const ventX = p[i].ventIdx === 0 ? 12 : -12;
      const ventZ = p[i].ventIdx === 0 ? -12 : 12;

      p[i].y += p[i].speed * 0.015;
      p[i].x = ventX + (Math.random() - 0.5) * 2 + Math.sin(t * 0.5 + p[i].phase) * 0.3;

      if (p[i].y > 2.5) {
        p[i].y = 0;
        p[i].z = ventZ + (Math.random() - 0.5) * 1;
      }

      const scale = 0.08 + p[i].y * 0.04;
      dummy.position.set(p[i].x, p[i].y, ventZ + (Math.random() - 0.5) * 0.5);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#aabbcc" transparent opacity={0.06} roughness={1} depthWrite={false} />
    </instancedMesh>
  );
}

// ===== ELECTRICAL SPARKS =====
function ElectricalSparks() {
  const sparkLightRef = useRef<THREE.PointLight>(null);
  const sparkTimerRef = useRef(0);
  const nextSparkRef = useRef(Math.random() * 3 + 1);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!sparkLightRef.current || !meshRef.current) return;
    sparkTimerRef.current += delta;

    if (sparkTimerRef.current >= nextSparkRef.current) {
      sparkTimerRef.current = 0;
      nextSparkRef.current = Math.random() * 4 + 0.5;
      sparkLightRef.current.intensity = 8;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 3;
    }

    if (sparkLightRef.current.intensity > 0) {
      sparkLightRef.current.intensity *= 0.82;
      if (sparkLightRef.current.intensity < 0.1) sparkLightRef.current.intensity = 0;
    }
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat.emissiveIntensity > 0.1) {
      mat.emissiveIntensity *= 0.85;
    }
  });

  return (
    <group position={[15, 1.5, -5]}>
      {/* Broken equipment box */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.6, 0.4]} />
        <meshStandardMaterial color="#333340" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Exposed wires */}
      <mesh position={[0.1, -0.1, 0.22]} rotation={[0.4, 0, 0.2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.25, 4]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.1, 0, 0.22]} rotation={[-0.2, 0, -0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 4]} />
        <meshStandardMaterial color="#2244ff" emissive="#2244ff" emissiveIntensity={0.2} />
      </mesh>
      {/* Spark flash mesh */}
      <mesh ref={meshRef} position={[0, 0, 0.25]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ffaa44" emissiveIntensity={0} />
      </mesh>
      <pointLight ref={sparkLightRef} position={[0, 0, 0.3]} color="#ffaa44" distance={5} decay={2} intensity={0} />
    </group>
  );
}

// ===== DRIPPING GREEN LIQUID =====
function DrippingGreenLiquid() {
  const count = 10;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useRef(
    Array.from({ length: count }, () => ({
      x: -5 + (Math.random() - 0.5) * 4,
      y: Math.random() * WALL_H,
      z: 10 + (Math.random() - 0.5) * 4,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const d = drops.current;

    for (let i = 0; i < count; i++) {
      d[i].y -= d[i].speed * delta;

      if (d[i].y < 0) {
        d[i].y = WALL_H - 0.3;
        d[i].x = -5 + (Math.random() - 0.5) * 4;
        d[i].z = 10 + (Math.random() - 0.5) * 4;
      }

      dummy.position.set(d[i].x, d[i].y, d[i].z);
      dummy.scale.set(0.02, 0.04, 0.02);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#00ff44" transparent opacity={0.5} emissive="#00ff44" emissiveIntensity={0.3} roughness={0.3} />
    </instancedMesh>
  );
}

// ===== BROKEN BEAKERS WITH SPILLED CHEMICALS =====
function BrokenBeakers() {
  const beakers = useMemo(
    () => [
      { pos: [5, 0, -8] as [number, number, number], color: '#ff4444', puddleSize: 0.6 },
      { pos: [-8, 0, 5] as [number, number, number], color: '#4444ff', puddleSize: 0.8 },
      { pos: [10, 0, 10] as [number, number, number], color: '#ffff44', puddleSize: 0.5 },
      { pos: [-3, 0, -12] as [number, number, number], color: '#ff44ff', puddleSize: 0.7 },
    ],
    []
  );

  return (
    <>
      {beakers.map((beaker, i) => (
        <group key={i} position={beaker.pos}>
          {/* Spilled chemical puddle */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
            <circleGeometry args={[beaker.puddleSize, 16]} />
            <meshStandardMaterial
              color={beaker.color}
              emissive={beaker.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
              roughness={0.3}
            />
          </mesh>
          {/* Broken beaker shards */}
          {Array.from({ length: 3 }, (_, j) => (
            <mesh key={j} position={[Math.random() * 0.3 - 0.15, 0.005, Math.random() * 0.3 - 0.15]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
              <planeGeometry args={[0.06, 0.08]} />
              <meshStandardMaterial color="#aaccee" transparent opacity={0.3} roughness={0.1} metalness={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ===== ARMORY DOOR =====
function ArmoryDoor() {
  return (
    <group position={[0, 0, -19.8]}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[2.5, 4, 0.15]} />
        <meshStandardMaterial color="#333340" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2, 0.08]} castShadow>
        <boxGeometry args={[2.2, 3.8, 0.08]} />
        <meshStandardMaterial color="#444450" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Lock mechanism */}
      <mesh position={[0.8, 1.8, 0.15]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffaa00" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Lock indicator */}
      <mesh position={[-0.8, 2.5, 0.12]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// ===== OPERATING ROOM =====
function OperatingRoom() {
  return (
    <group position={[12, 0, 10]}>
      {/* Room walls */}
      <mesh position={[0, WALL_H / 2, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[8, WALL_H, 0.15]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.85} />
      </mesh>
      <mesh position={[-4, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, WALL_H, 7]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.85} />
      </mesh>

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
        <meshStandardMaterial color="#6b0000" emissive="#330000" emissiveIntensity={0.3} transparent opacity={0.8} roughness={1} />
      </mesh>
      {/* Surgical light */}
      <pointLight position={[0, 3.5, 0]} color="#ffffff" intensity={2} distance={6} decay={2} />
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Instrument tray */}
      <mesh position={[-1.5, 0.7, 0.5]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#888890" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ===== BOSS ARENA =====
function BossArena() {
  return (
    <group position={[0, 0, -12]}>
      {/* Arena boundary pillars */}
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
      <mesh position={[0, 0.01, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.6, 32]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ===== INTERIOR WALLS / DARK ROOMS =====
function InteriorWalls() {
  return (
    <>
      <Wall position={[-14, WALL_H / 2, -14]} size={[8, WALL_H, 0.15]} />
      <Wall position={[-14, WALL_H / 2, -8]} size={[0.15, WALL_H, 6]} />
      <Wall position={[14, WALL_H / 2, -14]} size={[8, WALL_H, 0.15]} />
      <Wall position={[14, WALL_H / 2, -8]} size={[0.15, WALL_H, 6]} />
    </>
  );
}

// ===== SPAWNER =====
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

// ===== MAIN FLOOR3 COMPONENT =====
export default function Floor3() {
  const halfW = ROOM_W / 2;
  const halfD = ROOM_D / 2;

  return (
    <group>
      {/* Floor - lab tile (shinier) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#0e0e12" roughness={0.95} />
      </mesh>

      {/* Outer walls - white/sterile */}
      <Wall position={[0, WALL_H / 2, -halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} color="#2a2a35" />
      <Wall position={[0, WALL_H / 2, halfD]} size={[ROOM_W, WALL_H, WALL_THICKNESS]} color="#2a2a35" />
      <Wall position={[-halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} color="#2a2a35" />
      <Wall position={[halfW, WALL_H / 2, 0]} size={[WALL_THICKNESS, WALL_H, ROOM_D]} color="#2a2a35" />

      {/* Interior walls */}
      <InteriorWalls />

      {/* Specimen tanks with floating body parts */}
      <SpecimenTank position={[-8, 0, -5]} liquidColor="#00ff88" />
      <SpecimenTank position={[-6, 0, -5]} liquidColor="#ff0066" />
      <SpecimenTank position={[-4, 0, -5]} liquidColor="#4488ff" />
      <SpecimenTank position={[6, 0, -5]} liquidColor="#ff8800" />
      <SpecimenTank position={[8, 0, -5]} liquidColor="#aa00ff" />
      <SpecimenTank position={[4, 0, -5]} liquidColor="#00ffcc" />

      {/* Lab tables with equipment */}
      <LabTable position={[-12, 0, -10]} rotation={0} />
      <LabTable position={[12, 0, -10]} rotation={0} />
      <LabTable position={[-10, 0, 5]} rotation={Math.PI / 2} />
      <LabTable position={[10, 0, 5]} rotation={Math.PI / 2} />

      {/* Computer terminals */}
      <ComputerTerminal position={[-14, 0, 2]} rotation={Math.PI / 2} />
      <ComputerTerminal position={[14, 0, 2]} rotation={-Math.PI / 2} />
      <ComputerTerminal position={[0, 0, 14]} rotation={Math.PI} />

      {/* Chemical shelves */}
      <ChemicalShelf position={[-19.5, 0, -5]} rotation={Math.PI / 2} />
      <ChemicalShelf position={[19.5, 0, -5]} rotation={-Math.PI / 2} />
      <ChemicalShelf position={[-19.5, 0, 8]} rotation={Math.PI / 2} />

      {/* Centrifuge machine */}
      <Centrifuge position={[-5, 0, 10]} />
      <Centrifuge position={[7, 0, -14]} />

      {/* Autopsy table with body bag */}
      <AutopsyTable position={[0, 0, 5]} />

      {/* Chemical spill zones */}
      <ChemicalSpillZone position={[-10, 0, 5]} size={2.5} color="#00ff44" />
      <ChemicalSpillZone position={[10, 0, 5]} size={3} color="#00ff44" />
      <ChemicalSpillZone position={[0, 0, 0]} size={1.5} color="#ff4444" />

      {/* Armory door */}
      <ArmoryDoor />

      {/* Operating room */}
      <OperatingRoom />

      {/* Boss arena */}
      <BossArena />

      {/* Biohazard signs */}
      <BiohazardSign position={[-19.7, 2, -8]} rotation={-Math.PI / 2} />
      <BiohazardSign position={[19.7, 2, 8]} rotation={Math.PI / 2} />
      <BiohazardSign position={[-8, 2, -19.7]} rotation={0} />
      <BiohazardSign position={[8, 2, 19.7]} rotation={Math.PI} />

      {/* Quarantine tape across doorways */}
      <QuarantineTape position={[-14, 0, -11]} rotation={0} width={4} />
      <QuarantineTape position={[14, 0, -11]} rotation={0} width={4} />
      <QuarantineTape position={[0, 0, 16]} rotation={Math.PI / 2} width={3} />

      {/* Observation windows */}
      <ObservationWindow position={[-14.05, 2, -11]} rotation={-Math.PI / 2} />
      <ObservationWindow position={[14.05, 2, -11]} rotation={Math.PI / 2} />

      {/* Blood spatter */}
      <BloodSpatter />

      {/* Broken beakers with spilled chemicals */}
      <BrokenBeakers />

      {/* Wall scratches */}
      <WallScratches />

      {/* Exposed pipes and vents */}
      <ExposedPipesAndVents />

      {/* Steam from floor vents */}
      <SteamFromVents />

      {/* Electrical sparks from broken equipment */}
      <ElectricalSparks />

      {/* Dripping green liquid from pipes */}
      <DrippingGreenLiquid />

      {/* Red strobe lights */}
      <StrobeLight position={[-10, 3.5, -14]} />
      <StrobeLight position={[10, 3.5, -14]} />
      <StrobeLight position={[0, 3.5, -18]} />

      {/* Cold blue-white lab lighting */}
      <FlickeringLabLight position={[-8, WALL_H - 0.1, 5]} color="#aabbdd" />
      <FlickeringLabLight position={[8, WALL_H - 0.1, 5]} color="#aabbdd" />
      <FlickeringLabLight position={[0, WALL_H - 0.1, 15]} color="#aabbdd" />
      <FlickeringLabLight position={[12, WALL_H - 0.1, 12]} color="#99aabb" />

      {/* Red emergency backup lights */}
      <RedEmergencyLight position={[-15, 3.5, 5]} />
      <RedEmergencyLight position={[15, 3.5, 5]} />

      {/* Alarming red pulse light */}
      <RedPulseLight position={[0, 3.5, -5]} />

      {/* Dim corridor lights */}
      <pointLight position={[-14, 3, -10]} color="#334455" distance={8} decay={2} intensity={0.3} />
      <pointLight position={[14, 3, -10]} color="#334455" distance={8} decay={2} intensity={0.3} />

      {/* Elevator zone */}
      <mesh position={[0, 0.02, 19]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Save point glowstick */}
      <group position={[-5, 0, 15]}>
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

      <Floor3Spawner />
    </group>
  );
}
