import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameScene = 'mainMenu' | 'characterSelect' | 'gameplay' | 'death' | 'victory' | 'shop' | 'apocalypsePass' | 'multiplayer' | 'settings' | 'pause';
export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'apocalypse';
export type FloorNumber = 1 | 2 | 3 | 4;

export interface FloorData {
  id: FloorNumber;
  name: string;
  completed: boolean;
  zombiesKilled: number;
  itemsFound: number;
  notesFound: number;
  timePlayed: number;
}

interface GameState {
  currentScene: GameScene;
  previousScene: GameScene | null;
  isPaused: boolean;
  isLoading: boolean;
  loadingProgress: number;
  difficulty: GameDifficulty;
  currentFloor: FloorNumber;
  floorData: Record<FloorNumber, FloorData>;
  totalKills: number;
  totalDeaths: number;
  totalPlayTime: number;
  sessionStartTime: number | null;
  gameStarted: boolean;
  transitionAlpha: number;
  showTransition: boolean;

  setScene: (scene: GameScene) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean, progress?: number) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setCurrentFloor: (floor: FloorNumber) => void;
  completeFloor: (floor: FloorNumber) => void;
  addKill: () => void;
  addDeath: () => void;
  startSession: () => void;
  endSession: () => void;
  resetGame: () => void;
  setTransition: (alpha: number, show: boolean) => void;
}

const defaultFloorData: Record<FloorNumber, FloorData> = {
  1: { id: 1, name: 'LOBBY', completed: false, zombiesKilled: 0, itemsFound: 0, notesFound: 0, timePlayed: 0 },
  2: { id: 2, name: 'OFFICES', completed: false, zombiesKilled: 0, itemsFound: 0, notesFound: 0, timePlayed: 0 },
  3: { id: 3, name: 'LABORATORY', completed: false, zombiesKilled: 0, itemsFound: 0, notesFound: 0, timePlayed: 0 },
  4: { id: 4, name: 'ROOFTOP', completed: false, zombiesKilled: 0, itemsFound: 0, notesFound: 0, timePlayed: 0 },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScene: 'mainMenu',
      previousScene: null,
      isPaused: false,
      isLoading: false,
      loadingProgress: 0,
      difficulty: 'normal',
      currentFloor: 1,
      floorData: { ...defaultFloorData },
      totalKills: 0,
      totalDeaths: 0,
      totalPlayTime: 0,
      sessionStartTime: null,
      gameStarted: false,
      transitionAlpha: 0,
      showTransition: false,

      setScene: (scene) => set({ previousScene: get().currentScene, currentScene: scene }),
      setPaused: (paused) => set({ isPaused: paused }),
      setLoading: (loading, progress = 0) => set({ isLoading: loading, loadingProgress: progress }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setCurrentFloor: (floor) => set({ currentFloor: floor }),
      completeFloor: (floor) =>
        set((state) => ({
          floorData: {
            ...state.floorData,
            [floor]: { ...state.floorData[floor], completed: true },
          },
        })),
      addKill: () => set((state) => ({ totalKills: state.totalKills + 1 })),
      addDeath: () => set((state) => ({ totalDeaths: state.totalDeaths + 1 })),
      startSession: () => set({ sessionStartTime: Date.now(), gameStarted: true }),
      endSession: () => {
        const state = get();
        const elapsed = state.sessionStartTime ? (Date.now() - state.sessionStartTime) / 1000 : 0;
        set({
          totalPlayTime: state.totalPlayTime + elapsed,
          sessionStartTime: null,
          gameStarted: false,
        });
      },
      resetGame: () =>
        set({
          currentScene: 'mainMenu',
          isPaused: false,
          currentFloor: 1,
          floorData: { ...defaultFloorData },
          gameStarted: false,
          sessionStartTime: null,
        }),
      setTransition: (alpha, show) => set({ transitionAlpha: alpha, showTransition: show }),
    }),
    {
      name: 'apocalypse-game-state',
      partialize: (state) => ({
        difficulty: state.difficulty,
        floorData: state.floorData,
        totalKills: state.totalKills,
        totalDeaths: state.totalDeaths,
        totalPlayTime: state.totalPlayTime,
      }),
    }
  )
);
