'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useGameStore, GameScene } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useEffect } from 'react';

import Image from 'next/image';

const GameCanvas = dynamic(() => import('@/game/engine/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#050202',
      color: '#ff4400',
      fontFamily: 'monospace',
      gap: '1.5rem',
    }}>
      <Image
        src="/images/game-logo.png"
        alt="THE NOTE: APOCALYPSE"
        width={400}
        height={300}
        className="object-contain opacity-60"
        priority
      />
      <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.2em' }}>
        LOADING ENGINE...
      </div>
      <div style={{
        width: '200px',
        height: '2px',
        background: '#1a0000',
        borderRadius: '1px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: 'linear-gradient(90deg, #4a0000, #8b0000)',
          borderRadius: '1px',
          animation: 'loadPulse 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  ),
});

const MainMenu = dynamic(() => import('@/game/ui/MainMenu'), { ssr: false });
const CharacterSelect = dynamic(() => import('@/game/ui/CharacterSelect'), { ssr: false });
const HUD = dynamic(() => import('@/game/ui/HUD'), { ssr: false });
const PauseMenu = dynamic(() => import('@/game/ui/PauseMenu'), { ssr: false });
const Settings = dynamic(() => import('@/game/ui/Settings'), { ssr: false });
const DeathScreen = dynamic(() => import('@/game/ui/DeathScreen'), { ssr: false });
const VictoryScreen = dynamic(() => import('@/game/ui/VictoryScreen'), { ssr: false });
const ShopUI = dynamic(() => import('@/game/ui/ShopUI'), { ssr: false });
const ApocalypsePassUI = dynamic(() => import('@/game/ui/ApocalypsePassUI'), { ssr: false });
const MultiplayerLobby = dynamic(() => import('@/game/ui/MultiplayerLobby'), { ssr: false });

function UIOverlay() {
  const currentScene = useGameStore((s) => s.currentScene);
  const isPaused = useGameStore((s) => s.isPaused);

  // Handle ESC key for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const scene = useGameStore.getState().currentScene;
        const paused = useGameStore.getState().isPaused;

        if (scene === 'gameplay' && !paused) {
          useGameStore.getState().setPaused(true);
        } else if (paused) {
          useGameStore.getState().setPaused(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render UI based on scene
  if (isPaused && currentScene === 'gameplay') {
    return <PauseMenu />;
  }

  switch (currentScene) {
    case 'mainMenu':
      return <MainMenu />;
    case 'characterSelect':
      return <CharacterSelect />;
    case 'gameplay':
      return <HUD />;
    case 'pause':
      return (
        <>
          <HUD />
          <PauseMenu />
        </>
      );
    case 'death':
      return <DeathScreen />;
    case 'victory':
      return <VictoryScreen />;
    case 'shop':
      return <ShopUI />;
    case 'apocalypsePass':
      return <ApocalypsePassUI />;
    case 'multiplayer':
      return <MultiplayerLobby />;
    case 'settings':
      return <Settings />;
    default:
      return <MainMenu />;
  }
}

export default function SceneRouter() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      {/* 3D Canvas always in background */}
      <div className="fixed inset-0">
        <GameCanvas />
      </div>

      {/* UI Overlay on top */}
      <AnimatePresence mode="wait">
        <UIOverlay />
      </AnimatePresence>
    </div>
  );
}
