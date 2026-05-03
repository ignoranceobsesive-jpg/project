'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore, GraphicsQuality, Language } from '@/stores/settingsStore';
import { useAudioStore } from '@/stores/audioStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, RotateCcw, Volume2, Monitor, Gamepad2, Globe } from 'lucide-react';

export default function Settings() {
  const setScene = useGameStore((s) => s.setScene);
  const previousScene = useGameStore((s) => s.previousScene);

  const settings = useSettingsStore();
  const audio = useAudioStore();

  const goBack = () => {
    if (previousScene) {
      setScene(previousScene);
    } else {
      setScene('mainMenu');
    }
  };

  const qualityOptions: { value: GraphicsQuality; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Med' },
    { value: 'high', label: 'High' },
    { value: 'ultra', label: 'Ultra' },
  ];

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.95)' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-black/90 border border-zinc-800 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1"
            >
              <ChevronLeft className="h-5 w-5" />
              BACK
            </Button>
            <h2 className="text-lg font-bold tracking-[0.3em] text-red-400">SETTINGS</h2>
            <Button
              variant="ghost"
              onClick={() => {
                settings.resetToDefaults();
              }}
              className="text-zinc-500 hover:text-orange-400 hover:bg-orange-950/20 gap-1 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RESET
            </Button>
          </div>

          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="w-full bg-zinc-900/60 border border-zinc-800 mb-4">
              <TabsTrigger value="audio" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300">
                <Volume2 className="h-3.5 w-3.5" />
                AUDIO
              </TabsTrigger>
              <TabsTrigger value="graphics" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300">
                <Monitor className="h-3.5 w-3.5" />
                GRAPHICS
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300">
                <Gamepad2 className="h-3.5 w-3.5" />
                CONTROLS
              </TabsTrigger>
              <TabsTrigger value="language" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-red-900/40 data-[state=active]:text-red-300">
                <Globe className="h-3.5 w-3.5" />
                LANG
              </TabsTrigger>
            </TabsList>

            {/* AUDIO TAB */}
            <TabsContent value="audio" className="space-y-5">
              <VolumeSlider
                label="Master Volume"
                value={audio.masterVolume}
                onChange={audio.setMasterVolume}
              />
              <VolumeSlider
                label="Music"
                value={audio.musicVolume}
                onChange={audio.setMusicVolume}
              />
              <VolumeSlider
                label="SFX"
                value={audio.sfxVolume}
                onChange={audio.setSfxVolume}
              />
              <VolumeSlider
                label="Voice"
                value={audio.voiceVolume}
                onChange={audio.setVoiceVolume}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Mute All</span>
                <Switch
                  checked={audio.isMuted}
                  onCheckedChange={audio.toggleMute}
                />
              </div>
            </TabsContent>

            {/* GRAPHICS TAB */}
            <TabsContent value="graphics" className="space-y-5">
              <div>
                <p className="text-sm text-zinc-300 mb-2">Quality Preset</p>
                <div className="flex gap-2">
                  {qualityOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={settings.graphicsQuality === opt.value ? 'default' : 'outline'}
                      className={`flex-1 text-xs ${
                        settings.graphicsQuality === opt.value
                          ? 'bg-red-700 hover:bg-red-600 text-white'
                          : 'border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                      onClick={() => settings.setGraphicsQuality(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <SettingToggle label="Shadows" checked={settings.shadows} onChange={settings.setShadows} />
              <SettingToggle label="Post-Processing" checked={settings.postProcessing} onChange={settings.setPostProcessing} />
              <SettingToggle label="VSync" checked={settings.vsync} onChange={settings.setVsync} />
              <SettingToggle label="Show FPS" checked={settings.showFps} onChange={settings.setShowFps} />
              <SettingToggle label="Screen Shake" checked={settings.screenShake} onChange={settings.setScreenShake} />
              <SettingToggle label="Blood Effects" checked={settings.bloodEffects} onChange={settings.setBloodEffects} />
              <SettingToggle label="Jump Scares" checked={settings.jumpScares} onChange={settings.setJumpScares} />
            </TabsContent>

            {/* CONTROLS TAB */}
            <TabsContent value="controls" className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">Mouse Sensitivity</span>
                  <span className="text-zinc-500 font-mono">{settings.sensitivity}</span>
                </div>
                <Slider
                  value={[settings.sensitivity]}
                  onValueChange={([v]) => settings.setSensitivity(v)}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <SettingToggle label="Invert Y-Axis" checked={settings.invertY} onChange={settings.setInvertY} />
              <SettingToggle label="Vibration" checked={settings.vibration} onChange={settings.setVibration} />
              <SettingToggle label="Auto-Aim" checked={settings.autoAim} onChange={settings.setAutoAim} />
              <SettingToggle label="Show Mini-Map" checked={settings.showMinimap} onChange={settings.setShowMinimap} />
            </TabsContent>

            {/* LANGUAGE TAB */}
            <TabsContent value="language" className="space-y-2">
              {languageOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={settings.language === opt.value ? 'default' : 'outline'}
                  className={`w-full justify-start text-sm ${
                    settings.language === opt.value
                      ? 'bg-red-700 hover:bg-red-600 text-white'
                      : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                  onClick={() => settings.setLanguage(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500 font-mono">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
}

function SettingToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
