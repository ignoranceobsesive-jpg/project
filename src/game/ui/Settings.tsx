'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore, GraphicsQuality, Language } from '@/stores/settingsStore';
import { useAudioStore } from '@/stores/audioStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Monitor,
  Gamepad2,
  Globe,
  Skull,
  Settings as GearIcon,
  Cpu,
  Eye,
  Zap,
  Crosshair,
  Keyboard,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

/* ================================================================
   GOD LEVEL SETTINGS UI
   ================================================================ */

export default function Settings() {
  const setScene = useGameStore((s) => s.setScene);
  const previousScene = useGameStore((s) => s.previousScene);

  const settings = useSettingsStore();
  const audio = useAudioStore();

  const [activeTab, setActiveTab] = useState('audio');

  const goBack = () => {
    if (previousScene) {
      setScene(previousScene);
    } else {
      setScene('mainMenu');
    }
  };

  const qualityOptions: { value: GraphicsQuality; label: string; color: string; glow: string }[] = [
    { value: 'low', label: 'Low', color: 'text-zinc-400', glow: 'shadow-zinc-500/20' },
    { value: 'medium', label: 'Med', color: 'text-blue-400', glow: 'shadow-blue-500/20' },
    { value: 'high', label: 'High', color: 'text-green-400', glow: 'shadow-green-500/20' },
    { value: 'ultra', label: 'Ultra', color: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  ];

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  const keyBindings = [
    { key: 'W', action: 'Forward' },
    { key: 'A', action: 'Left' },
    { key: 'S', action: 'Back' },
    { key: 'D', action: 'Right' },
    { key: 'F', action: 'Flashlight' },
    { key: 'R', action: 'Reload' },
    { key: 'Q', action: 'Ability' },
    { key: 'E', action: 'Interact' },
    { key: 'Shift', action: 'Sprint' },
    { key: 'Esc', action: 'Pause' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.95)' }}
    >
      {/* Atmospheric overlays */}
      <div className="film-grain-overlay" style={{ opacity: 0.03 }} />
      <div className="vignette-overlay" style={{ boxShadow: 'inset 0 0 120px 40px rgba(0,0,0,0.6)' }} />

      <motion.div
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden"
      >
        <Card
          className="bg-black/90 border border-red-950/40 overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(127,29,29,0.1), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          {/* Red accent line at top */}
          <div
            className="h-0.5"
            style={{
              background: 'linear-gradient(90deg, transparent, #dc2626, #991b1b, #dc2626, transparent)',
            }}
          />

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-4px)] dark-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <Button
                variant="ghost"
                onClick={goBack}
                className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1.5 font-mono text-sm blood-reveal-btn"
              >
                <ChevronLeft className="h-5 w-5" />
                BACK
              </Button>

              <div className="flex items-center gap-3">
                {/* Rotating gear icon */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <GearIcon className="h-4 w-4 text-red-500/60" />
                </motion.div>
                <h2
                  className="text-lg font-black tracking-[0.3em] text-red-400"
                  style={{
                    textShadow: '0 0 20px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.15)',
                  }}
                >
                  SETTINGS
                </h2>
              </div>

              {/* Reset button with warning icon */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={() => settings.resetToDefaults()}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30 gap-1.5 text-xs font-mono group"
                >
                  <motion.div
                    whileHover={{ x: [-1, 1, -1, 1, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </motion.div>
                  <span>RESET</span>
                </Button>
              </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-zinc-900/60 border border-zinc-800/60 mb-5 h-auto p-1">
                <TabsTrigger
                  value="audio"
                  className="flex-1 gap-1.5 text-xs py-2 data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300 data-[state=active]:shadow-[0_0_10px_rgba(220,38,38,0.15)] transition-all"
                >
                  {audio.isMuted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">AUDIO</span>
                </TabsTrigger>
                <TabsTrigger
                  value="graphics"
                  className="flex-1 gap-1.5 text-xs py-2 data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300 data-[state=active]:shadow-[0_0_10px_rgba(220,38,38,0.15)] transition-all"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">GRAPHICS</span>
                </TabsTrigger>
                <TabsTrigger
                  value="controls"
                  className="flex-1 gap-1.5 text-xs py-2 data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300 data-[state=active]:shadow-[0_0_10px_rgba(220,38,38,0.15)] transition-all"
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">CONTROLS</span>
                </TabsTrigger>
                <TabsTrigger
                  value="language"
                  className="flex-1 gap-1.5 text-xs py-2 data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300 data-[state=active]:shadow-[0_0_10px_rgba(220,38,38,0.15)] transition-all"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">LANGUAGE</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {/* ====== AUDIO TAB ====== */}
                {activeTab === 'audio' && (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="audio" className="space-y-5 mt-0">
                      {/* Mute toggle at top */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                        <div className="flex items-center gap-2.5">
                          {audio.isMuted ? (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <Skull className="h-5 w-5 text-red-500" style={{ filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.5))' }} />
                            </motion.div>
                          ) : (
                            <Volume2 className="h-5 w-5 text-red-400/70" />
                          )}
                          <span className="text-sm text-zinc-300">Mute All</span>
                          {audio.isMuted && (
                            <span className="text-[9px] font-mono text-red-400/60 tracking-wider">MUTED</span>
                          )}
                        </div>
                        <Switch
                          checked={audio.isMuted}
                          onCheckedChange={audio.toggleMute}
                          className="data-[state=checked]:bg-red-700 data-[state=unchecked]:bg-zinc-700"
                        />
                      </div>

                      <HorrorVolumeSlider
                        label="Master Volume"
                        value={audio.masterVolume}
                        onChange={audio.setMasterVolume}
                        icon={<Volume2 className="h-3.5 w-3.5" />}
                      />
                      <HorrorVolumeSlider
                        label="Music"
                        value={audio.musicVolume}
                        onChange={audio.setMusicVolume}
                        icon={<Zap className="h-3.5 w-3.5" />}
                      />
                      <HorrorVolumeSlider
                        label="SFX"
                        value={audio.sfxVolume}
                        onChange={audio.setSfxVolume}
                        icon={<Cpu className="h-3.5 w-3.5" />}
                      />
                      <HorrorVolumeSlider
                        label="Voice"
                        value={audio.voiceVolume}
                        onChange={audio.setVoiceVolume}
                        icon={<Eye className="h-3.5 w-3.5" />}
                      />
                    </TabsContent>
                  </motion.div>
                )}

                {/* ====== GRAPHICS TAB ====== */}
                {activeTab === 'graphics' && (
                  <motion.div
                    key="graphics"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="graphics" className="space-y-5 mt-0">
                      {/* Quality presets */}
                      <div>
                        <p className="text-sm text-zinc-300 mb-3 flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-red-400/60" />
                          Quality Preset
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {qualityOptions.map((opt) => (
                            <motion.button
                              key={opt.value}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => settings.setGraphicsQuality(opt.value)}
                              className={`relative px-2 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 border overflow-hidden ${
                                settings.graphicsQuality === opt.value
                                  ? `${opt.color} border-current ${opt.glow}`
                                  : 'text-zinc-500 border-zinc-800 bg-zinc-900/30'
                              }`}
                              style={
                                settings.graphicsQuality === opt.value
                                  ? { boxShadow: `0 0 15px currentColor` }
                                  : undefined
                              }
                            >
                              {settings.graphicsQuality === opt.value && (
                                <motion.div
                                  layoutId="quality-glow"
                                  className="absolute inset-0 opacity-10"
                                  style={{
                                    background: 'currentColor',
                                  }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{opt.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-zinc-800/50" />

                      {/* Toggle settings */}
                      <HorrorToggle label="Shadows" checked={settings.shadows} onChange={settings.setShadows} icon="🌑" />
                      <HorrorToggle label="Post-Processing" checked={settings.postProcessing} onChange={settings.setPostProcessing} icon="✨" />
                      <HorrorToggle label="VSync" checked={settings.vsync} onChange={settings.setVsync} icon="🔄" />
                      <HorrorToggle label="Show FPS" checked={settings.showFps} onChange={settings.setShowFps} icon="📊" />
                      <HorrorToggle label="Screen Shake" checked={settings.screenShake} onChange={settings.setScreenShake} icon="📳" />
                      <HorrorToggle label="Blood Effects" checked={settings.bloodEffects} onChange={settings.setBloodEffects} icon="🩸" />
                      <HorrorToggle label="Jump Scares" checked={settings.jumpScares} onChange={settings.setJumpScares} icon="😱" />

                      {/* FPS counter preview */}
                      {settings.showFps && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-green-900/30 bg-green-950/10"
                        >
                          <span className="text-xs text-green-400/80 font-mono">FPS Counter Active</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-400 font-mono font-bold">60</span>
                          </div>
                        </motion.div>
                      )}
                    </TabsContent>
                  </motion.div>
                )}

                {/* ====== CONTROLS TAB ====== */}
                {activeTab === 'controls' && (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="controls" className="space-y-5 mt-0">
                      {/* Sensitivity with crosshair preview */}
                      <div className="p-4 rounded-lg border border-zinc-800/60 bg-zinc-900/20">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-zinc-300 flex items-center gap-2">
                            <Crosshair className="h-4 w-4 text-red-400/60" />
                            Mouse Sensitivity
                          </span>
                          <span className="text-red-400 font-mono font-bold tabular-nums">{settings.sensitivity}</span>
                        </div>

                        <Slider
                          value={[settings.sensitivity]}
                          onValueChange={([v]) => settings.setSensitivity(v)}
                          min={1}
                          max={100}
                          step={1}
                          className="w-full"
                        />

                        {/* Crosshair preview */}
                        <div className="flex items-center justify-center mt-4 h-16 relative">
                          <div className="text-zinc-700/30 text-xs font-mono absolute bottom-0">CROSSHAIR PREVIEW</div>
                          <svg
                            width="60"
                            height="60"
                            viewBox="0 0 60 60"
                            className="opacity-60"
                          >
                            {/* Dynamic crosshair that grows/shrinks with sensitivity */}
                            <line
                              x1="30"
                              y1={30 - 4 - settings.sensitivity * 0.12}
                              x2="30"
                              y2={30 - 3}
                              stroke="#dc2626"
                              strokeWidth="1.5"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }}
                            />
                            <line
                              x1="30"
                              y1={30 + 3}
                              x2="30"
                              y2={30 + 4 + settings.sensitivity * 0.12}
                              stroke="#dc2626"
                              strokeWidth="1.5"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }}
                            />
                            <line
                              x1={30 - 4 - settings.sensitivity * 0.12}
                              y1="30"
                              x2={30 - 3}
                              y2="30"
                              stroke="#dc2626"
                              strokeWidth="1.5"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }}
                            />
                            <line
                              x1={30 + 3}
                              y1="30"
                              x2={30 + 4 + settings.sensitivity * 0.12}
                              y2="30"
                              stroke="#dc2626"
                              strokeWidth="1.5"
                              style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }}
                            />
                            <circle cx="30" cy="30" r="1.5" fill="#dc2626" style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.5))' }} />
                          </svg>
                        </div>
                      </div>

                      <Separator className="bg-zinc-800/50" />

                      <HorrorToggle label="Invert Y-Axis" checked={settings.invertY} onChange={settings.setInvertY} icon="↕️" />
                      <HorrorToggle label="Vibration" checked={settings.vibration} onChange={settings.setVibration} icon="📳" />
                      <HorrorToggle label="Auto-Aim" checked={settings.autoAim} onChange={settings.setAutoAim} icon="🎯" />
                      <HorrorToggle label="Show Mini-Map" checked={settings.showMinimap} onChange={settings.setShowMinimap} icon="🗺️" />

                      <Separator className="bg-zinc-800/50" />

                      {/* Key bindings */}
                      <div>
                        <p className="text-sm text-zinc-300 mb-3 flex items-center gap-2">
                          <Keyboard className="h-4 w-4 text-red-400/60" />
                          Key Bindings
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {keyBindings.map((binding) => (
                            <div
                              key={binding.key}
                              className="flex items-center justify-between px-3 py-2 rounded-md border border-zinc-800/40 bg-zinc-900/20"
                            >
                              <span className="text-[11px] text-zinc-400">{binding.action}</span>
                              <kbd
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-red-400/80 border border-red-900/30 bg-red-950/20"
                                style={{ textShadow: '0 0 4px rgba(220,38,38,0.3)' }}
                              >
                                {binding.key}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {/* ====== LANGUAGE TAB ====== */}
                {activeTab === 'language' && (
                  <motion.div
                    key="language"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="language" className="space-y-2 mt-0">
                      <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-red-400/60" />
                        Select Language
                      </p>
                      {languageOptions.map((opt, index) => (
                        <motion.button
                          key={opt.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => settings.setLanguage(opt.value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 border overflow-hidden ${
                            settings.language === opt.value
                              ? 'border-red-700/50 bg-red-950/20 text-red-300'
                              : 'border-zinc-800/40 bg-zinc-900/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                          }`}
                          style={
                            settings.language === opt.value
                              ? { boxShadow: '0 0 15px rgba(220,38,38,0.1)' }
                              : undefined
                          }
                        >
                          {/* Flag-like emoji */}
                          <span className="text-xl">{opt.flag}</span>
                          <span className="flex-1 text-left font-medium">{opt.label}</span>
                          {settings.language === opt.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-red-400" style={{ filter: 'drop-shadow(0 0 4px rgba(220,38,38,0.4))' }} />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>

            {/* Footer - auto-save indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-zinc-800/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">Changes auto-saved</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   HORROR VOLUME SLIDER - Custom styled with waveform
   ================================================================ */

function HorrorVolumeSlider({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-lg border border-zinc-800/40 bg-zinc-900/15">
      <div className="flex justify-between text-sm mb-2.5">
        <span className="text-zinc-300 flex items-center gap-2">
          <span className="text-red-400/50">{icon}</span>
          {label}
        </span>
        <span className="font-mono tabular-nums" style={{ color: value > 80 ? '#ef4444' : value > 50 ? '#fbbf24' : '#71717a' }}>
          {value}%
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      {/* Waveform visualization */}
      <div className="flex items-end justify-center gap-[2px] h-6 mt-2">
        {Array.from({ length: 20 }).map((_, i) => {
          const normalizedPos = i / 19;
          const isActive = normalizedPos <= value / 100;
          const baseHeight = 3 + Math.sin(i * 0.8) * 4 + Math.random() * 2;
          const height = isActive ? Math.max(4, baseHeight * (0.5 + (value / 100) * 0.8)) : 3;

          return (
            <motion.div
              key={i}
              className="w-[3px] rounded-full transition-colors duration-300"
              style={{
                height: `${height}px`,
                backgroundColor: isActive
                  ? value > 80
                    ? `rgba(239, 68, 68, ${0.4 + (i / 20) * 0.4})`
                    : value > 50
                      ? `rgba(251, 191, 36, ${0.4 + (i / 20) * 0.4})`
                      : `rgba(220, 38, 38, ${0.3 + (i / 20) * 0.3})`
                  : 'rgba(63, 63, 70, 0.3)',
                boxShadow: isActive ? `0 0 4px currentColor` : 'none',
              }}
              animate={
                isActive && value > 0
                  ? { height: [`${height}px`, `${height * (0.7 + Math.random() * 0.6)}px`, `${height}px`] }
                  : { height: `${height}px` }
              }
              transition={{
                duration: 0.3 + Math.random() * 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: i * 0.02,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   HORROR TOGGLE - Consistent horror-styled switch
   ================================================================ */

function HorrorToggle({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-1 group">
      <span className="text-sm text-zinc-300 flex items-center gap-2">
        {icon && <span className="text-xs">{icon}</span>}
        {label}
      </span>
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-red-700 data-[state=unchecked]:bg-zinc-700 transition-colors duration-300"
        />
        {checked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"
            style={{
              boxShadow: '0 0 6px rgba(220,38,38,0.6)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}
