'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { useApocalypsePassStore, PASS_REWARDS } from '@/stores/apocalypsePassStore';
import { useEconomyStore } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  Crown,
  Star,
  Lock,
  Check,
  Gift,
  Clock,
  Skull,
  Zap,
  Coins,
  Flame,
  Sparkles,
} from 'lucide-react';

/* ================================================================
   GOD LEVEL APOCALYPSE PASS UI
   ================================================================ */

export default function ApocalypsePassUI() {
  const setScene = useGameStore((s) => s.setScene);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const currentLevel = useApocalypsePassStore((s) => s.currentLevel);
  const currentXP = useApocalypsePassStore((s) => s.currentXP);
  const isPremium = useApocalypsePassStore((s) => s.isPremium);
  const seasonNumber = useApocalypsePassStore((s) => s.seasonNumber);
  const seasonEndDate = useApocalypsePassStore((s) => s.seasonEndDate);
  const getXpForLevel = useApocalypsePassStore((s) => s.getXpForLevel);
  const claimReward = useApocalypsePassStore((s) => s.claimReward);
  const canClaimReward = useApocalypsePassStore((s) => s.canClaimReward);
  const isRewardClaimed = useApocalypsePassStore((s) => s.isRewardClaimed);
  const purchasePremium = useApocalypsePassStore((s) => s.purchasePremium);
  const getSeasonTimeRemaining = useApocalypsePassStore((s) => s.getSeasonTimeRemaining);

  const [showPremium, setShowPremium] = useState(isPremium);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  const xpForNextLevel = getXpForLevel(currentLevel);
  const xpProgress = Math.min((currentXP / xpForNextLevel) * 100, 100);

  // Countdown timer - live updates
  const [timeData, setTimeData] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const remaining = getSeasonTimeRemaining();
      setTimeData({
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [getSeasonTimeRemaining, seasonEndDate]);

  // Particle burst when XP hits 100% - derived directly from progress
  const particleBurst = xpProgress >= 100;

  const handleClaim = (level: number, premium: boolean) => {
    const reward = PASS_REWARDS.find((r) => r.level === level);
    if (!reward) return;
    const rewardData = premium ? reward.premiumReward : reward.freeReward;
    if (!rewardData) return;

    claimReward(level, premium);
    setJustClaimed(level);
    setTimeout(() => setJustClaimed(null), 1200);

    if (rewardData.type === 'coins') {
      addCoins(rewardData.value);
    }
  };

  const visibleLevels = useMemo(() => PASS_REWARDS.slice(0, 25), []);

  // Rarity color mapping
  const getRarityColor = (type: string) => {
    switch (type) {
      case 'weapon': return { border: 'border-orange-500/50', bg: 'bg-orange-950/20', glow: 'shadow-orange-500/10' };
      case 'skin': return { border: 'border-purple-500/50', bg: 'bg-purple-950/20', glow: 'shadow-purple-500/10' };
      case 'flashlight': return { border: 'border-cyan-500/50', bg: 'bg-cyan-950/20', glow: 'shadow-cyan-500/10' };
      case 'execution': return { border: 'border-red-500/50', bg: 'bg-red-950/20', glow: 'shadow-red-500/10' };
      case 'emote': return { border: 'border-green-500/50', bg: 'bg-green-950/20', glow: 'shadow-green-500/10' };
      case 'icon': return { border: 'border-blue-500/50', bg: 'bg-blue-950/20', glow: 'shadow-blue-500/10' };
      default: return { border: 'border-zinc-700/50', bg: 'bg-zinc-900/20', glow: 'shadow-zinc-500/5' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.97)' }}
    >
      {/* ====== ATMOSPHERIC OVERLAYS ====== */}
      <div className="film-grain-overlay" />
      <div className="vignette-overlay" />

      {/* Red fog at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-40"
        style={{
          background: 'linear-gradient(to top, rgba(80, 0, 0, 0.25) 0%, rgba(40, 0, 0, 0.1) 50%, transparent 100%)',
        }}
      />

      {/* Ember particles */}
      <div className="ember-container">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ember" style={{ left: `${8 + i * 12}%` }} />
        ))}
      </div>

      {/* ====== HEADER WITH BANNER ====== */}
      <div className="relative h-48 sm:h-56 md:h-64 shrink-0 overflow-hidden">
        {/* Banner image */}
        <Image
          src="/images/battlepass-banner.png"
          alt="Apocalypse Pass Banner"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,2,2,0.3) 0%, rgba(5,2,2,0.6) 50%, rgba(5,2,2,0.95) 85%, rgba(5,2,2,1) 100%)',
          }}
        />

        {/* Blood drip from top */}
        <div className="blood-drip-overlay" />
        <div className="blood-drip-extra-1" />
        <div className="blood-drip-extra-2" />
        <div className="blood-drip-extra-3" />

        {/* Back button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 z-20"
        >
          <Button
            variant="ghost"
            onClick={() => setScene('mainMenu')}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1.5 font-mono text-sm blood-reveal-btn"
          >
            <ChevronLeft className="h-5 w-5" />
            BACK
          </Button>
        </motion.div>

        {/* Center title group */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
          {/* Season badge */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-2 mb-2"
          >
            <Skull className="h-4 w-4 text-red-500" style={{ filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.6))' }} />
            <span className="text-xs font-mono tracking-[0.3em] text-red-400/80">
              SEASON {seasonNumber}
            </span>
            <Skull className="h-4 w-4 text-red-500" style={{ filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.6))' }} />
          </motion.div>

          {/* Main title with golden glow + fire */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.15em] fire-text"
            style={{ color: '#fbbf24' }}
          >
            APOCALYPSE PASS
          </motion.h1>

          {/* Countdown timer with clock animation */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border border-red-900/40 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <Clock className="h-3.5 w-3.5 text-red-400" />
            </motion.div>
            <span className="font-mono text-xs text-zinc-300 tabular-nums">
              {String(timeData.days).padStart(2, '0')}d{' '}
              {String(timeData.hours).padStart(2, '0')}h{' '}
              {String(timeData.minutes).padStart(2, '0')}m{' '}
              <span className="text-red-400">{String(timeData.seconds).padStart(2, '0')}s</span>
            </span>
          </motion.div>
        </div>
      </div>

      {/* ====== XP PROGRESS SECTION ====== */}
      <div className="relative px-4 py-4 border-b border-red-950/50 bg-black/50 shrink-0">
        {/* Inner glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.3), transparent)',
          }}
        />

        <div className="flex items-center justify-between mb-3">
          {/* Level with golden star */}
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star
                className="h-6 w-6 text-yellow-400 fill-yellow-400"
                style={{ filter: 'drop-shadow(0 0 8px rgba(234,179,8,0.6))' }}
              />
            </motion.div>
            <div>
              <span className="text-base font-black tracking-wider text-yellow-300" style={{ textShadow: '0 0 12px rgba(234,179,8,0.4)' }}>
                LEVEL {currentLevel}
              </span>
            </div>
          </motion.div>

          {/* XP counter monospace */}
          <div className="text-right">
            <span className="font-mono text-sm tabular-nums">
              <span className="text-yellow-400" style={{ textShadow: '0 0 8px rgba(234,179,8,0.3)' }}>
                {currentXP}
              </span>
              <span className="text-zinc-600"> / </span>
              <span className="text-zinc-500">{xpForNextLevel}</span>
            </span>
            <span className="text-zinc-600 text-xs ml-1.5">XP</span>
          </div>
        </div>

        {/* Blood-fill progress bar */}
        <div className="relative h-5 rounded-full overflow-hidden blood-progress-bar">
          {/* Track background */}
          <div className="absolute inset-0 bg-zinc-900 rounded-full" />

          {/* Blood fill - animated */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(90deg, #7f1d1d, #b91c1c, #dc2626, #ef4444)',
              boxShadow: '0 0 12px rgba(220,38,38,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Liquid wave effect at the leading edge */}
            <div
              className="absolute top-0 right-0 w-4 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,100,100,0.3))',
                animation: 'liquid-wave 1.5s ease-in-out infinite alternate',
              }}
            />

            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          </motion.div>

          {/* Percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-white/80 tabular-nums drop-shadow-md">
              {Math.round(xpProgress)}%
            </span>
          </div>
        </div>

        {/* Particle burst on 100% */}
        <AnimatePresence>
          {particleBurst && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${50 + (Math.cos((i / 12) * Math.PI * 2) * 40)}%`,
                    y: `${50 + (Math.sin((i / 12) * Math.PI * 2) * 40)}%`,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  style={{
                    boxShadow: '0 0 8px 2px rgba(234,179,8,0.6)',
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Free/Premium track toggle + upgrade button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPremium(false)}
              className={`relative px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 overflow-hidden ${
                !showPremium
                  ? 'bg-zinc-700 text-zinc-100 shadow-lg shadow-zinc-900/50'
                  : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800'
              }`}
            >
              {!showPremium && (
                <motion.div
                  layoutId="track-glow"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(161,161,170,0.15), 0 0 10px rgba(161,161,170,0.1)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">FREE TRACK</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPremium(true)}
              className={`relative px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 overflow-hidden ${
                showPremium
                  ? 'text-black'
                  : 'bg-zinc-900/50 text-yellow-700 border border-yellow-900/30'
              }`}
              style={
                showPremium
                  ? {
                      background: 'linear-gradient(135deg, #b8860b, #daa520, #ffd700)',
                      boxShadow: '0 0 20px rgba(234,179,8,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
                    }
                  : undefined
              }
            >
              {showPremium && (
                <motion.div
                  layoutId="track-glow"
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 2s linear infinite',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Crown className="h-3 w-3 inline mr-1.5 relative z-10" />
              <span className="relative z-10">PREMIUM</span>
            </motion.button>
          </div>

          {/* Premium upgrade button */}
          {!isPremium && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={purchasePremium}
              className="relative px-4 py-2 rounded-lg text-xs font-black tracking-wider text-black overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8b6914, #daa520, #ffd700, #daa520)',
                backgroundSize: '200% 100%',
                animation: 'golden-shimmer 3s linear infinite',
                boxShadow: '0 0 20px rgba(234,179,8,0.3), 0 0 40px rgba(234,179,8,0.15)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
              <Crown className="h-3 w-3 inline mr-1.5 relative z-10" />
              <span className="relative z-10">$4.99 UPGRADE</span>
            </motion.button>
          )}

          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Crown className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 tracking-wider">PREMIUM ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* ====== REWARDS GRID ====== */}
      <ScrollArea className="flex-1 dark-scrollbar">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visibleLevels.map((reward, index) => {
            const isUnlocked = reward.level <= currentLevel;
            const freeClaimed = isRewardClaimed(reward.level, false);
            const premiumClaimed = isRewardClaimed(reward.level, true);
            const canClaimFree = canClaimReward(reward.level, false);
            const canClaimPremium = canClaimReward(reward.level, true) && isPremium;
            const isCurrent = reward.level === currentLevel;
            const isJustClaimed = justClaimed === reward.level;

            const displayReward = showPremium && reward.premiumReward ? reward.premiumReward : reward.freeReward;
            const isClaimed = showPremium ? premiumClaimed : freeClaimed;
            const canClaim = showPremium ? canClaimPremium : canClaimFree;
            const rarityStyle = getRarityColor(displayReward.type);

            return (
              <motion.div
                key={reward.level}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                <Card
                  className={`relative p-3 transition-all duration-300 overflow-hidden ${
                    isCurrent
                      ? `border-yellow-500/60 ${rarityStyle.bg}`
                      : isClaimed
                        ? `border-green-700/40 bg-green-950/10`
                        : isUnlocked
                          ? `border-zinc-700/60 ${rarityStyle.bg}`
                          : 'border-zinc-800/40 bg-black/40 opacity-50'
                  }`}
                  style={
                    isCurrent
                      ? {
                          boxShadow: '0 0 15px rgba(234,179,8,0.25), 0 0 30px rgba(234,179,8,0.1)',
                          animation: 'golden-glow-pulse 2s ease-in-out infinite',
                        }
                      : canClaim
                        ? { boxShadow: '0 0 10px rgba(34,197,94,0.2)' }
                        : !isUnlocked
                          ? { boxShadow: '0 0 8px rgba(127,29,29,0.15)' }
                          : undefined
                  }
                >
                  {/* Level number in circular badge */}
                  <div
                    className={`absolute -top-0 -left-0 w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-mono font-bold z-10 ${
                      isCurrent
                        ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/30'
                        : isClaimed
                          ? 'bg-green-800 border-green-600 text-green-200'
                          : isUnlocked
                            ? 'bg-zinc-800 border-zinc-600 text-zinc-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {reward.level}
                  </div>

                  {/* Premium crown icon */}
                  {showPremium && reward.premiumReward && (
                    <div className="absolute top-1 right-1.5">
                      <Crown
                        className="h-3 w-3 text-yellow-500 fill-yellow-500"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(234,179,8,0.5))' }}
                      />
                    </div>
                  )}

                  {/* Free track premium indicator */}
                  {!showPremium && reward.premiumReward && isPremium && (
                    <div className="absolute top-1 right-1.5">
                      <Crown className="h-3 w-3 text-yellow-500/30" />
                    </div>
                  )}

                  {/* CURRENT badge */}
                  {isCurrent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0 -right-0 z-10"
                    >
                      <Badge className="bg-yellow-500 text-black text-[8px] font-black tracking-wider px-1.5 py-0 h-4 shadow-lg shadow-yellow-500/30">
                        CURRENT
                      </Badge>
                    </motion.div>
                  )}

                  {/* Reward icon */}
                  <div className="text-2xl text-center mb-1.5 mt-3">{displayReward.icon}</div>

                  {/* Reward name */}
                  <p className="text-[10px] text-center text-zinc-300 truncate leading-tight">{displayReward.name}</p>

                  {/* Reward type badge */}
                  <div className="flex justify-center mt-1">
                    <span className={`text-[8px] font-mono tracking-wider uppercase ${rarityStyle.border.replace('border-', 'text-').replace('/50', '')}`}>
                      {displayReward.type}
                    </span>
                  </div>

                  {/* Status section */}
                  <div className="mt-2 text-center min-h-[28px] flex items-center justify-center">
                    {!isUnlocked ? (
                      <div className="flex flex-col items-center">
                        <Lock className="h-4 w-4 text-zinc-700" />
                        <span className="text-[8px] text-zinc-600 font-mono mt-0.5">LOCKED</span>
                      </div>
                    ) : isClaimed ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400 tracking-wider">CLAIMED</span>
                      </motion.div>
                    ) : canClaim ? (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleClaim(reward.level, showPremium)}
                        className="relative flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold text-white overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #15803d, #16a34a, #22c55e)',
                          boxShadow: '0 0 10px rgba(34,197,94,0.3)',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      >
                        <Gift className="h-3 w-3" />
                        CLAIM
                      </motion.button>
                    ) : (
                      <span className="text-[9px] text-zinc-600 font-mono">LOCKED</span>
                    )}
                  </div>

                  {/* Just claimed animation overlay */}
                  <AnimatePresence>
                    {isJustClaimed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg z-20"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Check className="h-8 w-8 text-green-400" style={{ filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.6))' }} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Locked overlay with red glow */}
                  {!isUnlocked && (
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(30,0,0,0.2) 100%)',
                        boxShadow: 'inset 0 0 15px rgba(127,29,29,0.1)',
                      }}
                    />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom spacer for fog */}
        <div className="h-24" />
      </ScrollArea>

      {/* ====== BOTTOM FOG OVERLAY ====== */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none z-30">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(80,0,0,0.3) 0%, rgba(40,0,0,0.1) 50%, transparent 100%)',
          }}
        />
      </div>
    </motion.div>
  );
}
