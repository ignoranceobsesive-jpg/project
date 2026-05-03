'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useEconomyStore, SHOP_ITEMS, IAP_PACKS, ShopCategory, ItemRarity } from '@/stores/economyStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Coins, Check, Lock, ShoppingCart, Sparkles } from 'lucide-react';

const CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: 'skins', label: 'SKINS' },
  { value: 'weapons', label: 'WEAPONS' },
  { value: 'emotes', label: 'EMOTES' },
  { value: 'effects', label: 'EFFECTS' },
  { value: 'flashlights', label: 'FLASHLIGHTS' },
  { value: 'bundles', label: 'BUNDLES' },
];

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-zinc-400 border-zinc-600',
  rare: 'text-blue-400 border-blue-700',
  legendary: 'text-yellow-400 border-yellow-700',
};

const RARITY_BG: Record<ItemRarity, string> = {
  common: 'bg-zinc-900/60',
  rare: 'bg-blue-950/30',
  legendary: 'bg-yellow-950/30',
};

export default function ShopUI() {
  const setScene = useGameStore((s) => s.setScene);
  const deathCoins = useEconomyStore((s) => s.deathCoins);
  const ownedItems = useEconomyStore((s) => s.ownedItems);
  const equippedItems = useEconomyStore((s) => s.equippedItems);
  const purchaseItem = useEconomyStore((s) => s.purchaseItem);
  const equipItem = useEconomyStore((s) => s.equipItem);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);

  const isOwned = (id: string) => ownedItems.includes(id);
  const isEquipped = (id: string, cat: ShopCategory) => equippedItems[cat] === id;
  const canAfford = (price: number) => deathCoins >= price;

  const handlePurchase = (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    if (purchaseItem(itemId)) {
      equipItem(itemId, item.category);
      setConfirmDialog(null);
    }
  };

  const selectedItemData = selectedItem ? SHOP_ITEMS.find((i) => i.id === selectedItem) : null;

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

        <h2 className="text-lg font-bold tracking-[0.3em] text-red-400">SHOP</h2>

        {/* Death Coins Balance */}
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-yellow-800/40">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="font-mono text-sm text-yellow-400 font-bold">{deathCoins}</span>
        </div>
      </div>

      {/* Tabs + Content */}
      <Tabs defaultValue="skins" className="flex-1 flex flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full bg-zinc-900/60 border border-zinc-800 flex-wrap h-auto gap-1 p-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex-1 text-[10px] sm:text-xs data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300 min-w-0"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CATEGORIES.map((cat) => {
          const items = SHOP_ITEMS.filter((i) => i.category === cat.value);
          return (
            <TabsContent key={cat.value} value={cat.value} className="flex-1 p-4">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item.id, item.category);
                    const affordable = canAfford(item.price);

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedItem(item.id)}
                      >
                        <Card
                          className={`relative p-3 cursor-pointer transition-all duration-200 border
                            ${equipped ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-zinc-800 hover:border-zinc-600'}
                            ${RARITY_BG[item.rarity]}`}
                        >
                          {/* Rarity badge */}
                          <Badge
                            variant="outline"
                            className={`absolute top-1.5 right-1.5 text-[9px] ${RARITY_COLORS[item.rarity]}`}
                          >
                            {item.rarity.toUpperCase()}
                          </Badge>

                          {/* Icon */}
                          <div className="text-3xl text-center mb-2">{item.icon}</div>

                          {/* Name */}
                          <p className="text-xs font-bold text-center text-zinc-200 truncate">{item.name}</p>

                          {/* Price or status */}
                          <div className="mt-2 text-center">
                            {owned ? (
                              equipped ? (
                                <div className="flex items-center justify-center gap-1 text-yellow-400 text-[10px] font-bold">
                                  <Check className="h-3 w-3" />
                                  EQUIPPED
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 text-green-400 text-[10px] font-bold">
                                  <Check className="h-3 w-3" />
                                  OWNED
                                </div>
                              )
                            ) : (
                              <div className={`flex items-center justify-center gap-1 text-[10px] font-bold
                                ${affordable ? 'text-yellow-400' : 'text-zinc-600'}`}
                              >
                                <Coins className="h-3 w-3" />
                                {item.price}
                              </div>
                            )}

                            {item.isPremiumOnly && !owned && (
                              <div className="flex items-center justify-center gap-1 text-[9px] text-orange-400 mt-0.5">
                                <Sparkles className="h-2.5 w-2.5" />
                                PREMIUM
                              </div>
                            )}
                          </div>

                          {/* Insufficient overlay */}
                          {!owned && !affordable && (
                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                              <Lock className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Selected item detail / IAP packs */}
      <div className="border-t border-zinc-800 p-4">
        {selectedItemData && (
          <div className="flex items-center justify-between mb-3 p-3 bg-zinc-900/40 rounded border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedItemData.icon}</span>
              <div>
                <p className="text-sm font-bold text-zinc-200">{selectedItemData.name}</p>
                <p className="text-xs text-zinc-500">{selectedItemData.description}</p>
              </div>
            </div>
            {isOwned(selectedItemData.id) ? (
              <Button
                size="sm"
                onClick={() => equipItem(selectedItemData.id, selectedItemData.category)}
                variant="outline"
                className={`text-xs ${
                  isEquipped(selectedItemData.id, selectedItemData.category)
                    ? 'border-yellow-600 text-yellow-400'
                    : 'border-green-700 text-green-400'
                }`}
              >
                {isEquipped(selectedItemData.id, selectedItemData.category) ? 'EQUIPPED' : 'EQUIP'}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!canAfford(selectedItemData.price)}
                onClick={() => setConfirmDialog(selectedItemData.id)}
                className={`text-xs ${
                  canAfford(selectedItemData.price)
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {selectedItemData.price} COINS
              </Button>
            )}
          </div>
        )}

        {/* IAP Coin Packs */}
        <div>
          <p className="text-[10px] text-zinc-600 mb-2 tracking-wider">GET MORE COINS</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {IAP_PACKS.map((pack) => (
              <Button
                key={pack.id}
                size="sm"
                variant="outline"
                className="flex-shrink-0 border-yellow-800/40 text-yellow-400 hover:bg-yellow-950/30 text-xs"
                onClick={() => {
                  // Simulate purchase
                  useEconomyStore.getState().addCoins(pack.coins);
                }}
              >
                <Coins className="h-3 w-3 mr-1" />
                {pack.name} — {pack.price}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-black/95 border-zinc-800 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-red-400">Confirm Purchase</DialogTitle>
          </DialogHeader>
          {confirmDialog && (() => {
            const item = SHOP_ITEMS.find((i) => i.id === confirmDialog);
            if (!item) return null;
            return (
              <div className="py-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-lg font-bold">
                  <Coins className="h-5 w-5" />
                  {item.price} DEATH COINS
                </div>
                <p className="text-center text-xs text-zinc-500 mt-1">
                  Balance: {deathCoins} → {deathCoins - item.price}
                </p>
              </div>
            );
          })()}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} className="border-zinc-700 text-zinc-400">
              Cancel
            </Button>
            <Button
              onClick={() => confirmDialog && handlePurchase(confirmDialog)}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
            >
              BUY
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
