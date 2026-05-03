'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useApocalypsePassStore, PASS_REWARDS } from '@/stores/apocalypsePassStore';
import { useEconomyStore } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Crown, Star, Lock, Check, Gift, Clock } from 'lucide-react';

export default function ApocalypsePassUI() {
  const setScene = useGameStore((s) => s.setScene);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const currentLevel = useApocalypsePassStore((s) => s.currentLevel);
  const currentXP = useApocalypsePassStore((s) => s.currentXP);
  const isPremium = useApocalypsePassStore((s) => s.isPremium);
  const seasonNumber = useApocalypsePassStore((s) => s.seasonNumber);
  const seasonEndDate = useApocalypsePassStore((s) => s.seasonEndDate);
  const claimedRewards = useApocalypsePassStore((s) => s.claimedRewards);
  const getXpForLevel = useApocalypsePassStore((s) => s.getXpForLevel);
  const claimReward = useApocalypsePassStore((s) => s.claimReward);
  const canClaimReward = useApocalypsePassStore((s) => s.canClaimReward);
  const isRewardClaimed = useApocalypsePassStore((s) => s.isRewardClaimed);
  const purchasePremium = useApocalypsePassStore((s) => s.purchasePremium);
  const getSeasonTimeRemaining = useApocalypsePassStore((s) => s.getSeasonTimeRemaining);

  const [showPremium, setShowPremium] = useState(isPremium);

  const xpForNextLevel = getXpForLevel(currentLevel);
  const xpProgress = (currentXP / xpForNextLevel) * 100;

  const timeRemaining = getSeasonTimeRemaining();
  const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const handleClaim = (level: number, premium: boolean) => {
    const reward = PASS_REWARDS.find((r) => r.level === level);
    if (!reward) return;
    const rewardData = premium ? reward.premiumReward : reward.freeReward;
    if (!rewardData) return;

    claimReward(level, premium);

    if (rewardData.type === 'coins') {
      addCoins(rewardData.value);
    }
  };

  const visibleLevels = PASS_REWARDS.slice(0, 25);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.96)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <Button
          variant="ghost"
          onClick={() => setScene('mainMenu')}
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1"
        >
          <ChevronLeft className="h-5 w-5" />
          BACK
        </Button>

        <div className="text-center">
          <h2 className="text-lg font-bold tracking-[0.2em] text-red-400">APOCALYPSE PASS</h2>
          <p className="text-[10px] text-zinc-600">SEASON {seasonNumber}</p>
        </div>

        {/* Time remaining */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{daysLeft}d {hoursLeft}h</span>
        </div>
      </div>

      {/* Progress section */}
      <div className="p-4 border-b border-zinc-800 bg-black/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-yellow-400 font-bold">LEVEL {currentLevel}</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{currentXP} / {xpForNextLevel} XP</span>
        </div>
        <Progress value={xpProgress} className="h-3 bg-zinc-800" />

        {/* Premium toggle / purchase */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={!showPremium ? 'default' : 'outline'}
              className={`text-xs ${!showPremium ? 'bg-zinc-700 hover:bg-zinc-600' : 'border-zinc-700 text-zinc-400'}`}
              onClick={() => setShowPremium(false)}
            >
              FREE TRACK
            </Button>
            <Button
              size="sm"
              variant={showPremium ? 'default' : 'outline'}
              className={`text-xs ${showPremium ? 'bg-yellow-700 hover:bg-yellow-600 text-black' : 'border-yellow-800 text-yellow-600'}`}
              onClick={() => setShowPremium(true)}
            >
              <Crown className="h-3 w-3 mr-1" />
              PREMIUM
            </Button>
          </div>

          {!isPremium && (
            <Button
              size="sm"
              onClick={purchasePremium}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              $4.99 UPGRADE
            </Button>
          )}
        </div>
      </div>

      {/* Rewards Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visibleLevels.map((reward) => {
            const isUnlocked = reward.level <= currentLevel;
            const freeClaimed = isRewardClaimed(reward.level, false);
            const premiumClaimed = isRewardClaimed(reward.level, true);
            const canClaimFree = canClaimReward(reward.level, false);
            const canClaimPremium = canClaimReward(reward.level, true) && isPremium;
            const isCurrent = reward.level === currentLevel;

            const displayReward = showPremium && reward.premiumReward ? reward.premiumReward : reward.freeReward;
            const isClaimed = showPremium ? premiumClaimed : freeClaimed;
            const canClaim = showPremium ? canClaimPremium : canClaimFree;

            return (
              <motion.div
                key={reward.level}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reward.level * 0.02 }}
              >
                <Card
                  className={`relative p-3 border transition-all duration-200 ${
                    isCurrent
                      ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                      : isUnlocked
                        ? 'border-zinc-700'
                        : 'border-zinc-800 opacity-60'
                  } bg-black/60`}
                >
                  {/* Level number */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{reward.level}</span>
                  </div>

                  {/* Reward icon */}
                  <div className="text-2xl text-center mb-1.5 mt-1">{displayReward.icon}</div>

                  {/* Reward name */}
                  <p className="text-[11px] text-center text-zinc-300 truncate">{displayReward.name}</p>

                  {/* Premium indicator */}
                  {showPremium && reward.premiumReward && (
                    <Crown className="absolute top-1.5 right-1.5 h-3 w-3 text-yellow-500" />
                  )}

                  {/* Status */}
                  <div className="mt-2 text-center">
                    {!isUnlocked ? (
                      <Lock className="h-4 w-4 mx-auto text-zinc-700" />
                    ) : isClaimed ? (
                      <div className="flex items-center justify-center gap-1 text-green-400 text-[10px]">
                        <Check className="h-3 w-3" />
                        CLAIMED
                      </div>
                    ) : canClaim ? (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(reward.level, showPremium)}
                        className="h-6 text-[10px] bg-green-700 hover:bg-green-600 text-white px-2"
                      >
                        <Gift className="h-2.5 w-2.5 mr-1" />
                        CLAIM
                      </Button>
                    ) : (
                      <span className="text-[9px] text-zinc-600">LOCKED</span>
                    )}
                  </div>

                  {/* Free/Premium dual indicators */}
                  {!showPremium && reward.premiumReward && isPremium && (
                    <div className="absolute top-1.5 right-1.5">
                      <Crown className="h-3 w-3 text-yellow-500/50" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
