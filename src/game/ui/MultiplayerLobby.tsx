'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  Skull,
  Users,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DIFFICULTY_OPTIONS: {
  value: GameDifficulty;
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon?: React.ReactNode;
}[] = [
  { value: 'easy', label: 'EASY', color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-800/50', glow: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]' },
  { value: 'normal', label: 'NORMAL', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-800/50', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]' },
  { value: 'hard', label: 'HARD', color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-800/50', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]' },
  { value: 'apocalypse', label: 'APOCALYPSE', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/50', glow: 'shadow-[0_0_16px_rgba(239,68,68,0.4)]', icon: <Skull className="h-3 w-3 ml-1" /> },
];

const COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

/* ------------------------------------------------------------------ */
/*  Ambient Particles                                                  */
/* ------------------------------------------------------------------ */

function AmbientParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            background: `rgba(${139 + Math.random() * 60}, 0, 0, ${0.2 + Math.random() * 0.4})`,
            boxShadow: `0 0 ${4 + Math.random() * 6}px rgba(139,0,0,${0.15 + Math.random() * 0.25})`,
          }}
          animate={{
            y: [0, -720],
            x: [0, (Math.random() - 0.5) * 60],
            opacity: [0, 0.6, 0.4, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scan Line Effect                                                   */
/* ------------------------------------------------------------------ */

function ScanLineEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.15), transparent)',
          boxShadow: '0 0 20px rgba(220,38,38,0.1)',
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Room Code Character Card                                           */
/* ------------------------------------------------------------------ */

function RoomCodeChar({ char, index }: { char: string; index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotateY: -90, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
      className="w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center bg-black/60 border border-red-900/40 rounded-md shadow-[0_0_10px_rgba(220,38,38,0.15)]"
    >
      <span className="text-xl sm:text-2xl font-mono font-black text-yellow-400 tracking-wider"
        style={{ textShadow: '0 0 10px rgba(234,179,8,0.5), 0 0 20px rgba(234,179,8,0.2)' }}
      >
        {char}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Player Card                                                        */
/* ------------------------------------------------------------------ */

function PlayerCard({ player, isLocal, onToggleReady, survivorData }: {
  player: { id: string; name: string; survivorId: string; color: string; isHost: boolean; isReady: boolean };
  isLocal: boolean;
  onToggleReady: () => void;
  survivorData: { name: string; role: string };
}) {
  const colorHex = COLOR_MAP[player.color] || player.color;

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <Card className="bg-black/50 border border-zinc-800/80 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-zinc-700/60 transition-colors group">
        {/* Portrait */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border-2"
            style={{ borderColor: `${colorHex}66`, boxShadow: `0 0 10px ${colorHex}22` }}
          >
            <Image
              src={`/images/characters/${player.survivorId}.png`}
              alt={player.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          {player.isHost && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center border border-yellow-400/50"
              style={{ boxShadow: '0 0 8px rgba(234,179,8,0.4)' }}
            >
              <Crown className="h-3 w-3 text-yellow-200" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-200 truncate" style={{ color: colorHex }}>
            {player.name}
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-500 truncate">
            {survivorData?.role || 'Unknown'}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {player.isHost && (
            <Badge className="bg-yellow-800/60 text-yellow-200 text-[9px] border border-yellow-700/40 hidden sm:inline-flex">
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              HOST
            </Badge>
          )}
          {isLocal ? (
            <Button
              size="sm"
              onClick={onToggleReady}
              className={`h-7 text-[10px] px-2.5 font-bold transition-all ${
                player.isReady
                  ? 'bg-green-700/80 hover:bg-green-600/80 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.25)]'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 border border-zinc-700/50'
              }`}
            >
              {player.isReady ? 'READY' : 'READY?'}
            </Button>
          ) : (
            <Badge
              className={`text-[9px] ${
                player.isReady
                  ? 'bg-green-800/60 text-green-200 border border-green-700/40'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700/40'
              }`}
            >
              {player.isReady ? 'READY' : 'NOT READY'}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat Message                                                       */
/* ------------------------------------------------------------------ */

function ChatMessage({ msg, player }: {
  msg: { playerId: string; message: string; time: number };
  player: { name: string; color: string } | undefined;
}) {
  const isSystem = msg.playerId === 'system';
  const colorHex = player ? (COLOR_MAP[player.color] || player.color) : '#a1a1aa';

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="text-xs leading-relaxed"
    >
      {isSystem ? (
        <span className="italic text-yellow-500/80">
          ⚠ {msg.message}
        </span>
      ) : (
        <>
          <span className="font-bold" style={{ color: colorHex }}>
            {player?.name || 'Unknown'}
          </span>
          <span className="text-zinc-600 mx-1">:</span>
          <span className="text-zinc-400">{msg.message}</span>
        </>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function MultiplayerLobby() {
  /* Store bindings */
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
  const localPlayerId = useMultiplayerStore((s) => s.localPlayerId);
  const updatePlayer = useMultiplayerStore((s) => s.updatePlayer);

  const selectedSurvivor = usePlayerStore((s) => s.selectedSurvivor);

  /* Local state */
  const [joinCode, setJoinCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll chat */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* Ping color */
  const pingColor = pingMs < 50 ? 'text-green-400' : pingMs < 100 ? 'text-yellow-400' : 'text-red-400';
  const pingGlow = pingMs < 50
    ? 'drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]'
    : pingMs < 100
      ? 'drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]'
      : 'drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]';

  /* Handlers */
  const handleCreateRoom = useCallback(() => {
    createRoom();
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
  }, [createRoom, selectedSurvivor, setLocalPlayerId, addPlayer]);

  const handleJoinRoom = useCallback(() => {
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
  }, [joinCode, joinRoom, selectedSurvivor, setLocalPlayerId, addPlayer, players.length]);

  const handleCopyCode = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomCode]);

  const handleSendChat = useCallback(() => {
    if (chatInput.trim() && localPlayerId) {
      addChatMessage(localPlayerId, chatInput.trim());
      setChatInput('');
    }
  }, [chatInput, localPlayerId, addChatMessage]);

  const handleToggleReady = useCallback(() => {
    if (localPlayerId) {
      const player = players.find((p) => p.id === localPlayerId);
      if (player) {
        updatePlayer(localPlayerId, { isReady: !player.isReady });
      }
    }
  }, [localPlayerId, players, updatePlayer]);

  const handleStartGame = useCallback(() => {
    setScene('gameplay');
  }, [setScene]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    setChatOpen(false);
  }, [leaveRoom]);

  const allReady = players.length > 0 && players.every((p) => p.isReady);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col eerie-bg overflow-hidden"
      style={{ backgroundColor: 'rgba(5, 2, 2, 0.97)' }}
    >
      {/* ---- Atmospheric Overlays ---- */}
      <div className="film-grain-overlay" />
      <ScanLineEffect />
      <div className="vignette-overlay" style={{ zIndex: 57 }} />
      <AmbientParticles />

      {/* ---- Blood Veins ---- */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-[2px]"
            style={{
              left: `${8 + i * 16}%`,
              background: `linear-gradient(to top, rgba(139,0,0,0.25), rgba(100,0,0,0.1), transparent)`,
              borderRadius: '0 0 2px 2px',
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${20 + Math.random() * 30}%`, opacity: [0, 0.5, 0.3, 0] }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/60 bg-black/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={() => {
            leaveRoom();
            setScene('mainMenu');
          }}
          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 gap-1 text-sm"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">BACK</span>
        </Button>

        <div className="flex items-center gap-3">
          <h2
            className="text-base sm:text-xl font-black tracking-[0.35em] fire-text"
            style={{ color: '#ef4444' }}
          >
            CO-OP SURVIVAL
          </h2>
          {lobbyState !== 'idle' && (
            <div className="flex items-center gap-1.5 ml-3">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Signal className={`h-3.5 w-3.5 ${pingColor} ${pingGlow}`} />
              </motion.div>
              <span className={`text-[10px] font-mono tabular-nums ${pingColor}`}>
                {pingMs}ms
              </span>
            </div>
          )}
        </div>

        {/* Chat toggle (mobile) */}
        {lobbyState !== 'idle' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatOpen(!chatOpen)}
            className="sm:hidden text-zinc-400 hover:text-red-400 hover:bg-red-950/30 relative"
          >
            <MessageSquare className="h-5 w-5" />
            {chatMessages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
            )}
          </Button>
        )}
        {lobbyState === 'idle' && <div className="w-10" />}
      </header>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative z-10">

        {/* ---- Left: Main Panel ---- */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto dark-scrollbar">

          {/* ====================================================== */}
          {/*  IDLE STATE: Create / Join                              */}
          {/* ====================================================== */}
          <AnimatePresence mode="wait">
            {lobbyState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8"
              >
                {/* Decorative top text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] tracking-[0.5em] text-red-900 font-mono"
                >
                  FORM YOUR SQUAD
                </motion.p>

                {/* Split panels */}
                <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* CREATE ROOM */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="flex-1 flex flex-col items-center gap-4"
                  >
                    <Card className="w-full p-6 sm:p-8 bg-black/40 border border-red-900/30 rounded-lg flex flex-col items-center gap-5 relative overflow-hidden">
                      {/* Decorative corner marks */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-red-800/40" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-red-800/40" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-red-800/40" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-red-800/40" />

                      <div className="relative">
                        {/* Zombie horde silhouette icon - stylized */}
                        <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center border border-red-800/30">
                          <Users className="h-8 w-8 text-red-500" />
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-full border border-red-500/30"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>

                      <Button
                        onClick={handleCreateRoom}
                        className="w-full h-14 text-base font-black tracking-[0.25em] bg-red-800 hover:bg-red-700 text-white relative overflow-hidden blood-reveal-btn
                          shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-shadow"
                      >
                        <Plus className="h-5 w-5 mr-2 relative z-10" />
                        <span className="relative z-10">CREATE ROOM</span>
                        {/* Pulse ring */}
                        <motion.div
                          className="absolute inset-0 rounded-md border border-red-400/20"
                          animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </Button>

                      <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                        Host a new game session.<br />Survive together or die alone.
                      </p>
                    </Card>
                  </motion.div>

                  {/* OR divider */}
                  <div className="flex sm:flex-col items-center justify-center gap-2 py-2 sm:py-0 sm:px-0">
                    <Separator className="w-8 sm:w-0 sm:h-8 bg-zinc-800/50" />
                    <div className="flex items-center gap-2 text-zinc-700">
                      <div className="w-8 sm:w-0 h-px sm:h-8 bg-zinc-800/50" />
                      <Skull className="h-4 w-4 text-zinc-700" />
                      <span className="text-[10px] tracking-[0.3em] text-zinc-600 font-bold">OR</span>
                      <div className="w-8 sm:w-0 h-px sm:h-8 bg-zinc-800/50" />
                    </div>
                    <Separator className="w-8 sm:w-0 sm:h-8 bg-zinc-800/50" />
                  </div>

                  {/* JOIN ROOM */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex-1 flex flex-col items-center gap-4"
                  >
                    <Card className="w-full p-6 sm:p-8 bg-black/40 border border-zinc-800/40 rounded-lg flex flex-col items-center gap-5 relative overflow-hidden">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-zinc-700/30" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-zinc-700/30" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-zinc-700/30" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-zinc-700/30" />

                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-700/30">
                        <LogIn className="h-8 w-8 text-zinc-500" />
                      </div>

                      <div className="w-full flex flex-col items-center gap-3">
                        <p className="text-xs text-zinc-500 tracking-[0.2em] font-bold">ENTER ROOM CODE</p>
                        <Input
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                          placeholder="——"
                          className="w-44 text-center font-mono text-xl font-black tracking-[0.5em] bg-black/70 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-800 placeholder:tracking-[0.5em] h-12 focus:border-red-700/50 focus:ring-red-900/30"
                          maxLength={6}
                          onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        />
                        <Button
                          onClick={handleJoinRoom}
                          disabled={joinCode.length < 6}
                          className="w-full h-11 font-bold tracking-[0.2em] bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-200 border border-zinc-700/50 transition-all"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          JOIN ROOM
                        </Button>
                      </div>

                      <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                        Enter a 6-character code to<br />join an existing session.
                      </p>
                    </Card>
                  </motion.div>
                </div>

                {/* Bottom decorative text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1 }}
                  className="text-[9px] tracking-[0.6em] text-zinc-700 font-mono red-pulse-warning"
                >
                  MAXIMUM 4 SURVIVORS PER SESSION
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====================================================== */}
          {/*  ROOM STATE                                             */}
          {/* ====================================================== */}
          <AnimatePresence mode="wait">
            {lobbyState !== 'idle' && (
              <motion.div
                key="room"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col gap-4 sm:gap-5"
              >
                {/* ---- Room Code Display ---- */}
                {roomCode && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-[10px] tracking-[0.4em] text-zinc-600 font-bold">ROOM CODE</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {roomCode.split('').map((char, i) => (
                          <RoomCodeChar key={i} char={char} index={i} />
                        ))}
                      </div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyCode}
                          className="text-zinc-400 hover:text-yellow-400 h-10 w-10 p-0 ml-1"
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                              >
                                <Check className="h-4 w-4 text-green-400" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Copy className="h-4 w-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* ---- Difficulty Selector (Host Only) ---- */}
                {isHost && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-[10px] tracking-[0.3em] text-zinc-600 font-bold mb-2">DIFFICULTY</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DIFFICULTY_OPTIONS.map((opt, i) => (
                        <motion.div
                          key={opt.value}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDifficulty(opt.value)}
                            className={`w-full text-[10px] sm:text-xs font-bold tracking-wider h-9 transition-all ${
                              difficulty === opt.value
                                ? `${opt.bg} ${opt.border} ${opt.color} ${opt.glow} border`
                                : 'border-zinc-800/50 text-zinc-500 hover:border-zinc-700/50 hover:text-zinc-400'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-0.5">
                              {opt.label}
                              {opt.icon}
                            </span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ---- Player Count ---- */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-600" />
                    <span className="text-xs text-zinc-500 font-bold tracking-wider">
                      <span className="text-zinc-300 tabular-nums">{players.length}</span>
                      <span className="text-zinc-600">/4</span>
                      <span className="text-zinc-500 ml-1.5">SURVIVORS</span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full border"
                        animate={i < players.length ? {
                          backgroundColor: ['#ef4444', '#dc2626'],
                          borderColor: ['rgba(220,38,38,0.6)', 'rgba(220,38,38,0.8)'],
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={i < players.length ? { duration: 1.5, repeat: Infinity, delay: i * 0.15 } : {}}
                        style={i >= players.length ? {
                          backgroundColor: 'rgba(39,39,42,0.4)',
                          borderColor: 'rgba(63,63,70,0.4)',
                        } : undefined}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* ---- Player List ---- */}
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full max-h-64 sm:max-h-80">
                    <div className="space-y-2 pr-1">
                      <AnimatePresence>
                        {players.map((player, i) => (
                          <motion.div
                            key={player.id}
                            initial={{ y: 0 }}
                            animate={{ y: 0 }}
                          >
                            <PlayerCard
                              player={player}
                              isLocal={player.id === localPlayerId}
                              onToggleReady={handleToggleReady}
                              survivorData={SURVIVORS[player.survivorId as SurvivorId]}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </div>

                {/* ---- Action Buttons ---- */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 pt-2"
                >
                  {/* Ready toggle for non-hosts */}
                  {!isHost && localPlayerId && (
                    <Button
                      onClick={handleToggleReady}
                      className={`flex-1 h-11 font-bold tracking-[0.15em] transition-all ${
                        players.find((p) => p.id === localPlayerId)?.isReady
                          ? 'bg-green-700/80 hover:bg-green-600/80 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {players.find((p) => p.id === localPlayerId)?.isReady ? 'READY' : 'READY UP'}
                    </Button>
                  )}

                  {/* Start Game (Host Only) */}
                  {isHost && (
                    <Button
                      onClick={handleStartGame}
                      disabled={!allReady || players.length < 1}
                      className={`flex-1 h-12 font-black tracking-[0.2em] transition-all relative overflow-hidden ${
                        allReady && players.length >= 1
                          ? 'bg-green-700 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {allReady && players.length >= 1 && (
                        <motion.div
                          className="absolute inset-0 rounded-md border border-green-400/20"
                          animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <Play className="h-5 w-5 mr-2 relative z-10" />
                      <span className="relative z-10">START GAME</span>
                    </Button>
                  )}

                  {/* Leave */}
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 font-bold tracking-[0.1em] h-11 sm:h-12"
                  >
                    <X className="h-4 w-4 mr-1" />
                    LEAVE
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- Chat Panel (Desktop: always visible, Mobile: toggled) ---- */}
        {lobbyState !== 'idle' && (
          <>
            {/* Desktop chat */}
            <div className="hidden sm:flex w-72 lg:w-80 border-l border-zinc-800/60 flex-col bg-black/40">
              <ChatPanel
                chatMessages={chatMessages}
                players={players}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                chatEndRef={chatEndRef}
                localPlayerId={localPlayerId}
              />
            </div>

            {/* Mobile chat overlay */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed inset-0 z-20 sm:hidden flex flex-col bg-[rgba(5,2,2,0.98)]"
                >
                  <div className="flex items-center justify-between p-3 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-bold tracking-wider">CHAT</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatOpen(false)}
                      className="text-zinc-400 hover:text-red-400 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ChatPanel
                    chatMessages={chatMessages}
                    players={players}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    handleSendChat={handleSendChat}
                    chatEndRef={chatEndRef}
                    localPlayerId={localPlayerId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat Panel Sub-Component                                           */
/* ------------------------------------------------------------------ */

function ChatPanel({ chatMessages, players, chatInput, setChatInput, handleSendChat, chatEndRef, localPlayerId }: {
  chatMessages: { playerId: string; message: string; time: number }[];
  players: { id: string; name: string; color: string }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSendChat: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  localPlayerId: string | null;
}) {
  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-zinc-800/60 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-zinc-500" />
        <span className="text-xs text-zinc-400 font-bold tracking-wider">TEAM COMMS</span>
        <span className="ml-auto text-[9px] text-zinc-700 font-mono">ENCRYPTED</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2.5">
          {chatMessages.length === 0 && (
            <p className="text-[10px] text-zinc-700 italic text-center py-8">
              No messages yet. Coordinate with your team...
            </p>
          )}
          {chatMessages.map((msg, i) => {
            const player = players.find((p) => p.id === msg.playerId);
            return <ChatMessage key={i} msg={msg} player={player} />;
          })}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800/60 flex gap-2">
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
          placeholder={localPlayerId ? 'Type a message...' : 'Connecting...'}
          disabled={!localPlayerId}
          className="text-xs bg-black/60 border-zinc-800/50 text-zinc-200 placeholder:text-zinc-700 focus:border-red-900/40 focus:ring-red-900/20"
        />
        <Button
          size="sm"
          onClick={handleSendChat}
          disabled={!chatInput.trim() || !localPlayerId}
          className="bg-red-800/80 hover:bg-red-700/80 disabled:bg-zinc-900 disabled:text-zinc-700 text-white h-9 w-9 p-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </>
  );
}


