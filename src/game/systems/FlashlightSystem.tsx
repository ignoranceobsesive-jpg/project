'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '@/stores/playerStore';
import { useZombieStore } from '@/stores/zombieStore';
import { useEconomyStore } from '@/stores/economyStore';

const FLASHLIGHT_COLORS: Record<string, string> = {
  default: '#ffffff',
  flashlight_red: '#ff2200',
  flashlight_green: '#00ff44',
  flashlight_uv: '#8800ff',
  flashlight_lightning: '#44aaff',
  flash_red: '#ff2200',
  flash_green: '#00ff44',
  flash_amber: '#ffaa00',
  flash_white: '#ffffff',
  flash_blood: '#cc0000',
};

function getFlashlightColor(equippedFlashlight: string | null): string {
  if (!equippedFlashlight) return FLASHLIGHT_COLORS.default;
  return FLASHLIGHT_COLORS[equippedFlashlight] ?? FLASHLIGHT_COLORS.default;
}

// Volumetric light cone mesh
function VolumetricCone({ color, flashlightOn, batteryFactor }: { color: string; flashlightOn: boolean; batteryFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    meshRef.current.visible = flashlightOn && batteryFactor > 0.05;
    if (meshRef.current.visible) {
      materialRef.current.opacity = 0.04 * batteryFactor;
    }
  });

  return (
    <mesh ref={meshRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[3, 15, 32, 1, true]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Dust particles in flashlight beam
function BeamDustParticles({ flashlightOn }: { flashlightOn: boolean }) {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particlesRef = useRef(
    Array.from({ length: count }, () => ({
      offset: Math.random(),
      lateralX: (Math.random() - 0.5) * 1.5,
      lateralY: (Math.random() - 0.5) * 1.5,
      speed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.visible = flashlightOn;
    if (!flashlightOn) return;

    const t = state.clock.elapsedTime;
    const particles = particlesRef.current;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.offset += p.speed * 0.016;
      if (p.offset > 1) p.offset -= 1;

      const depth = p.offset * 12;
      const spreadFactor = depth / 12;
      const x = p.lateralX * spreadFactor + Math.sin(t * 0.5 + p.phase) * 0.2;
      const y = p.lateralY * spreadFactor + Math.cos(t * 0.3 + p.phase) * 0.15;

      dummy.position.set(x, y, -depth);
      dummy.scale.setScalar(0.02 + Math.random() * 0.01);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ccccbb" transparent opacity={0.15} depthWrite={false} />
    </instancedMesh>
  );
}

export default function FlashlightSystem() {
  const { camera } = useThree();
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const targetObjRef = useRef<THREE.Object3D | null>(null);
  const coneRef = useRef<THREE.Group>(null);
  const flickerTimer = useRef(0);
  const isFlickering = useRef(false);
  const flickerIntensityRef = useRef(1);
  const smoothFlickerRef = useRef(1);
  const ambientLightRef = useRef<THREE.PointLight>(null);

  const flashlightOn = usePlayerStore((s) => s.flashlightOn);
  const flashlightBattery = usePlayerStore((s) => s.flashlightBattery);
  const position = usePlayerStore((s) => s.position);
  const getNearestZombie = useZombieStore((s) => s.getNearestZombie);
  const equippedItems = useEconomyStore((s) => s.equippedItems);

  const flashlightColor = useMemo(() => {
    const equippedFlashlight = equippedItems.flashlights;
    return getFlashlightColor(equippedFlashlight);
  }, [equippedItems.flashlights]);

  // Parse color for dynamic tinting
  const baseColor = useMemo(() => new THREE.Color(flashlightColor), [flashlightColor]);

  // Create target object and assign in effect
  useEffect(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0, -10);
    targetObjRef.current = obj;
    if (spotLightRef.current) {
      spotLightRef.current.target = obj;
      spotLightRef.current.parent?.add(obj);
    }
  }, []);

  useFrame((_, delta) => {
    if (!spotLightRef.current || !targetObjRef.current) return;

    // Position spotlight at camera
    spotLightRef.current.position.copy(camera.position);

    // Target point in camera forward direction
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    targetObjRef.current.position.copy(camera.position).add(dir.multiplyScalar(10));

    // Position volumetric cone on camera
    if (coneRef.current) {
      coneRef.current.position.copy(camera.position);
      coneRef.current.quaternion.copy(camera.quaternion);
    }

    // Handle flicker when zombie is nearby
    const nearestZombie = getNearestZombie(position);
    let nearestDist = Infinity;
    if (nearestZombie) {
      const dx = position[0] - nearestZombie.position[0];
      const dz = position[2] - nearestZombie.position[2];
      nearestDist = Math.sqrt(dx * dx + dz * dz);
    }

    const shouldFlicker = nearestDist < 10;

    if (shouldFlicker && !isFlickering.current) {
      isFlickering.current = true;
      flickerTimer.current = 0;
    }
    if (!shouldFlicker) {
      isFlickering.current = false;
    }

    const batteryFactor = flashlightBattery / 100;

    if (isFlickering.current) {
      flickerTimer.current += delta;

      // Zombie proximity flicker - more dramatic when closer
      const proximityFactor = Math.max(0, 1 - nearestDist / 10); // 0-1, stronger when closer

      if (nearestDist < 4) {
        // Very close - rapid strobe effect
        const strobe = Math.sin(flickerTimer.current * 30) > 0 ? 1 : 0.05;
        flickerIntensityRef.current = strobe;
      } else {
        // Moderate distance - gradual dim then bright (not just on/off)
        const flickerCycle = Math.sin(flickerTimer.current * 8) * 0.5 + 0.5;
        const gradualFlicker = THREE.MathUtils.lerp(0.15, 1, flickerCycle);
        // Occasional full dropout
        const dropout = Math.sin(flickerTimer.current * 2.3) > 0.92 ? 0.05 : 1;
        flickerIntensityRef.current = gradualFlicker * dropout;
      }
    } else {
      // Low battery flicker - gradual dim then bright, not on/off
      if (flashlightBattery < 20) {
        const lowBatteryCycle = Math.sin(performance.now() * 0.003) * 0.5 + 0.5;
        flickerIntensityRef.current = THREE.MathUtils.lerp(0.3, 1, lowBatteryCycle);
      } else {
        flickerIntensityRef.current = 1;
      }
    }

    // Smooth the flicker to avoid harsh jumps
    smoothFlickerRef.current = THREE.MathUtils.lerp(
      smoothFlickerRef.current,
      flickerIntensityRef.current,
      delta * 15
    );

    // Battery warning color shift - turn yellow/orange when low
    let currentColor = baseColor.clone();
    if (flashlightBattery < 15) {
      const warningFactor = 1 - (flashlightBattery / 15); // 0-1
      const warningColor = new THREE.Color('#ff8800');
      currentColor.lerp(warningColor, warningFactor * 0.6);
    }

    spotLightRef.current.color.copy(currentColor);
    spotLightRef.current.intensity = flashlightOn
      ? 3.5 * batteryFactor * smoothFlickerRef.current
      : 0;

    // Ambient bounce light - subtle colored light from nearby surfaces
    if (ambientLightRef.current) {
      ambientLightRef.current.position.set(
        position[0],
        position[1] - 0.3,
        position[2]
      );
      // Slightly warm the bounce light based on flashlight color
      const bounceColor = currentColor.clone().lerp(new THREE.Color('#ffccaa'), 0.3);
      ambientLightRef.current.color.copy(bounceColor);
      ambientLightRef.current.intensity = flashlightOn
        ? 0.2 * batteryFactor * smoothFlickerRef.current
        : 0;
    }
  });

  return (
    <>
      {/* Main flashlight spotlight - higher quality shadows */}
      <spotLight
        ref={spotLightRef}
        color={flashlightColor}
        intensity={flashlightOn ? 3.5 : 0}
        angle={0.35}
        penumbra={0.6}
        decay={2}
        distance={35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
      />

      {/* Volumetric cone */}
      <group ref={coneRef}>
        <VolumetricCone
          color={flashlightColor}
          flashlightOn={flashlightOn}
          batteryFactor={flashlightBattery / 100}
        />
        <BeamDustParticles flashlightOn={flashlightOn} />
      </group>

      {/* Ambient fill from flashlight - simulates light bounce */}
      <pointLight
        ref={ambientLightRef}
        color={flashlightColor}
        intensity={0.15}
        distance={6}
        decay={2}
      />
    </>
  );
}
