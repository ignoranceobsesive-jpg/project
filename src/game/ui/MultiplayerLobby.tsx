'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GameDifficulty } from '@/stores/gameStore';
import { useMultiplayerStore, PLAYER_COLORS } from '@/stores/multiplayerStore';
import { usePlayerStore, SURVIVORS, SurvivorId } from '@/stores/playerStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Plus,
  LogIn,
  Copy,
  Check,
  Crown,
  Shield,
  Play,
  X,
  MessageSquare,
  Send,
  Signal,
} from 'lucide-react';

const DIFFICULTY_OPTIONS: { value: GameDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'EASY', color: 'text-green-400' },
  { value: 'normal', label: 'NORMAL', color: 'text-yellow-400' },
  { value: 'hard', label: 'HARD', color: 'text-orange-400' },
  { value: 'apocalypse', label: 'APOCALYPSE', color: 'text-red-400' },
];

export default function MultiplayerLobby() {
  const setScene = useGameStore((s) => s.setScene);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const difficulty = useGameStore((s) => s.difficulty);

  const lobbyState = useMultiplayerStore((s) => s.lobbyState);
  const roomCode = useMultiplayerStore((s) => s.roomCode);
  const players = useMultiplayerStore((s) => s.players);
  const isHost = useMultiplayerStore((s) => s.isHost);
  const chatMessages = useMultiplayerStore((s) => s.chatMessages);
  const pingMs = useMultiplayerStore((s) => s.pingMs);
  const createRoom = useMultiplayerStore((s) => s.createRoom);
  const joinRoom = useMultiplayerStore((s) => s.joinRoom);
  const leaveRoom = useMultiplayerStore((s) => s.leaveRoom);
  const addChatMessage = useMultiplayerStore((s) => s.addChatMessage);
  const addPlayer = useMultiplayerStore((s) => s.addPlayer);
  const setLocalPlayerId = useMultiplayerStore((s) => s.setLocalPlayerId);
  const setLobbyState = useMultiplayerStore((s) => s.setLobbyState);
  const localPlayerId = useMultiplayerStore((s) => s.localPlayerId);

  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);

  const [joinCode, setJoinCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleCreateRoom = () => {
    const code = createRoom();
    const playerId = `player_${Date.now()}`;
    setLocalPlayerId(playerId);
    addPlayer({
      id: playerId,
      name: SURVIVORS[selectedSurvivor].name,
      survivorId: selectedSurvivor,
      color: PLAYER_COLORS[0],
      isHost: true,
      isReady: false,
      health: 100,
      position: [0, 1.6, 0],
    });
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      joinRoom(joinCode);
      const playerId = `player_${Date.now()}`;
      setLocalPlayerId(playerId);
      addPlayer({
        id: playerId,
        name: SURVIVORS[selectedSurvivor].name,
        survivorId: selectedSurvivor,
        color: PLAYER_COLORS[players.length % 4],
        isHost: false,
        isReady: false,
        health: 100,
        position: [0, 1.6, 0],
      });
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim() && localPlayerId) {
      addChatMessage(localPlayerId, chatInput.trim());
      setChatInput('');
    }
  };

  const handleStartGame = () => {
    setScene('gameplay');
  };

  const handleLeave = () => {
    leaveRoom();
  };

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
          onClick={() => {
            leaveRoom();
            setScene('mainMenu');
          }}
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1"
        >
          <ChevronLeft className="h-5 w-5" />
          BACK
        </Button>
        <h2 className="text-lg font-bold tracking-[0.3em] text-red-400">MULTIPLAYER</h2>
        {lobbyState !== 'idle' && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Signal className="h-3.5 w-3.5" />
            <span>{pingMs}ms</span>
          </div>
        )}
        {lobbyState === 'idle' && <div className="w-16" />}
      </div>

      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Main panel */}
        <div className="flex-1 p-4 flex flex-col">
          {lobbyState === 'idle' && (
            /* Create / Join */
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  onClick={handleCreateRoom}
                  className="w-64 h-14 text-base font-bold tracking-[0.2em] bg-red-700 hover:bg-red-600
                    shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  CREATE ROOM
                </Button>
              </motion.div>

              <Separator className="max-w-xs bg-zinc-800" />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <p className="text-sm text-zinc-500">JOIN EXISTING ROOM</p>
                <div className="flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ROOM CODE"
                    className="w-40 text-center font-mono text-lg tracking-[0.3em] bg-black/60 border-zinc-700 text-zinc-200 placeholder:text-zinc-700"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={joinCode.length < 6}
                    className="bg-orange-700 hover:bg-orange-600 text-white font-bold"
                  >
                    <LogIn className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {lobbyState !== 'idle' && (
            /* Room view */
            <div className="flex-1 flex flex-col">
              {/* Room Code Display */}
              {roomCode && (
                <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-500">ROOM CODE:</span>
                  <span className="text-2xl font-mono font-black tracking-[0.4em] text-yellow-400">
                    {roomCode}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="text-zinc-400 hover:text-yellow-400 h-8 w-8 p-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {/* Difficulty selector (host only) */}
              {isHost && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">DIFFICULTY</p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={difficulty === opt.value ? 'default' : 'outline'}
                        className={`flex-1 text-xs ${
                          difficulty === opt.value
                            ? 'bg-red-700 hover:bg-red-600 text-white'
                            : 'border-zinc-700 text-zinc-400'
                        }`}
                        onClick={() => setDifficulty(opt.value)}
                      >
                        <span className={difficulty !== opt.value ? opt.color : ''}>{opt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Player List */}
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-2">PLAYERS ({players.length}/4)</p>
                <div className="space-y-2">
                  {players.map((player) => (
                    <Card key={player.id} className="bg-black/50 border border-zinc-800 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `${player.color}33`, color: player.color }}
                        >
                          {SURVIVORS[player.survivorId as SurvivorId]?.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{player.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {SURVIVORS[player.survivorId as SurvivorId]?.role || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.isHost && (
                          <Badge className="bg-yellow-700 text-yellow-100 text-[9px]">
                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                            HOST
                          </Badge>
                        )}
                        <Badge
                          className={`text-[9px] ${
                            player.isReady ? 'bg-green-700 text-green-100' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {player.isReady ? 'READY' : 'NOT READY'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-3">
                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold tracking-[0.15em] h-11"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    START GAME
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  className="border-red-900/50 text-red-400 hover:bg-red-950/30 font-bold tracking-[0.1em] h-11"
                >
                  <X className="h-4 w-4 mr-1" />
                  LEAVE
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat panel (when in room) */}
        {lobbyState !== 'idle' && (
          <div className="w-full sm:w-72 border-t sm:border-t-0 sm:border-l border-zinc-800 flex flex-col">
            <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-400 font-bold">CHAT</span>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {chatMessages.map((msg, i) => {
                  const player = players.find((p) => p.id === msg.playerId);
                  return (
                    <div key={i} className="text-xs">
                      <span className="font-bold" style={{ color: player?.color || '#a1a1aa' }}>
                        {player?.name || 'Unknown'}:
                      </span>{' '}
                      <span className="text-zinc-400">{msg.message}</span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-zinc-800 flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="text-xs bg-black/60 border-zinc-800 text-zinc-200 placeholder:text-zinc-700"
              />
              <Button
                size="sm"
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="bg-red-700 hover:bg-red-600 text-white"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
