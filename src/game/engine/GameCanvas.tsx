'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import MainMenuScene from '@/game/scenes/MainMenuScene';
import CharacterSelectScene from '@/game/scenes/CharacterSelectScene';
import GameplayScene from '@/game/scenes/GameplayScene';
import PostProcessing from '@/game/systems/PostProcessing';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

function SceneRouter() {
  const currentScene = useGameStore((s) => s.currentScene);

  switch (currentScene) {
    case 'mainMenu':
      return <MainMenuScene />;
    case 'characterSelect':
      return <CharacterSelectScene />;
    case 'gameplay':
    case 'pause':
    case 'shop':
      return <GameplayScene />;
    case 'death':
    case 'victory':
      return <GameplayScene />;
    default:
      return <MainMenuScene />;
  }
}

function SceneLighting() {
  const currentScene = useGameStore((s) => s.currentScene);
  const isGameplay = useMemo(
    () => currentScene === 'gameplay' || currentScene === 'pause' || currentScene === 'death' || currentScene === 'victory',
    [currentScene]
  );

  return (
    <>
      <ambientLight intensity={isGameplay ? 0.25 : 0.15} color="#99aabb" />
      {!isGameplay && (
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.15}
          color="#ffccaa"
        />
      )}
    </>
  );
}

export default function GameCanvas() {
  const postProcessing = useSettingsStore((s) => s.postProcessing);
  const graphicsQuality = useSettingsStore((s) => s.graphicsQuality);
  const currentScene = useGameStore((s) => s.currentScene);
  const isGameplay = useMemo(
    () => currentScene === 'gameplay' || currentScene === 'pause' || currentScene === 'death' || currentScene === 'victory',
    [currentScene]
  );

  const dpr: [number, number] = useMemo(() => {
    switch (graphicsQuality) {
      case 'low': return [0.5, 0.75];
      case 'medium': return [0.75, 1];
      case 'high': return [1, 1.5];
      case 'ultra': return [1.5, 2];
      default: return [1, 1.5];
    }
  }, [graphicsQuality]);

  // Horror-optimized camera: slightly narrower FOV for claustrophobic feel
  const cameraFov = isGameplay ? 68 : 60;

  // Shadow settings based on quality
  const shadowMapSize = useMemo(() => {
    switch (graphicsQuality) {
      case 'ultra': return 2048;
      case 'high': return 1024;
      default: return 512;
    }
  }, [graphicsQuality]);

  return (
    <Canvas
      camera={{
        fov: cameraFov,
        near: 0.05,
        far: 500,
        position: isGameplay ? [0, 1.6, 0] : [0, 5, 15],
      }}
      dpr={dpr}
      shadows={graphicsQuality !== 'low'}
      shadow-map-type={THREE.PCFSoftShadowMap}
      gl={{
        antialias: graphicsQuality !== 'low',
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        // Very dark, slightly red-tinted clear color for horror atmosphere
        gl.setClearColor(new THREE.Color('#1a1215'));
      }}
    >
      {/* Darker, more atmospheric fog - red-tinted for horror */}
      <fog attach="fog" args={['#1a1215', isGameplay ? 8 : 20, isGameplay ? 45 : 60]} />

      <Suspense fallback={<LoadingFallback />}>
        <SceneLighting />
        <SceneRouter />
        {postProcessing && <PostProcessing />}
      </Suspense>
    </Canvas>
  );
}
