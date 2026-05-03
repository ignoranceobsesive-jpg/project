'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore, SURVIVORS, SurvivorId } from '@/stores/playerStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Swords, Heart, Zap, Shield, Star, Clock, Flame } from 'lucide-react';

const survivorIds: SurvivorId[] = ['marcus', 'elena', 'viktor', 'sara', 'dexter'];

const statConfig = [
  { key: 'maxHealth' as const, label: 'HEALTH', icon: Heart, gradientFrom: '#7f1d1d', gradientTo: '#ef4444', textColor: 'text-red-400', max: 150 },
  { key: 'speed' as const, label: 'SPEED', icon: Zap, gradientFrom: '#713f12', gradientTo: '#eab308', textColor: 'text-yellow-400', max: 10 },
  { key: 'damage' as const, label: 'DAMAGE', icon: Swords, gradientFrom: '#7c2d12', gradientTo: '#f97316', textColor: 'text-orange-400', max: 10 },
  { key: 'abilityPower' as const, label: 'ABILITY', icon: Star, gradientFrom: '#581c87', gradientTo: '#a855f7', textColor: 'text-purple-400', max: 10 },
];

/* ─── Typewriter hook ─── */
function useTypewriter(text: string, speed: number = 30, startDelay: number = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const start = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        timeout = setTimeout(start, speed);
      } else {
        setDone(true);
      }
    };
    timeout = setTimeout(start, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ─── Animated stat bar ─── */
function StatBar({
  label,
  value,
  max,
  icon: Icon,
  gradientFrom,
  gradientTo,
  textColor,
  delay,
}: {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  delay: number;
}) {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-[0.15em] text-zinc-400 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color: gradientTo }} />
          {label}
        </span>
        <span className={`font-mono text-sm font-bold tabular-nums ${textColor}`}
          style={{ textShadow: `0 0 8px ${gradientTo}40` }}
        >
          {value}
        </span>
      </div>
      <div className="relative h-3 bg-black/80 rounded-sm overflow-hidden border border-zinc-800/60">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${gradientTo}20 0px, ${gradientTo}20 1px, transparent 1px, transparent 8px)`,
          }}
        />
        <motion.div
          className="h-full rounded-sm relative"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 0 12px ${gradientTo}60, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {/* Scan line */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'hud-scan 2s linear infinite', animationDelay: `${delay}s` }}
            />
          </div>
          {/* Shimmer */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'blood-shimmer 2.5s ease-in-out infinite', animationDelay: `${delay + 0.5}s` }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Ember particles around portrait ─── */
function PortraitEmbers({ color }: { color: string }) {
  const embers = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: e.left,
            bottom: '-5px',
            width: e.size,
            height: e.size,
            background: `radial-gradient(circle, ${color}, ${color}88)`,
            boxShadow: `0 0 ${e.size * 2}px ${color}80`,
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
            opacity: [0, 0.8, 0.6, 0],
            scale: [1, 0.8, 0.3],
          }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Blood drip button effect ─── */
function BloodDripButton({ children, onClick, className }: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const drips = useMemo(() =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: `${15 + i * 14}%`,
      delay: i * 0.2,
      width: 1.5 + Math.random() * 2,
    })), []
  );

  return (
    <div className="relative group">
      <Button onClick={onClick} className={className}>
        {children}
      </Button>
      {/* Blood drips on hover */}
      <div className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        {drips.map((d) => (
          <motion.div
            key={d.id}
            className="absolute"
            style={{
              left: d.left,
              top: 0,
              width: d.width,
              borderRadius: '0 0 50% 50%',
              background: 'linear-gradient(to bottom, #8b0000, #5a0000, transparent)',
            }}
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: [0, 8, 16, 22], opacity: [0, 0.9, 0.7, 0] }}
            transition={{ duration: 1.5, delay: d.delay, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function CharacterSelect() {
  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const selectSurvivor = usePlayerStore((s) => s.selectSurvivor);
  const setScene = useGameStore((s) => s.setScene);

  const [hoveredId, setHoveredId] = useState<SurvivorId | null>(null);
  const [isReady, setIsReady] = useState(false);

  const selected = SURVIVORS[selectedSurvivor];

  /* Typewriter for ability description */
  const { displayed: abilityDesc, done: abilityDone } = useTypewriter(
    selected.abilityDescription, 22, 200
  );

  /* Entrance animation */
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* Select handler with reset */
  const handleSelect = useCallback((id: SurvivorId) => {
    if (id !== selectedSurvivor) {
      selectSurvivor(id);
    }
  }, [selectedSurvivor, selectSurvivor]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col eerie-bg select-none">

      {/* ═══ ATMOSPHERIC OVERLAYS ═══ */}
      <div className="film-grain-overlay" />
      <div className="scanline-overlay" />
      <div className="tv-static" />
      <div className="vignette-overlay" />

      {/* Blood drip at top */}
      <div className="blood-drip-overlay" />
      <div className="blood-drip-extra-1" />
      <div className="blood-drip-extra-2" />
      <div className="blood-drip-extra-3" />
      <div className="blood-drip-extra-4" />

      {/* Red fog at bottom */}
      <div className="fog-overlay" />

      {/* Smoke */}
      <div className="smoke-container">
        <div className="smoke-particle" />
        <div className="smoke-particle" />
        <div className="smoke-particle" />
        <div className="smoke-particle" />
        <div className="smoke-particle" />
        <div className="smoke-particle" />
      </div>

      {/* Blood Rain */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="blood-drop"
            style={{
              left: `${2 + i * 6.5}%`,
              height: `${10 + (i % 4) * 5}px`,
            }}
            animate={{
              y: ['-5vh', '105vh'],
              opacity: [0, 0.6, 0.4, 0],
            }}
            transition={{
              duration: 3.5 + (i % 3) * 1.2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 25% 40%, ${selected.color}12 0%, transparent 50%)`,
          }}
          animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 75% 60%, rgba(60, 0, 0, 0.12) 0%, transparent 50%)',
          }}
          animate={{ x: [15, -15, 15], y: [10, -10, 10] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ═══ HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
      >
        <Button
          variant="ghost"
          onClick={() => setScene('mainMenu')}
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-2 font-mono tracking-wider text-sm"
        >
          <ChevronLeft className="h-5 w-5" />
          BACK
        </Button>

        <h2
          className="glitch-subtitle text-base sm:text-lg md:text-xl font-black tracking-[0.3em] text-red-400"
          data-text="SELECT SURVIVOR"
        >
          SELECT SURVIVOR
        </h2>

        <div className="w-16 sm:w-20" />
      </motion.div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 sm:px-6 lg:px-8 min-h-0">

        {/* ─── LEFT: HERO PORTRAIT ─── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col items-center justify-center relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSurvivor}
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Glow ring behind portrait */}
              <motion.div
                className="absolute -inset-4 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse, ${selected.color}30 0%, ${selected.color}10 40%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Portrait container */}
              <div
                className="relative w-72 xl:w-80 aspect-[3/4] rounded-xl overflow-hidden"
                style={{
                  boxShadow: `0 0 40px ${selected.color}40, 0 0 80px ${selected.color}20, 0 0 2px ${selected.color}80, inset 0 0 60px rgba(0,0,0,0.5)`,
                  border: `2px solid ${selected.color}60`,
                }}
              >
                {/* Character portrait image */}
                <Image
                  src={`/images/characters/${selectedSurvivor}.png`}
                  alt={selected.name}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Dark gradient overlay at bottom for name */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Scan line effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute left-0 right-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${selected.color}80, ${selected.color}, ${selected.color}80, transparent)`,
                      boxShadow: `0 0 15px ${selected.color}, 0 0 30px ${selected.color}60`,
                    }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
                  }}
                />

                {/* Character name overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl xl:text-3xl font-black tracking-[0.2em]"
                    style={{
                      color: selected.color,
                      textShadow: `0 0 20px ${selected.color}80, 0 2px 4px rgba(0,0,0,0.8)`,
                    }}
                  >
                    {selected.name}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs tracking-[0.15em] text-zinc-400 font-mono mt-1"
                  >
                    {selected.role}
                  </motion.p>
                </div>

                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 rounded-tl-sm"
                  style={{ borderColor: selected.color }} />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr-sm"
                  style={{ borderColor: selected.color }} />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 rounded-bl-sm"
                  style={{ borderColor: selected.color }} />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 rounded-br-sm"
                  style={{ borderColor: selected.color }} />
              </div>

              {/* Ember particles */}
              <PortraitEmbers color={selected.color} />

              {/* "SURVIVOR FILE" label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left"
              >
                <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600">
                  SURVIVOR FILE // {selectedSurvivor.toUpperCase()}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ─── RIGHT: STATS + INFO ─── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-1 flex flex-col gap-4 lg:gap-5 min-h-0 overflow-y-auto dark-scrollbar pb-2"
        >
          {/* Mobile portrait + name (shown only on mobile/tablet) */}
          <div className="lg:hidden flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSurvivor}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  border: `2px solid ${selected.color}80`,
                  boxShadow: `0 0 20px ${selected.color}30`,
                }}
              >
                <Image
                  src={`/images/characters/${selectedSurvivor}.png`}
                  alt={selected.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div>
              <h3
                className="text-xl sm:text-2xl font-black tracking-[0.15em]"
                style={{
                  color: selected.color,
                  textShadow: `0 0 15px ${selected.color}60`,
                }}
              >
                {selected.name}
              </h3>
              <p className="text-xs text-zinc-500 font-mono tracking-wider mt-0.5">{selected.role}</p>
            </div>
          </div>

          {/* Stats Panel */}
          <div
            className="rounded-xl p-4 sm:p-5 border backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(10,5,5,0.6))',
              borderColor: `${selected.color}25`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4" style={{ color: selected.color }} />
              <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Combat Statistics</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>

            <div className="space-y-3.5">
              {statConfig.map((stat, i) => (
                <StatBar
                  key={stat.key}
                  label={stat.label}
                  value={selected[stat.key]}
                  max={stat.max}
                  icon={stat.icon}
                  gradientFrom={stat.gradientFrom}
                  gradientTo={stat.gradientTo}
                  textColor={stat.textColor}
                  delay={0.3 + i * 0.15}
                />
              ))}
            </div>
          </div>

          {/* Ability & Passive */}
          <div
            className="rounded-xl p-4 sm:p-5 border backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(10,5,5,0.6))',
              borderColor: `${selected.color}25`,
            }}
          >
            {/* Ability */}
            <div className="mb-4">
              <Badge
                className="mb-2 text-[10px] tracking-[0.15em] font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))',
                  color: '#fb923c',
                  border: '1px solid rgba(249,115,22,0.3)',
                  boxShadow: '0 0 12px rgba(249,115,22,0.15)',
                }}
              >
                <Flame className="h-3 w-3 mr-1" />
                ABILITY
              </Badge>
              <h4
                className="text-sm font-black tracking-[0.12em] text-orange-300 mb-1.5"
                style={{ textShadow: '0 0 10px rgba(249,115,22,0.3)' }}
              >
                {selected.abilityName}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed min-h-[2.5em]">
                {abilityDesc}
                {!abilityDone && (
                  <span className="inline-block w-[2px] h-3.5 bg-orange-400 ml-0.5 align-middle"
                    style={{ animation: 'cursor-blink 0.7s step-end infinite' }}
                  />
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-3 w-3 text-zinc-600" />
                <span className="text-[10px] font-mono text-zinc-600 tracking-wider">
                  COOLDOWN: <span className="text-zinc-400">{selected.abilityCooldown}s</span>
                </span>
              </div>
            </div>

            {/* Passive */}
            <div>
              <Badge
                className="mb-2 text-[10px] tracking-[0.15em] font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.08))',
                  color: '#4ade80',
                  border: '1px solid rgba(34,197,94,0.25)',
                  boxShadow: '0 0 12px rgba(34,197,94,0.1)',
                }}
              >
                <Zap className="h-3 w-3 mr-1" />
                PASSIVE
              </Badge>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selected.passiveDescription}
              </p>
            </div>
          </div>

          {/* Backstory */}
          <div
            className="rounded-xl p-4 sm:p-5 border backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(20,10,5,0.7), rgba(15,8,4,0.6))',
              borderColor: 'rgba(139,69,19,0.15)',
            }}
          >
            {/* Parchment-like texture overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139,69,19,0.1) 2px, rgba(139,69,19,0.1) 4px)`,
              }}
            />

            <Badge
              variant="outline"
              className="mb-2 text-[10px] tracking-[0.15em] font-bold border-zinc-700/50 text-zinc-500"
            >
              BACKSTORY
            </Badge>
            <ScrollArea className="h-16 sm:h-20">
              <p className="text-[11px] sm:text-xs text-zinc-500 italic leading-relaxed pr-2">
                &ldquo;{selected.backstory}&rdquo;
              </p>
            </ScrollArea>
          </div>

          {/* START GAME Button */}
          <div className="flex justify-center pt-1 pb-2">
            <BloodDripButton
              onClick={() => setScene('gameplay')}
              className="relative bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800
                text-white font-black tracking-[0.25em] text-base sm:text-lg
                px-10 sm:px-14 h-13 sm:h-14
                border-2 border-red-600/50 hover:border-red-500/70
                shadow-[0_0_25px_rgba(220,38,38,0.4),0_0_50px_rgba(220,38,38,0.15)]
                hover:shadow-[0_0_35px_rgba(220,38,38,0.6),0_0_70px_rgba(220,38,38,0.25)]
                transition-all duration-300 overflow-hidden rounded-lg"
            >
              {/* Pulsing glow behind button */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  boxShadow: '0 0 30px rgba(220,38,38,0.3), 0 0 60px rgba(220,38,38,0.1)',
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Blood shimmer sweep */}
              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <motion.div
                  className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-red-400/20 to-transparent"
                  animate={{ x: ['-100px', '500px'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />
              </div>

              <span className="relative flex items-center gap-3 z-10">
                <Swords className="h-5 w-5" />
                START GAME
              </span>
            </BloodDripButton>
          </div>
        </motion.div>
      </div>

      {/* ═══ BOTTOM: CHARACTER CARDS ROW ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-20 px-4 sm:px-6 lg:px-8 pb-4 pt-2"
      >
        {/* Top border glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${selected.color}40, ${selected.color}20, transparent)`,
          }}
        />

        <div className="flex gap-3 sm:gap-4 justify-center overflow-x-auto dark-scrollbar pb-1">
          {survivorIds.map((id, index) => {
            const s = SURVIVORS[id];
            const isSelected = id === selectedSurvivor;
            const isHovered = id === hoveredId;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.08, duration: 0.4 }}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSelect(id)}
                className="cursor-pointer flex-shrink-0"
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1.05 : isHovered ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    width: 'clamp(80px, 15vw, 120px)',
                    border: isSelected
                      ? `2px solid ${s.color}`
                      : `1px solid rgba(63,63,70,0.5)`,
                    boxShadow: isSelected
                      ? `0 0 20px ${s.color}40, 0 0 40px ${s.color}15, inset 0 0 20px ${s.color}10`
                      : isHovered
                        ? `0 0 12px ${s.color}20`
                        : 'none',
                  }}
                >
                  {/* Portrait image */}
                  <div className="relative w-full aspect-[3/4]">
                    <Image
                      src={`/images/characters/${id}.png`}
                      alt={s.name}
                      fill
                      className="object-cover"
                      style={{
                        filter: isSelected ? 'brightness(1.1)' : isHovered ? 'brightness(0.9)' : 'brightness(0.5)',
                      }}
                    />

                    {/* Dark overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isSelected
                          ? `linear-gradient(to top, ${s.color}30 0%, transparent 60%)`
                          : isHovered
                            ? 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                            : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
                      }}
                    />

                    {/* Selected pulsing border effect */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          border: `1px solid ${s.color}`,
                          boxShadow: `inset 0 0 15px ${s.color}20`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    {/* Color accent bar at top */}
                    <div
                      className="absolute top-0 inset-x-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    />

                    {/* Name + role at bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 text-center">
                      <p
                        className="text-[10px] sm:text-xs font-black tracking-[0.12em] leading-tight"
                        style={{
                          color: isSelected ? s.color : '#d4d4d8',
                          textShadow: isSelected ? `0 0 8px ${s.color}60` : '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {s.name}
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-wider mt-0.5">
                        {s.role.split('(')[0].trim()}
                      </p>
                    </div>

                    {/* SELECTED badge */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-1 -right-1 z-10"
                        >
                          <Badge
                            className="text-[8px] sm:text-[9px] font-black tracking-wider px-1.5 py-0 h-4 sm:h-5"
                            style={{
                              background: s.color,
                              color: '#fff',
                              boxShadow: `0 0 8px ${s.color}60`,
                            }}
                          >
                            SELECTED
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mini stat bars at very bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 space-y-0.5 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6))' }}
                    >
                      {statConfig.map((stat) => (
                        <div key={stat.key} className="flex items-center gap-1">
                          <stat.icon className="h-2 w-2 flex-shrink-0" style={{ color: stat.gradientTo }} />
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                width: `${(s[stat.key] / stat.max) * 100}%`,
                                background: `linear-gradient(90deg, ${stat.gradientFrom}, ${stat.gradientTo})`,
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(s[stat.key] / stat.max) * 100}%` }}
                              transition={{ duration: 0.6, delay: index * 0.08 + 0.5 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
