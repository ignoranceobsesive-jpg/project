'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEconomyStore, COIN_REWARDS } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skull, RotateCcw, Home, Tv, Coins, Clock, Swords } from 'lucide-react';

/* ── Horror Quotes ── */
const LAST_WORDS = [
  '"The dead don\'t stay dead in this place."',
  '"Every hallway leads to the same end."',
  '"You can\'t outrun what\'s already inside."',
  '"The note was never meant for the living."',
  '"There is no exit. There never was."',
  '"The building remembers everyone who dies here."',
  '"Your blood just feeds what comes next."',
  '"Death isn\'t the end. It\'s the invitation."',
  '"They whisper your name in the dark."',
  '"The apocalypse was always personal."',
];

/* ── Count-up Number ── */
function CountUp({ target, duration = 1500, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 30;
    const stepTime = duration / steps;
    let val = 0;
    const increment = target / steps;

    const interval = setInterval(() => {
      val += increment;
      if (val >= target) {
        setCurrent(target);
        clearInterval(interval);
      } else {
        setCurrent(Math.floor(val));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [target, duration]);

  return <>{current}{suffix}</>;
}

/* ── Blood Veins Background ── */
function BloodVeins() {
  const veins = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    height: 30 + Math.random() * 60,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {veins.map((v) => (
        <motion.div
          key={v.id}
          className="absolute bottom-0 w-[2px]"
          style={{ left: `${v.x}%` }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${v.height}%`, opacity: 0.3 }}
          transition={{ delay: v.delay, duration: v.duration, ease: 'easeOut' }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to top, rgba(139,0,0,0.6), rgba(100,0,0,0.3), transparent)',
              filter: 'blur(1px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Screen Cracks ── */
function ScreenCracks() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      <motion.path
        d="M200,0 L210,80 L180,150 L220,250 L200,400"
        fill="none" stroke="rgba(139,0,0,0.4)" strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.path
        d="M210,80 L280,120 L350,110"
        fill="none" stroke="rgba(139,0,0,0.3)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      <motion.path
        d="M180,150 L120,180 L50,200"
        fill="none" stroke="rgba(139,0,0,0.3)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
      <motion.path
        d="M220,250 L300,280 L360,320"
        fill="none" stroke="rgba(139,0,0,0.25)" strokeWidth="0.8"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />
    </svg>
  );
}

/* ── Blood Splatter ── */
function BloodSplatter() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 1 }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
        style={{
          background: `radial-gradient(ellipse at center,
            rgba(120,0,0,0.3) 0%,
            rgba(80,0,0,0.15) 20%,
            rgba(40,0,0,0.05) 40%,
            transparent 60%)`,
        }}
      />
    </motion.div>
  );
}

/* ── 3D Skull Icon ── */
function Skull3D() {
  return (
    <div className="relative inline-block">
      <Skull
        className="h-16 w-16 text-red-500"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(220,38,38,0.4))',
          transform: 'perspective(200px) rotateY(-5deg) rotateX(5deg)',
        }}
      />
      {/* Subtle glow behind */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)',
          transform: 'scale(1.5)',
        }}
      />
    </div>
  );
}

/* ── Main Death Screen ── */
export default function DeathScreen() {
  const setScene = useGameStore((s) => s.setScene);
  const endSession = useGameStore((s) => s.endSession);
  const resetGame = useGameStore((s) => s.resetGame);
  const totalDeaths = useGameStore((s) => s.totalDeaths);
  const totalPlayTime = useGameStore((s) => s.totalPlayTime);

  const killsThisRun = usePlayerStore((s) => s.killsThisRun);
  const coinsThisRun = usePlayerStore((s) => s.coinsThisRun);
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);
  const revive = usePlayerStore((s) => s.revive);
  const sessionStartTime = useGameStore((s) => s.sessionStartTime);

  const addCoins = useEconomyStore((s) => s.addCoins);
  const canWatchAd = useEconomyStore((s) => s.canWatchAd);
  const watchAd = useEconomyStore((s) => s.watchAd);

  const [showContent, setShowContent] = useState(false);
  const [flashVisible, setFlashVisible] = useState(true);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [statIndex, setStatIndex] = useState(-1);

  const elapsed = sessionStartTime
    ? (Date.now() - sessionStartTime) / 1000
    : 0;

  const totalPlaytimeMinutes = Math.floor((totalPlayTime + elapsed) / 60);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const lastWords = LAST_WORDS[Math.floor(Math.random() * LAST_WORDS.length)];

  useEffect(() => {
    // Screen shake on death
    setShakeIntensity(10);
    const shakeTimer = setTimeout(() => setShakeIntensity(0), 400);
    // Red flash
    const flashTimer = setTimeout(() => setFlashVisible(false), 300);
    // Content appears
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      // Stagger stats
      let i = 0;
      const statInterval = setInterval(() => {
        setStatIndex(i);
        i++;
        if (i > 5) clearInterval(statInterval);
      }, 200);
      return () => clearInterval(statInterval);
    }, 800);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(flashTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleRetry = () => {
    resetPlayer();
    addCoins(coinsThisRun);
    setScene('gameplay');
  };

  const handleMainMenu = () => {
    addCoins(coinsThisRun);
    endSession();
    resetGame();
    setScene('mainMenu');
  };

  const handleWatchAd = () => {
    if (watchAd()) {
      revive(0.5);
      setScene('gameplay');
    }
  };

  const stats = [
    { label: 'KILLS', value: killsThisRun, icon: <Swords className="h-4 w-4 text-red-500" />, color: 'text-red-400' },
    { label: 'SURVIVED', value: formatTime(elapsed), icon: <Clock className="h-4 w-4 text-red-500" />, color: 'text-red-400', isText: true },
    { label: 'EARNED', value: coinsThisRun, icon: <Coins className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-400', suffix: ' 🪙' },
    { label: 'TOTAL TIME', value: `${totalPlaytimeMinutes}m`, icon: <Clock className="h-4 w-4 text-zinc-500" />, color: 'text-zinc-400', isText: true },
    { label: 'DEATHS', value: totalDeaths + 1, icon: <Skull className="h-4 w-4 text-zinc-500" />, color: 'text-zinc-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Red flash */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-red-900/80"
          />
        )}
      </AnimatePresence>

      {/* Dark background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 2, 2, 0.97)' }}
      />

      {/* Blood veins */}
      {showContent && <BloodVeins />}

      {/* Screen cracks */}
      {showContent && <ScreenCracks />}

      {/* Blood splatter */}
      <BloodSplatter />

      {/* Blood drip overlay */}
      <div className="blood-drip-overlay" />

      {/* Content */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            x: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity/2, shakeIntensity/2, 0] : 0,
          }}
          transition={{ duration: 0.6 }}
          className="relative z-30 w-full max-w-md mx-4"
        >
          <Card className="bg-black/85 border border-red-900/50 p-6 sm:p-8 text-center relative overflow-hidden backdrop-blur-sm">
            {/* Red pulse wave from top */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-red-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />

            {/* YOU DIED - Slam in with screen shake */}
            <div className="mb-6">
              {/* 3D Skull */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-3"
              >
                <Skull3D />
              </motion.div>

              {/* YOU DIED text - slamming in */}
              <motion.h1
                initial={{ scale: 4, opacity: 0, letterSpacing: '0.1em' }}
                animate={{ scale: 1, opacity: 1, letterSpacing: '0.3em' }}
                transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                className="text-5xl sm:text-6xl font-black text-red-600 relative"
                style={{
                  textShadow: '0 0 20px rgba(200,0,0,0.8), 0 0 60px rgba(180,0,0,0.4), 0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                YOU DIED
              </motion.h1>

              {/* Dripping blood effect under text */}
              <motion.div
                className="flex justify-center gap-3 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] rounded-b-full"
                    style={{ background: 'linear-gradient(to bottom, #8b0000, #4a0000, transparent)' }}
                    initial={{ height: 0 }}
                    animate={{ height: [0, 12 + i * 4, 8 + i * 3] }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 1.5, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Last Words */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-xs text-zinc-600 italic mb-5 font-mono px-4"
            >
              {lastWords}
            </motion.p>

            {/* Stats - animate one by one */}
            <div className="space-y-2 mb-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={statIndex >= i ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2.5 bg-red-950/20 rounded-sm border border-red-900/20"
                >
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-[10px] text-zinc-500 tracking-wider">{stat.label}</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${stat.color}`}>
                    {stat.isText ? (
                      stat.value
                    ) : (
                      <CountUp target={stat.value as number} suffix={stat.suffix || ''} />
                    )}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Watch Ad to Revive - Golden glow pulse */}
            <motion.div
              animate={{ boxShadow: canWatchAd() ? [
                '0 0 10px rgba(234,179,8,0.2)',
                '0 0 25px rgba(234,179,8,0.5), 0 0 50px rgba(234,179,8,0.2)',
                '0 0 10px rgba(234,179,8,0.2)',
              ] : 'none' }}
              transition={{ duration: 2, repeat: Infinity }}
              className="rounded mb-3"
            >
              <Button
                onClick={handleWatchAd}
                disabled={!canWatchAd()}
                className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-900/60 via-yellow-800/50 to-yellow-900/60
                  hover:from-yellow-800/70 hover:via-yellow-700/60 hover:to-yellow-800/70
                  text-yellow-300 font-bold tracking-[0.1em] h-12 border border-yellow-700/40
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Tv className="h-4 w-4 mr-2" />
                WATCH AD TO REVIVE
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/10 to-yellow-600/0 animate-shimmer" />
              </Button>
            </motion.div>

            {/* Retry - Blood drip border */}
            <div className="relative mb-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-red-900/50 hover:bg-red-800/60 text-red-300
                  font-bold tracking-[0.15em] h-11 border border-red-800/40 relative overflow-hidden"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                RETRY
              </Button>
              {/* Blood drip bottom border */}
              <div className="absolute -bottom-1 left-0 right-0 flex justify-around">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-b-full bg-red-800/60"
                    style={{ height: `${3 + (i % 3) * 2}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Main Menu */}
            <div className="relative">
              <Button
                onClick={handleMainMenu}
                variant="outline"
                className="w-full border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-bold tracking-[0.15em] h-11"
              >
                <Home className="h-4 w-4 mr-2" />
                MAIN MENU
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
