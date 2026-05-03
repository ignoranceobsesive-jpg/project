import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AudioState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  isMuted: boolean;
  currentMusic: string | null;
  isMusicPlaying: boolean;
  ambientIntensity: number; // 0-1 based on nearby zombies
  heartbeatRate: number; // BPM
  combatState: 'calm' | 'alert' | 'combat' | 'boss';
  lastAmbientSfx: number;

  setMasterVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setVoiceVolume: (vol: number) => void;
  toggleMute: () => void;
  playMusic: (track: string) => void;
  stopMusic: () => void;
  setAmbientIntensity: (intensity: number) => void;
  setHeartbeatRate: (rate: number) => void;
  setCombatState: (state: AudioState['combatState']) => void;
  playSfx: (name: string, position?: [number, number, number]) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      masterVolume: 80,
      musicVolume: 60,
      sfxVolume: 75,
      voiceVolume: 80,
      isMuted: false,
      currentMusic: null,
      isMusicPlaying: false,
      ambientIntensity: 0,
      heartbeatRate: 60,
      combatState: 'calm',
      lastAmbientSfx: 0,

      setMasterVolume: (vol) => set({ masterVolume: Math.max(0, Math.min(100, vol)) }),
      setMusicVolume: (vol) => set({ musicVolume: Math.max(0, Math.min(100, vol)) }),
      setSfxVolume: (vol) => set({ sfxVolume: Math.max(0, Math.min(100, vol)) }),
      setVoiceVolume: (vol) => set({ voiceVolume: Math.max(0, Math.min(100, vol)) }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      playMusic: (track) => set({ currentMusic: track, isMusicPlaying: true }),
      stopMusic: () => set({ isMusicPlaying: false, currentMusic: null }),
      setAmbientIntensity: (intensity) => set({ ambientIntensity: intensity }),
      setHeartbeatRate: (rate) => set({ heartbeatRate: rate }),
      setCombatState: (state) => set({ combatState: state }),
      playSfx: (name, _position) => {
        // SFX playback is handled by the AudioSystem component
        // This just logs the event for the system to pick up
        set({ lastAmbientSfx: Date.now() });
      },
    }),
    {
      name: 'apocalypse-audio-settings',
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        voiceVolume: state.voiceVolume,
        isMuted: state.isMuted,
      }),
    }
  )
);
