'use client';

import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore, WEAPONS, SURVIVORS } from '@/stores/playerStore';
import { useZombieStore } from '@/stores/zombieStore';
import { useGameStore } from '@/stores/gameStore';
import { useHorrorStore } from '@/stores/horrorStore';
import { useEconomyStore, COIN_REWARDS } from '@/stores/economyStore';
import { useApocalypsePassStore, XP_REWARDS } from '@/stores/apocalypsePassStore';

const HEADSHOT_HEIGHT_MIN = 1.4;
const HEADSHOT_MULTIPLIER = 2;
const MELEE_COOLDOWN = 0.5;
const RANGED_COOLDOWN = 0.3;
const CRIT_THRESHOLD = 80;

// Max counts for instanced meshes
const MAX_BLOOD = 80;
const MAX_SHELLS = 12;
const MAX_MARKERS = 8;
const MAX_NUMBERS = 8;
const MAX_KILLS = 5;
const MAX_SLASHES = 2;

// Effect data stored in refs for performance
interface HitMarkerData {
  position: THREE.Vector3;
  isHeadshot: boolean;
  timer: number;
}

interface DamageNumberData {
  damage: number;
  position: THREE.Vector3;
  isHeadshot: boolean;
  isCrit: boolean;
  timer: number;
}

interface BloodParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  timer: number;
  size: number;
}

interface ShellCasingData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  timer: number;
}

interface KillConfirmData {
  position: THREE.Vector3;
  timer: number;
}

interface MeleeSlashData {
  timer: number;
  direction: number;
}

// ===== ENHANCED MUZZLE FLASH =====
function MuzzleFlash() {
  const { camera } = useThree();
  const flashRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const flashTimer = useRef(0);
  const flashScaleRef = useRef(0);

  const isAttacking = usePlayerStore((s) => s.isAttacking);
  const currentWeapon = usePlayerStore((s) => s.currentWeapon);

  useFrame((_, delta) => {
    if (!flashRef.current || !lightRef.current) return;

    if (isAttacking && flashTimer.current <= 0) {
      const weapon = WEAPONS[currentWeapon as keyof typeof WEAPONS];
      if (weapon?.isRanged) {
        flashTimer.current = currentWeapon === 'shotgun' ? 0.1 : 0.05;
        if (currentWeapon === 'shotgun') flashScaleRef.current = 0.2;
        else if (currentWeapon === 'rifle') flashScaleRef.current = 0.08;
        else flashScaleRef.current = 0.06;
      }
    }

    if (flashTimer.current > 0) {
      flashTimer.current -= delta;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const flashPos = camera.position.clone().add(dir.multiplyScalar(0.6));
      flashRef.current.position.copy(flashPos);
      flashRef.current.visible = true;

      let flashColor = '#ffaa00';
      if (currentWeapon === 'shotgun') flashColor = '#ff6600';
      else if (currentWeapon === 'silencedPistol') flashColor = '#ffdd88';

      const scale = flashScaleRef.current * Math.max(0, flashTimer.current / 0.05);
      flashRef.current.scale.setScalar(scale);

      lightRef.current.position.copy(flashPos);
      lightRef.current.intensity = currentWeapon === 'shotgun' ? 12 : 8;
      lightRef.current.color.set(flashColor);
    } else {
      flashRef.current.visible = false;
      lightRef.current.intensity = 0;
    }
  });

  return (
    <>
      <group ref={flashRef} visible={false}>
        <mesh>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
        {[0, 45, 90, 135].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <planeGeometry args={[0.15, 3]} />
            <meshBasicMaterial color="#ffcc44" transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <pointLight ref={lightRef} color="#ffaa00" intensity={0} distance={8} decay={2} />
    </>
  );
}

// ===== MAIN COMBAT SYSTEM =====
export default function CombatSystem() {
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const attackCooldown = useRef(0);

  // Visual effect data - stored in refs for performance
  const hitMarkersRef = useRef<HitMarkerData[]>([]);
  const damageNumbersRef = useRef<DamageNumberData[]>([]);
  const bloodParticlesRef = useRef<BloodParticleData[]>([]);
  const shellCasingsRef = useRef<ShellCasingData[]>([]);
  const killConfirmsRef = useRef<KillConfirmData[]>([]);
  const meleeSlashesRef = useRef<MeleeSlashData[]>([]);
  const critFlashOpacity = useRef(0);

  // InstancedMesh refs for rendering particles
  const bloodMeshRef = useRef<THREE.InstancedMesh>(null);
  const markerMeshRef = useRef<THREE.InstancedMesh>(null);
  const numberMeshRef = useRef<THREE.InstancedMesh>(null);
  const killMeshRef = useRef<THREE.InstancedMesh>(null);
  const shellMeshRef = useRef<THREE.InstancedMesh>(null);
  const slashMeshRef = useRef<THREE.InstancedMesh>(null);
  const critOverlayRef = useRef<THREE.Mesh>(null);

  const dummy = useRef(new THREE.Object3D());

  const isAttacking = usePlayerStore((s) => s.isAttacking);
  const currentWeapon = usePlayerStore((s) => s.currentWeapon);
  const position = usePlayerStore((s) => s.position);
  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const isDead = usePlayerStore((s) => s.isDead);
  const isReloading = usePlayerStore((s) => s.isReloading);
  const reloadWeapon = usePlayerStore((s) => s.reload);
  const addKill = usePlayerStore((s) => s.addKill);
  const addCoins = usePlayerStore((s) => s.addCoins);
  const damageZombie = useZombieStore((s) => s.damageZombie);
  const zombies = useZombieStore((s) => s.zombies);
  const addScreenShake = useHorrorStore((s) => s.addScreenShake);
  const addBloodDecal = useHorrorStore((s) => s.addBloodDecal);
  const isPaused = useGameStore((s) => s.isPaused);
  const addGameKill = useGameStore((s) => s.addKill);
  const addEconomyCoins = useEconomyStore((s) => s.addCoins);
  const addXP = useApocalypsePassStore((s) => s.addXP);

  // Spawn helpers
  const spawnBlood = useCallback((pos: [number, number, number], count: number) => {
    const particles = bloodParticlesRef.current;
    for (let i = 0; i < count; i++) {
      particles.push({
        position: new THREE.Vector3(pos[0], pos[1] + 1.0, pos[2]),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2 + 1,
          (Math.random() - 0.5) * 3
        ),
        timer: 0,
        size: 0.03 + Math.random() * 0.04,
      });
    }
    while (particles.length > MAX_BLOOD) particles.shift();
  }, []);

  const spawnShellCasing = useCallback(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
    const ejectDir = right.clone().multiplyScalar(1.5).add(new THREE.Vector3(0, 2, 0));
    const casings = shellCasingsRef.current;
    casings.push({
      position: new THREE.Vector3(position[0] + right.x * 0.3, position[1] + 0.2, position[2] + right.z * 0.3),
      velocity: ejectDir,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotSpeed: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
      timer: 0,
    });
    while (casings.length > MAX_SHELLS) casings.shift();
  }, [camera, position]);

  const spawnHitMarker = useCallback((pos: [number, number, number], isHeadshot: boolean) => {
    const markers = hitMarkersRef.current;
    markers.push({
      position: new THREE.Vector3(pos[0], pos[1] + 1.5, pos[2]),
      isHeadshot,
      timer: 0,
    });
    while (markers.length > MAX_MARKERS) markers.shift();
  }, []);

  const spawnDamageNumber = useCallback((pos: [number, number, number], damage: number, isHeadshot: boolean, isCrit: boolean) => {
    const numbers = damageNumbersRef.current;
    numbers.push({
      damage: Math.round(damage),
      position: new THREE.Vector3(
        pos[0] + (Math.random() - 0.5) * 0.5,
        pos[1] + 1.8,
        pos[2] + (Math.random() - 0.5) * 0.5
      ),
      isHeadshot,
      isCrit,
      timer: 0,
    });
    while (numbers.length > MAX_NUMBERS) numbers.shift();
  }, []);

  const spawnKillConfirm = useCallback((pos: [number, number, number]) => {
    const kills = killConfirmsRef.current;
    kills.push({
      position: new THREE.Vector3(pos[0], pos[1] + 2.2, pos[2]),
      timer: 0,
    });
    while (kills.length > MAX_KILLS) kills.shift();
  }, []);

  const spawnMeleeSlash = useCallback(() => {
    const slashes = meleeSlashesRef.current;
    slashes.push({ timer: 0, direction: Math.random() > 0.5 ? 1 : -1 });
    while (slashes.length > MAX_SLASHES) slashes.shift();
  }, []);

  const handleZombieKilled = useCallback(
    (zombieType: string, zombiePos: [number, number, number]) => {
      addKill();
      addGameKill();
      addXP(XP_REWARDS.killZombie);

      let coinReward: number = COIN_REWARDS.killWalker;
      if (zombieType === 'runner') coinReward = COIN_REWARDS.killRunner;
      else if (zombieType === 'crawler') coinReward = COIN_REWARDS.killCrawler;
      else if (zombieType === 'boss_scientist') {
        coinReward = COIN_REWARDS.killBossScientist;
        addXP(XP_REWARDS.bossKill);
      } else if (zombieType === 'boss_alpha') {
        coinReward = COIN_REWARDS.killBossAlpha;
        addXP(XP_REWARDS.bossKill);
      }

      addCoins(coinReward);
      addEconomyCoins(coinReward);
      spawnKillConfirm(zombiePos);
    },
    [addKill, addGameKill, addXP, addCoins, addEconomyCoins, spawnKillConfirm]
  );

  // Update visual effects and render instanced meshes each frame
  useFrame((_, delta) => {
    const d = dummy.current;

    // ===== Update & render blood particles =====
    bloodParticlesRef.current = bloodParticlesRef.current
      .map((p) => {
        const newPos = p.position.clone().add(p.velocity.clone().multiplyScalar(delta));
        const newVel = p.velocity.clone();
        newVel.y -= 9.8 * delta;
        return { ...p, position: newPos, velocity: newVel, timer: p.timer + delta };
      })
      .filter((p) => p.timer < 0.8 && p.position.y > -0.5);

    if (bloodMeshRef.current) {
      const particles = bloodParticlesRef.current;
      for (let i = 0; i < MAX_BLOOD; i++) {
        if (i < particles.length) {
          const p = particles[i];
          const opacity = 1 - p.timer / 0.8;
          d.position.copy(p.position);
          d.scale.setScalar(p.size * 10 * opacity);
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        bloodMeshRef.current.setMatrixAt(i, d.matrix);
      }
      bloodMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // ===== Update & render hit markers =====
    hitMarkersRef.current = hitMarkersRef.current
      .map((m) => ({ ...m, timer: m.timer + delta }))
      .filter((m) => m.timer < 0.4);

    if (markerMeshRef.current) {
      const markers = hitMarkersRef.current;
      for (let i = 0; i < MAX_MARKERS; i++) {
        if (i < markers.length) {
          const m = markers[i];
          const progress = m.timer / 0.4;
          const opacity = 1 - progress;
          d.position.set(m.position.x, m.position.y + progress * 0.3, m.position.z);
          const scale = (0.15 + progress * 0.05) * (m.isHeadshot ? 1.5 : 1);
          d.scale.set(scale, scale * 3, scale);
          d.rotation.set(0, 0, (i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4));
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        markerMeshRef.current.setMatrixAt(i, d.matrix);
      }
      markerMeshRef.current.instanceMatrix.needsUpdate = true;

      // Update color for headshot markers
      const markerMat = markerMeshRef.current.material as THREE.InstancedMesh['material'];
      if (markers.some((m) => m.isHeadshot)) {
        (markerMat as THREE.MeshBasicMaterial).color.set('#ffdd00');
      } else {
        (markerMat as THREE.MeshBasicMaterial).color.set('#ffffff');
      }
    }

    // ===== Update & render damage numbers =====
    damageNumbersRef.current = damageNumbersRef.current
      .map((n) => ({
        ...n,
        timer: n.timer + delta,
        position: new THREE.Vector3(n.position.x, n.position.y + delta * 2, n.position.z),
      }))
      .filter((n) => n.timer < 1.0);

    if (numberMeshRef.current) {
      const numbers = damageNumbersRef.current;
      for (let i = 0; i < MAX_NUMBERS; i++) {
        if (i < numbers.length) {
          const n = numbers[i];
          const progress = n.timer / 1.0;
          const opacity = 1 - Math.pow(progress, 2);
          const fontSize = n.isCrit ? 1.6 : n.isHeadshot ? 1.4 : 1;
          d.position.copy(n.position);
          d.scale.set(fontSize * 0.15, fontSize * 0.08, 1);
          d.rotation.set(0, 0, 0);
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        numberMeshRef.current.setMatrixAt(i, d.matrix);
      }
      numberMeshRef.current.instanceMatrix.needsUpdate = true;

      const numMat = numberMeshRef.current.material as THREE.MeshBasicMaterial;
      const hasCrit = numbers.some((n) => n.isCrit);
      const hasHeadshot = numbers.some((n) => n.isHeadshot);
      if (hasCrit) numMat.color.set('#ff2200');
      else if (hasHeadshot) numMat.color.set('#ffdd00');
      else numMat.color.set('#ffffff');
    }

    // ===== Update & render shell casings =====
    shellCasingsRef.current = shellCasingsRef.current
      .map((c) => {
        const newPos = c.position.clone().add(c.velocity.clone().multiplyScalar(delta));
        const newVel = c.velocity.clone();
        newVel.y -= 9.8 * delta;
        const newRot = new THREE.Euler(
          c.rotation.x + c.rotSpeed.x * delta,
          c.rotation.y + c.rotSpeed.y * delta,
          c.rotation.z + c.rotSpeed.z * delta
        );
        if (newPos.y < 0.02) {
          newPos.y = 0.02;
          newVel.set(0, 0, 0);
        }
        return { ...c, position: newPos, velocity: newVel, rotation: newRot, timer: c.timer + delta };
      })
      .filter((c) => c.timer < 3);

    if (shellMeshRef.current) {
      const casings = shellCasingsRef.current;
      for (let i = 0; i < MAX_SHELLS; i++) {
        if (i < casings.length) {
          const c = casings[i];
          const opacity = Math.max(0, 1 - c.timer / 3);
          d.position.copy(c.position);
          d.rotation.copy(c.rotation);
          d.scale.setScalar(opacity);
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        shellMeshRef.current.setMatrixAt(i, d.matrix);
      }
      shellMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // ===== Update & render kill confirms =====
    killConfirmsRef.current = killConfirmsRef.current
      .map((k) => ({ ...k, timer: k.timer + delta }))
      .filter((k) => k.timer < 1.0);

    if (killMeshRef.current) {
      const kills = killConfirmsRef.current;
      for (let i = 0; i < MAX_KILLS; i++) {
        if (i < kills.length) {
          const k = kills[i];
          const progress = k.timer / 1.0;
          d.position.set(k.position.x, k.position.y + progress * 0.5, k.position.z);
          const scale = 0.2 + progress * 0.1;
          d.scale.setScalar(scale);
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        killMeshRef.current.setMatrixAt(i, d.matrix);
      }
      killMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // ===== Update & render melee slashes =====
    meleeSlashesRef.current = meleeSlashesRef.current
      .map((s) => ({ ...s, timer: s.timer + delta }))
      .filter((s) => s.timer < 0.3);

    if (slashMeshRef.current) {
      const slashes = meleeSlashesRef.current;
      for (let i = 0; i < MAX_SLASHES; i++) {
        if (i < slashes.length) {
          const s = slashes[i];
          const progress = s.timer / 0.3;
          const opacity = 1 - progress;
          const arcAngle = Math.PI * 0.6;
          // Position slash in front of camera
          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);
          d.position.copy(camera.position).add(dir.multiplyScalar(1.5));
          d.position.y -= 0.2;
          d.rotation.set(0, camera.rotation.y + s.direction * progress * arcAngle, 0);
          d.scale.set(1, 1, opacity);
        } else {
          d.position.set(0, -100, 0);
          d.scale.setScalar(0);
        }
        d.updateMatrix();
        slashMeshRef.current.setMatrixAt(i, d.matrix);
      }
      slashMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // ===== Crit flash overlay =====
    if (critFlashOpacity.current > 0) {
      critFlashOpacity.current -= delta * 2;
      if (critFlashOpacity.current < 0) critFlashOpacity.current = 0;
    }
    if (critOverlayRef.current) {
      critOverlayRef.current.visible = critFlashOpacity.current > 0;
      const mat = critOverlayRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = critFlashOpacity.current;
    }
  });

  // Main combat logic
  useFrame((_, delta) => {
    if (isDead || isPaused) return;

    if (isReloading) {
      reloadWeapon(currentWeapon);
      return;
    }

    if (attackCooldown.current > 0) {
      attackCooldown.current -= delta;
      return;
    }

    if (!isAttacking) return;

    const weapon = WEAPONS[currentWeapon];
    const survivor = SURVIVORS[selectedSurvivor];
    const baseDamage = weapon.damage;
    const damageBonus = 1 + survivor.damageBonus;
    const totalDamage = baseDamage * damageBonus;

    if (weapon.isRanged) {
      const playerStore = usePlayerStore.getState();
      if (!playerStore.useAmmo(currentWeapon, 1)) return;

      attackCooldown.current = weapon.fireRate + RANGED_COOLDOWN;

      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      raycaster.current.far = weapon.range;

      const spread = weapon.spread;
      const spreadDir = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        0
      );
      raycaster.current.ray.direction.add(spreadDir).normalize();

      const rayOrigin = camera.position.clone();
      const rayDir = raycaster.current.ray.direction.clone();

      let closestZombie: string | null = null;
      let closestDist = Infinity;

      for (const zombie of zombies) {
        if (zombie.state === 'dead' || zombie.state === 'playingDead') continue;

        const zombiePos = new THREE.Vector3(...zombie.position);
        zombiePos.y += 1.0;

        const toZombie = zombiePos.clone().sub(rayOrigin);
        const projection = toZombie.dot(rayDir);

        if (projection < 0 || projection > weapon.range) continue;

        const closestPoint = rayOrigin.clone().add(rayDir.clone().multiplyScalar(projection));
        const distance = closestPoint.distanceTo(zombiePos);

        const hitRadius = zombie.isBoss ? 1.5 : 0.5;
        if (distance < hitRadius && projection < closestDist) {
          closestDist = projection;
          closestZombie = zombie.id;
        }
      }

      if (closestZombie) {
        const zombie = zombies.find((z) => z.id === closestZombie);
        const isHeadshot = zombie
          ? (rayOrigin.y + rayDir.y * closestDist) > (zombie.position[1] + HEADSHOT_HEIGHT_MIN)
          : false;

        const finalDamage = isHeadshot ? totalDamage * HEADSHOT_MULTIPLIER : totalDamage;
        const isCrit = finalDamage >= CRIT_THRESHOLD;
        const actualDamage = damageZombie(closestZombie, finalDamage, isHeadshot);

        if (zombie && actualDamage > 0) {
          addBloodDecal(
            [zombie.position[0], 0.01, zombie.position[2]],
            0.3 + Math.random() * 0.3
          );

          const bloodCount = currentWeapon === 'shotgun' ? 12 : currentWeapon === 'rifle' ? 6 : 4;
          spawnBlood(zombie.position, bloodCount);
          spawnHitMarker(zombie.position, isHeadshot);
          spawnDamageNumber(zombie.position, actualDamage, isHeadshot, isCrit);

          if (isCrit) {
            critFlashOpacity.current = 0.3;
          }
        }

        if (zombie && zombie.health - actualDamage <= 0) {
          handleZombieKilled(zombie.type, zombie.position);
        }
      }

      spawnShellCasing();

      const shakeIntensity = currentWeapon === 'shotgun' ? 0.12 : 0.05;
      const shakeDuration = currentWeapon === 'shotgun' ? 0.2 : 0.1;
      addScreenShake(shakeIntensity, shakeDuration);
    } else {
      // Melee combat
      attackCooldown.current = weapon.fireRate + MELEE_COOLDOWN;
      spawnMeleeSlash();

      for (const zombie of zombies) {
        if (zombie.state === 'dead' || zombie.state === 'playingDead') continue;

        const dx = position[0] - zombie.position[0];
        const dz = position[2] - zombie.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < weapon.range) {
          const angleToZombie = Math.atan2(dx, dz);
          const playerRot = camera.rotation.y;
          const angleDiff = Math.abs(
            Math.atan2(Math.sin(angleToZombie - playerRot), Math.cos(angleToZombie - playerRot))
          );

          if (angleDiff < Math.PI / 3) {
            const isCrit = totalDamage >= CRIT_THRESHOLD;
            const actualDamage = damageZombie(zombie.id, totalDamage);

            if (actualDamage > 0) {
              addBloodDecal(
                [zombie.position[0], 0.01, zombie.position[2]],
                0.4 + Math.random() * 0.3
              );
              spawnBlood(zombie.position, 6);
              spawnHitMarker(zombie.position, false);
              spawnDamageNumber(zombie.position, actualDamage, false, isCrit);
            }

            if (zombie.health - actualDamage <= 0) {
              handleZombieKilled(zombie.type, zombie.position);
            }

            addScreenShake(0.08, 0.15);
            break;
          }
        }
      }
    }
  });

  return (
    <>
      <MuzzleFlash />

      {/* Blood particles */}
      <instancedMesh ref={bloodMeshRef} args={[undefined, undefined, MAX_BLOOD]} frustumCulled={false}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#880000" transparent opacity={0.8} depthWrite={false} />
      </instancedMesh>

      {/* Hit markers (X shapes) */}
      <instancedMesh ref={markerMeshRef} args={[undefined, undefined, MAX_MARKERS]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* Damage numbers */}
      <instancedMesh ref={numberMeshRef} args={[undefined, undefined, MAX_NUMBERS]} frustumCulled={false}>
        <planeGeometry args={[2, 0.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} />
      </instancedMesh>

      {/* Shell casings */}
      <instancedMesh ref={shellMeshRef} args={[undefined, undefined, MAX_SHELLS]} frustumCulled={false}>
        <cylinderGeometry args={[0.008, 0.006, 0.04, 6]} />
        <meshStandardMaterial color="#ccaa44" metalness={0.8} roughness={0.3} />
      </instancedMesh>

      {/* Kill confirms (skull shapes) */}
      <instancedMesh ref={killMeshRef} args={[undefined, undefined, MAX_KILLS]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.8} depthTest={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>

      {/* Melee slash arc */}
      <instancedMesh ref={slashMeshRef} args={[undefined, undefined, MAX_SLASHES]} frustumCulled={false}>
        <torusGeometry args={[1, 0.03, 4, 16, Math.PI * 0.6]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.5} depthTest={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>

      {/* Crit flash overlay */}
      <mesh ref={critOverlayRef} visible={false} renderOrder={999}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>
    </>
  );
}
