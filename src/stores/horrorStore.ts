import { create } from 'zustand';

export type JumpScareType =
  | 'mirror_zombie'
  | 'corpse_hand'
  | 'vent_crawler'
  | 'lights_out'
  | 'door_creak'
  | 'window_face'
  | 'elevator_arms'
  | 'radio_whisper'
  | 'ceiling_crawler'
  | 'typewriter'
  | 'fridge_zombie'
  | 'moving_shadow'
  | 'piano_notes'
  | 'toilet_flush'
  | 'photocopier'
  | 'baby_monitor'
  | 'mannequin'
  | 'security_cam'
  | 'heartbeat_monitor'
  | 'behind_you';

export interface JumpScareEvent {
  type: JumpScareType;
  triggered: boolean;
  triggerChance: number; // 0-1
  location: [number, number, number];
  floor: number;
  cooldown: number;
}

export interface BloodDecal {
  id: string;
  position: [number, number, number];
  size: number;
  opacity: number;
  spread: number;
  timestamp: number;
}

export interface ScreenShakeEvent {
  intensity: number;
  duration: number;
  decay: number;
  timestamp: number;
}

interface HorrorState {
  jumpScares: JumpScareEvent[];
  triggeredScares: Set<string>;
  bloodDecals: BloodDecal[];
  screenShake: ScreenShakeEvent | null;
  cameraShakeIntensity: number;
  bloodOnScreen: number; // 0-1
  fearLevel: number; // 0-1
  isFlickering: boolean;
  flickerTimer: number;
  ambientEventTimer: number;
  nextAmbientEvent: number;

  triggerJumpScare: (type: JumpScareType) => void;
  checkJumpScares: (playerPos: [number, number, number], floor: number) => void;
  addBloodDecal: (position: [number, number, number], size: number) => void;
  addScreenShake: (intensity: number, duration: number) => void;
  setBloodOnScreen: (amount: number) => void;
  setFearLevel: (level: number) => void;
  setFlickering: (on: boolean) => void;
  tickHorror: (delta: number) => void;
  resetHorror: () => void;
}

export const JUMP_SCARE_DEFINITIONS: Omit<JumpScareEvent, 'triggered'>[] = [
  { type: 'mirror_zombie', triggerChance: 0.15, location: [15, 1.5, 8], floor: 2, cooldown: 0 },
  { type: 'corpse_hand', triggerChance: 0.15, location: [5, 0.5, 12], floor: 1, cooldown: 0 },
  { type: 'vent_crawler', triggerChance: 0.15, location: [20, 2.5, 5], floor: 2, cooldown: 0 },
  { type: 'lights_out', triggerChance: 0.15, location: [10, 1.5, 10], floor: 1, cooldown: 0 },
  { type: 'door_creak', triggerChance: 0.15, location: [8, 1.5, 15], floor: 1, cooldown: 0 },
  { type: 'window_face', triggerChance: 0.15, location: [25, 2, 3], floor: 2, cooldown: 0 },
  { type: 'elevator_arms', triggerChance: 0.15, location: [12, 1.5, 20], floor: 1, cooldown: 0 },
  { type: 'radio_whisper', triggerChance: 0.15, location: [18, 1.5, 12], floor: 2, cooldown: 0 },
  { type: 'ceiling_crawler', triggerChance: 0.15, location: [7, 3, 15], floor: 3, cooldown: 0 },
  { type: 'typewriter', triggerChance: 0.15, location: [22, 1, 8], floor: 2, cooldown: 0 },
  { type: 'fridge_zombie', triggerChance: 0.15, location: [30, 1.5, 5], floor: 2, cooldown: 0 },
  { type: 'moving_shadow', triggerChance: 0.15, location: [3, 1.5, 3], floor: 1, cooldown: 0 },
  { type: 'piano_notes', triggerChance: 0.15, location: [16, 1, 18], floor: 1, cooldown: 0 },
  { type: 'toilet_flush', triggerChance: 0.15, location: [28, 0.5, 10], floor: 2, cooldown: 0 },
  { type: 'photocopier', triggerChance: 0.15, location: [20, 1, 15], floor: 2, cooldown: 0 },
  { type: 'baby_monitor', triggerChance: 0.15, location: [10, 1, 25], floor: 3, cooldown: 0 },
  { type: 'mannequin', triggerChance: 0.15, location: [5, 1.5, 20], floor: 3, cooldown: 0 },
  { type: 'security_cam', triggerChance: 0.15, location: [15, 2, 22], floor: 2, cooldown: 0 },
  { type: 'heartbeat_monitor', triggerChance: 0.15, location: [8, 1, 28], floor: 3, cooldown: 0 },
  { type: 'behind_you', triggerChance: 0.15, location: [12, 1.5, 12], floor: 3, cooldown: 0 },
];

let decalId = 0;

export const useHorrorStore = create<HorrorState>()((set, get) => ({
  jumpScares: JUMP_SCARE_DEFINITIONS.map((s) => ({ ...s, triggered: false })),
  triggeredScares: new Set<string>(),
  bloodDecals: [],
  screenShake: null,
  cameraShakeIntensity: 0,
  bloodOnScreen: 0,
  fearLevel: 0,
  isFlickering: false,
  flickerTimer: 0,
  ambientEventTimer: 0,
  nextAmbientEvent: 10 + Math.random() * 20,

  triggerJumpScare: (type) => {
    set((s) => ({
      triggeredScares: new Set([...s.triggeredScares, type]),
      cameraShakeIntensity: 1,
      fearLevel: Math.min(1, s.fearLevel + 0.3),
    }));
    // Auto-recover after scare
    setTimeout(() => {
      set((s) => ({ cameraShakeIntensity: Math.max(0, s.cameraShakeIntensity - 0.5) }));
    }, 500);
  },

  checkJumpScares: (playerPos, floor) => {
    const state = get();
    for (const scare of state.jumpScares) {
      if (scare.triggered || scare.floor !== floor) continue;
      if (state.triggeredScares.has(scare.type)) continue;
      const dx = playerPos[0] - scare.location[0];
      const dz = playerPos[2] - scare.location[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3 && Math.random() < scare.triggerChance) {
        get().triggerJumpScare(scare.type);
        set((s) => ({
          jumpScares: s.jumpScares.map((sc) =>
            sc.type === scare.type ? { ...sc, triggered: true } : sc
          ),
        }));
        break; // Only one scare at a time
      }
    }
  },

  addBloodDecal: (position, size) =>
    set((s) => ({
      bloodDecals: [
        ...s.bloodDecals,
        {
          id: `decal_${decalId++}`,
          position,
          size,
          opacity: 0.8,
          spread: 0,
          timestamp: Date.now(),
        },
      ],
    })),

  addScreenShake: (intensity, duration) =>
    set({
      screenShake: { intensity, duration, decay: intensity / duration, timestamp: Date.now() },
      cameraShakeIntensity: intensity,
    }),

  setBloodOnScreen: (amount) => set({ bloodOnScreen: Math.max(0, Math.min(1, amount)) }),
  setFearLevel: (level) => set({ fearLevel: Math.max(0, Math.min(1, level)) }),
  setFlickering: (on) => set({ isFlickering: on }),

  tickHorror: (delta) => {
    const state = get();

    // Decay screen shake
    let shakeIntensity = state.cameraShakeIntensity;
    if (state.screenShake) {
      const elapsed = (Date.now() - state.screenShake.timestamp) / 1000;
      shakeIntensity = Math.max(0, state.screenShake.intensity - state.screenShake.decay * elapsed);
      if (elapsed > state.screenShake.duration) {
        set({ screenShake: null, cameraShakeIntensity: 0 });
      } else {
        set({ cameraShakeIntensity: shakeIntensity });
      }
    }

    // Decay blood on screen
    if (state.bloodOnScreen > 0) {
      set({ bloodOnScreen: Math.max(0, state.bloodOnScreen - delta * 0.3) });
    }

    // Decay fear level slowly
    if (state.fearLevel > 0) {
      set({ fearLevel: Math.max(0, state.fearLevel - delta * 0.05) });
    }

    // Blood decals spread over time
    set({
      bloodDecals: state.bloodDecals.map((d) => ({
        ...d,
        spread: Math.min(d.spread + delta * 0.1, d.size * 2),
        opacity: Math.max(0.3, d.opacity - delta * 0.01),
      })),
    });

    // Ambient event timer
    const newTimer = state.ambientEventTimer + delta;
    if (newTimer >= state.nextAmbientEvent) {
      set({ ambientEventTimer: 0, nextAmbientEvent: 10 + Math.random() * 20 });
    } else {
      set({ ambientEventTimer: newTimer });
    }

    // Flicker timer
    if (state.isFlickering) {
      set({ flickerTimer: state.flickerTimer - delta });
      if (state.flickerTimer - delta <= 0) {
        set({ isFlickering: false, flickerTimer: 0 });
      }
    }
  },

  resetHorror: () =>
    set({
      jumpScares: JUMP_SCARE_DEFINITIONS.map((s) => ({ ...s, triggered: false })),
      triggeredScares: new Set<string>(),
      bloodDecals: [],
      screenShake: null,
      cameraShakeIntensity: 0,
      bloodOnScreen: 0,
      fearLevel: 0,
      isFlickering: false,
      flickerTimer: 0,
      ambientEventTimer: 0,
      nextAmbientEvent: 10 + Math.random() * 20,
    }),
}));
