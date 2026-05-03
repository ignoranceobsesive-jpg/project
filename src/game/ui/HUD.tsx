'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore, SURVIVORS, WEAPONS } from '@/stores/playerStore';
import { useGameStore, FloorNumber } from '@/stores/gameStore';
import { useZombieStore } from '@/stores/zombieStore';
import { useEconomyStore } from '@/stores/economyStore';
import {
  Coins, Battery, Zap, Heart, Skull, Crosshair as CrosshairIcon,
  KeyRound, Swords, Shield, Timer, Activity, MapPin
} from 'lucide-react';

const FLOOR_NAMES: Record<FloorNumber, string> = {
  1: 'LOBBY',
  2: 'OFFICES',
  3: 'LABORATORY',
  4: 'ROOFTOP',
};

/* ── Kill Feed Popup ── */
function KillPopup({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex items-center gap-1.5 bg-red-950/70 px-2.5 py-1 rounded border border-red-800/40 backdrop-blur-sm"
    >
      <span className="text-red-400 text-xs font-bold font-mono">+1 KILL</span>
      <Coins className="h-3 w-3 text-yellow-500" />
    </motion.div>
  );
}

/* ── Bio-Monitor Health Bar ── */
function BioMonitorHealth({ health, maxHealth, isLowHealth }: { health: number; maxHealth: number; isLowHealth: boolean }) {
  const healthPercent = (health / maxHealth) * 100;
  const pipCount = 10;
  const filledPips = Math.ceil((health / maxHealth) * pipCount);

  return (
    <div className="relative">
      {/* Label row */}
      <div className="flex justify-between items-center text-[10px] mb-1 px-0.5">
        <span className="flex items-center gap-1">
          <motion.span
            animate={{ scale: isLowHealth ? [1, 1.3, 1] : 1 }}
            transition={{ duration: isLowHealth ? 0.5 : 0, repeat: isLowHealth ? Infinity : 0 }}
          >
            <Heart className={`h-3 w-3 ${isLowHealth ? 'text-red-500' : 'text-red-400'}`} fill={isLowHealth ? '#ef4444' : '#f87171'} />
          </motion.span>
          <span className="text-zinc-500 font-mono tracking-wider">BIO-MONITOR</span>
        </span>
        <span className={`font-mono font-bold ${isLowHealth ? 'text-red-400' : 'text-zinc-300'}`}>
          {Math.ceil(health)}/{maxHealth}
        </span>
      </div>

      {/* Segmented health pips */}
      <div className="relative h-4 bg-black/80 rounded-sm overflow-hidden border border-zinc-800/80">
        {/* Background scan line */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        </motion.div>

        {/* Pips */}
        <div className="absolute inset-0 flex gap-[2px] px-[1px] py-[1px] z-[5]">
          {Array.from({ length: pipCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1px] transition-all duration-300"
              style={{
                backgroundColor: i < filledPips
                  ? isLowHealth
                    ? `rgba(239, 68, 68, ${0.6 + Math.sin(Date.now() / 200 + i) * 0.3})`
                    : healthPercent > 60
                      ? '#22c55e'
                      : '#eab308'
                  : 'rgba(39, 39, 42, 0.4)',
                boxShadow: i < filledPips && isLowHealth
                  ? '0 0 6px rgba(239, 68, 68, 0.6)'
                  : i < filledPips && healthPercent > 60
                    ? '0 0 4px rgba(34, 197, 94, 0.3)'
                    : 'none',
              }}
            />
          ))}
        </div>

        {/* Low health pulse overlay */}
        {isLowHealth && (
          <motion.div
            className="absolute inset-0 bg-red-600/20 z-[6]"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Heartbeat line */}
      <svg className="w-full h-3 mt-0.5" viewBox="0 0 200 10" preserveAspectRatio="none">
        <motion.path
          d="M0,5 L30,5 L35,5 L38,1 L42,9 L46,3 L50,7 L54,5 L70,5 L75,5 L78,1 L82,9 L86,3 L90,7 L94,5 L110,5 L115,5 L118,1 L122,9 L126,3 L130,7 L134,5 L150,5 L155,5 L158,2 L162,8 L166,4 L170,5 L200,5"
          fill="none"
          stroke={isLowHealth ? '#ef4444' : '#22c55e'}
          strokeWidth="0.8"
          animate={{
            strokeOpacity: isLowHealth ? [0.4, 1, 0.4] : 0.5,
          }}
          transition={{ duration: isLowHealth ? 0.6 : 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

/* ── Military Ammo Counter ── */
function MilitaryAmmoCounter({
  currentAmmo, maxAmmo, weaponName, isReloading, isLowAmmo
}: {
  currentAmmo: number; maxAmmo: number; weaponName: string;
  isReloading: boolean; isLowAmmo: boolean;
}) {
  const bulletCount = maxAmmo === Infinity ? 0 : Math.min(maxAmmo, 30);
  const filledBullets = maxAmmo === Infinity ? 0 : currentAmmo;

  return (
    <div className="bg-black/80 border border-zinc-700/60 rounded px-3 py-2 relative overflow-hidden backdrop-blur-sm">
      {/* Scan line */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-1/4 bg-gradient-to-b from-transparent via-green-500/5 to-transparent" />
      </motion.div>

      <p className="text-[9px] text-zinc-600 font-mono tracking-[0.2em] mb-1">{weaponName}</p>

      {/* Digital display */}
      <div className="flex items-baseline gap-1">
        <motion.span
          key={currentAmmo}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-mono font-black tabular-nums ${
            isLowAmmo ? 'text-red-500' : currentAmmo === Infinity ? 'text-green-400' : 'text-green-300'
          }`}
          style={{
            textShadow: isLowAmmo
              ? '0 0 10px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.3)'
              : '0 0 8px rgba(74,222,128,0.4), 0 0 16px rgba(74,222,128,0.2)',
            fontFamily: 'monospace',
          }}
        >
          {currentAmmo === Infinity ? '∞' : String(currentAmmo).padStart(2, '0')}
        </motion.span>
        <span className="text-zinc-700 text-sm">/</span>
        <span className="text-zinc-500 text-sm font-mono">
          {maxAmmo === Infinity ? '∞' : String(maxAmmo).padStart(2, '0')}
        </span>
      </div>

      {/* Magazine bullet visualization */}
      {bulletCount > 0 && (
        <div className="flex gap-[2px] mt-1.5 flex-wrap">
          {Array.from({ length: bulletCount }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] h-2 rounded-[1px] transition-all duration-150"
              style={{
                backgroundColor: i < filledBullets
                  ? isLowAmmo ? '#ef4444' : '#4ade80'
                  : 'rgba(63, 63, 70, 0.5)',
                boxShadow: i < filledBullets && isLowAmmo ? '0 0 3px rgba(239,68,68,0.5)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Reloading indicator */}
      {isReloading && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          className="absolute bottom-0 left-0 h-[2px] bg-yellow-500"
          style={{ boxShadow: '0 0 6px rgba(234,179,8,0.6)' }}
        />
      )}
      {isReloading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-[9px] text-yellow-400 font-bold font-mono mt-0.5 tracking-widest"
        >
          RELOADING...
        </motion.p>
      )}
    </div>
  );
}

/* ── Fog-of-War Minimap ── */
function FogOfWarMinimap({
  aliveZombies, playerPos, playerRotation, enemiesNear
}: {
  aliveZombies: { id: string; position: [number, number, number]; type: string; isBoss: boolean }[];
  playerPos: [number, number, number];
  playerRotation: number;
  enemiesNear: boolean;
}) {
  const mapSize = 128;

  return (
    <div className="relative">
      <motion.div
        className="w-28 h-28 sm:w-32 sm:h-32 bg-black/90 rounded-sm overflow-hidden relative"
        animate={{
          borderColor: enemiesNear ? ['rgba(153,27,27,0.6)', 'rgba(239,68,68,0.4)', 'rgba(153,27,27,0.6)'] : 'rgba(39,39,42,0.8)',
        }}
        transition={{ duration: 1.5, repeat: enemiesNear ? Infinity : 0 }}
        style={{ borderWidth: '1px', borderStyle: 'solid' }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0">
          {[25, 50, 75].map((p) => (
            <div key={`g${p}`}>
              <div className="absolute left-0 right-0 border-t border-zinc-800/30" style={{ top: `${p}%` }} />
              <div className="absolute top-0 bottom-0 border-l border-zinc-800/30" style={{ left: `${p}%` }} />
            </div>
          ))}
        </div>

        {/* Fog of war - radial gradient centered on player */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.9) 80%)`,
          }}
        />

        {/* Zombie dots */}
        {aliveZombies.map((z) => {
          const mx = ((z.position[0] - playerPos[0]) / 50 + 0.5) * 100;
          const mz = ((z.position[2] - playerPos[2]) / 50 + 0.5) * 100;
          if (mx < 2 || mx > 98 || mz < 2 || mz > 98) return null;

          const distFromCenter = Math.sqrt((mx - 50) ** 2 + (mz - 50) ** 2);
          const fogOpacity = distFromCenter < 25 ? 1 : distFromCenter < 40 ? 0.6 : 0.2;

          return (
            <div
              key={z.id}
              className="absolute z-10"
              style={{
                left: `${mx}%`,
                top: `${mz}%`,
                transform: 'translate(-50%, -50%)',
                opacity: fogOpacity,
              }}
            >
              {z.isBoss ? (
                <Skull className="h-2.5 w-2.5 text-red-500" style={{ filter: 'drop-shadow(0 0 3px rgba(239,68,68,0.8))' }} />
              ) : (
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" style={{ boxShadow: '0 0 3px rgba(239,68,68,0.6)' }} />
              )}
            </div>
          );
        })}

        {/* Player direction indicator */}
        <div
          className="absolute top-1/2 left-1/2 z-30"
          style={{ transform: `translate(-50%, -50%) rotate(${playerRotation}rad)` }}
        >
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
            {/* Direction arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0"
              style={{
                borderLeft: '3px solid transparent',
                borderRight: '3px solid transparent',
                borderBottom: '5px solid #4ade80',
                filter: 'drop-shadow(0 0 2px rgba(74,222,128,0.6))',
              }}
            />
          </div>
        </div>

        {/* Room outline */}
        <div className="absolute inset-2 border border-zinc-700/30 rounded-sm z-[5]" />

        {/* Corner labels */}
        <div className="absolute top-0.5 left-1 text-[6px] text-zinc-600 font-mono z-30">N</div>
      </motion.div>
    </div>
  );
}

/* ── Battery Icon ── */
function BatteryIndicator({ battery, isOn }: { battery: number; isOn: boolean }) {
  const isLow = battery < 20;
  const isCritical = battery < 10;
  const fillWidth = Math.max(2, (battery / 100) * 20);

  return (
    <div className="flex items-center gap-2">
      {/* Battery icon */}
      <div className="relative">
        <svg width="28" height="14" viewBox="0 0 28 14">
          {/* Battery body */}
          <rect x="1" y="2" width="22" height="10" rx="2" fill="none" stroke={isLow ? '#ef4444' : '#52525b'} strokeWidth="1.5" />
          {/* Battery tip */}
          <rect x="23" y="4.5" width="3" height="5" rx="1" fill={isLow ? '#ef4444' : '#52525b'} />
          {/* Fill */}
          <rect
            x="3" y="4"
            width={fillWidth} height="6"
            rx="1"
            fill={isCritical ? '#ef4444' : isLow ? '#eab308' : '#22c55e'}
            style={{
              opacity: isCritical ? undefined : 1,
            }}
          />
          {isCritical && (
            <motion.rect
              x="3" y="4" width={fillWidth} height="6" rx="1"
              fill="#ef4444"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`text-[9px] font-mono ${isOn ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
        <span className={`text-[10px] font-mono font-bold ${isLow ? 'text-yellow-500' : 'text-zinc-300'}`}>
          {Math.ceil(battery)}%
        </span>
      </div>
    </div>
  );
}

/* ── Circular Ability Cooldown ── */
function AbilityCooldown({
  percent, cooldownRemaining, abilityName, survivorColor, isReady
}: {
  percent: number; cooldownRemaining: number; abilityName: string;
  survivorColor: string; isReady: boolean;
}) {
  const circumference = 2 * Math.PI * 15.5;
  const strokeDash = (percent / 100) * circumference;

  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        {/* Background ring */}
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#27272a" strokeWidth="2.5" />
        {/* Progress ring */}
        <circle
          cx="18" cy="18" r="15.5" fill="none"
          stroke={isReady ? survivorColor : '#52525b'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
          className="transition-all duration-300"
          style={{
            filter: isReady ? `drop-shadow(0 0 6px ${survivorColor})` : 'none',
          }}
        />
        {/* Glow ring when ready */}
        {isReady && (
          <motion.circle
            cx="18" cy="18" r="15.5" fill="none"
            stroke={survivorColor}
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isReady ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Zap
            className="h-5 w-5"
            style={{ color: isReady ? survivorColor : '#52525b' }}
          />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Dynamic Crosshair ── */
function DynamicCrosshair({ isMoving, isAimingAtEnemy }: { isMoving: boolean; isAimingAtEnemy: boolean }) {
  const gap = isMoving ? 8 : 4;
  const color = isAimingAtEnemy ? '#ef4444' : 'rgba(255,255,255,0.5)';
  const lineLen = 6;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Top */}
        <line x1="16" y1={16 - gap} x2="16" y2={16 - gap - lineLen} stroke={color} strokeWidth="1.5" />
        {/* Bottom */}
        <line x1="16" y1={16 + gap} x2="16" y2={16 + gap + lineLen} stroke={color} strokeWidth="1.5" />
        {/* Left */}
        <line x1={16 - gap} y1="16" x2={16 - gap - lineLen} y2="16" stroke={color} strokeWidth="1.5" />
        {/* Right */}
        <line x1={16 + gap} y1="16" x2={16 + gap + lineLen} y2="16" stroke={color} strokeWidth="1.5" />
        {/* Center dot */}
        <circle cx="16" cy="16" r="1" fill={color} />
        {isAimingAtEnemy && (
          <motion.circle
            cx="16" cy="16" r="12"
            fill="none" stroke="#ef4444" strokeWidth="0.5"
            animate={{ opacity: [0.4, 0.8, 0.4], r: [10, 13, 10] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </svg>
    </div>
  );
}

/* ── Damage Direction Arc ── */
function DamageArc({ angle }: { angle: number }) {
  const deg = (angle * 180) / Math.PI;

  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute inset-0 pointer-events-none"
    >
      {/* Red arc pointing toward damage source */}
      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from ${deg - 30}deg at 50% 50%, transparent 0deg, rgba(220,38,38,0.35) 20deg, rgba(220,38,38,0.15) 40deg, transparent 60deg)`,
        }}
      />
      {/* Directional arrow */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-min(35vh, 35vw))`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon points="10,0 5,8 15,8" fill="rgba(239,68,68,0.7)" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ── Main HUD Component ── */
export default function HUD() {
  const health = usePlayerStore((s) => s.health);
  const maxHealth = usePlayerStore((s) => s.maxHealth);
  const currentWeapon = usePlayerStore((s) => s.currentWeapon);
  const ammo = usePlayerStore((s) => s.ammo);
  const isReloading = usePlayerStore((s) => s.isReloading);
  const flashlightOn = usePlayerStore((s) => s.flashlightOn);
  const flashlightBattery = usePlayerStore((s) => s.flashlightBattery);
  const abilityCooldownRemaining = usePlayerStore((s) => s.abilityCooldownRemaining);
  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const killsThisRun = usePlayerStore((s) => s.killsThisRun);
  const damageDirection = usePlayerStore((s) => s.damageDirection);
  const damageTimer = usePlayerStore((s) => s.damageTimer);
  const inventory = usePlayerStore((s) => s.inventory);
  const playerPos = usePlayerStore((s) => s.position);
  const playerRotation = usePlayerStore((s) => s.rotation);
  const isMoving = usePlayerStore((s) => s.isMoving);
  const secondaryWeapon = usePlayerStore((s) => s.secondaryWeapon);

  const currentFloor = useGameStore((s) => s.currentFloor);
  const totalKills = useGameStore((s) => s.totalKills);
  const deathCoins = useEconomyStore((s) => s.deathCoins);
  const zombies = useZombieStore((s) => s.zombies);

  const survivor = SURVIVORS[selectedSurvivor];
  const weapon = WEAPONS[currentWeapon];
  const healthPercent = (health / maxHealth) * 100;
  const isLowHealth = healthPercent < 30;

  const currentAmmo = ammo[currentWeapon];
  const maxAmmo = weapon.ammoMax;
  const isLowAmmo = maxAmmo !== Infinity && currentAmmo <= Math.ceil(maxAmmo * 0.25);

  const abilityCooldown = survivor.abilityCooldown;
  const abilityPercent = abilityCooldown > 0
    ? ((abilityCooldown - abilityCooldownRemaining) / abilityCooldown) * 100
    : 100;
  const isAbilityReady = abilityCooldownRemaining <= 0;

  // Damage direction
  const damageIndicatorDeg = useMemo(() => {
    if (damageTimer <= 0 || damageDirection === null) return null;
    return (damageDirection * 180) / Math.PI;
  }, [damageDirection, damageTimer]);

  // Alive zombies for minimap
  const aliveZombies = useMemo(
    () => zombies.filter((z) => z.state !== 'dead' && z.state !== 'playingDead'),
    [zombies]
  );

  // Enemies near player (for pulsing border)
  const enemiesNear = useMemo(() => {
    return aliveZombies.some((z) => {
      const dx = z.position[0] - playerPos[0];
      const dz = z.position[2] - playerPos[2];
      return Math.sqrt(dx * dx + dz * dz) < 15;
    });
  }, [aliveZombies, playerPos]);

  // Kill feed
  const [killPopups, setKillPopups] = useState<{ id: number }[]>([]);
  const prevKillsRef = useRef(killsThisRun);

  useEffect(() => {
    if (killsThisRun > prevKillsRef.current) {
      const id = Date.now();
      setKillPopups((prev) => [...prev.slice(-2), { id }]);
    }
    prevKillsRef.current = killsThisRun;
  }, [killsThisRun]);

  const removeKillPopup = useCallback((id: number) => {
    setKillPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Timestamp for floor indicator
  const [timestamp, setTimestamp] = useState('');
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimestamp(d.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* ── Low Health Overlay ── */}
      <AnimatePresence>
        {isLowHealth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Red vignette edges */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: `inset 0 0 ${100 + Math.sin(Date.now() / 300) * 40}px rgba(180, 0, 0, ${0.5 + Math.sin(Date.now() / 400) * 0.2})`,
              }}
            />
            {/* Breathing effect */}
            <motion.div
              className="absolute inset-0 bg-red-950/20"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Heartbeat pulse */}
            <motion.div
              className="absolute inset-0 bg-red-900/10"
              animate={{ opacity: [0, 0.2, 0, 0, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Damage Direction Arc ── */}
      {damageIndicatorDeg !== null && (
        <DamageArc angle={damageIndicatorDeg * Math.PI / 180} />
      )}

      {/* ── Dynamic Crosshair ── */}
      <DynamicCrosshair isMoving={isMoving} isAimingAtEnemy={false} />

      {/* ── Top Left - Bio-Monitor Health + Battery ── */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 w-52 sm:w-60">
        <BioMonitorHealth health={health} maxHealth={maxHealth} isLowHealth={isLowHealth} />

        {/* Flashlight battery */}
        <div className="flex items-center justify-between bg-black/50 px-2 py-1.5 rounded-sm border border-zinc-800/50">
          <BatteryIndicator battery={flashlightBattery} isOn={flashlightOn} />
          <span className="text-[8px] text-zinc-600 font-mono">[F]</span>
        </div>
      </div>

      {/* ── Top Center - Security Camera Floor Label ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="bg-black/70 px-4 py-1.5 rounded-sm border border-zinc-700/50 backdrop-blur-sm relative overflow-hidden">
          {/* Recording dot */}
          <div className="absolute top-1.5 right-2 flex items-center gap-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[7px] text-red-400 font-mono">REC</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
              FL-{currentFloor} {'//'} {FLOOR_NAMES[currentFloor]}
            </span>
          </div>
          <div className="text-[8px] text-zinc-600 font-mono mt-0.5">{timestamp}</div>
        </div>

        {/* Kill counter */}
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-0.5 rounded-sm border border-zinc-800/40">
          <Skull className="h-3 w-3 text-red-500" />
          <span className="text-[10px] text-red-400 font-mono font-bold">{killsThisRun}</span>
        </div>
      </div>

      {/* ── Top Right - Death Coins + Minimap ── */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        {/* Death coins */}
        <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-sm border border-zinc-800/50 backdrop-blur-sm">
          <Coins className="h-4 w-4 text-yellow-500" />
          <motion.span
            key={deathCoins}
            initial={{ scale: 1.3, color: '#facc15' }}
            animate={{ scale: 1, color: '#e4e4e7' }}
            className="font-mono text-sm font-bold"
          >
            {deathCoins}
          </motion.span>
        </div>

        {/* Minimap */}
        <FogOfWarMinimap
          aliveZombies={aliveZombies}
          playerPos={playerPos}
          playerRotation={playerRotation}
          enemiesNear={enemiesNear}
        />
      </div>

      {/* ── Bottom Left - Ability Cooldown ── */}
      <div className="absolute bottom-4 left-3 flex items-center gap-3">
        <AbilityCooldown
          percent={abilityPercent}
          cooldownRemaining={abilityCooldownRemaining}
          abilityName={survivor.abilityName}
          survivorColor={survivor.color}
          isReady={isAbilityReady}
        />
        <div>
          <p className="text-xs text-zinc-400 font-bold">{survivor.abilityName}</p>
          {abilityCooldownRemaining > 0 ? (
            <p className="text-[10px] text-zinc-600 font-mono">{abilityCooldownRemaining.toFixed(1)}s</p>
          ) : (
            <motion.p
              className="text-[10px] font-bold"
              style={{ color: survivor.color }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              READY [Q]
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Bottom Right - Military Ammo Counter ── */}
      <div className="absolute bottom-4 right-3 flex flex-col items-end gap-1.5">
        <MilitaryAmmoCounter
          currentAmmo={currentAmmo}
          maxAmmo={maxAmmo}
          weaponName={weapon.name}
          isReloading={isReloading}
          isLowAmmo={isLowAmmo}
        />

        {/* Weapon switch indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono border ${
            true ? 'bg-zinc-800/80 border-zinc-600/50 text-zinc-200' : 'bg-zinc-900/50 border-zinc-800/30 text-zinc-600'
          }`}>
            <span>1</span>
            <span>{weapon.name.slice(0, 6)}</span>
          </div>
          {secondaryWeapon && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono bg-zinc-900/50 border border-zinc-800/30 text-zinc-600">
              <span>2</span>
              <span>{WEAPONS[secondaryWeapon].name.slice(0, 6)}</span>
            </div>
          )}
        </div>

        <p className="text-[8px] text-zinc-700 font-mono">[R] Reload [1/2] Switch</p>
      </div>

      {/* ── Kill Feed Popups ── */}
      <div className="absolute top-1/3 right-3 flex flex-col gap-1">
        <AnimatePresence>
          {killPopups.map((popup) => (
            <KillPopup key={popup.id} onDone={() => removeKillPopup(popup.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Interaction Prompt ── */}
      {inventory.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-black/70 px-4 py-2 rounded-sm border border-zinc-700/50 backdrop-blur-sm"
          >
            {/* Glow outline */}
            <div className="absolute inset-0 rounded-sm border border-yellow-500/20" style={{ boxShadow: '0 0 10px rgba(234,179,8,0.1)' }} />
            <div className="flex items-center gap-2 text-xs">
              <KeyRound className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-yellow-400 font-bold font-mono">[E]</span>
              <span className="text-zinc-400">Interact</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
