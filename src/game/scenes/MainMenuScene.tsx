'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Volumetric Fog Particles ────────────────────────────────────────
function VolumetricFog() {
  const count = 80;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleData = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 3 + 0.2,
        z: (Math.random() - 0.5) * 30 - 5,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        scale: Math.random() * 4 + 2,
        opacity: Math.random() * 0.06 + 0.02,
      })),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const d = particleData[i];
      dummy.position.set(
        d.x + Math.sin(t * d.speed + d.phase) * 2,
        d.y + Math.sin(t * 0.2 + d.phase) * 0.3,
        d.z + Math.cos(t * d.speed * 0.5 + d.phase) * 1.5
      );
      dummy.rotation.set(0, t * 0.01 + d.phase, 0);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#2a1a1a"
        transparent
        opacity={0.04}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ─── Ground Fog Layers ───────────────────────────────────────────────
function GroundFog() {
  const groupRef = useRef<THREE.Group>(null);
  const layers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        y: 0.05 + i * 0.15,
        opacity: 0.08 - i * 0.005,
        scale: 35 + i * 2,
      })),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Date.now() * 0.0003;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = t * (0.1 + i * 0.02);
      child.rotation.x = Math.sin(t + i) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {layers.map((l, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, l.y, -8]}>
          <planeGeometry args={[l.scale, l.scale]} />
          <meshBasicMaterial
            color="#1a0a0a"
            transparent
            opacity={l.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floating Ember Particles ────────────────────────────────────────
function EmberParticles() {
  const count = 150;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const embers = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 35,
        y: Math.random() * 12,
        z: (Math.random() - 0.5) * 25 - 5,
        speed: Math.random() * 0.8 + 0.3,
        wobble: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.08 + 0.02,
        hue: Math.random(),
      })),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const e = embers[i];
      const yPos = ((e.y + t * e.speed) % 12);
      dummy.position.set(
        e.x + Math.sin(t * e.wobble + e.phase) * 0.5,
        yPos,
        e.z + Math.cos(t * e.wobble * 0.7 + e.phase) * 0.3
      );
      dummy.scale.setScalar(e.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ff4400" transparent opacity={0.9} />
    </instancedMesh>
  );
}

// ─── Blood Puddle Decals ─────────────────────────────────────────────
function BloodPuddles() {
  const puddles = useMemo(
    () => [
      { pos: [-3, 0.01, -6] as [number, number, number], size: 1.2, rot: 0.5 },
      { pos: [5, 0.01, -10] as [number, number, number], size: 0.8, rot: 1.2 },
      { pos: [-1, 0.01, -12] as [number, number, number], size: 1.5, rot: 2.1 },
      { pos: [7, 0.01, -4] as [number, number, number], size: 0.6, rot: 0.8 },
      { pos: [-6, 0.01, -3] as [number, number, number], size: 1.0, rot: 3.0 },
      { pos: [2, 0.01, -8] as [number, number, number], size: 0.9, rot: 1.7 },
    ],
    []
  );

  return (
    <>
      {puddles.map((p, i) => (
        <group key={i} position={p.pos} rotation={[-Math.PI / 2, 0, p.rot]}>
          <mesh>
            <circleGeometry args={[p.size, 24]} />
            <meshStandardMaterial
              color="#4a0000"
              emissive="#220000"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
              roughness={1}
              metalness={0.1}
            />
          </mesh>
          {/* blood drip trails */}
          <mesh position={[p.size * 0.5, 0, 0]}>
            <planeGeometry args={[0.1, p.size * 0.8]} />
            <meshStandardMaterial
              color="#3a0000"
              emissive="#1a0000"
              emissiveIntensity={0.2}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── Zombie Silhouette (Detailed) ────────────────────────────────────
function ZombieSilhouette({
  position,
  speed,
  type,
}: {
  position: [number, number, number];
  speed: number;
  type?: 'stagger' | 'drag' | 'crawl';
}) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const randomType = useMemo(() => ['stagger', 'drag', 'crawl'][Math.floor(Math.random() * 3)] as const, []);
  const zombieType = type ?? randomType;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = Date.now() * 0.001;

    if (zombieType === 'stagger') {
      groupRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.15;
      groupRef.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.08;
      groupRef.current.rotation.y += delta * 0.15;
    } else if (zombieType === 'drag') {
      groupRef.current.position.y = position[1] - 0.1;
      groupRef.current.rotation.z = Math.sin(t * 0.3 + phase) * 0.05;
      groupRef.current.rotation.y += delta * 0.08;
    } else {
      // crawl - lower to ground
      groupRef.current.position.y = position[1] - 0.5;
      groupRef.current.rotation.x = 0.4;
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const isCrawl = zombieType === 'crawl';
  const isDrag = zombieType === 'drag';

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, isCrawl ? 0.4 : 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, isCrawl ? 0.6 : 1.0, 0.3]} />
        <meshStandardMaterial color="#0f0f0f" transparent opacity={0.65} roughness={0.9} />
      </mesh>
      {/* Head - tilted for zombies */}
      <mesh position={[0, isCrawl ? 0.5 : 1.65, isCrawl ? 0.2 : 0]} rotation={[isCrawl ? 0.5 : 0.2, 0, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} roughness={0.85} />
      </mesh>
      {/* Left arm - extended forward for stagger, dragging for drag */}
      <mesh
        position={isCrawl ? [-0.3, 0.3, 0.3] : [-0.4, 0.9, 0.2]}
        rotation={isCrawl ? [1.2, 0, 0] : isDrag ? [0, 0, 0.3] : [-0.6, 0, 0.2]}
        castShadow
      >
        <boxGeometry args={[0.12, isCrawl ? 0.5 : 0.8, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.55} />
      </mesh>
      {/* Right arm - extended like zombie reach */}
      <mesh
        position={isCrawl ? [0.3, 0.3, 0.3] : [0.4, 0.9, 0.25]}
        rotation={isCrawl ? [1.3, 0, 0] : [-0.7, 0, -0.15]}
        castShadow
      >
        <boxGeometry args={[0.12, isCrawl ? 0.5 : 0.8, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.55} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.15, isCrawl ? 0.1 : 0.2, isDrag ? 0.1 : 0]} castShadow>
        <boxGeometry args={[0.18, isCrawl ? 0.3 : 0.6, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.5} />
      </mesh>
      {/* Right leg - dragging leg for drag type */}
      <mesh position={[0.15, isDrag ? 0.05 : isCrawl ? 0.1 : 0.2, isDrag ? 0.15 : 0]} rotation={isDrag ? [0.3, 0, 0] : [0, 0, 0]} castShadow>
        <boxGeometry args={[0.18, isDrag ? 0.7 : isCrawl ? 0.3 : 0.6, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.5} />
      </mesh>
      {/* Torn clothing rags */}
      <mesh position={[0, isCrawl ? 0.3 : 0.6, 0.15]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.55, 0.3, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.35} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[0.08, isCrawl ? 0.55 : 1.7, isCrawl ? 0.35 : 0.17]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      <mesh position={[-0.08, isCrawl ? 0.55 : 1.7, isCrawl ? 0.35 : 0.17]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
    </group>
  );
}

// ─── Flickering Neon EXIT Sign ───────────────────────────────────────
function FlickeringNeonSign() {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const textMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flickerState = useRef({ on: true, timer: 0, nextFlicker: 0.5 });

  useFrame((_, delta) => {
    if (!lightRef.current || !textMatRef.current) return;
    const s = flickerState.current;
    s.timer += delta;

    if (s.timer >= s.nextFlicker) {
      s.timer = 0;
      s.nextFlicker = Math.random() * 1.5 + 0.1;

      if (s.on) {
        // Chance to turn off
        if (Math.random() < 0.4) {
          s.on = false;
          s.nextFlicker = Math.random() * 0.3 + 0.05;
        }
      } else {
        // Turn back on, maybe with rapid flicker
        s.on = true;
        if (Math.random() < 0.3) {
          s.nextFlicker = 0.05; // rapid flicker
        }
      }
    }

    const intensity = s.on ? (1.5 + Math.random() * 0.5) : 0;
    lightRef.current.intensity = intensity;
    textMatRef.current.emissiveIntensity = s.on ? 2 + Math.random() * 0.5 : 0;
  });

  return (
    <group ref={groupRef} position={[-15, 5.5, -19.5]}>
      {/* Sign backing */}
      <mesh>
        <boxGeometry args={[3, 1.2, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* E-X-I-T letter blocks */}
      {['E', 'X', 'I', 'T'].map((_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.7, 0, 0.09]}>
          <boxGeometry args={[0.5, 0.7, 0.05]} />
          <meshStandardMaterial
            ref={textMatRef}
            color="#ff3300"
            emissive="#ff3300"
            emissiveIntensity={2}
            roughness={0.4}
          />
        </mesh>
      ))}
      {/* Sign glow light */}
      <pointLight ref={lightRef} position={[0, -0.5, 0.5]} color="#ff2200" distance={8} decay={2} intensity={1.5} />
      {/* Sign mount bracket */}
      <mesh position={[1.3, 0.5, -0.05]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-1.3, 0.5, -0.05]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ─── Distant Lightning ───────────────────────────────────────────────
function DistantLightning() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const state = useRef({ timer: 0, nextFlash: 5 + Math.random() * 10, flashing: false, flashDuration: 0 });

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const s = state.current;
    s.timer += delta;

    if (s.flashing) {
      s.flashDuration -= delta;
      if (s.flashDuration <= 0) {
        s.flashing = false;
        lightRef.current.intensity = 0;
        s.nextFlash = 3 + Math.random() * 12;
        s.timer = 0;
      } else {
        // Flicker during flash
        lightRef.current.intensity = Math.random() > 0.3 ? 3 : 0.5;
      }
    } else if (s.timer >= s.nextFlash) {
      s.flashing = true;
      s.flashDuration = 0.1 + Math.random() * 0.3;
      lightRef.current.intensity = 3;
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[10, 30, -30]}
      intensity={0}
      color="#aabbdd"
    />
  );
}

// ─── Broken Columns & Debris ─────────────────────────────────────────
function BrokenColumns() {
  const columns = useMemo(
    () => [
      { pos: [-12, 0, -15] as [number, number, number], height: 4, broken: true },
      { pos: [14, 0, -14] as [number, number, number], height: 6, broken: false },
      { pos: [-8, 0, -18] as [number, number, number], height: 3, broken: true },
      { pos: [10, 0, -18] as [number, number, number], height: 5.5, broken: true },
      { pos: [0, 0, -19.5] as [number, number, number], height: 7, broken: false },
    ],
    []
  );

  return (
    <>
      {columns.map((c, i) => (
        <group key={i} position={c.pos}>
          {/* Column base */}
          <mesh position={[0, c.height / 2, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.5, c.height, 8]} />
            <meshStandardMaterial color="#1a1515" roughness={0.9} metalness={0.1} />
          </mesh>
          {c.broken && (
            <>
              {/* Broken top - jagged */}
              <mesh position={[0, c.height + 0.2, 0]} rotation={[0.1, 0, 0.15]} castShadow>
                <coneGeometry args={[0.35, 0.6, 5]} />
                <meshStandardMaterial color="#1a1515" roughness={0.95} />
              </mesh>
              {/* Fallen chunk */}
              <mesh position={[0.8, 0.2, 0.5]} rotation={[0.3, 0.5, 0.8]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.35]} />
                <meshStandardMaterial color="#1a1515" roughness={0.9} />
              </mesh>
            </>
          )}
          {/* Column cap (if not broken) */}
          {!c.broken && (
            <mesh position={[0, c.height + 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.55, 0.4, 0.3, 8]} />
              <meshStandardMaterial color="#1a1515" roughness={0.85} metalness={0.15} />
            </mesh>
          )}
          {/* Cracks - thin dark lines */}
          <mesh position={[0.15, c.height * 0.4, 0.35]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.02, c.height * 0.5, 0.02]} />
            <meshStandardMaterial color="#0a0505" />
          </mesh>
        </group>
      ))}
      {/* Debris pieces on ground */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const dist = 6 + Math.random() * 10;
        return (
          <mesh
            key={`debris-${i}`}
            position={[Math.sin(angle) * dist, 0.08, Math.cos(angle) * dist - 5]}
            rotation={[Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3]}
            castShadow
          >
            <boxGeometry args={[
              0.15 + Math.random() * 0.3,
              0.1 + Math.random() * 0.15,
              0.15 + Math.random() * 0.3,
            ]} />
            <meshStandardMaterial color="#151010" roughness={0.95} />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Hanging Chains ──────────────────────────────────────────────────
function HangingChains() {
  return (
    <>
      {[
        { pos: [-5, 8, -10] as [number, number, number], length: 3 },
        { pos: [3, 8, -12] as [number, number, number], length: 4 },
        { pos: [-8, 8, -6] as [number, number, number], length: 2.5 },
        { pos: [8, 8, -8] as [number, number, number], length: 3.5 },
        { pos: [0, 8, -16] as [number, number, number], length: 2 },
      ].map((chain, i) => (
        <HangingChain key={i} position={chain.pos} length={chain.length} index={i} />
      ))}
    </>
  );
}

function HangingChain({ position, length, index }: { position: [number, number, number]; length: number; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const linkCount = Math.floor(length / 0.25);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(t * 0.5 + index * 1.3) * 0.04;
    groupRef.current.rotation.x = Math.sin(t * 0.3 + index * 0.7) * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: linkCount }, (_, i) => (
        <mesh key={i} position={[0, -i * 0.25, 0]} rotation={[i % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.015, 4, 6]} />
          <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.4} />
        </mesh>
      ))}
      {/* Hook at end */}
      <mesh position={[0, -linkCount * 0.25 - 0.15, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.08, 0.02, 4, 8, Math.PI]} />
        <meshStandardMaterial color="#555555" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}

// ─── Dripping Water ──────────────────────────────────────────────────
function DrippingWater() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 20 - 5,
        speed: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.03 + 0.01,
      })),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      // Drip from ceiling (y=8) to ground (y=0), then reset
      const cycle = ((t * d.speed + d.phase) % 3) / 3;
      const yPos = 8 - cycle * 8;
      dummy.position.set(d.x, yPos, d.z);
      dummy.scale.setScalar(d.size * (1 + cycle * 0.5)); // grows as it falls
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#6688aa" transparent opacity={0.5} />
    </instancedMesh>
  );
}

// ─── Animated Accent Lights ──────────────────────────────────────────
function AnimatedLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(() => {
    if (!lightRef.current) return;
    const t = Date.now() * 0.001;
    lightRef.current.intensity = 1.5 + Math.sin(t * 2 + phase) * 0.5 + Math.sin(t * 5.3) * 0.2;
  });

  return <pointLight ref={lightRef} position={[0, 8, 0]} color="#ff4400" distance={30} decay={2} />;
}

// ─── Slow Orbit Camera ───────────────────────────────────────────────
function OrbitCamera() {
  const angleRef = useRef(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(({ camera }, delta) => {
    if (!cameraRef.current) cameraRef.current = camera as THREE.PerspectiveCamera;
    angleRef.current += delta * 0.05;
    const r = 18;
    const cam = cameraRef.current;
    cam.position.set(
      Math.sin(angleRef.current) * r,
      5 + Math.sin(angleRef.current * 0.3) * 1,
      Math.cos(angleRef.current) * r - 5
    );
    cam.lookAt(0, 1.5, -8);
  });

  return null;
}

// ─── Main Scene ──────────────────────────────────────────────────────
export default function MainMenuScene() {
  const zombieConfigs = useMemo(
    () => [
      { pos: [-6, 0, -8] as [number, number, number], speed: 0.5, type: 'stagger' as const },
      { pos: [7, 0, -10] as [number, number, number], speed: 0.6, type: 'drag' as const },
      { pos: [-3, 0, -14] as [number, number, number], speed: 0.4, type: 'crawl' as const },
      { pos: [4, 0, -12] as [number, number, number], speed: 0.7, type: 'stagger' as const },
      { pos: [0, 0, -16] as [number, number, number], speed: 0.3, type: 'drag' as const },
      { pos: [-8, 0, -6] as [number, number, number], speed: 0.5, type: 'stagger' as const },
      { pos: [9, 0, -7] as [number, number, number], speed: 0.6, type: 'crawl' as const },
      { pos: [-5, 0, -12] as [number, number, number], speed: 0.4, type: 'drag' as const },
      { pos: [2, 0, -6] as [number, number, number], speed: 0.5, type: 'stagger' as const },
      { pos: [-10, 0, -10] as [number, number, number], speed: 0.35, type: 'crawl' as const },
    ],
    []
  );

  return (
    <>
      {/* Camera orbit */}
      <OrbitCamera />

      {/* Ground plane - wet dark concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0808" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Ground fog layers */}
      <GroundFog />

      {/* Volumetric fog particles */}
      <VolumetricFog />

      {/* Floating embers */}
      <EmberParticles />

      {/* Dripping water */}
      <DrippingWater />

      {/* Blood puddles */}
      <BloodPuddles />

      {/* Atmospheric lighting */}
      <AnimatedLight />
      {/* Sickly green light */}
      <pointLight position={[-10, 3, -15]} color="#22aa44" intensity={0.4} distance={12} decay={2} />
      {/* Deep red light */}
      <pointLight position={[8, 5, -8]} color="#cc2200" intensity={0.6} distance={20} decay={2} />
      {/* Pale blue light */}
      <pointLight position={[-6, 4, -5]} color="#4466aa" intensity={0.3} distance={15} decay={2} />
      {/* Orange accent */}
      <pointLight position={[-8, 5, -5]} color="#ff6600" intensity={0.8} distance={20} decay={2} />
      {/* Front fill - sickly warm */}
      <pointLight position={[0, 3, -3]} color="#ff3300" intensity={0.4} distance={15} decay={2} />

      {/* Flickering EXIT sign */}
      <FlickeringNeonSign />

      {/* Lightning flashes */}
      <DistantLightning />

      {/* Zombie silhouettes */}
      {zombieConfigs.map((z, i) => (
        <ZombieSilhouette
          key={i}
          position={z.pos}
          speed={z.speed}
          type={z.type}
        />
      ))}

      {/* Background walls - damaged */}
      <mesh position={[0, 5, -20]}>
        <boxGeometry args={[40, 10, 0.5]} />
        <meshStandardMaterial color="#0a0808" roughness={0.95} />
      </mesh>
      <mesh position={[-20, 5, -10]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#0a0808" roughness={0.95} />
      </mesh>
      <mesh position={[20, 5, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#0a0808" roughness={0.95} />
      </mesh>

      {/* Broken columns and debris */}
      <BrokenColumns />

      {/* Hanging chains */}
      <HangingChains />

      {/* Ceiling */}
      <mesh position={[0, 8, -10]}>
        <boxGeometry args={[40, 0.3, 20]} />
        <meshStandardMaterial color="#080606" roughness={0.95} />
      </mesh>

      {/* Wall stains / damage details */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`stain-${i}`}
          position={[
            (Math.random() - 0.5) * 30,
            2 + Math.random() * 4,
            -19.6,
          ]}
        >
          <planeGeometry args={[0.5 + Math.random() * 1.5, 0.3 + Math.random() * 0.8]} />
          <meshStandardMaterial
            color="#1a0505"
            emissive="#0a0000"
            emissiveIntensity={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}
