'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type ZombieType, type ZombieState } from '@/stores/zombieStore';

interface ZombieModelProps {
  id: string;
  type: ZombieType;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  state: ZombieState;
  isBoss: boolean;
  bossPhase: number;
}

// ===== GLOWING EYES - shared across all types =====
function GlowingEyes({ y = 1.7, z = 0.28, spacing = 0.06, size = 0.025, color = '#ff2200', intensity = 2 }: {
  y?: number; z?: number; spacing?: number; size?: number; color?: string; intensity?: number;
}) {
  return (
    <>
      <mesh position={[-spacing, y, z]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
      </mesh>
      <mesh position={[spacing, y, z]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
      </mesh>
    </>
  );
}

// ===== HEALTH BAR =====
function HealthBar({ health, maxHealth, visible }: { health: number; maxHealth: number; visible: boolean }) {
  if (!visible || health >= maxHealth) return null;

  const healthPercent = health / maxHealth;
  const barWidth = 1.2;
  const barHeight = 0.08;
  const barColor = healthPercent > 0.5 ? '#00cc00' : healthPercent > 0.25 ? '#ccaa00' : '#cc0000';

  return (
    <group position={[0, 2.5, 0]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshBasicMaterial color="#222222" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[(healthPercent - 1) * barWidth / 2, 0, 0.001]}>
        <planeGeometry args={[barWidth * healthPercent, barHeight - 0.02]} />
        <meshBasicMaterial color={barColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ===== WALKER MODEL - enhanced =====
function WalkerModel({ position, rotation, state }: { position: [number, number, number]; rotation: number; state: ZombieState }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const hitReactionRef = useRef(0);
  const alertTimerRef = useRef(0);
  const deathProgressRef = useRef(0);

  useFrame((state_, delta) => {
    if (!groupRef.current) return;
    const t = state_.clock.elapsedTime;

    // Hit reaction - flinch backward briefly
    if (state === 'attack' || state === 'chase') {
      hitReactionRef.current = 0;
    }
    if (hitReactionRef.current > 0) {
      hitReactionRef.current -= delta * 4;
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0.15 - hitReactionRef.current * 0.3;
      }
    } else if (bodyRef.current) {
      bodyRef.current.rotation.x = 0;
    }

    // Walk animation
    if (state === 'chase' || state === 'wander') {
      const walkSpeed = state === 'chase' ? 8 : 4;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4;
      alertTimerRef.current = 0;
    }

    // Alert animation - look around before chase
    if (state === 'alert') {
      alertTimerRef.current += delta;
      const lookAngle = Math.sin(alertTimerRef.current * 4) * 0.8;
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation + lookAngle;
      }
      // Arms raise slightly
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5;
    }

    // Attack animation
    if (state === 'attack') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3;
    }

    // Death animation - dramatic stagger and fall
    if (state === 'dead') {
      deathProgressRef.current = Math.min(deathProgressRef.current + delta * 1.5, 1);
      const p = deathProgressRef.current;
      // Ragdoll-like: stagger sideways, then fall
      if (groupRef.current) {
        groupRef.current.rotation.x = p * (Math.PI / 2);
        groupRef.current.rotation.z = p * 0.3 * Math.sin(t * 2);
        groupRef.current.position.y = position[1] - p * 0.8;
      }
      return;
    } else {
      deathProgressRef.current = 0;
    }

    // Hunched posture
    if (groupRef.current && state !== 'alert') {
      groupRef.current.rotation.x = 0.15;
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        {/* Body - torn clothing */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
          <meshStandardMaterial color="#3a4a3a" roughness={0.9} />
        </mesh>
        {/* Torn shirt flap - left side */}
        <mesh position={[-0.28, 0.9, 0.1]} rotation={[0.2, 0.3, 0.4]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.02]} />
          <meshStandardMaterial color="#2a3a2a" roughness={0.95} transparent opacity={0.8} />
        </mesh>
        {/* Torn shirt flap - right side */}
        <mesh position={[0.3, 0.85, -0.05]} rotation={[-0.1, -0.2, -0.3]} castShadow>
          <boxGeometry args={[0.12, 0.35, 0.02]} />
          <meshStandardMaterial color="#2a3a2a" roughness={0.95} transparent opacity={0.7} />
        </mesh>
        {/* Blood stain on torso */}
        <mesh position={[0.1, 1.0, 0.26]}>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial color="#440000" emissive="#220000" emissiveIntensity={0.3} roughness={1} transparent opacity={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.75, 0.1]} castShadow>
          <boxGeometry args={[0.28, 0.3, 0.28]} />
          <meshStandardMaterial color="#4a5a4a" roughness={0.85} />
        </mesh>
        {/* Glowing eyes */}
        <GlowingEyes y={1.8} z={0.25} />
        {/* Left arm */}
        <mesh ref={leftArmRef} position={[-0.35, 1.1, 0]} rotation={[0.3, 0, 0.2]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.12]} />
          <meshStandardMaterial color="#3a4a3a" roughness={0.9} />
        </mesh>
        {/* Right arm - extended */}
        <mesh ref={rightArmRef} position={[0.35, 1.1, 0.1]} rotation={[-0.4, 0, -0.15]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.12]} />
          <meshStandardMaterial color="#3a4a3a" roughness={0.9} />
        </mesh>
        {/* Left leg */}
        <mesh ref={leftLegRef} position={[-0.12, 0.35, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshStandardMaterial color="#2a3a2a" roughness={0.9} />
        </mesh>
        {/* Right leg */}
        <mesh ref={rightLegRef} position={[0.12, 0.35, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshStandardMaterial color="#2a3a2a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ===== RUNNER MODEL - enhanced =====
function RunnerModel({ position, rotation, state }: { position: [number, number, number]; rotation: number; state: ZombieState }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const hitReactionRef = useRef(0);
  const alertTimerRef = useRef(0);
  const deathProgressRef = useRef(0);

  useFrame((state_, delta) => {
    if (!groupRef.current) return;
    const t = state_.clock.elapsedTime;

    // Hit reaction
    if (hitReactionRef.current > 0) {
      hitReactionRef.current -= delta * 5;
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0.35 - hitReactionRef.current * 0.4;
      }
    } else if (bodyRef.current) {
      bodyRef.current.rotation.x = 0;
    }

    // Fast run animation
    if (state === 'chase' || state === 'wander') {
      const runSpeed = 12;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * runSpeed) * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * runSpeed + Math.PI) * 0.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * runSpeed + Math.PI) * 0.7;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * runSpeed) * 0.7;
      alertTimerRef.current = 0;
    }

    // Alert animation
    if (state === 'alert') {
      alertTimerRef.current += delta;
      const lookAngle = Math.sin(alertTimerRef.current * 5) * 0.6;
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation + lookAngle;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
    }

    // Attack animation - fast swipe
    if (state === 'attack') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -2.0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.0;
    }

    // Death animation
    if (state === 'dead') {
      deathProgressRef.current = Math.min(deathProgressRef.current + delta * 2, 1);
      const p = deathProgressRef.current;
      if (groupRef.current) {
        // Runner falls forward dramatically
        groupRef.current.rotation.x = p * (Math.PI / 2) * 1.1;
        groupRef.current.position.y = position[1] - p * 1.0;
        groupRef.current.rotation.z = p * 0.2;
      }
      return;
    } else {
      deathProgressRef.current = 0;
    }

    // Leaning forward - more aggressive stance
    if (groupRef.current && state !== 'alert') {
      groupRef.current.rotation.x = state === 'chase' ? 0.4 : 0.35;
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        {/* Body - leaner, more aggressive */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.9} />
        </mesh>
        {/* Veins on torso - emissive purple lines */}
        <mesh position={[-0.12, 1.1, 0.23]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.02, 0.3, 0.01]} />
          <meshStandardMaterial color="#440066" emissive="#6600aa" emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.08, 0.95, 0.23]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.02, 0.25, 0.01]} />
          <meshStandardMaterial color="#440066" emissive="#6600aa" emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.0, 1.15, 0.23]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.02, 0.2, 0.01]} />
          <meshStandardMaterial color="#440066" emissive="#6600aa" emissiveIntensity={1.5} transparent opacity={0.5} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.65, 0.15]} castShadow>
          <boxGeometry args={[0.24, 0.28, 0.24]} />
          <meshStandardMaterial color="#353540" roughness={0.85} />
        </mesh>
        {/* Glowing eyes */}
        <GlowingEyes y={1.7} z={0.28} color="#ff4400" intensity={3} />
        {/* Arms */}
        <mesh ref={leftArmRef} position={[-0.32, 1.0, 0.15]} rotation={[-0.5, 0, 0.2]} castShadow>
          <boxGeometry args={[0.1, 0.55, 0.1]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.9} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.32, 1.0, 0.15]} rotation={[-0.5, 0, -0.2]} castShadow>
          <boxGeometry args={[0.1, 0.55, 0.1]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.9} />
        </mesh>
        {/* Legs */}
        <mesh ref={leftLegRef} position={[-0.1, 0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.9} />
        </mesh>
        <mesh ref={rightLegRef} position={[0.1, 0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ===== CRAWLER MODEL - enhanced =====
function CrawlerModel({ position, rotation, state }: { position: [number, number, number]; rotation: number; state: ZombieState }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const hitReactionRef = useRef(0);
  const alertTimerRef = useRef(0);
  const deathProgressRef = useRef(0);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state_, delta) => {
    if (!groupRef.current) return;
    const t = state_.clock.elapsedTime;

    // Hit reaction
    if (hitReactionRef.current > 0) {
      hitReactionRef.current -= delta * 4;
      if (groupRef.current) {
        groupRef.current.position.y = position[1] + hitReactionRef.current * 0.2;
      }
    }

    // Crawl animation
    if (state === 'chase' || state === 'wander') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 6) * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.5;
      alertTimerRef.current = 0;
    }

    // Alert animation
    if (state === 'alert') {
      alertTimerRef.current += delta;
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation + Math.sin(alertTimerRef.current * 3) * 0.5;
      }
    }

    // Death animation
    if (state === 'dead') {
      deathProgressRef.current = Math.min(deathProgressRef.current + delta * 1.5, 1);
      const p = deathProgressRef.current;
      groupRef.current.position.y = position[1] - p * 0.3;
      return;
    } else {
      deathProgressRef.current = 0;
    }

    // Trailing blood effect - long stain behind crawler
    if (trailRef.current) {
      const mat = trailRef.current.material as THREE.MeshStandardMaterial;
      if (state === 'chase' || state === 'wander') {
        mat.opacity = 0.5;
      } else if (state === 'dead') {
        mat.opacity = 0.8;
      } else {
        mat.opacity = 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Low body - more ground-hugging */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.9, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.9} />
      </mesh>
      {/* Head - low */}
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#4a453a" roughness={0.85} />
      </mesh>
      {/* Glowing eyes */}
      <GlowingEyes y={0.35} z={0.62} spacing={0.05} size={0.02} color="#ff6600" intensity={2.5} />
      {/* Arms on ground */}
      <mesh ref={leftArmRef} position={[-0.25, 0.12, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#3a3530" roughness={0.9} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.25, 0.12, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#3a3530" roughness={0.9} />
      </mesh>
      {/* Legs trailing */}
      <mesh position={[-0.1, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#2a2520" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#2a2520" roughness={0.9} />
      </mesh>
      {/* Trailing blood effect */}
      <mesh ref={trailRef} position={[0, 0.01, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 1.5]} />
        <meshStandardMaterial color="#550000" emissive="#330000" emissiveIntensity={0.2} transparent opacity={0.3} roughness={1} />
      </mesh>
    </group>
  );
}

// ===== BOSS SCIENTIST MODEL - enhanced =====
function BossScientistModel({
  position,
  rotation,
  state,
  bossPhase,
}: {
  position: [number, number, number];
  rotation: number;
  state: ZombieState;
  bossPhase: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const tentacleRef = useRef<THREE.Mesh>(null);
  const tentacle2Ref = useRef<THREE.Mesh>(null);
  const brainRef = useRef<THREE.Mesh>(null);
  const hitReactionRef = useRef(0);
  const alertTimerRef = useRef(0);
  const deathProgressRef = useRef(0);
  const pustuleRefs = useRef<THREE.Mesh[]>([]);
  const veinRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state_, delta) => {
    if (!groupRef.current) return;
    const t = state_.clock.elapsedTime;

    // Hit reaction
    if (hitReactionRef.current > 0) {
      hitReactionRef.current -= delta * 3;
      if (bodyRef.current) {
        bodyRef.current.rotation.z = hitReactionRef.current * 0.15;
      }
    } else if (bodyRef.current) {
      bodyRef.current.rotation.z = 0;
    }

    // Walk
    if (state === 'chase' || state === 'wander') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 4) * 0.4;
      alertTimerRef.current = 0;
    }

    // Alert animation
    if (state === 'alert') {
      alertTimerRef.current += delta;
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation + Math.sin(alertTimerRef.current * 3) * 0.6;
      }
    }

    // Tentacle wave - both tentacles
    if (tentacleRef.current) {
      tentacleRef.current.rotation.x = -0.5 + Math.sin(t * 3) * 0.3;
      tentacleRef.current.rotation.z = Math.sin(t * 5) * 0.2;
    }
    if (tentacle2Ref.current) {
      tentacle2Ref.current.rotation.x = -0.4 + Math.sin(t * 3.5 + 1) * 0.25;
      tentacle2Ref.current.rotation.z = Math.sin(t * 4.5 + 2) * 0.15;
    }

    // Brain glow based on boss phase
    if (brainRef.current) {
      const mat = brainRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = bossPhase === 3 ? 5 : bossPhase === 2 ? 3 : 1.5;
    }

    // Pulsing pustules
    pustuleRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1 + Math.sin(t * 3 + i * 1.5) * 0.8;
        const pulse = 1 + Math.sin(t * 4 + i) * 0.1;
        mesh.scale.setScalar(pulse);
      }
    });

    // Pulsing veins
    veinRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1 + Math.sin(t * 5 + i * 0.8) * 0.5;
      }
    });

    // Attack
    if (state === 'attack' && rightArmRef.current) {
      rightArmRef.current.rotation.x = -1.2 + Math.sin(t * 15) * 0.3;
    }

    // Death animation
    if (state === 'dead') {
      deathProgressRef.current = Math.min(deathProgressRef.current + delta * 1, 1);
      const p = deathProgressRef.current;
      if (groupRef.current) {
        groupRef.current.rotation.x = p * (Math.PI / 2);
        groupRef.current.rotation.z = p * 0.4 * Math.sin(t * 1.5);
        groupRef.current.position.y = position[1] - p * 1.2;
      }
      // Brain dims on death
      if (brainRef.current) {
        const mat = brainRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.max(0.1, (1 - p) * 5);
      }
      return;
    } else {
      deathProgressRef.current = 0;
    }

    if (groupRef.current && state !== 'alert') {
      groupRef.current.rotation.x = 0.1;
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={1.3}>
      <group ref={bodyRef}>
        {/* Lab coat body */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
          <meshStandardMaterial color="#2a2a35" roughness={0.7} />
        </mesh>
        {/* Lab coat tear - left */}
        <mesh position={[-0.32, 1.0, 0.15]} rotation={[0.1, 0.2, 0.5]} castShadow>
          <boxGeometry args={[0.18, 0.5, 0.02]} />
          <meshStandardMaterial color="#1a1a25" roughness={0.85} transparent opacity={0.7} />
        </mesh>
        {/* Lab coat tear - right */}
        <mesh position={[0.35, 0.9, -0.1]} rotation={[-0.15, -0.3, -0.4]} castShadow>
          <boxGeometry args={[0.15, 0.45, 0.02]} />
          <meshStandardMaterial color="#1a1a25" roughness={0.85} transparent opacity={0.6} />
        </mesh>
        {/* Pulsing veins across body */}
        {[
          { pos: [-0.15, 1.4, 0.31] as [number, number, number], rot: [0, 0, 0.4] as [number, number, number], size: [0.025, 0.35, 0.01] as [number, number, number] },
          { pos: [0.1, 1.3, 0.31] as [number, number, number], rot: [0, 0, -0.3] as [number, number, number], size: [0.025, 0.3, 0.01] as [number, number, number] },
          { pos: [0.0, 1.5, 0.31] as [number, number, number], rot: [0, 0, 0.1] as [number, number, number], size: [0.02, 0.2, 0.01] as [number, number, number] },
          { pos: [-0.08, 1.15, 0.31] as [number, number, number], rot: [0, 0, 0.5] as [number, number, number], size: [0.02, 0.25, 0.01] as [number, number, number] },
        ].map((v, i) => (
          <mesh key={`vein-${i}`} position={v.pos} rotation={v.rot} ref={(el) => { if (el) veinRefs.current[i] = el; }}>
            <boxGeometry args={v.size} />
            <meshStandardMaterial color="#440044" emissive="#880088" emissiveIntensity={1} transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Glowing pustules */}
        {[
          [0.2, 1.5, 0.3] as [number, number, number],
          [-0.25, 1.3, 0.3] as [number, number, number],
          [0.15, 1.1, 0.3] as [number, number, number],
          [-0.1, 1.6, 0.3] as [number, number, number],
          [0.0, 1.0, 0.32] as [number, number, number],
        ].map((pos, i) => (
          <mesh key={`pustule-${i}`} position={pos} ref={(el) => { if (el) pustuleRefs.current[i] = el; }}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={1.5} transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Head */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.35, 0.32]} />
          <meshStandardMaterial color="#3a3a45" roughness={0.8} />
        </mesh>
        {/* Glowing brain */}
        <mesh ref={brainRef} position={[0, 2.25, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial
            color="#ff0066"
            emissive="#ff0066"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Glowing eyes */}
        <GlowingEyes y={2.05} z={0.17} spacing={0.07} size={0.03} color="#ff0088" intensity={4} />
        {/* Left arm */}
        <mesh ref={leftArmRef} position={[-0.4, 1.2, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color="#2a2a35" roughness={0.8} />
        </mesh>
        {/* Right arm - tentacle */}
        <group ref={rightArmRef} position={[0.4, 1.2, 0]} rotation={[0, 0, -0.2]}>
          <mesh ref={tentacleRef} position={[0, -0.2, 0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.08, 0.9, 8]} />
            <meshStandardMaterial
              color="#4a1a3a"
              emissive="#880044"
              emissiveIntensity={0.5}
              roughness={0.6}
            />
          </mesh>
        </group>
        {/* Second tentacle - from left side */}
        <group position={[-0.35, 1.0, 0.1]} rotation={[0, 0, 0.3]}>
          <mesh ref={tentacle2Ref} position={[0, -0.15, 0.05]} castShadow>
            <cylinderGeometry args={[0.03, 0.06, 0.7, 8]} />
            <meshStandardMaterial
              color="#4a1a3a"
              emissive="#880044"
              emissiveIntensity={0.4}
              roughness={0.6}
            />
          </mesh>
        </group>
        {/* Legs */}
        <mesh position={[-0.14, 0.4, 0]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.16]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.9} />
        </mesh>
        <mesh position={[0.14, 0.4, 0]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.16]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ===== BOSS ALPHA MODEL - enhanced =====
function BossAlphaModel({
  position,
  rotation,
  state,
  bossPhase,
}: {
  position: [number, number, number];
  rotation: number;
  state: ZombieState;
  bossPhase: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const hitReactionRef = useRef(0);
  const alertTimerRef = useRef(0);
  const deathProgressRef = useRef(0);

  useFrame((state_, delta) => {
    if (!groupRef.current) return;
    const t = state_.clock.elapsedTime;

    // Hit reaction
    if (hitReactionRef.current > 0) {
      hitReactionRef.current -= delta * 2;
      if (bodyRef.current) {
        bodyRef.current.rotation.z = hitReactionRef.current * 0.1;
        bodyRef.current.rotation.x = hitReactionRef.current * 0.05;
      }
    } else if (bodyRef.current) {
      bodyRef.current.rotation.z = 0;
      bodyRef.current.rotation.x = 0;
    }

    // Walk animation
    if (state === 'chase' || state === 'wander') {
      const walkSpeed = 5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.6;
      alertTimerRef.current = 0;
    }

    // Alert animation
    if (state === 'alert') {
      alertTimerRef.current += delta;
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation + Math.sin(alertTimerRef.current * 2) * 0.4;
      }
    }

    // Attack - slam
    if (state === 'attack') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -2.0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -2.0;
    }

    // Chest core pulsing
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const pulseIntensity = bossPhase === 3 ? 6 : bossPhase === 2 ? 4 : 2;
      mat.emissiveIntensity = pulseIntensity + Math.sin(t * 4) * 1.5;
    }
    if (coreLightRef.current) {
      const lightPulse = bossPhase === 3 ? 10 : bossPhase === 2 ? 7 : 4;
      coreLightRef.current.intensity = lightPulse + Math.sin(t * 4) * 3;
    }

    // Aura effect - transparent pulsing sphere
    if (auraRef.current) {
      const auraMat = auraRef.current.material as THREE.MeshStandardMaterial;
      const auraPulse = 1 + Math.sin(t * 2) * 0.1;
      auraRef.current.scale.setScalar(auraPulse);
      const auraIntensity = bossPhase === 3 ? 0.15 : bossPhase === 2 ? 0.1 : 0.06;
      auraMat.opacity = auraIntensity + Math.sin(t * 3) * 0.03;
    }

    // Death animation - dramatic
    if (state === 'dead') {
      deathProgressRef.current = Math.min(deathProgressRef.current + delta * 0.8, 1);
      const p = deathProgressRef.current;
      if (groupRef.current) {
        groupRef.current.rotation.x = p * (Math.PI / 2);
        groupRef.current.rotation.z = p * 0.5 * Math.sin(t);
        groupRef.current.position.y = position[1] - p * 1.5;
      }
      // Dim core and aura
      if (coreRef.current) {
        const mat = coreRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.max(0.2, (1 - p) * 6);
      }
      if (auraRef.current) {
        const mat = auraRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, (1 - p) * 0.15);
      }
      return;
    } else {
      deathProgressRef.current = 0;
    }

    if (groupRef.current && state !== 'alert') {
      groupRef.current.rotation.x = 0.05;
      groupRef.current.position.y = position[1];
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={2.0}>
      <group ref={bodyRef}>
        {/* Massive body */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.4, 1.0, 8, 16]} />
          <meshStandardMaterial color="#1a1010" roughness={0.8} />
        </mesh>
        {/* Glowing runes/markings on body */}
        {[
          { pos: [-0.25, 1.4, 0.41] as [number, number, number], rot: [0, 0, 0.3] as [number, number, number] },
          { pos: [0.2, 1.6, 0.41] as [number, number, number], rot: [0, 0, -0.2] as [number, number, number] },
          { pos: [0.0, 1.2, 0.42] as [number, number, number], rot: [0, 0, 0.1] as [number, number, number] },
          { pos: [-0.15, 1.0, 0.41] as [number, number, number], rot: [0, 0, 0.5] as [number, number, number] },
        ].map((rune, i) => (
          <mesh key={`rune-${i}`} position={rune.pos} rotation={rune.rot}>
            <boxGeometry args={[0.06, 0.15, 0.01]} />
            <meshStandardMaterial
              color="#ff2200"
              emissive="#ff4400"
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
        {/* Bone protrusions from shoulders */}
        <mesh position={[-0.5, 1.7, 0]} rotation={[0, 0, 0.8]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 0.3, 6]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.7} />
        </mesh>
        <mesh position={[0.5, 1.7, 0]} rotation={[0, 0, -0.8]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 0.3, 6]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.7} />
        </mesh>
        <mesh position={[-0.45, 1.85, -0.1]} rotation={[0.3, 0, 0.6]} castShadow>
          <cylinderGeometry args={[0.015, 0.03, 0.25, 6]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 1.85, -0.1]} rotation={[0.3, 0, -0.6]} castShadow>
          <cylinderGeometry args={[0.015, 0.03, 0.25, 6]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#251515" roughness={0.8} />
        </mesh>
        {/* Glowing eyes */}
        <GlowingEyes y={2.15} z={0.21} spacing={0.1} size={0.04} color="#ff0000" intensity={6} />
        {/* Glowing chest core */}
        <mesh ref={coreRef} position={[0, 1.3, 0.25]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#ff4400"
            emissive="#ff4400"
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
        <pointLight ref={coreLightRef} position={[0, 1.3, 0.3]} color="#ff4400" distance={10} decay={2} intensity={4} />
        {/* Aura effect - transparent pulsing sphere */}
        <mesh ref={auraRef} position={[0, 1.2, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial
            color="#ff2200"
            emissive="#ff2200"
            emissiveIntensity={0.3}
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
        {/* Arms - massive */}
        <mesh ref={leftArmRef} position={[-0.55, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.2, 0.9, 0.2]} />
          <meshStandardMaterial color="#1a1010" roughness={0.85} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.55, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.2, 0.9, 0.2]} />
          <meshStandardMaterial color="#1a1010" roughness={0.85} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.18, 0.4, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.2]} />
          <meshStandardMaterial color="#0f0808" roughness={0.9} />
        </mesh>
        <mesh position={[0.18, 0.4, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.2]} />
          <meshStandardMaterial color="#0f0808" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ===== MAIN ZOMBIE MODEL COMPONENT =====
export default function ZombieModel({
  id: _id,
  type,
  position,
  rotation,
  health,
  maxHealth,
  state,
  isBoss,
  bossPhase,
}: ZombieModelProps) {
  // Death animation offset - sink into ground
  const adjustedPosition: [number, number, number] = useMemo(() => {
    if (state === 'dead') {
      return [position[0], -0.3, position[2]];
    }
    if (state === 'playingDead') {
      return [position[0], -0.1, position[2]];
    }
    return position;
  }, [position, state]);

  const showHealthBar = health < maxHealth && state !== 'dead' && state !== 'playingDead';

  return (
    <group>
      {type === 'walker' && (
        <WalkerModel position={adjustedPosition} rotation={rotation} state={state} />
      )}
      {type === 'runner' && (
        <RunnerModel position={adjustedPosition} rotation={rotation} state={state} />
      )}
      {type === 'crawler' && (
        <CrawlerModel position={adjustedPosition} rotation={rotation} state={state} />
      )}
      {type === 'boss_scientist' && (
        <BossScientistModel
          position={adjustedPosition}
          rotation={rotation}
          state={state}
          bossPhase={bossPhase}
        />
      )}
      {type === 'boss_alpha' && (
        <BossAlphaModel
          position={adjustedPosition}
          rotation={rotation}
          state={state}
          bossPhase={bossPhase}
        />
      )}
      {/* Health bar */}
      {showHealthBar && (
        <group position={[adjustedPosition[0], (isBoss ? 4.5 : 2.5), adjustedPosition[2]]}>
          <HealthBar health={health} maxHealth={maxHealth} visible={showHealthBar} />
        </group>
      )}
    </group>
  );
}
