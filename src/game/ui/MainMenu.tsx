'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useEconomyStore } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Coins, Play, RotateCcw, Users, ShoppingBag, Crown, Settings } from 'lucide-react';

const menuItems = [
  { id: 'play', label: 'PLAY', icon: Play, scene: 'characterSelect' as const },
  { id: 'continue', label: 'CONTINUE', icon: RotateCcw, scene: 'gameplay' as const },
  { id: 'multiplayer', label: 'MULTIPLAYER', icon: Users, scene: 'multiplayer' as const },
  { id: 'shop', label: 'SHOP', icon: ShoppingBag, scene: 'shop' as const },
  { id: 'pass', label: 'APOCALYPSE PASS', icon: Crown, scene: 'apocalypsePass' as const },
  { id: 'settings', label: 'SETTINGS', icon: Settings, scene: 'settings' as const },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 2.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

/* Typewriter hook */
function useTypewriter(text: string, delay: number, startDelay: number) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const start = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        timeout = setTimeout(start, delay);
      } else {
        setDone(true);
      }
    };
    timeout = setTimeout(start, startDelay);
    return () => clearTimeout(timeout);
  }, [text, delay, startDelay]);

  return { displayed, done };
}

/* Letter-by-letter slam for title */
function TitleLetters({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: -80, scale: 2.5, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{
            delay: 0.4 + i * 0.07,
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function MainMenu() {
  const setScene = useGameStore((s) => s.setScene);
  const deathCoins = useEconomyStore((s) => s.deathCoins);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const { displayed: subtitleText, done: subtitleDone } = useTypewriter('APOCALYPSE', 90, 1.5);

  /* Fake atmospheric loading bar */
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Eased progress for dramatic feel */
      const eased = 1 - Math.pow(1 - progress, 3);
      setLoadingProgress(eased * 100);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setLoadingDone(true);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Screen shake on title entrance */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const handleHoverStart = useCallback((id: string) => {
    setHoveredBtn(id);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredBtn(null);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center eerie-bg ${shaking ? 'screen-shake-heavy' : ''}`}
    >
      {/* ===== ATMOSPHERIC OVERLAYS ===== */}

      {/* Film grain */}
      <div className="film-grain-overlay" />

      {/* Scanlines */}
      <div className="scanline-overlay" />

      {/* TV static */}
      <div className="tv-static" />

      {/* Vignette */}
      <div className="vignette-overlay" />

      {/* Heartbeat pulse */}
      <div className="heartbeat-pulse" />

      {/* Blood drip at top */}
      <div className="blood-drip-overlay" />
      <div className="blood-drip-extra-1" />
      <div className="blood-drip-extra-2" />
      <div className="blood-drip-extra-3" />
      <div className="blood-drip-extra-4" />

      {/* Fog at bottom */}
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

      {/* Embers */}
      <div className="ember-container">
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
        <div className="ember" />
      </div>

      {/* ===== BLOOD RAIN ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="blood-drop"
            style={{
              left: `${3 + i * 5}%`,
              height: `${12 + (i % 4) * 6}px`,
            }}
            animate={{
              y: ['-5vh', '105vh'],
              opacity: [0, 0.7, 0.5, 0],
            }}
            transition={{
              duration: 4 + (i % 3) * 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* ===== BACKGROUND GRADIENT SHIFTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(60, 0, 0, 0.15) 0%, transparent 50%)',
          }}
          animate={{
            x: [-20, 20, -20],
            y: [-10, 10, -10],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 70%, rgba(40, 0, 20, 0.12) 0%, transparent 50%)',
          }}
          animate={{
            x: [20, -20, 20],
            y: [10, -10, 10],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(80, 10, 0, 0.08) 0%, transparent 40%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ===== LOADING SCREEN ===== */}
      <AnimatePresence>
        {!loadingDone && (
          <motion.div
            className="absolute inset-0 z-[10000] flex flex-col items-center justify-center"
            style={{ backgroundColor: 'rgba(2, 0, 0, 0.98)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="font-mono text-red-900 text-sm tracking-[0.3em] mb-6"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              INITIALIZING
            </motion.p>
            <div className="w-64 h-2 blood-progress-bar rounded-sm">
              <motion.div
                className="h-full rounded-sm relative"
                style={{
                  width: `${loadingProgress}%`,
                  background: 'linear-gradient(90deg, #4a0000, #8b0000, #b30000, #8b0000)',
                  boxShadow: '0 0 10px rgba(139, 0, 0, 0.5), inset 0 0 4px rgba(255, 50, 50, 0.2)',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <motion.p
              className="font-mono text-red-950 text-xs mt-3 tracking-widest"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.floor(loadingProgress)}%
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DEATH COINS - TOP RIGHT ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2.5, duration: 0.6, ease: 'easeOut' }}
        className="absolute top-5 right-5 sm:top-6 sm:right-6 z-[70]"
      >
        <div className="relative flex items-center gap-2.5 rounded-lg bg-black/70 px-4 py-2.5 border border-yellow-600/30 backdrop-blur-sm">
          {/* Golden sparkles */}
          <div className="golden-sparkle" />
          <div className="golden-sparkle" />
          <div className="golden-sparkle" />
          <div className="golden-sparkle" />
          <div className="golden-sparkle" />

          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ perspective: 100 }}
          >
            <Coins className="h-5 w-5 text-yellow-500 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
          </motion.div>
          <span className="font-mono text-yellow-400 text-lg font-bold drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">
            {deathCoins}
          </span>
        </div>
      </motion.div>

      {/* ===== TITLE AREA ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-10 sm:mb-12 text-center relative z-10"
      >
        {/* Ambient sound rings around title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="sound-ring" style={{ width: 280, height: 280 }} />
          <div className="sound-ring" style={{ width: 280, height: 280 }} />
          <div className="sound-ring" style={{ width: 280, height: 280 }} />
        </div>

        {/* Main title with letter-by-letter slam + god-level glitch */}
        <h1
          className="glitch-title-god fire-text text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] text-red-500"
          data-text="THE NOTE"
        >
          <TitleLetters text="THE NOTE" className="" />
        </h1>

        {/* Subtitle with typewriter effect */}
        <h2
          className={`mt-3 text-xl sm:text-2xl md:text-4xl font-bold tracking-[0.5em] text-orange-400 ${
            subtitleDone ? '' : 'typewriter-cursor'
          }`}
          style={{
            textShadow: '0 0 10px rgba(255,140,0,0.6), 0 0 30px rgba(255,68,0,0.3)',
          }}
        >
          {subtitleText}
        </h2>

        {/* Decorative line under subtitle */}
        <motion.div
          className="mx-auto mt-4"
          style={{
            width: 200,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.6), rgba(255,100,0,0.4), rgba(139,0,0,0.6), transparent)',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8, ease: 'easeOut' }}
        />
      </motion.div>

      {/* ===== MENU BUTTONS ===== */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2.5 w-72 sm:w-80 z-10"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isContinue = item.id === 'continue';
          const disabled = isContinue && !gameStarted;
          const num = String(index + 1).padStart(2, '0');

          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Button
                disabled={disabled}
                onClick={() => setScene(item.scene)}
                onPointerEnter={() => handleHoverStart(item.id)}
                onPointerLeave={handleHoverEnd}
                className={`w-full relative group overflow-hidden blood-reveal-btn
                  bg-black/50 border transition-all duration-300
                  disabled:opacity-30 disabled:cursor-not-allowed
                  h-12 text-base font-bold tracking-[0.15em] text-red-400
                  ${hoveredBtn === item.id
                    ? 'border-orange-500/80 bg-red-950/40 text-orange-300'
                    : 'border-red-900/40 hover:border-orange-500/70 hover:bg-red-950/40 hover:text-orange-300'
                  }`}
              >
                {/* Blood reveal sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/5 to-orange-600/0
                  group-hover:via-red-700/20 transition-all duration-500" />

                {/* Left accent bar */}
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 group-hover:w-1.5 group-hover:bg-orange-500 transition-all duration-300" />

                {/* Pulsing glow border on hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                  animate-pulse-glow" />

                {/* Inner glow on hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  shadow-[inset_0_0_30px_rgba(255,80,0,0.15)]" />

                {/* Content */}
                <span className="relative flex items-center gap-3 z-10">
                  <span className="horror-number">{num}</span>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Button>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* ===== WARNING TEXT ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-12 sm:bottom-14 left-0 right-0 text-center z-10"
      >
        <p className="red-pulse-warning text-[10px] sm:text-xs font-mono tracking-[0.3em] text-red-600">
          WARNING: CONTAINS HORROR CONTENT
        </p>
      </motion.div>

      {/* ===== VERSION TEXT ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="absolute bottom-4 left-4 z-10"
      >
        <span className="scratched-text text-[10px] sm:text-xs text-zinc-600 font-mono">
          v0.1.0 ALPHA
        </span>
      </motion.div>
    </div>
  );
}
