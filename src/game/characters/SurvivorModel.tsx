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

export default function SurvivorModel({
  survivorId,
  color: colorOverride,
  position = [0, 0, 0],
  rotation = 0,
  showAbilityEffect = false,
}: SurvivorModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const abilityActive = usePlayerStore((s) => s.abilityActive);

  const id = survivorId ?? selectedSurvivor;
  const survivor = SURVIVORS[id];
  const color = colorOverride ?? survivor.color;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Idle bob animation
    groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Body - capsule */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.7, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 1.9, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.07, 1.9, 0.17]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.38, 1.1, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.13, 0.65, 0.13]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.38, 1.1, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.13, 0.65, 0.13]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.13, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.13, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Ability activation effect */}
      {(showAbilityEffect || abilityActive) && (
        <>
          <pointLight
            ref={glowRef}
            position={[0, 1.2, 0]}
            color={color}
            distance={5}
            decay={2}
            intensity={3}
          />
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2}
              transparent
              opacity={0.2}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
