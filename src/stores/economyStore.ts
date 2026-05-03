import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ItemRarity = 'common' | 'rare' | 'legendary';
export type ShopCategory = 'skins' | 'weapons' | 'emotes' | 'effects' | 'bundles' | 'flashlights';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  rarity: ItemRarity;
  icon: string;
  owned: boolean;
  equipped: boolean;
  isPremiumOnly: boolean;
}

export const COIN_REWARDS = {
  killWalker: 1,
  killRunner: 2,
  killCrawler: 1,
  killBossScientist: 15,
  killBossAlpha: 25,
  completeFloor1: 8,
  completeFloor2: 10,
  completeFloor3: 12,
  completeFloor4: 20,
  dailyLogin: 3,
  findNote: 5,
  watchAd: 10,
} as const;

export const SHOP_ITEMS: ShopItem[] = [
  // Emotes
  { id: 'emote_wave', name: 'Wave', description: 'Wave to nearby survivors', category: 'emotes', price: 100, rarity: 'common', icon: '👋', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'emote_salute', name: 'Salute', description: 'Military salute', category: 'emotes', price: 100, rarity: 'common', icon: '🫡', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'emote_dance', name: 'Survivor Dance', description: 'Celebrate staying alive', category: 'emotes', price: 150, rarity: 'common', icon: '💃', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'emote_scream', name: 'Horror Scream', description: 'Scream like you mean it', category: 'emotes', price: 200, rarity: 'common', icon: '😱', owned: false, equipped: false, isPremiumOnly: false },

  // Player Icons
  { id: 'icon_skull', name: 'Skull Icon', description: 'Classic skull player icon', category: 'effects', price: 80, rarity: 'common', icon: '💀', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'icon_bite', name: 'Bite Mark', description: 'Zombie bite mark icon', category: 'effects', price: 80, rarity: 'common', icon: '🦷', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'icon_biohazard', name: 'Biohazard', description: 'Biohazard warning icon', category: 'effects', price: 80, rarity: 'common', icon: '☣️', owned: false, equipped: false, isPremiumOnly: false },

  // Flashlight Colors
  { id: 'flashlight_red', name: 'Red Beam', description: 'Sinister red flashlight', category: 'flashlights', price: 250, rarity: 'common', icon: '🔴', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'flashlight_green', name: 'Night Vision', description: 'Green night vision beam', category: 'flashlights', price: 250, rarity: 'common', icon: '🟢', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'flashlight_uv', name: 'UV Light', description: 'Ultraviolet beam reveals blood', category: 'flashlights', price: 400, rarity: 'rare', icon: '🟣', owned: false, equipped: false, isPremiumOnly: false },

  // Weapon Skins
  { id: 'weapon_rust', name: 'Rusted', description: 'Rusted weapon skin', category: 'weapons', price: 500, rarity: 'common', icon: '🔫', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'weapon_blood', name: 'Bloodstained', description: 'Blood-coated weapon', category: 'weapons', price: 1500, rarity: 'rare', icon: '🩸', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'weapon_gold', name: 'Golden', description: 'Legendary golden weapon', category: 'weapons', price: 5000, rarity: 'legendary', icon: '✨', owned: false, equipped: false, isPremiumOnly: false },

  // Character Skins
  { id: 'char_survivor', name: 'Wasteland Gear', description: 'Survivor wasteland outfit', category: 'skins', price: 800, rarity: 'common', icon: '🧥', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'char_hazmat', name: 'Hazmat Suit', description: 'Chemical protection suit', category: 'skins', price: 3000, rarity: 'rare', icon: '🥽', owned: false, equipped: false, isPremiumOnly: false },
  { id: 'char_legendary', name: 'Apocalypse Walker', description: 'Legendary undead hunter', category: 'skins', price: 10000, rarity: 'legendary', icon: '👑', owned: false, equipped: false, isPremiumOnly: false },

  // Death Animations
  { id: 'death_drag', name: 'Zombie Drag', description: 'Get dragged away by zombies', category: 'effects', price: 2000, rarity: 'rare', icon: '🧟', owned: false, equipped: false, isPremiumOnly: false },

  // Execution Animations
  { id: 'exec_headshot', name: 'Perfect Headshot', description: 'Cinematic headshot execution', category: 'effects', price: 7000, rarity: 'legendary', icon: '🎯', owned: false, equipped: false, isPremiumOnly: false },

  // Premium Flashlight FX
  { id: 'flashlight_lightning', name: 'Lightning Beam', description: 'Electric lightning flashlight', category: 'flashlights', price: 4000, rarity: 'legendary', icon: '⚡', owned: false, equipped: false, isPremiumOnly: true },

  // Bundles
  { id: 'bundle_starter', name: 'Starter Pack', description: '3 emotes + 1 icon + 100 coins bonus', category: 'bundles', price: 500, rarity: 'common', icon: '📦', owned: false, equipped: false, isPremiumOnly: false },
];

export const IAP_PACKS = [
  { id: 'scrap_pack', name: 'Scrap Pack', price: '$0.99', coins: 300 },
  { id: 'survivor_pack', name: 'Survivor Pack', price: '$2.99', coins: 1200 },
  { id: 'war_chest', name: 'War Chest', price: '$7.99', coins: 4000 },
  { id: 'apocalypse_vault', name: 'Apocalypse Vault', price: '$14.99', coins: 10000 },
  { id: 'mega_vault', name: 'Mega Vault', price: '$29.99', coins: 35000 },
];

interface EconomyState {
  deathCoins: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  ownedItems: string[];
  equippedItems: Record<ShopCategory, string | null>;
  adsWatchedToday: number;
  lastAdWatch: number;
  adsRemoved: boolean;
  lastDailyLogin: number;
  dailyLoginClaimed: boolean;
  purchaseHistory: { itemId: string; price: number; date: number }[];

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string, category: ShopCategory) => void;
  unequipItem: (category: ShopCategory) => void;
  watchAd: () => boolean;
  canWatchAd: () => boolean;
  claimDailyLogin: () => boolean;
  canClaimDaily: () => boolean;
  removeAds: () => void;
  resetDailyCounters: () => void;
}

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      deathCoins: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      ownedItems: [],
      equippedItems: { skins: null, weapons: null, emotes: null, effects: null, bundles: null, flashlights: null },
      adsWatchedToday: 0,
      lastAdWatch: 0,
      adsRemoved: false,
      lastDailyLogin: 0,
      dailyLoginClaimed: false,
      purchaseHistory: [],

      addCoins: (amount) =>
        set((s) => ({
          deathCoins: s.deathCoins + amount,
          totalCoinsEarned: s.totalCoinsEarned + amount,
        })),

      spendCoins: (amount) => {
        const state = get();
        if (state.deathCoins < amount) return false;
        set({
          deathCoins: state.deathCoins - amount,
          totalCoinsSpent: state.totalCoinsSpent + amount,
        });
        return true;
      },

      purchaseItem: (itemId) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item || item.owned) return false;
        if (!get().spendCoins(item.price)) return false;
        set((s) => ({
          ownedItems: [...s.ownedItems, itemId],
          purchaseHistory: [...s.purchaseHistory, { itemId, price: item.price, date: Date.now() }],
        }));
        return true;
      },

      equipItem: (itemId, category) =>
        set((s) => ({
          equippedItems: { ...s.equippedItems, [category]: itemId },
        })),

      unequipItem: (category) =>
        set((s) => ({
          equippedItems: { ...s.equippedItems, [category]: null },
        })),

      watchAd: () => {
        const state = get();
        if (!state.canWatchAd()) return false;
        get().addCoins(COIN_REWARDS.watchAd);
        set({ adsWatchedToday: state.adsWatchedToday + 1, lastAdWatch: Date.now() });
        return true;
      },

      canWatchAd: () => {
        const state = get();
        if (state.adsRemoved) return false;
        if (state.adsWatchedToday >= 10) return false;
        if (Date.now() - state.lastAdWatch < 300000) return false; // 5 minute cooldown
        return true;
      },

      claimDailyLogin: () => {
        const state = get();
        if (!state.canClaimDaily()) return false;
        get().addCoins(COIN_REWARDS.dailyLogin);
        set({ lastDailyLogin: Date.now(), dailyLoginClaimed: true });
        return true;
      },

      canClaimDaily: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastLogin = state.lastDailyLogin ? new Date(state.lastDailyLogin).toDateString() : null;
        return today !== lastLogin;
      },

      removeAds: () => set({ adsRemoved: true }),

      resetDailyCounters: () => set({ adsWatchedToday: 0, dailyLoginClaimed: false }),
    }),
    {
      name: 'apocalypse-economy',
    }
  )
);
