'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerStore, SURVIVORS, type SurvivorId } from '@/stores/playerStore';
import * as THREE from 'three';

// ─── Spotlight with Volumetric Cone ──────────────────────────────────
function VolumetricSpotlight() {
  const coneRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (!coneRef.current || !lightRef.current) return;
    const t = Date.now() * 0.001;
    // Subtle breathing of the cone
    coneRef.current.scale.x = 1 + Math.sin(t * 0.5) * 0.02;
    coneRef.current.scale.z = 1 + Math.sin(t * 0.5) * 0.02;
    lightRef.current.intensity = 4 + Math.sin(t * 0.8) * 0.3;
  });

  return (
    <group position={[0, 9, 3]}>
      <spotLight
        ref={lightRef}
        angle={0.35}
        penumbra={0.6}
        intensity={4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        target-position={[0, 0, 0]}
      />
      {/* Volumetric cone - fake light shaft */}
      <mesh ref={coneRef} rotation={[0.15, 0, 0]}>
        <coneGeometry args={[3.5, 9, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.015}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Floating Dust Motes ─────────────────────────────────────────────
function DustMotes() {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * 6 + 0.5,
        z: (Math.random() - 0.5) * 8,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.04 + 0.01,
      })),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * 0.5,
        p.y + Math.sin(t * 0.2 + p.phase) * 0.3,
        p.z + Math.cos(t * p.speed * 0.7 + p.phase) * 0.5
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffddaa" transparent opacity={0.4} />
    </instancedMesh>
  );
}

// ─── Floor Reflection (Mirror Plane) ─────────────────────────────────
function FloorReflection() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial
        color="#0a0a12"
        roughness={0.15}
        metalness={0.85}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ─── Smoke at Feet ───────────────────────────────────────────────────
function SmokeAtFeet() {
  const count = 30;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const smokeData = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3,
        speed: Math.random() * 0.2 + 0.05,
        phase: Math.random() * Math.PI * 2,
        maxSize: Math.random() * 0.8 + 0.4,
      })),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const s = smokeData[i];
      const cycle = ((t * s.speed + s.phase) % 4) / 4;
      const yPos = cycle * 2;
      const scale = s.maxSize * (1 + cycle * 1.5);
      dummy.position.set(
        s.x + Math.sin(t * 0.3 + s.phase) * 0.3,
        yPos,
        s.z + Math.cos(t * 0.2 + s.phase) * 0.3
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#1a1a2e"
        transparent
        opacity={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ─── Detailed Pillars with Cracks ────────────────────────────────────
function DetailedPillars() {
  return (
    <>
      {useMemo(() => {
        const pillars: React.ReactNode[] = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.sin(angle) * 8;
          const z = Math.cos(angle) * 8;
          const hasCrack = i % 2 === 0;
          const hasDamage = i % 3 === 0;
          pillars.push(
            <group key={i} position={[x, 0, z]}>
              {/* Main pillar */}
              <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[0.5, 6, 0.5]} />
                <meshStandardMaterial color="#111122" roughness={0.8} metalness={0.3} />
              </mesh>
              {/* Pillar base */}
              <mesh position={[0, 0.15, 0]} castShadow>
                <boxGeometry args={[0.7, 0.3, 0.7]} />
                <meshStandardMaterial color="#0f0f1e" roughness={0.75} metalness={0.35} />
              </mesh>
              {/* Pillar cap */}
              <mesh position={[0, 6.15, 0]} castShadow>
                <boxGeometry args={[0.65, 0.3, 0.65]} />
                <meshStandardMaterial color="#0f0f1e" roughness={0.75} metalness={0.35} />
              </mesh>
              {/* Cracks */}
              {hasCrack && (
                <>
                  <mesh position={[0.26, 2, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.02, 2.5, 0.02]} />
                    <meshStandardMaterial color="#050510" />
                  </mesh>
                  <mesh position={[0.26, 3.5, 0]} rotation={[0, 0, -0.15]}>
                    <boxGeometry args={[0.02, 1.2, 0.02]} />
                    <meshStandardMaterial color="#050510" />
                  </mesh>
                </>
              )}
              {/* Damage - chipped corner */}
              {hasDamage && (
                <mesh position={[0.25, 1.5, 0.25]} rotation={[0.3, 0.5, 0.2]}>
                  <boxGeometry args={[0.2, 0.3, 0.2]} />
                  <meshStandardMaterial color="#080815" roughness={0.95} />
                </mesh>
              )}
            </group>
          );
        }
        return pillars;
      }, [])}
    </>
  );
}

// ─── Holographic UI Ring ─────────────────────────────────────────────
function HolographicRing({ survivorId }: { survivorId: SurvivorId }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const survivor = SURVIVORS[survivorId];
  const color = survivor.color;

  useFrame((state) => {
    if (!groupRef.current || !ringRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.position.y = 1.2 + Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      {/* Main ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Second ring - tilted */}
      <mesh rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
        <torusGeometry args={[2.3, 0.015, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Third ring - more tilted */}
      <mesh rotation={[Math.PI / 2 - 0.2, -0.3, 0]}>
        <torusGeometry args={[1.7, 0.015, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      {/* Data points on ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}
          >
            <octahedronGeometry args={[0.04, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        );
      })}
      {/* Scanning line */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Particle Burst on Character Change ──────────────────────────────
function ParticleBurst({ survivorId }: { survivorId: SurvivorId }) {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [burstTime, setBurstTime] = useState(Date.now());
  const survivor = SURVIVORS[survivorId];
  const color = survivor.color;

  const burstData = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        dx: (Math.random() - 0.5) * 6,
        dy: Math.random() * 4,
        dz: (Math.random() - 0.5) * 6,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 0.06 + 0.02,
      })),
    []
  );

  useEffect(() => {
    setBurstTime(Date.now());
  }, [survivorId]);

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = (Date.now() - burstTime) / 1000;
    const progress = Math.min(elapsed / 1.5, 1);
    const fadeOut = Math.max(0, 1 - progress);

    for (let i = 0; i < count; i++) {
      const b = burstData[i];
      const dist = progress * b.speed * 3;
      dummy.position.set(
        b.dx * dist,
        b.dy * dist,
        b.dz * dist
      );
      dummy.scale.setScalar(b.size * fadeOut);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
}

// ─── Rotating Platform ───────────────────────────────────────────────
function RotatingPlatform() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef} position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Platform glow ring */}
      <mesh ref={meshRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.55, 64]} />
        <meshBasicMaterial color="#334466" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Platform inner ring */}
      <mesh ref={meshRef} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.1, 32]} />
        <meshBasicMaterial color="#445577" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Character Model ─────────────────────────────────────────────────
function CharacterModel({ survivorId }: { survivorId: SurvivorId }) {
  const groupRef = useRef<THREE.Group>(null);
  const survivor = SURVIVORS[survivorId];
  const color = survivor.color;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = 0.1 + Math.sin(t * 2) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body - capsule approximation */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.45, 1.2, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.45, 1.2, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.18, 0.65, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.18, 0.65, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Character glow - subtle emissive accent */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────────
export default function CharacterSelectScene() {
  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);

  return (
    <>
      {/* Dark reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#080810" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Floor reflection overlay */}
      <FloorReflection />

      {/* Fog backdrop */}
      <fog attach="fog" args={['#080810', 8, 30]} />

      {/* Platform */}
      <RotatingPlatform />

      {/* Volumetric spotlight */}
      <VolumetricSpotlight />

      {/* Dramatic rim lighting */}
      <pointLight position={[-5, 3, -2]} color="#ff4400" intensity={1.2} distance={10} decay={2} />
      <pointLight position={[5, 3, -2]} color="#0044cc" intensity={0.8} distance={10} decay={2} />
      {/* Top fill */}
      <pointLight position={[0, 7, 0]} color="#6644aa" intensity={0.3} distance={12} decay={2} />
      {/* Bottom uplight */}
      <pointLight position={[0, 0.5, 2]} color="#ff6600" intensity={0.4} distance={6} decay={2} />

      {/* Selected character model */}
      <CharacterModel survivorId={selectedSurvivor} />

      {/* Holographic UI ring */}
      <HolographicRing survivorId={selectedSurvivor} />

      {/* Particle burst on change */}
      <ParticleBurst survivorId={selectedSurvivor} />

      {/* Floating dust motes in spotlight */}
      <DustMotes />

      {/* Smoke at feet */}
      <SmokeAtFeet />

      {/* Detailed pillars */}
      <DetailedPillars />

      {/* Ambient fill */}
      <ambientLight intensity={0.05} color="#334466" />
    </>
  );
}
