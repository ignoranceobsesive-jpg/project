'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEconomyStore } from '@/stores/economyStore';
import { useApocalypsePassStore } from '@/stores/apocalypsePassStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Skull, Clock, Package, Coins, Star, Sparkles, Zap } from 'lucide-react';

/* ── Rank System ── */
function getRank(kills: number, time: number, items: number): { rank: string; color: string; glow: string } {
  const score = kills * 10 + items * 5 + Math.max(0, 600 - time);
  if (score >= 800) return { rank: 'S', color: '#facc15', glow: '0 0 30px rgba(234,179,8,0.6)' };
  if (score >= 500) return { rank: 'A', color: '#a78bfa', glow: '0 0 20px rgba(167,139,250,0.4)' };
  if (score >= 300) return { rank: 'B', color: '#60a5fa', glow: '0 0 15px rgba(96,165,250,0.3)' };
  if (score >= 150) return { rank: 'C', color: '#4ade80', glow: '0 0 10px rgba(74,222,128,0.2)' };
  return { rank: 'D', color: '#a1a1aa', glow: 'none' };
}

/* ── Floating Light Particles ── */
function FloatingParticles() {
  const particles = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
      size: 2 + Math.random() * 3,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(234,179,8,0.4)',
            boxShadow: '0 0 6px rgba(234,179,8,0.3)',
          }}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '-10%', opacity: [0, 0.8, 0.8, 0] }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/* ── Coin Rain ── */
function CoinRain() {
  const coins = useMemo(
    () => Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      delay: Math.random() * 1.5,
      rotation: Math.random() * 360,
      duration: 1.5 + Math.random() * 1.5,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {coins.map((c) => (
        <motion.div
          key={c.id}
          className="absolute text-lg"
          style={{ left: `${c.x}%` }}
          initial={{ y: '-5%', opacity: 0, rotate: 0 }}
          animate={{ y: '110%', opacity: [0, 1, 1, 0], rotate: c.rotation + 720 }}
          transition={{
            delay: c.delay,
            duration: c.duration,
            ease: 'easeIn',
          }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

/* ── Spinning Trophy with Sparkles ── */
function SpinningTrophy() {
  const sparkles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i / 6) * Math.PI * 2,
      delay: i * 0.3,
    })),
    []
  );

  return (
    <div className="relative inline-block">
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Trophy
          className="h-14 w-14 text-yellow-400"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(234,179,8,0.5)) drop-shadow(0 0 30px rgba(234,179,8,0.3))',
          }}
        />
      </motion.div>

      {/* Sparkle particles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute top-1/2 left-1/2"
          animate={{
            x: [0, Math.cos(s.angle) * 30],
            y: [0, Math.sin(s.angle) * 30],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            delay: s.delay,
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Sparkles className="h-3 w-3 text-yellow-300" />
        </motion.div>
      ))}
    </div>
  );
}

/* ── 3D Flip Stat Card ── */
function FlipStatCard({
  icon, label, value, delay, isAnimated = false
}: {
  icon: React.ReactNode; label: string; value: string | number;
  delay: number; isAnimated?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [displayValue, setDisplayValue] = useState(isAnimated ? 0 : value);

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), delay);
    return () => clearTimeout(flipTimer);
  }, [delay]);

  // Count-up for animated values
  useEffect(() => {
    if (!flipped || !isAnimated || typeof value !== 'number') return;
    const target = value as number;
    const steps = 20;
    const stepTime = 50;
    let current = 0;
    const increment = target / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [flipped, isAnimated, value]);

  return (
    <div className="perspective-1000">
      <motion.div
        initial={{ rotateX: 90, opacity: 0 }}
        animate={flipped ? { rotateX: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        className="p-3 bg-yellow-950/20 rounded-sm border border-yellow-800/30 relative overflow-hidden"
      >
        {/* Shine effect on flip */}
        {flipped && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        )}
        <div className="relative z-10">
          {icon}
          <p className="text-[9px] text-zinc-500 mt-1 tracking-wider">{label}</p>
          <p className="text-xl font-mono font-bold text-yellow-400">{displayValue}</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Animated Progress Bar with Particle Burst ── */
function XPProgressBar({
  progress, currentXP, requiredXP, animatedXP, xpEarned
}: {
  progress: number; currentXP: number; requiredXP: number;
  animatedXP: number; xpEarned: number;
}) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setComplete(true), 100);
      const resetTimer = setTimeout(() => setComplete(false), 2100);
      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [progress]);

  return (
    <div className="relative">
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-400 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 2, ease: 'easeOut', delay: 1.5 }}
          style={{ boxShadow: '0 0 8px rgba(234,179,8,0.4)' }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {/* Particle burst on completion */}
      <AnimatePresence>
        {complete && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-400"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 30,
                  y: Math.sin((i / 8) * Math.PI * 2) * 30,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-zinc-600">+{animatedXP} XP earned</span>
        <span className="text-[10px] text-zinc-500">{currentXP}/{requiredXP} XP</span>
      </div>
    </div>
  );
}

/* ── Main Victory Screen ── */
export default function VictoryScreen() {
  const setScene = useGameStore((s) => s.setScene);
  const endSession = useGameStore((s) => s.endSession);
  const resetGame = useGameStore((s) => s.resetGame);
  const totalKills = useGameStore((s) => s.totalKills);
  const sessionStartTime = useGameStore((s) => s.sessionStartTime);
  const floorData = useGameStore((s) => s.floorData);
  const totalPlayTime = useGameStore((s) => s.totalPlayTime);

  const killsThisRun = usePlayerStore((s) => s.killsThisRun);
  const coinsThisRun = usePlayerStore((s) => s.coinsThisRun);
  const inventory = usePlayerStore((s) => s.inventory);
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);

  const addCoins = useEconomyStore((s) => s.addCoins);
  const deathCoins = useEconomyStore((s) => s.deathCoins);

  const passLevel = useApocalypsePassStore((s) => s.currentLevel);
  const passXP = useApocalypsePassStore((s) => s.currentXP);
  const getXpForLevel = useApocalypsePassStore((s) => s.getXpForLevel);
  const addXP = useApocalypsePassStore((s) => s.addXP);
  const isPremium = useApocalypsePassStore((s) => s.isPremium);

  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showCoinRain, setShowCoinRain] = useState(false);

  const elapsed = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const totalItemsFound = Object.values(floorData).reduce((sum, f) => sum + f.itemsFound, 0);
  const totalNotesFound = Object.values(floorData).reduce((sum, f) => sum + f.notesFound, 0);

  const xpEarned = totalKills * 5 + 300;
  const xpForNextLevel = getXpForLevel(passLevel);
  const xpProgress = (passXP / xpForNextLevel) * 100;

  // Rank calculation
  const rankData = getRank(killsThisRun, elapsed, totalItemsFound);

  // New record check (simplified - if kills > previous best)
  const isNewRecord = killsThisRun > 20; // Simplified threshold

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setShowCoinRain(true);
      setTimeout(() => setShowCoinRain(false), 3000);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animate coins
  useEffect(() => {
    if (!showContent) return;
    const duration = 2000;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = coinsThisRun / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= coinsThisRun) {
        setAnimatedCoins(coinsThisRun);
        clearInterval(interval);
      } else {
        setAnimatedCoins(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [showContent, coinsThisRun]);

  // Animate XP
  useEffect(() => {
    if (!showContent) return;
    const duration = 2500;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;
    const increment = xpEarned / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setAnimatedXP(xpEarned);
        addXP(xpEarned);
        clearInterval(interval);
      } else {
        setAnimatedXP(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [showContent, xpEarned, addXP]);

  const handleContinue = () => {
    addCoins(coinsThisRun);
    endSession();
    resetPlayer();
    resetGame();
    setScene('mainMenu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Golden radial gradient background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(180,120,20,0.25) 0%, rgba(5,2,2,0.97) 70%)',
        }}
      />

      {/* Light rays */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.5, duration: 2 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-top"
            style={{
              width: '2px',
              height: '50vh',
              background: 'linear-gradient(to bottom, rgba(234,179,8,0.3), transparent)',
              transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </motion.div>

      {/* Floating light particles */}
      <FloatingParticles />

      {/* Coin rain */}
      {showCoinRain && <CoinRain />}

      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-lg mx-4"
        >
          <Card className="bg-black/85 border border-yellow-700/50 p-6 sm:p-8 text-center relative overflow-hidden backdrop-blur-sm">
            {/* Golden pulse wave */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ transformOrigin: 'center' }}
            />

            {/* Spinning Trophy */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <SpinningTrophy />
            </motion.div>

            {/* SURVIVED title with golden glow */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-2"
            >
              <h1
                className="text-5xl sm:text-6xl font-black tracking-[0.4em] text-yellow-400"
                style={{
                  textShadow: '0 0 40px rgba(234,179,8,0.5), 0 0 80px rgba(234,179,8,0.2), 0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                SURVIVED
              </h1>
            </motion.div>

            {/* Rank Display */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 15 }}
              className="mb-4 inline-block"
            >
              <div
                className="text-4xl font-black px-4 py-1 rounded-sm border-2"
                style={{
                  color: rankData.color,
                  borderColor: rankData.color,
                  boxShadow: rankData.glow,
                  textShadow: rankData.glow,
                }}
              >
                {rankData.rank}
              </div>
            </motion.div>

            {/* NEW RECORD badge */}
            <AnimatePresence>
              {isNewRecord && (
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.2, type: 'spring', stiffness: 400, damping: 15 }}
                  className="mb-4"
                >
                  <span
                    className="inline-block px-4 py-1 rounded-sm text-xs font-black tracking-[0.3em] bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                    style={{
                      boxShadow: '0 0 15px rgba(234,179,8,0.3)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    ★ NEW RECORD ★
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats - 3D card flip */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <FlipStatCard
                icon={<Skull className="h-5 w-5 mx-auto text-yellow-600" />}
                label="TOTAL KILLS"
                value={totalKills}
                delay={1000}
                isAnimated
              />
              <FlipStatCard
                icon={<Clock className="h-5 w-5 mx-auto text-yellow-600" />}
                label="TIME"
                value={formatTime(elapsed)}
                delay={1200}
              />
              <FlipStatCard
                icon={<Package className="h-5 w-5 mx-auto text-yellow-600" />}
                label="ITEMS"
                value={totalItemsFound}
                delay={1400}
                isAnimated
              />
              <FlipStatCard
                icon={<Coins className="h-5 w-5 mx-auto text-yellow-500" />}
                label="DEATH COINS"
                value={animatedCoins}
                delay={1600}
              />
            </div>

            {/* Apocalypse Pass XP */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="mb-6 p-4 bg-zinc-900/40 rounded-sm border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-400 font-bold">APOCALYPSE PASS</span>
                </div>
                <span className="text-xs text-zinc-500">
                  Level {passLevel} {isPremium ? '(Premium)' : ''}
                </span>
              </div>
              <XPProgressBar
                progress={xpProgress}
                currentXP={passXP}
                requiredXP={xpForNextLevel}
                animatedXP={animatedXP}
                xpEarned={xpEarned}
              />
            </motion.div>

            {/* Continue button - golden glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(234,179,8,0.3)',
                  '0 0 40px rgba(234,179,8,0.5), 0 0 60px rgba(234,179,8,0.2)',
                  '0 0 20px rgba(234,179,8,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="rounded"
            >
              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700
                  hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-600
                  text-black font-bold tracking-[0.2em] h-12
                  transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">CONTINUE</span>
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
