'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore, SURVIVORS, SurvivorId, Survivor } from '@/stores/playerStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Swords, Heart, Zap, Shield, Star } from 'lucide-react';

const survivorIds: SurvivorId[] = ['marcus', 'elena', 'viktor', 'sara', 'dexter'];

const statConfig = [
  { key: 'maxHealth' as const, label: 'HEALTH', icon: Heart, color: 'bg-red-500', max: 150 },
  { key: 'speed' as const, label: 'SPEED', icon: Zap, color: 'bg-yellow-500', max: 10 },
  { key: 'damage' as const, label: 'DAMAGE', icon: Swords, color: 'bg-orange-500', max: 10 },
  { key: 'abilityPower' as const, label: 'ABILITY', icon: Star, color: 'bg-purple-500', max: 10 },
];

export default function CharacterSelect() {
  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);
  const selectSurvivor = usePlayerStore((s) => s.selectSurvivor);
  const setScene = useGameStore((s) => s.setScene);
  const [hoveredId, setHoveredId] = useState<SurvivorId | null>(null);

  const selected = SURVIVORS[selectedSurvivor];

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.94)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => setScene('mainMenu')}
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          BACK
        </Button>
        <h2 className="text-lg sm:text-xl font-bold tracking-[0.3em] text-red-400">SELECT SURVIVOR</h2>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Survivor Cards Row */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto max-w-full pb-2 px-2">
          {survivorIds.map((id, index) => {
            const s = SURVIVORS[id];
            const isSelected = id === selectedSurvivor;
            const isHovered = id === hoveredId;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => selectSurvivor(id)}
                className="cursor-pointer flex-shrink-0"
              >
                <Card
                  className={`relative w-36 sm:w-44 p-3 sm:p-4 transition-all duration-300 bg-black/60 border-2
                    ${isSelected
                      ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.3)] scale-105'
                      : isHovered
                        ? 'border-zinc-600 scale-102'
                        : 'border-zinc-800'
                    }`}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                    style={{ backgroundColor: s.color }}
                  />

                  {/* Character avatar area */}
                  <div
                    className="w-full h-20 sm:h-24 rounded mb-2 flex items-center justify-center text-3xl sm:text-4xl font-black"
                    style={{ backgroundColor: `${s.color}22`, color: s.color }}
                  >
                    {s.name.charAt(0)}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-center tracking-wider"
                    style={{ color: isSelected ? '#ef4444' : '#d4d4d8' }}
                  >
                    {s.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 text-center mt-0.5">{s.role}</p>

                  {/* Mini stat bars */}
                  <div className="mt-2 space-y-1">
                    {statConfig.map((stat) => (
                      <div key={stat.key} className="flex items-center gap-1.5">
                        <stat.icon className="h-2.5 w-2.5 text-zinc-600 flex-shrink-0" />
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${stat.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(s[stat.key] / stat.max) * 100}%` }}
                            transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="selected-badge"
                      className="absolute -top-2 -right-2"
                    >
                      <Badge className="bg-red-600 text-white text-[10px]">SELECTED</Badge>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected survivor detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSurvivor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-black/60 border border-zinc-800 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Left: Stats */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4" style={{ color: selected.color }} />
                    <h3 className="font-bold tracking-wider" style={{ color: selected.color }}>
                      {selected.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {statConfig.map((stat) => {
                      const value = selected[stat.key];
                      const pct = (value / stat.max) * 100;
                      return (
                        <div key={stat.key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <stat.icon className="h-3 w-3" />
                              {stat.label}
                            </span>
                            <span className="text-zinc-300 font-mono">{value}</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${stat.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Abilities & Backstory */}
                <div>
                  {/* Ability */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-orange-400 border-orange-800 mb-1.5">
                      ABILITY
                    </Badge>
                    <h4 className="text-sm font-bold text-orange-300">{selected.abilityName}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{selected.abilityDescription}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Cooldown: {selected.abilityCooldown}s</p>
                  </div>

                  {/* Passive */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-green-400 border-green-800 mb-1.5">
                      PASSIVE
                    </Badge>
                    <p className="text-xs text-zinc-400">{selected.passiveDescription}</p>
                  </div>

                  {/* Backstory */}
                  <ScrollArea className="h-20">
                    <p className="text-[11px] text-zinc-600 italic leading-relaxed">
                      {selected.backstory}
                    </p>
                  </ScrollArea>
                </div>
              </div>

              {/* Play Button */}
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setScene('gameplay')}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold tracking-[0.2em]
                    px-10 h-12 shadow-[0_0_20px_rgba(220,38,38,0.4)]
                    hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  START GAME
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
