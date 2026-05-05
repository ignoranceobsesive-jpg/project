'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore, WEAPONS } from '@/stores/playerStore';
import { useZombieStore } from '@/stores/zombieStore';
import { useHorrorStore } from '@/stores/horrorStore';
import { useSettingsStore } from '@/stores/settingsStore';
import Floor1 from '@/game/floors/Floor1';
import Floor2 from '@/game/floors/Floor2';
import Floor3 from '@/game/floors/Floor3';
import Floor4 from '@/game/floors/Floor4';
import ZombieModel from '@/game/zombies/ZombieModel';
import FlashlightSystem from '@/game/systems/FlashlightSystem';
import HorrorEffects from '@/game/systems/HorrorEffects';
import CombatSystem from '@/game/systems/CombatSystem';

const MOVE_SPEED = 5;
const SPRINT_MULTIPLIER = 1.6;
const MOUSE_SENSITIVITY = 0.002;

function FloorRouter() {
  const currentFloor = useGameStore((s) => s.currentFloor);

  switch (currentFloor) {
    case 1: return <Floor1 />;
    case 2: return <Floor2 />;
    case 3: return <Floor3 />;
    case 4: return <Floor4 />;
    default: return <Floor1 />;
  }
}

function PlayerController() {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof PointerLockControls>>(null);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  const isPaused = useGameStore((s) => s.isPaused);
  const isDead = usePlayerStore((s) => s.isDead);
  const setPaused = useGameStore((s) => s.setPaused);
  const setScene = useGameStore((s) => s.setScene);
  const setPosition = usePlayerStore((s) => s.setPosition);
  const setRotation = usePlayerStore((s) => s.setRotation);
  const setMoving = usePlayerStore((s) => s.setMoving);
  const setSprinting = usePlayerStore((s) => s.setSprinting);
  const toggleFlashlight = usePlayerStore((s) => s.toggleFlashlight);
  const setAttacking = usePlayerStore((s) => s.setAttacking);
  const activateAbility = usePlayerStore((s) => s.activateAbility);
  const setReloading = usePlayerStore((s) => s.setReloading);
  const sensitivity = useSettingsStore((s) => s.sensitivity);
  const invertY = useSettingsStore((s) => s.invertY);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isDead || isPaused) {
        if (e.code === 'Escape' && isPaused) {
          setPaused(false);
        }
        return;
      }
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveState.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': moveState.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': moveState.current.left = true; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.sprint = true; break;
        case 'KeyF': toggleFlashlight(); break;
        case 'KeyR': setReloading(true); break;
        case 'KeyE': break; // interact handled by combat system
        case 'KeyQ': activateAbility(); break;
        case 'Escape': setPaused(true); setScene('pause'); break;
      }
    },
    [isDead, isPaused, setPaused, setScene, toggleFlashlight, setReloading, activateAbility]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': moveState.current.forward = false; break;
      case 'KeyS': case 'ArrowDown': moveState.current.backward = false; break;
      case 'KeyA': case 'ArrowLeft': moveState.current.left = false; break;
      case 'KeyD': case 'ArrowRight': moveState.current.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': moveState.current.sprint = false; break;
      case 'KeyR': setReloading(false); break;
    }
  }, [setReloading]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (isDead || isPaused) return;
    if (e.button === 0) setAttacking(true);
  }, [isDead, isPaused, setAttacking]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 0) setAttacking(false);
  }, [setAttacking]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp]);

  const playerPosRef = useRef(new THREE.Vector3(0, 1.6, 0));

  useFrame((_, delta) => {
    if (isDead || isPaused) return;

    const ms = moveState.current;
    const isMoving = ms.forward || ms.backward || ms.left || ms.right;
    setMoving(isMoving);
    setSprinting(ms.sprint && isMoving);

    const speed = MOVE_SPEED * (ms.sprint ? SPRINT_MULTIPLIER : 1) * delta;

    direction.current.set(0, 0, 0);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const camRight = new THREE.Vector3();
    camRight.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    if (ms.forward) direction.current.add(camDir);
    if (ms.backward) direction.current.sub(camDir);
    if (ms.left) direction.current.sub(camRight);
    if (ms.right) direction.current.add(camRight);

    if (direction.current.length() > 0) {
      direction.current.normalize();
      velocity.current.copy(direction.current).multiplyScalar(speed);
      playerPosRef.current.add(velocity.current);

      // Simple collision bounds
      playerPosRef.current.x = Math.max(-19, Math.min(19, playerPosRef.current.x));
      playerPosRef.current.z = Math.max(-19, Math.min(19, playerPosRef.current.z));
      playerPosRef.current.y = 1.6; // Lock to eye height

      camera.position.set(playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.z);
    }

    setPosition([playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.z]);
    setRotation(camera.rotation.y);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
    />
  );
}

function ZombieRenderer() {
  const zombies = useZombieStore((s) => s.zombies);

  return (
    <>
      {zombies.map((zombie) => (
        <ZombieModel
          key={zombie.id}
          id={zombie.id}
          type={zombie.type}
          position={zombie.position}
          rotation={zombie.rotation}
          health={zombie.health}
          maxHealth={zombie.maxHealth}
          state={zombie.state}
          isBoss={zombie.isBoss}
          bossPhase={zombie.bossPhase}
        />
      ))}
    </>
  );
}

function BloodDecals() {
  const bloodDecals = useHorrorStore((s) => s.bloodDecals);

  return (
    <>
      {bloodDecals.map((decal) => (
        <mesh
          key={decal.id}
          position={[decal.position[0], 0.01, decal.position[2]]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <circleGeometry args={[decal.size + decal.spread, 16]} />
          <meshStandardMaterial
            color="#8b0000"
            transparent
            opacity={decal.opacity}
            roughness={1}
          />
        </mesh>
      ))}
    </>
  );
}

function GameTicker() {
  const tickZombies = useZombieStore((s) => s.tickZombies);
  const tickTimers = usePlayerStore((s) => s.tickTimers);
  const tickAbility = usePlayerStore((s) => s.tickAbility);
  const drainBattery = usePlayerStore((s) => s.drainBattery);
  const position = usePlayerStore((s) => s.position);
  const flashlightOn = usePlayerStore((s) => s.flashlightOn);
  const isDead = usePlayerStore((s) => s.isDead);
  const isPaused = useGameStore((s) => s.isPaused);
  const tickHorror = useHorrorStore((s) => s.tickHorror);
  const checkJumpScares = useHorrorStore((s) => s.checkJumpScares);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const setFearLevel = useHorrorStore((s) => s.setFearLevel);
  const getNearestZombie = useZombieStore((s) => s.getNearestZombie);
  const setAmbientIntensity = useAudioStore((s) => s.setAmbientIntensity);

  useFrame((_, delta) => {
    if (isDead || isPaused) return;

    // Cap delta to avoid large jumps
    const d = Math.min(delta, 0.1);

    tickZombies(d, position);
    tickTimers(d);
    tickAbility(d);
    tickHorror(d);
    if (flashlightOn) drainBattery(d);

    // Check for jump scares
    checkJumpScares(position, currentFloor);

    // Update fear level based on nearest zombie distance
    const nearest = getNearestZombie(position);
    if (nearest) {
      const dx = position[0] - nearest.position[0];
      const dz = position[2] - nearest.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      const fearFromDistance = Math.max(0, 1 - dist / 15);
      setFearLevel(fearFromDistance);
      setAmbientIntensity(fearFromDistance);
    } else {
      setFearLevel(0);
      setAmbientIntensity(0);
    }
  });

  return null;
}

// Need to import audioStore for the ticker
import { useAudioStore } from '@/stores/audioStore';

function ElevatorZone() {
  const currentFloor = useGameStore((s) => s.currentFloor);
  const setCurrentFloor = useGameStore((s) => s.setCurrentFloor);
  const position = usePlayerStore((s) => s.position);

  useFrame(() => {
    // Elevator zone detection at z=-18 near x=0
    if (position[2] < -17 && Math.abs(position[0]) < 3) {
      if (currentFloor < 4) {
        setCurrentFloor((currentFloor + 1) as 1 | 2 | 3 | 4);
      }
    }
  });

  // Visual marker for elevator
  return (
    <mesh position={[0, 0.02, -19]}>
      <planeGeometry args={[3, 1]} />
      <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

export default function GameplayScene() {
  return (
    <>
      {/* Gameplay ambient fill - ensures base visibility even without flashlight */}
      <ambientLight intensity={0.15} color="#8899aa" />
      <hemisphereLight args={['#445566', '#221111', 0.3]} />
      
      <PlayerController />
      <FloorRouter />
      <ZombieRenderer />
      <BloodDecals />
      <FlashlightSystem />
      <HorrorEffects />
      <CombatSystem />
      <GameTicker />
      <ElevatorZone />
    </>
  );
}
