'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useHorrorStore } from '@/stores/horrorStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Simple Perlin-like noise using layered sine waves
function perlinNoise(t: number, seed: number): number {
  return (
    Math.sin(t * 1.0 + seed) * 0.5 +
    Math.sin(t * 2.3 + seed * 1.7) * 0.3 +
    Math.sin(t * 5.1 + seed * 3.1) * 0.15 +
    Math.sin(t * 11.7 + seed * 7.3) * 0.05
  );
}

export default function HorrorEffects() {
  const { camera } = useThree();
  const perspCam = camera as THREE.PerspectiveCamera;

  // Refs for smooth state tracking
  const shakeOffsetRef = useRef(new THREE.Vector3());
  const shakeDecayRef = useRef(0);
  const bobVertRef = useRef(0);
  const bobHorzRef = useRef(0);
  const fovRef = useRef(75);
  const rotationZRef = useRef(0);
  const breathOffsetRef = useRef(0);
  const landingDipRef = useRef(0);
  const wasSprinting = useRef(false);
  const deathTimer = useRef(0);
  const deathFallRef = useRef(0);
  const damageFlashRef = useRef(0);
  const prevDamageTimer = useRef(0);
  const tiltRef = useRef(0);
  const timeRef = useRef(0);

  // Perlin noise seeds for camera shake - different per axis for organic feel
  const shakeSeeds = useMemo(() => ({
    x: Math.random() * 1000,
    y: Math.random() * 1000,
    z: Math.random() * 1000,
  }), []);

  const cameraShakeIntensity = useHorrorStore((s) => s.cameraShakeIntensity);
  const screenShake = useSettingsStore((s) => s.screenShake);
  const fearLevel = useHorrorStore((s) => s.fearLevel);
  const isMoving = usePlayerStore((s) => s.isMoving);
  const isSprinting = usePlayerStore((s) => s.isSprinting);
  const headBobPhase = usePlayerStore((s) => s.headBobPhase);
  const damageTimer = usePlayerStore((s) => s.damageTimer);
  const isDead = usePlayerStore((s) => s.isDead);
  const health = usePlayerStore((s) => s.health);
  const maxHealth = usePlayerStore((s) => s.maxHealth);
  const isAttacking = usePlayerStore((s) => s.isAttacking);
  const currentWeapon = usePlayerStore((s) => s.currentWeapon);

  useFrame((_, delta) => {
    // Accumulate time for noise functions
    timeRef.current += delta;
    const t = timeRef.current;

    // ===== DEATH CAMERA =====
    if (isDead) {
      deathTimer.current += delta;
      // Slowly fall and tilt over 3 seconds
      const deathProgress = Math.min(deathTimer.current / 3, 1);
      const eased = 1 - Math.pow(1 - deathProgress, 3); // ease-out cubic

      deathFallRef.current = eased * 1.2; // Fall 1.2 units
      rotationZRef.current = eased * 0.4; // Tilt 0.4 rad (~23 degrees)
      // Smoothly lower FOV for tunnel vision death effect
      fovRef.current = THREE.MathUtils.lerp(fovRef.current, 40, delta * 2);

      /* eslint-disable react-hooks/immutability */
      camera.position.y = 1.6 - deathFallRef.current;
      camera.rotation.z = rotationZRef.current;
      /* eslint-enable react-hooks/immutability */

      if (perspCam.fov !== fovRef.current) {
        // eslint-disable-next-line react-hooks/immutability
        perspCam.fov = fovRef.current;
        perspCam.updateProjectionMatrix();
      }
      return;
    }

    // Reset death timer when alive
    deathTimer.current = 0;
    deathFallRef.current = 0;

    // ===== PERLIN NOISE CAMERA SHAKE =====
    if (screenShake && cameraShakeIntensity > 0) {
      shakeDecayRef.current = cameraShakeIntensity;
      const shakeTime = t * 20; // Fast time for shake
      const intensity = cameraShakeIntensity * 0.12;

      // Use Perlin-like noise for organic shake - no jitter
      shakeOffsetRef.current.set(
        perlinNoise(shakeTime, shakeSeeds.x) * intensity,
        perlinNoise(shakeTime, shakeSeeds.y) * intensity * 0.8,
        perlinNoise(shakeTime, shakeSeeds.z) * intensity * 0.5
      );
    } else {
      // Smooth decay instead of snapping to zero
      shakeDecayRef.current *= Math.pow(0.001, delta);
      if (shakeDecayRef.current < 0.001) {
        shakeDecayRef.current = 0;
        shakeOffsetRef.current.lerp(new THREE.Vector3(0, 0, 0), delta * 10);
      } else {
        const shakeTime = t * 20;
        shakeOffsetRef.current.set(
          perlinNoise(shakeTime, shakeSeeds.x) * shakeDecayRef.current * 0.12,
          perlinNoise(shakeTime, shakeSeeds.y) * shakeDecayRef.current * 0.096,
          perlinNoise(shakeTime, shakeSeeds.z) * shakeDecayRef.current * 0.06
        );
      }
    }

    // ===== BREATHING EFFECT =====
    // Subtle camera movement synced with breathing
    const breathingSpeed = isSprinting ? 3.5 : (health / maxHealth < 0.3 ? 2.5 : 1.5);
    const breathingAmplitude = isSprinting ? 0.025 : (health / maxHealth < 0.3 ? 0.018 : 0.008);
    breathOffsetRef.current = Math.sin(t * breathingSpeed * Math.PI) * breathingAmplitude;

    // ===== HEAD BOB - vertical + horizontal, not just sine =====
    if (isMoving) {
      const bobSpeed = isSprinting ? 1.0 : 0.6;
      const bobVertAmount = isSprinting ? 0.055 : 0.025;
      const bobHorzAmount = isSprinting ? 0.025 : 0.012;

      // Vertical bob with double-frequency for more natural step feel
      const rawBob = Math.sin(headBobPhase * bobSpeed);
      const doubleBob = Math.abs(rawBob); // Double-frequency bounce
      bobVertRef.current = doubleBob * bobVertAmount * Math.sign(rawBob);

      // Horizontal sway - offset by PI/2 for alternating sway
      bobHorzRef.current = Math.sin(headBobPhase * bobSpeed + Math.PI / 2) * bobHorzAmount;
    } else {
      // Smooth return to center
      bobVertRef.current *= Math.pow(0.0001, delta);
      bobHorzRef.current *= Math.pow(0.0001, delta);
    }

    // ===== LANDING EFFECT =====
    // When stopping from sprint, camera dips down briefly
    if (wasSprinting.current && !isSprinting) {
      landingDipRef.current = 0.06; // Trigger landing dip
    }
    wasSprinting.current = isSprinting;

    if (landingDipRef.current > 0) {
      landingDipRef.current -= delta * 0.25;
      if (landingDipRef.current < 0) landingDipRef.current = 0;
    }

    // ===== SPRINT CAMERA TILT =====
    const targetTilt = isSprinting && isMoving ? 0.03 : 0;
    tiltRef.current = THREE.MathUtils.lerp(tiltRef.current, targetTilt, delta * 5);

    // ===== DAMAGE HIT EFFECT =====
    // Detect fresh damage
    if (damageTimer > prevDamageTimer.current + 0.01) {
      damageFlashRef.current = 1.0; // Trigger red flash
    }
    prevDamageTimer.current = damageTimer;

    if (damageFlashRef.current > 0) {
      damageFlashRef.current -= delta * 4; // Fade over 0.25s
    }

    // Damage rotation jerk - sharper than before, with decay
    let damageRotZ = 0;
    if (damageTimer > 0) {
      const intensity = damageTimer / 0.5;
      // Use noise for rotation jerk too - feels like screen crack
      damageRotZ = perlinNoise(t * 40, 42) * 0.04 * intensity;
    }

    // ===== FEAR EFFECTS =====
    let fearFOVOffset = 0;
    let fearWobbleZ = 0;

    if (fearLevel > 0.3) {
      const fearIntensity = (fearLevel - 0.3) / 0.7; // 0-1 range for fear above 0.3

      // Tunnel vision - narrow FOV smoothly
      fearFOVOffset = -fearIntensity * 12; // Up to -12 FOV at max fear

      // Chromatic aberration-like wobble via subtle Z rotation
      fearWobbleZ = perlinNoise(t * 3, 99) * fearIntensity * 0.015;
    }

    // ===== LOW HEALTH EFFECTS =====
    const healthPercent = health / maxHealth;
    let lowHealthFOVPulse = 0;

    if (healthPercent < 0.35) {
      const lowHealthIntensity = 1 - (healthPercent / 0.35); // 0-1, stronger at lower health

      // Heartbeat FOV pulse - simulates heart pounding
      const heartbeatRate = 1.2 + lowHealthIntensity * 1.5; // Faster when closer to death
      const heartbeatPhase = Math.pow(Math.max(0, Math.sin(t * heartbeatRate * Math.PI * 2)), 8); // Sharp pulse
      lowHealthFOVPulse = heartbeatPhase * lowHealthIntensity * 5; // Up to 5 FOV pulse
    }

    // ===== AIM DOWN SIGHTS =====
    let adsFOVOffset = 0;
    const rangedWeapons = ['pistol', 'silencedPistol', 'shotgun', 'rifle'];
    if (isAttacking && rangedWeapons.includes(currentWeapon)) {
      adsFOVOffset = -5; // Narrow FOV when aiming ranged weapon
    }

    // ===== COMBINE ALL FOV EFFECTS =====
    const targetFOV = 75 + fearFOVOffset + lowHealthFOVPulse + adsFOVOffset;
    fovRef.current = THREE.MathUtils.lerp(fovRef.current, targetFOV, delta * 8);

    // ===== COMBINE ALL ROTATION EFFECTS =====
    const combinedRotZ = tiltRef.current + damageRotZ + fearWobbleZ;
    rotationZRef.current = THREE.MathUtils.lerp(rotationZRef.current, combinedRotZ, delta * 12);

    // ===== APPLY ALL EFFECTS TO CAMERA =====
    camera.position.x += shakeOffsetRef.current.x + bobHorzRef.current;
    camera.position.y = 1.6
      + bobVertRef.current
      + breathOffsetRef.current
      + shakeOffsetRef.current.y
      - landingDipRef.current;
    camera.position.z += shakeOffsetRef.current.z;
    camera.rotation.z = rotationZRef.current;

    if (perspCam.fov !== fovRef.current) {
      perspCam.fov = fovRef.current;
      perspCam.updateProjectionMatrix();
    }
  });

  return null;
}
