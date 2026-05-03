'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { useEconomyStore, SHOP_ITEMS, IAP_PACKS, ShopCategory, ItemRarity } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Coins,
  Check,
  Lock,
  ShoppingCart,
  Sparkles,
  Skull,
  Ghost,
  Swords,
  Smile,
  Flashlight,
  Package,
  AlertTriangle,
  Zap,
  Star,
  X,
} from 'lucide-react';

/* ────────────────────────── Constants ────────────────────────── */

const CATEGORIES: { value: ShopCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'skins', label: 'SKINS', icon: <Ghost className="h-3.5 w-3.5" /> },
  { value: 'weapons', label: 'WEAPONS', icon: <Swords className="h-3.5 w-3.5" /> },
  { value: 'emotes', label: 'EMOTES', icon: <Smile className="h-3.5 w-3.5" /> },
  { value: 'effects', label: 'EFFECTS', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { value: 'flashlights', label: 'FLASHLIGHTS', icon: <Flashlight className="h-3.5 w-3.5" /> },
  { value: 'bundles', label: 'BUNDLES', icon: <Package className="h-3.5 w-3.5" /> },
];

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-zinc-400',
  rare: 'text-blue-400',
  legendary: 'text-amber-400',
};

const RARITY_BORDER: Record<ItemRarity, string> = {
  common: 'border-zinc-700/60',
  rare: 'border-blue-600/60',
  legendary: 'border-amber-500/60',
};

const RARITY_BG: Record<ItemRarity, string> = {
  common: 'bg-zinc-900/70',
  rare: 'bg-blue-950/40',
  legendary: 'bg-amber-950/30',
};

const RARITY_GLOW: Record<ItemRarity, string> = {
  common: 'shadow-[0_0_12px_rgba(161,161,170,0.15)]',
  rare: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
  legendary: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
};

const RARITY_GLOW_ANIM: Record<ItemRarity, string> = {
  common: 'animate-rarity-common',
  rare: 'animate-rarity-rare',
  legendary: 'animate-rarity-legendary',
};

/* ────────────────────────── Coin Counter Component ────────────────────────── */

function AnimatedCoinCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (display !== value) {
      setIsAnimating(true);
      const diff = value - display;
      const steps = Math.min(Math.abs(diff), 20);
      const stepValue = diff / steps;
      let current = 0;
      const interval = setInterval(() => {
        current++;
        if (current >= steps) {
          setDisplay(value);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplay(Math.round(display + stepValue * current));
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [value, display]);

  return (
    <span
      className={`font-mono text-sm font-bold transition-colors duration-300 ${
        isAnimating ? 'text-amber-300' : 'text-yellow-400'
      }`}
    >
      {display.toLocaleString()}
    </span>
  );
}

/* ────────────────────────── Legendary Particle Effect ────────────────────────── */

function LegendaryParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400 rounded-full"
          initial={{
            x: `${15 + i * 14}%`,
            y: '100%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: ['-10%', '110%'],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 0.8, 0],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────── Main Shop Component ────────────────────────── */

export default function ShopUI() {
  const setScene = useGameStore((s) => s.setScene);
  const deathCoins = useEconomyStore((s) => s.deathCoins);
  const ownedItems = useEconomyStore((s) => s.ownedItems);
  const equippedItems = useEconomyStore((s) => s.equippedItems);
  const purchaseItem = useEconomyStore((s) => s.purchaseItem);
  const equipItem = useEconomyStore((s) => s.equipItem);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('skins');

  const handleCategoryChange = useCallback((cat: ShopCategory) => {
    setActiveCategory(cat);
    setSelectedItem(null);
  }, []);

  const isOwned = useCallback((id: string) => ownedItems.includes(id), [ownedItems]);
  const isEquipped = useCallback((id: string, cat: ShopCategory) => equippedItems[cat] === id, [equippedItems]);
  const canAfford = useCallback((price: number) => deathCoins >= price, [deathCoins]);

  const handlePurchase = useCallback(
    (itemId: string) => {
      const item = SHOP_ITEMS.find((i) => i.id === itemId);
      if (!item) return;
      if (purchaseItem(itemId)) {
        equipItem(itemId, item.category);
        setConfirmDialog(null);
        setSelectedItem(null);
      }
    },
    [purchaseItem, equipItem]
  );

  const selectedItemData = selectedItem ? SHOP_ITEMS.find((i) => i.id === selectedItem) : null;

  /* ──────────────────────── Render ──────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden eerie-bg"
    >
      {/* ═══════ Atmospheric Overlays ═══════ */}
      <div className="vignette-overlay" style={{ zIndex: 58 }} />
      <div className="film-grain-overlay" style={{ zIndex: 59 }} />
      <div className="blood-drip-overlay" />
      <div className="blood-drip-extra-1" />
      <div className="blood-drip-extra-2" />
      <div className="blood-drip-extra-3" />
      <div className="blood-drip-extra-4" />

      {/* Red ambient glow at edges */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 57,
          boxShadow:
            'inset 0 0 120px 30px rgba(120,0,0,0.12), inset 0 -80px 60px -20px rgba(80,0,0,0.08)',
        }}
      />

      {/* ═══════ HEADER ═══════ */}
      <div className="relative flex-shrink-0 border-b border-red-900/30">
        {/* Banner Background */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/shop-banner.png"
            alt="Shop banner"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[rgba(5,2,2,0.96)]" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* BACK Button */}
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => setScene('mainMenu')}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1.5 font-mono text-xs tracking-wider blood-reveal-btn"
            >
              <ChevronLeft className="h-4 w-4" />
              BACK
            </Button>
          </motion.div>

          {/* Title */}
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Skull className="h-5 w-5 text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
            </motion.div>
            <h2
              className="text-xl sm:text-2xl font-black tracking-[0.35em] text-red-500 glitch-title-god"
              data-text="DEATH SHOP"
            >
              DEATH SHOP
            </h2>
          </div>

          {/* Death Coins Balance */}
          <div className="relative flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-md border border-yellow-800/40 backdrop-blur-sm">
            {/* Golden sparkles */}
            <div className="golden-sparkle" style={{ top: '-2px', left: '15%', width: '3px', height: '3px', animationDelay: '0s' }} />
            <div className="golden-sparkle" style={{ top: '40%', right: '5%', width: '2px', height: '2px', animationDelay: '0.4s' }} />
            <div className="golden-sparkle" style={{ bottom: '-1px', left: '50%', width: '3px', height: '3px', animationDelay: '0.8s' }} />

            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="flex-shrink-0"
            >
              <Coins className="h-4 w-4 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
            </motion.div>
            <AnimatedCoinCounter value={deathCoins} />
          </div>
        </div>
      </div>

      {/* ═══════ CATEGORY TABS ═══════ */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1 sm:px-6">
        <Tabs
          value={activeCategory}
          onValueChange={(v) => handleCategoryChange(v as ShopCategory)}
          className="w-full"
        >
          <TabsList className="w-full bg-zinc-950/60 border border-zinc-800/60 flex h-auto gap-0.5 p-1 rounded-md overflow-x-auto dark-scrollbar">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex-1 min-w-0 gap-1 text-[10px] sm:text-xs px-2 py-1.5 font-mono tracking-wider data-[state=active]:bg-red-900/50 data-[state=active]:text-red-300 data-[state=active]:shadow-[0_0_12px_rgba(220,38,38,0.3)] data-[state=active]:border-red-800/50 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 rounded-sm border border-transparent"
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.slice(0, 3)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ═══════ ITEM GRID ═══════ */}
      <div className="flex-1 min-h-0 px-3 py-2 sm:px-6 sm:py-3">
        <ScrollArea className="h-full dark-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 pb-4"
            >
              {SHOP_ITEMS.filter((i) => i.category === activeCategory).map((item, index) => {
                const owned = isOwned(item.id);
                const equipped = isEquipped(item.id, item.category);
                const affordable = canAfford(item.price);
                const isSelected = selectedItem === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`relative p-3 sm:p-4 transition-all duration-300 border overflow-hidden ${RARITY_BG[item.rarity]} ${RARITY_BORDER[item.rarity]}
                        ${isSelected ? 'ring-2 ring-red-500/60 ' + RARITY_GLOW[item.rarity] : RARITY_GLOW[item.rarity]}
                        ${equipped ? 'ring-2 ring-amber-500/70 !border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : ''}
                        hover:${RARITY_GLOW[item.rarity].replace('shadow-', 'shadow-').replace('0_0_', '0_0_').replace('0.15', '0.3').replace('0.25', '0.4').replace('0.35', '0.5')}
                      `}
                    >
                      {/* Rarity animated border glow */}
                      <div className={`absolute inset-0 rounded-lg pointer-events-none ${RARITY_GLOW_ANIM[item.rarity]}`} />

                      {/* Legendary particles */}
                      {item.rarity === 'legendary' && <LegendaryParticles />}

                      {/* Rarity Badge */}
                      <Badge
                        variant="outline"
                        className={`absolute top-1.5 right-1.5 text-[8px] sm:text-[9px] px-1.5 py-0 font-mono tracking-wider ${RARITY_COLORS[item.rarity]} ${RARITY_BORDER[item.rarity]} bg-black/40 backdrop-blur-sm`}
                      >
                        {item.rarity.toUpperCase()}
                      </Badge>

                      {/* Premium Badge */}
                      {item.isPremiumOnly && !owned && (
                        <Badge className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0 font-mono tracking-wider bg-orange-600/80 text-orange-100 border-orange-500/40 backdrop-blur-sm">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          PREMIUM
                        </Badge>
                      )}

                      {/* Equipped Badge */}
                      {equipped && (
                        <Badge className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0 font-mono tracking-wider bg-amber-600/80 text-amber-100 border-amber-500/40 backdrop-blur-sm">
                          <Star className="h-2.5 w-2.5 mr-0.5" />
                          EQUIPPED
                        </Badge>
                      )}

                      {/* Owned Badge (not equipped) */}
                      {owned && !equipped && (
                        <Badge className="absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0 font-mono tracking-wider bg-emerald-700/70 text-emerald-100 border-emerald-600/40 backdrop-blur-sm">
                          <Check className="h-2.5 w-2.5 mr-0.5" />
                          OWNED
                        </Badge>
                      )}

                      {/* Item Icon */}
                      <div className="text-3xl sm:text-4xl text-center mb-2 mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {item.icon}
                      </div>

                      {/* Item Name */}
                      <p
                        className={`text-[11px] sm:text-xs font-bold text-center truncate mb-1.5 ${RARITY_COLORS[item.rarity]}`}
                      >
                        {item.name}
                      </p>

                      {/* Price / Status */}
                      <div className="flex items-center justify-center">
                        {!owned ? (
                          affordable ? (
                            <div className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs font-bold">
                              <Coins className="h-3 w-3" />
                              {item.price.toLocaleString()}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 text-[10px] sm:text-xs font-bold">
                              <Lock className="h-3 w-3" />
                              {item.price.toLocaleString()}
                            </div>
                          )
                        ) : equipped ? (
                          <div className="flex items-center gap-1 text-amber-400 text-[10px] sm:text-xs font-bold">
                            <Star className="h-3 w-3" />
                            ACTIVE
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400 text-[10px] sm:text-xs font-bold">
                            <Check className="h-3 w-3" />
                            OWNED
                          </div>
                        )}
                      </div>

                      {/* Can't afford overlay */}
                      {!owned && !affordable && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                          <Lock className="h-5 w-5 text-red-700/60" />
                        </div>
                      )}

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="shop-selection"
                          className="absolute inset-0 rounded-lg border-2 border-red-500/70 pointer-events-none"
                          initial={false}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                        />
                      )}
                    </Card>
                  </motion.div>
                );
              })}

              {/* Empty State */}
              {SHOP_ITEMS.filter((i) => i.category === activeCategory).length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-600"
                >
                  <Skull className="h-12 w-12 mb-3 text-zinc-700" />
                  <p className="text-sm font-mono tracking-widest">NO ITEMS AVAILABLE</p>
                  <p className="text-xs text-zinc-700 mt-1">Check back later...</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* ═══════ SELECTED ITEM DETAIL PANEL ═══════ */}
      <AnimatePresence>
        {selectedItemData && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex-shrink-0 border-t border-red-900/30 bg-gradient-to-b from-zinc-950/95 to-black/98 backdrop-blur-sm"
          >
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Large icon */}
                <div
                  className={`flex-shrink-0 text-4xl sm:text-5xl p-2 rounded-lg ${RARITY_BG[selectedItemData.rarity]} border ${RARITY_BORDER[selectedItemData.rarity]} shadow-lg`}
                >
                  {selectedItemData.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3
                      className={`text-sm sm:text-base font-bold ${RARITY_COLORS[selectedItemData.rarity]}`}
                    >
                      {selectedItemData.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[8px] ${RARITY_COLORS[selectedItemData.rarity]} ${RARITY_BORDER[selectedItemData.rarity]}`}
                    >
                      {selectedItemData.rarity.toUpperCase()}
                    </Badge>
                    {selectedItemData.isPremiumOnly && (
                      <Badge className="text-[8px] bg-orange-600/70 text-orange-100 border-orange-500/40">
                        <Sparkles className="h-2 w-2 mr-0.5" />
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-500 mb-2 line-clamp-2">
                    {selectedItemData.description}
                  </p>

                  {/* Price Breakdown */}
                  {!isOwned(selectedItemData.id) && (
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-600" />
                        {deathCoins.toLocaleString()}
                      </span>
                      <span>→</span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          canAfford(selectedItemData.price) ? 'text-emerald-400' : 'text-red-500'
                        }`}
                      >
                        <Coins className="h-3 w-3" />
                        {Math.max(0, deathCoins - selectedItemData.price).toLocaleString()}
                      </span>
                      <Separator orientation="vertical" className="h-3 bg-zinc-800" />
                      <span className="text-yellow-500 font-bold">
                        Cost: {selectedItemData.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {isOwned(selectedItemData.id) ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => equipItem(selectedItemData.id, selectedItemData.category)}
                        className={`text-xs font-bold gap-1.5 ${
                          isEquipped(selectedItemData.id, selectedItemData.category)
                            ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        }`}
                      >
                        {isEquipped(selectedItemData.id, selectedItemData.category) ? (
                          <>
                            <Star className="h-3.5 w-3.5" />
                            EQUIPPED
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5" />
                            EQUIP
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        disabled={!canAfford(selectedItemData.price)}
                        onClick={() => setConfirmDialog(selectedItemData.id)}
                        className={`text-xs font-bold gap-1.5 relative overflow-hidden ${
                          canAfford(selectedItemData.price)
                            ? 'bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-700 hover:from-yellow-600 hover:via-amber-500 hover:to-yellow-600 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {/* Shimmer overlay */}
                        {canAfford(selectedItemData.price) && (
                          <span className="absolute inset-0 overflow-hidden">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          </span>
                        )}
                        <ShoppingCart className="h-3.5 w-3.5 relative z-10" />
                        <span className="relative z-10">{selectedItemData.price.toLocaleString()} COINS</span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ IAP COIN PACKS ═══════ */}
      <div className="flex-shrink-0 border-t border-yellow-900/20 bg-black/60 px-3 py-2 sm:px-6 sm:py-3">
        <p className="text-[9px] sm:text-[10px] text-zinc-600 mb-1.5 tracking-[0.2em] font-mono">
          GET MORE COINS
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 dark-scrollbar">
          {IAP_PACKS.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 relative overflow-hidden border-yellow-700/40 text-yellow-400 hover:bg-yellow-950/30 hover:border-yellow-600/50 text-xs gap-1.5 shadow-[0_0_10px_rgba(234,179,8,0.1)] transition-all duration-200"
                onClick={() => addCoins(pack.coins)}
              >
                {/* Shimmer */}
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-shimmer" />
                </span>
                <Coins className="h-3.5 w-3.5 relative z-10 text-yellow-500" />
                <span className="relative z-10 font-mono font-bold">{pack.coins.toLocaleString()}</span>
                <Separator orientation="vertical" className="h-3 bg-yellow-800/40 relative z-10" />
                <span className="relative z-10 text-yellow-500">{pack.price}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════ PURCHASE CONFIRMATION DIALOG ═══════ */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-black/95 border-red-900/50 text-zinc-200 max-w-sm sm:max-w-md backdrop-blur-sm shadow-[0_0_40px_rgba(139,0,0,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2 font-mono tracking-wider text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              CONFIRM PURCHASE
            </DialogTitle>
          </DialogHeader>

          {confirmDialog && (() => {
            const item = SHOP_ITEMS.find((i) => i.id === confirmDialog);
            if (!item) return null;
            const affordable = canAfford(item.price);

            return (
              <div className="py-2">
                {/* Item Preview */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <div
                    className={`text-4xl p-2 rounded-lg ${RARITY_BG[item.rarity]} border ${RARITY_BORDER[item.rarity]}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className={`font-bold ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[8px] ${RARITY_COLORS[item.rarity]} ${RARITY_BORDER[item.rarity]}`}
                    >
                      {item.rarity.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Animated Coin Counter */}
                <div className="flex flex-col items-center gap-1 mb-3 py-3 rounded-lg bg-black/40 border border-zinc-900">
                  <div className="flex items-center gap-2 text-yellow-400 text-lg font-bold font-mono">
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Coins className="h-5 w-5" />
                    </motion.div>
                    {item.price.toLocaleString()} DEATH COINS
                  </div>

                  {/* Balance Breakdown */}
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-zinc-500">Balance:</span>
                    <span className="text-yellow-500 font-bold">{deathCoins.toLocaleString()}</span>
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      →
                    </motion.span>
                    <span
                      className={`font-bold ${
                        affordable ? 'text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {Math.max(0, deathCoins - item.price).toLocaleString()}
                    </span>
                  </div>

                  {!affordable && (
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-mono mt-1 red-pulse-warning">
                      <Lock className="h-3 w-3" />
                      INSUFFICIENT COINS
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-900 font-mono text-xs"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              CANCEL
            </Button>
            {confirmDialog && (() => {
              const item = SHOP_ITEMS.find((i) => i.id === confirmDialog);
              const affordable = item ? canAfford(item.price) : false;
              return (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    disabled={!affordable}
                    onClick={() => handlePurchase(confirmDialog)}
                    className={`relative overflow-hidden font-bold font-mono text-xs gap-1.5 ${
                      affordable
                        ? 'bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-700 hover:from-yellow-600 hover:via-amber-500 hover:to-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse-glow-red'
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {/* Shimmer overlay */}
                    {affordable && (
                      <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                      </span>
                    )}
                    <ShoppingCart className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">BUY</span>
                  </Button>
                </motion.div>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
