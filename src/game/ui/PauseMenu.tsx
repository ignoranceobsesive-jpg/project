'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore, WEAPONS, ItemId } from '@/stores/playerStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play, Settings, LogOut, Clock, Skull, Package, Heart,
  Crosshair, Zap, Battery, Swords, Shield, Gauge
} from 'lucide-react';

const ITEM_ICONS: Record<string, string> = {
  medkit: '💊',
  bandage: '🩹',
  ammo: '🔫',
  battery: '🔋',
  keycard1: '🔑',
  keycard2: '🔑',
  keycard3: '🔑',
  grenade_item: '💣',
  armor: '🛡️',
};

const ITEM_RARITY: Record<string, 'common' | 'rare' | 'legendary'> = {
  medkit: 'rare',
  bandage: 'common',
  ammo: 'common',
  battery: 'common',
  keycard1: 'rare',
  keycard2: 'rare',
  keycard3: 'legendary',
  grenade_item: 'rare',
  armor: 'legendary',
};

const RARITY_COLORS = {
  common: { border: 'border-zinc-700/60', bg: 'bg-zinc-900/60', text: 'text-zinc-400' },
  rare: { border: 'border-blue-700/50', bg: 'bg-blue-950/30', text: 'text-blue-400' },
  legendary: { border: 'border-yellow-600/50', bg: 'bg-yellow-950/30', text: 'text-yellow-400' },
};

const RARITY_GLOW = {
  common: 'none',
  rare: '0 0 8px rgba(59,130,246,0.2)',
  legendary: '0 0 10px rgba(234,179,8,0.3)',
};

/* ── Health Bar Visualization ── */
function PauseHealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  const percent = (health / maxHealth) * 100;
  const isLow = percent < 30;
  const isCritical = percent < 15;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Heart className="h-3.5 w-3.5 text-red-500" />
          HEALTH
        </span>
        <span className={`font-mono font-bold ${isLow ? 'text-red-400' : 'text-zinc-300'}`}>
          {Math.ceil(health)} / {maxHealth}
        </span>
      </div>
      <div className="h-2.5 bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-800/50 relative">
        <motion.div
          className={`h-full rounded-full ${
            isCritical ? 'bg-red-600' : isLow ? 'bg-red-500' : percent > 60 ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            boxShadow: isLow
              ? '0 0 8px rgba(239,68,68,0.4)'
              : percent > 60
                ? '0 0 6px rgba(34,197,94,0.3)'
                : '0 0 6px rgba(234,179,8,0.3)',
          }}
        />
        {/* Scan line */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Weapon Stats Display ── */
function WeaponStats({ weaponId }: { weaponId: string }) {
  const weapon = WEAPONS[weaponId as keyof typeof WEAPONS];
  if (!weapon) return null;

  const statBars = [
    { label: 'DAMAGE', value: weapon.damage, max: 150, color: 'bg-red-500' },
    { label: 'RANGE', value: weapon.range, max: 40, color: 'bg-blue-500' },
    { label: 'FIRE RATE', value: 1 / Math.max(0.01, weapon.fireRate), max: 10, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 flex items-center gap-1.5">
          <Swords className="h-3.5 w-3.5 text-zinc-500" />
          {weapon.name}
        </span>
        <Badge variant="outline" className="text-[9px] h-4 border-zinc-700 text-zinc-500">
          {weapon.isRanged ? 'RANGED' : 'MELEE'}
        </Badge>
      </div>
      {statBars.map((stat) => (
        <div key={stat.label}>
          <div className="flex justify-between text-[9px] mb-0.5">
            <span className="text-zinc-600">{stat.label}</span>
          </div>
          <div className="h-1 bg-zinc-900/80 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${stat.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Pause Menu ── */
export default function PauseMenu() {
  const setPaused = useGameStore((s) => s.setPaused);
  const setScene = useGameStore((s) => s.setScene);
  const totalKills = useGameStore((s) => s.totalKills);
  const totalPlayTime = useGameStore((s) => s.totalPlayTime);
  const sessionStartTime = useGameStore((s) => s.sessionStartTime);
  const currentFloor = useGameStore((s) => s.currentFloor);

  const health = usePlayerStore((s) => s.health);
  const maxHealth = usePlayerStore((s) => s.maxHealth);
  const inventory = usePlayerStore((s) => s.inventory);
  const currentWeapon = usePlayerStore((s) => s.currentWeapon);
  const secondaryWeapon = usePlayerStore((s) => s.secondaryWeapon);
  const killsThisRun = usePlayerStore((s) => s.killsThisRun);
  const flashlightBattery = usePlayerStore((s) => s.flashlightBattery);
  const ammo = usePlayerStore((s) => s.ammo);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const elapsed = sessionStartTime
    ? (Date.now() - sessionStartTime) / 1000
    : 0;

  const weapon = WEAPONS[currentWeapon];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Scan line effect on entire overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-red-950/5 to-transparent"
          animate={{ y: ['-100%', '400%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg mx-4 relative z-10"
      >
        <Card className="bg-black/90 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
          {/* Top red accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-800/60 to-transparent" />

          {/* Title */}
          <div className="text-center mb-5">
            <motion.h2
              initial={{ letterSpacing: '0.8em', opacity: 0 }}
              animate={{ letterSpacing: '0.4em', opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-black tracking-[0.4em] text-red-500 horror-title"
            >
              PAUSED
            </motion.h2>
            <Separator className="mt-3 bg-zinc-800/60" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="text-center p-2 bg-zinc-900/50 rounded-sm border border-zinc-800/40">
              <Clock className="h-4 w-4 mx-auto text-zinc-600 mb-1" />
              <p className="text-[9px] text-zinc-600 tracking-wider">TIME</p>
              <p className="text-sm font-mono text-zinc-300">{formatTime(elapsed)}</p>
            </div>
            <div className="text-center p-2 bg-zinc-900/50 rounded-sm border border-zinc-800/40">
              <Skull className="h-4 w-4 mx-auto text-zinc-600 mb-1" />
              <p className="text-[9px] text-zinc-600 tracking-wider">KILLS</p>
              <p className="text-sm font-mono text-zinc-300">{killsThisRun}</p>
            </div>
            <div className="text-center p-2 bg-zinc-900/50 rounded-sm border border-zinc-800/40">
              <Package className="h-4 w-4 mx-auto text-zinc-600 mb-1" />
              <p className="text-[9px] text-zinc-600 tracking-wider">ITEMS</p>
              <p className="text-sm font-mono text-zinc-300">{inventory.length}</p>
            </div>
          </div>

          {/* Health Bar */}
          <PauseHealthBar health={health} maxHealth={maxHealth} />

          {/* Player Status */}
          <div className="mb-4 p-3 bg-zinc-900/30 rounded-sm border border-zinc-800/40">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600 flex items-center gap-1">
                  <Battery className="h-3 w-3" />Battery
                </span>
                <span className={`font-mono ${flashlightBattery < 20 ? 'text-yellow-500' : 'text-zinc-300'}`}>
                  {Math.ceil(flashlightBattery)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Floor</span>
                <span className="text-zinc-300 font-mono">{currentFloor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 flex items-center gap-1">
                  <Crosshair className="h-3 w-3" />Ammo
                </span>
                <span className={`font-mono ${ammo[currentWeapon] <= Math.ceil(weapon.ammoMax * 0.25) && weapon.ammoMax !== Infinity ? 'text-red-400' : 'text-zinc-300'}`}>
                  {ammo[currentWeapon] === Infinity ? '∞' : ammo[currentWeapon]}/{weapon.ammoMax === Infinity ? '∞' : weapon.ammoMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 flex items-center gap-1">
                  <Gauge className="h-3 w-3" />Speed
                </span>
                <span className="text-zinc-300 font-mono">Normal</span>
              </div>
            </div>
          </div>

          {/* Weapon Stats */}
          <div className="mb-4 p-3 bg-zinc-900/30 rounded-sm border border-zinc-800/40">
            <WeaponStats weaponId={currentWeapon} />
            {secondaryWeapon && (
              <div className="mt-3 pt-3 border-t border-zinc-800/40">
                <WeaponStats weaponId={secondaryWeapon} />
              </div>
            )}
          </div>

          {/* Inventory Quick View with Rarity Colors */}
          <div className="mb-5">
            <p className="text-[9px] text-zinc-600 mb-2 tracking-[0.2em] font-bold">INVENTORY</p>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const item = inventory[i];
                const rarity = item ? ITEM_RARITY[item.id] || 'common' : 'common';
                const rarityStyle = RARITY_COLORS[rarity];

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`aspect-square rounded-sm flex items-center justify-center text-lg ${rarityStyle.bg} ${rarityStyle.border} border relative overflow-hidden`}
                    style={{
                      boxShadow: item ? RARITY_GLOW[rarity] : 'none',
                    }}
                  >
                    {item ? (
                      <span title={`${item.name} (${rarity})`}>
                        {ITEM_ICONS[item.id] || '📦'}
                      </span>
                    ) : (
                      <span className="text-zinc-800 text-[8px]">{i + 1}</span>
                    )}
                    {/* Rarity indicator dot */}
                    {item && rarity !== 'common' && (
                      <div
                        className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${
                          rarity === 'legendary' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => setPaused(false)}
              className="bg-green-800 hover:bg-green-700 text-white font-bold tracking-[0.15em] h-11
                shadow-[0_0_10px_rgba(34,197,94,0.15)] hover:shadow-[0_0_15px_rgba(34,197,94,0.25)]
                transition-all duration-300 relative overflow-hidden"
            >
              <Play className="h-4 w-4 mr-2" />
              RESUME
            </Button>
            <Button
              onClick={() => setScene('settings')}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800/50
                font-bold tracking-[0.15em] h-11 transition-all duration-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              SETTINGS
            </Button>
            <Button
              onClick={() => {
                setPaused(false);
                setScene('mainMenu');
              }}
              variant="outline"
              className="border-red-900/40 text-red-400 hover:text-red-300 hover:bg-red-950/20
                font-bold tracking-[0.15em] h-11 transition-all duration-300
                shadow-[0_0_10px_rgba(220,38,38,0.05)] hover:shadow-[0_0_15px_rgba(220,38,38,0.1)]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              SAVE & QUIT
            </Button>
          </div>

          {/* Bottom hint */}
          <p className="text-[8px] text-zinc-700 text-center mt-3 font-mono">ESC to resume</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
