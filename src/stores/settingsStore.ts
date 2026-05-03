import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';

interface SettingsState {
  graphicsQuality: GraphicsQuality;
  shadows: boolean;
  postProcessing: boolean;
  vsync: boolean;
  sensitivity: number;
  invertY: boolean;
  vibration: boolean;
  autoAim: boolean;
  language: Language;
  showFps: boolean;
  showMinimap: boolean;
  screenShake: boolean;
  bloodEffects: boolean;
  jumpScares: boolean;

  setGraphicsQuality: (q: GraphicsQuality) => void;
  setShadows: (on: boolean) => void;
  setPostProcessing: (on: boolean) => void;
  setVsync: (on: boolean) => void;
  setSensitivity: (val: number) => void;
  setInvertY: (on: boolean) => void;
  setVibration: (on: boolean) => void;
  setAutoAim: (on: boolean) => void;
  setLanguage: (lang: Language) => void;
  setShowFps: (on: boolean) => void;
  setShowMinimap: (on: boolean) => void;
  setScreenShake: (on: boolean) => void;
  setBloodEffects: (on: boolean) => void;
  setJumpScares: (on: boolean) => void;
  resetToDefaults: () => void;
}

const defaults = {
  graphicsQuality: 'high' as GraphicsQuality,
  shadows: true,
  postProcessing: true,
  vsync: true,
  sensitivity: 50,
  invertY: false,
  vibration: true,
  autoAim: false,
  language: 'en' as Language,
  showFps: false,
  showMinimap: true,
  screenShake: true,
  bloodEffects: true,
  jumpScares: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setGraphicsQuality: (q) => set({ graphicsQuality: q }),
      setShadows: (on) => set({ shadows: on }),
      setPostProcessing: (on) => set({ postProcessing: on }),
      setVsync: (on) => set({ vsync: on }),
      setSensitivity: (val) => set({ sensitivity: val }),
      setInvertY: (on) => set({ invertY: on }),
      setVibration: (on) => set({ vibration: on }),
      setAutoAim: (on) => set({ autoAim: on }),
      setLanguage: (lang) => set({ language: lang }),
      setShowFps: (on) => set({ showFps: on }),
      setShowMinimap: (on) => set({ showMinimap: on }),
      setScreenShake: (on) => set({ screenShake: on }),
      setBloodEffects: (on) => set({ bloodEffects: on }),
      setJumpScares: (on) => set({ jumpScares: on }),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: 'apocalypse-settings',
    }
  )
);
