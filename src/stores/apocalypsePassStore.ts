import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PassReward {
  level: number;
  freeReward: { type: string; id: string; name: string; value: number; icon: string };
  premiumReward: { type: string; id: string; name: string; value: number; icon: string } | null;
}

export const XP_REWARDS = {
  killZombie: 5,
  completeObjective: 50,
  floorCompletion: 100,
  findNote: 25,
  bossKill: 200,
} as const;

export const PASS_REWARDS: PassReward[] = [
  { level: 1, freeReward: { type: 'coins', id: 'pass_coins_1', name: '5 Death Coins', value: 5, icon: '🪙' }, premiumReward: { type: 'skin', id: 'pass_skin_rare_1', name: 'Wasteland Warrior', value: 0, icon: '🧥' } },
  { level: 2, freeReward: { type: 'emote', id: 'pass_emote_1', name: 'Zombie Walk', value: 0, icon: '🧟' }, premiumReward: { type: 'coins', id: 'pass_pcoins_2', name: '50 Death Coins', value: 50, icon: '🪙' } },
  { level: 3, freeReward: { type: 'coins', id: 'pass_coins_3', name: '10 Death Coins', value: 10, icon: '🪙' }, premiumReward: { type: 'icon', id: 'pass_icon_3', name: 'Apocalypse Icon', value: 0, icon: '☠️' } },
  { level: 4, freeReward: { type: 'icon', id: 'pass_icon_4', name: 'Biohazard Icon', value: 0, icon: '☣️' }, premiumReward: { type: 'coins', id: 'pass_pcoins_4', name: '75 Death Coins', value: 75, icon: '🪙' } },
  { level: 5, freeReward: { type: 'coins', id: 'pass_coins_5', name: '15 Death Coins', value: 15, icon: '🪙' }, premiumReward: { type: 'weapon', id: 'pass_weapon_legend_1', name: 'Plasma Rifle', value: 0, icon: '🔫' } },
  { level: 6, freeReward: { type: 'flashlight', id: 'pass_flash_6', name: 'Amber Beam', value: 0, icon: '🟠' }, premiumReward: { type: 'coins', id: 'pass_pcoins_6', name: '100 Death Coins', value: 100, icon: '🪙' } },
  { level: 7, freeReward: { type: 'coins', id: 'pass_coins_7', name: '20 Death Coins', value: 20, icon: '🪙' }, premiumReward: { type: 'emote', id: 'pass_pemote_7', name: 'Victory Dance', value: 0, icon: '🎉' } },
  { level: 8, freeReward: { type: 'emote', id: 'pass_emote_8', name: 'Point', value: 0, icon: '👉' }, premiumReward: { type: 'coins', id: 'pass_pcoins_8', name: '100 Death Coins', value: 100, icon: '🪙' } },
  { level: 9, freeReward: { type: 'coins', id: 'pass_coins_9', name: '25 Death Coins', value: 25, icon: '🪙' }, premiumReward: { type: 'icon', id: 'pass_picon_9', name: 'Elite Badge', value: 0, icon: '🏅' } },
  { level: 10, freeReward: { type: 'weapon', id: 'pass_weapon_10', name: 'Tactical Knife', value: 0, icon: '🗡️' }, premiumReward: { type: 'execution', id: 'pass_exec_10', name: 'Cinematic Kill', value: 0, icon: '🎬' } },
  { level: 11, freeReward: { type: 'coins', id: 'pass_coins_11', name: '30 Death Coins', value: 30, icon: '🪙' }, premiumReward: { type: 'coins', id: 'pass_pcoins_11', name: '150 Death Coins', value: 150, icon: '🪙' } },
  { level: 12, freeReward: { type: 'icon', id: 'pass_icon_12', name: 'Crossed Bones', value: 0, icon: '☠️' }, premiumReward: { type: 'emote', id: 'pass_pemote_12', name: 'Flex', value: 0, icon: '💪' } },
  { level: 13, freeReward: { type: 'coins', id: 'pass_coins_13', name: '30 Death Coins', value: 30, icon: '🪙' }, premiumReward: { type: 'coins', id: 'pass_pcoins_13', name: '150 Death Coins', value: 150, icon: '🪙' } },
  { level: 14, freeReward: { type: 'emote', id: 'pass_emote_14', name: 'Zombie Mock', value: 0, icon: '🧟' }, premiumReward: { type: 'flashlight', id: 'pass_pflash_14', name: 'Blood Beam', value: 0, icon: '🔴' } },
  { level: 15, freeReward: { type: 'coins', id: 'pass_coins_15', name: '35 Death Coins', value: 35, icon: '🪙' }, premiumReward: { type: 'skin', id: 'pass_skin_legend_15', name: 'Plague Doctor', value: 0, icon: '🎭' } },
  { level: 16, freeReward: { type: 'flashlight', id: 'pass_flash_16', name: 'White Beam', value: 0, icon: '⚪' }, premiumReward: { type: 'coins', id: 'pass_pcoins_16', name: '200 Death Coins', value: 200, icon: '🪙' } },
  { level: 17, freeReward: { type: 'coins', id: 'pass_coins_17', name: '40 Death Coins', value: 40, icon: '🪙' }, premiumReward: { type: 'icon', id: 'pass_picon_17', name: 'Crown', value: 0, icon: '👑' } },
  { level: 18, freeReward: { type: 'icon', id: 'pass_icon_18', name: 'Hazard', value: 0, icon: '⚠️' }, premiumReward: { type: 'emote', id: 'pass_pemote_18', name: 'Boss Taunt', value: 0, icon: '😤' } },
  { level: 19, freeReward: { type: 'coins', id: 'pass_coins_19', name: '45 Death Coins', value: 45, icon: '🪙' }, premiumReward: { type: 'coins', id: 'pass_pcoins_19', name: '250 Death Coins', value: 250, icon: '🪙' } },
  { level: 20, freeReward: { type: 'weapon', id: 'pass_weapon_20', name: 'Combat Axe', value: 0, icon: '🪓' }, premiumReward: { type: 'flashlight', id: 'pass_pflash_20', name: 'Lightning Beam', value: 0, icon: '⚡' } },
  // Premium-only levels 21-40
  ...Array.from({ length: 20 }, (_, i) => ({
    level: 21 + i,
    freeReward: { type: 'coins', id: `pass_coins_${21 + i}`, name: `${30 + i * 5} Death Coins`, value: 30 + i * 5, icon: '🪙' },
    premiumReward: i % 5 === 0
      ? { type: 'skin', id: `pass_pskin_${21 + i}`, name: i === 15 ? 'The Original' : `Legendary Skin ${21 + i}`, value: 0, icon: '👑' }
      : { type: 'coins', id: `pass_pcoins_${21 + i}`, name: `${200 + i * 25} Death Coins`, value: 200 + i * 25, icon: '🪙' },
  })),
];

interface ApocalypsePassState {
  currentLevel: number;
  currentXP: number;
  isPremium: boolean;
  seasonNumber: number;
  seasonEndDate: number;
  claimedRewards: { level: number; isPremium: boolean }[];
  totalXpEarned: number;

  addXP: (amount: number) => void;
  getXpForLevel: (level: number) => number;
  getCurrentLevelXP: () => { current: number; required: number; progress: number };
  claimReward: (level: number, isPremium: boolean) => void;
  purchasePremium: () => void;
  isRewardClaimed: (level: number, isPremium: boolean) => boolean;
  canClaimReward: (level: number, isPremium: boolean) => boolean;
  getSeasonTimeRemaining: () => number;
  resetSeason: () => void;
}

export const useApocalypsePassStore = create<ApocalypsePassState>()(
  persist(
    (set, get) => ({
      currentLevel: 1,
      currentXP: 0,
      isPremium: false,
      seasonNumber: 1,
      seasonEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      claimedRewards: [],
      totalXpEarned: 0,

      addXP: (amount) => {
        const state = get();
        let newXP = state.currentXP + amount;
        let newLevel = state.currentLevel;
        const newTotalXp = state.totalXpEarned + amount;

        while (newXP >= get().getXpForLevel(newLevel)) {
          newXP -= get().getXpForLevel(newLevel);
          newLevel++;
        }

        set({ currentXP: newXP, currentLevel: newLevel, totalXpEarned: newTotalXp });
      },

      getXpForLevel: (level) => level * 100,

      getCurrentLevelXP: () => {
        const state = get();
        const required = get().getXpForLevel(state.currentLevel);
        return { current: state.currentXP, required, progress: state.currentXP / required };
      },

      claimReward: (level, isPremium) => {
        const state = get();
        if (state.claimedRewards.some((r) => r.level === level && r.isPremium === isPremium)) return;
        if (level > state.currentLevel) return;
        if (isPremium && !state.isPremium) return;

        const reward = PASS_REWARDS.find((r) => r.level === level);
        const rewardData = isPremium ? reward?.premiumReward : reward?.freeReward;
        if (!rewardData) return;

        // Add coin rewards to economy
        if (rewardData.type === 'coins') {
          // This will be handled by the component that calls claimReward
        }

        set({
          claimedRewards: [...state.claimedRewards, { level, isPremium }],
        });
      },

      isRewardClaimed: (level, isPremium) =>
        get().claimedRewards.some((r) => r.level === level && r.isPremium === isPremium),

      canClaimReward: (level, isPremium) => {
        const state = get();
        if (level > state.currentLevel) return false;
        if (isPremium && !state.isPremium) return false;
        return !state.claimedRewards.some((r) => r.level === level && r.isPremium === isPremium);
      },

      purchasePremium: () => set({ isPremium: true }),

      getSeasonTimeRemaining: () => Math.max(0, get().seasonEndDate - Date.now()),

      resetSeason: () =>
        set({
          currentLevel: 1,
          currentXP: 0,
          claimedRewards: [],
          totalXpEarned: 0,
          seasonNumber: get().seasonNumber + 1,
          seasonEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
    }),
    {
      name: 'apocalypse-pass',
      partialize: (state) => ({
        currentLevel: state.currentLevel,
        currentXP: state.currentXP,
        isPremium: state.isPremium,
        seasonNumber: state.seasonNumber,
        seasonEndDate: state.seasonEndDate,
        claimedRewards: state.claimedRewards,
        totalXpEarned: state.totalXpEarned,
      }),
    }
  )
);
