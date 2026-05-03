import { create } from 'zustand';

export type LobbyState = 'idle' | 'creating' | 'joining' | 'waiting' | 'ready' | 'playing' | 'disconnected';
export type PlayerColor = 'blue' | 'green' | 'yellow' | 'red';

export interface LobbyPlayer {
  id: string;
  name: string;
  survivorId: string;
  color: PlayerColor;
  isHost: boolean;
  isReady: boolean;
  health: number;
  position: [number, number, number];
}

interface MultiplayerState {
  lobbyState: LobbyState;
  roomCode: string | null;
  players: LobbyPlayer[];
  localPlayerId: string | null;
  isHost: boolean;
  connectionError: string | null;
  chatMessages: { playerId: string; message: string; time: number }[];
  pingMs: number;

  setLobbyState: (state: LobbyState) => void;
  createRoom: () => string;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  setRoomCode: (code: string | null) => void;
  addPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<LobbyPlayer>) => void;
  setLocalPlayerId: (id: string) => void;
  setIsHost: (isHost: boolean) => void;
  setConnectionError: (error: string | null) => void;
  addChatMessage: (playerId: string, message: string) => void;
  setPing: (ms: number) => void;
  resetLobby: () => void;
}

const PLAYER_COLORS: PlayerColor[] = ['blue', 'green', 'yellow', 'red'];

export const useMultiplayerStore = create<MultiplayerState>()((set, get) => ({
  lobbyState: 'idle',
  roomCode: null,
  players: [],
  localPlayerId: null,
  isHost: false,
  connectionError: null,
  chatMessages: [],
  pingMs: 0,

  setLobbyState: (state) => set({ lobbyState: state }),

  createRoom: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    set({ roomCode: code, isHost: true, lobbyState: 'waiting' });
    return code;
  },

  joinRoom: (code) => set({ roomCode: code.toUpperCase(), isHost: false, lobbyState: 'joining' }),

  leaveRoom: () => set({ roomCode: null, players: [], isHost: false, lobbyState: 'idle' }),

  setRoomCode: (code) => set({ roomCode: code }),

  addPlayer: (player) =>
    set((s) => ({ players: [...s.players, player] })),

  removePlayer: (playerId) =>
    set((s) => {
      const remaining = s.players.filter((p) => p.id !== playerId);
      // Host migration
      if (s.players.find((p) => p.id === playerId)?.isHost && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isHost: true };
        if (remaining[0].id === s.localPlayerId) {
          return { players: remaining, isHost: true };
        }
      }
      return { players: remaining };
    }),

  updatePlayer: (playerId, updates) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
    })),

  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  setIsHost: (isHost) => set({ isHost }),
  setConnectionError: (error) => set({ connectionError: error }),

  addChatMessage: (playerId, message) =>
    set((s) => ({
      chatMessages: [...s.chatMessages, { playerId, message, time: Date.now() }],
    })),

  setPing: (ms) => set({ pingMs: ms }),

  resetLobby: () =>
    set({
      lobbyState: 'idle',
      roomCode: null,
      players: [],
      localPlayerId: null,
      isHost: false,
      connectionError: null,
      chatMessages: [],
    }),
}));

export { PLAYER_COLORS };
