'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  SSAO,
  DepthOfField,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useHorrorStore } from '@/stores/horrorStore';
import { useSettingsStore } from '@/stores/settingsStore';

// ─── Vignette Pulsing Controller ─────────────────────────────────────
function VignetteController() {
  // This is a no-op component that exists to make the vignette reactive
  // The actual pulsing is handled by the useFrame in the parent
  return null;
}

// ─── Main PostProcessing ─────────────────────────────────────────────
export default function PostProcessing() {
  const fearLevel = useHorrorStore((s) => s.fearLevel);
  const isFlickering = useHorrorStore((s) => s.isFlickering);
  const graphicsQuality = useSettingsStore((s) => s.graphicsQuality);

  const isUltra = graphicsQuality === 'ultra';
  const isHigh = graphicsQuality === 'high' || isUltra;
  const enableSSAO = isHigh || isUltra;
  const enableDOF = isHigh || isUltra;
  const enableSMAA = isUltra;
  const ssaoSamples = isUltra ? 32 : 16;
  const multisampling = isUltra ? 4 : 0;

  // ── Fear-reactive parameters ──

  // Vignette: pulses with fear, stronger at high fear
  const vignetteDarkness = useMemo(
    () => 0.25 + fearLevel * 0.35 + (isFlickering ? 0.1 : 0),
    [fearLevel, isFlickering]
  );

  // Bloom: cinematic threshold, stronger with fear for eerie glow
  const bloomIntensity = useMemo(
    () => 0.4 + fearLevel * 0.6,
    [fearLevel]
  );

  const bloomThreshold = useMemo(
    () => 0.7 - fearLevel * 0.15,
    [fearLevel]
  );

  // Noise: film grain style, stronger with fear
  const noiseOpacity = useMemo(
    () => 0.03 + fearLevel * 0.1,
    [fearLevel]
  );

  // Chromatic aberration: more dramatic during fear/flicker
  const chromaticOffset = useMemo(
    () => new THREE.Vector2(
      0.0003 + fearLevel * 0.003 + (isFlickering ? 0.005 : 0),
      0.0002 + fearLevel * 0.001 + (isFlickering ? 0.003 : 0)
    ),
    [fearLevel, isFlickering]
  );

  // Hue shift: desaturate and shift toward sickly tones with fear
  const hueSaturationHue = useMemo(
    () => fearLevel * 0.02,
    [fearLevel]
  );

  const hueSaturationSaturation = useMemo(
    () => -0.05 - fearLevel * 0.2,
    [fearLevel]
  );

  // Brightness/Contrast: darken and increase contrast with fear
  const brightnessContrastBrightness = useMemo(
    () => 0.03 - fearLevel * 0.06,
    [fearLevel]
  );

  const brightnessContrastContrast = useMemo(
    () => 0.03 + fearLevel * 0.1,
    [fearLevel]
  );

  // Depth of Field: subtle blur, more with fear (tunnel vision effect)
  const dofFocusDistance = useMemo(
    () => 0.02,
    []
  );

  const dofFocalLength = useMemo(
    () => 0.05 + fearLevel * 0.02,
    [fearLevel]
  );

  const dofBokehScale = useMemo(
    () => 2 + fearLevel * 3,
    [fearLevel]
  );

  // SSAO: horror-friendly settings - deep shadows in corners
  const ssaoRadius = useMemo(
    () => 0.3 + fearLevel * 0.1,
    [fearLevel]
  );

  const ssaoIntensity = useMemo(
    () => 12 + fearLevel * 8,
    [fearLevel]
  );

  return (
    <EffectComposer multisampling={multisampling}>
      {/* ── Tone Mapping: Cinematic ACES Filmic ── */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
      />

      {/* ── Depth of Field: cinematic blur, tunnel vision with fear ── */}
      {enableDOF && (
        <DepthOfField
          focusDistance={dofFocusDistance}
          focalLength={dofFocalLength}
          bokehScale={dofBokehScale}
        />
      )}

      {/* ── Bloom: cinematic glow with better threshold ── */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.3}
        mipmapBlur
      />

      {/* ── Hue/Saturation: horror color grading (orange/teal desaturation) ── */}
      <HueSaturation
        hue={hueSaturationHue}
        saturation={hueSaturationSaturation}
      />

      {/* ── Brightness/Contrast: darken and contrast for fear ── */}
      <BrightnessContrast
        brightness={brightnessContrastBrightness}
        contrast={brightnessContrastContrast}
      />

      {/* ── Vignette: pulsing with fear ── */}
      <Vignette
        offset={0.2 + fearLevel * 0.08}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ── Chromatic Aberration: dramatic during combat/fear ── */}
      <ChromaticAberration
        offset={chromaticOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* ── Noise: Film grain, not digital ── */}
      <Noise
        opacity={noiseOpacity}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* ── SSAO: Better horror atmosphere ── */}
      {enableSSAO && (
        <SSAO
          samples={ssaoSamples}
          radius={ssaoRadius}
          intensity={ssaoIntensity}
          luminanceInfluence={0.6}
          color={new THREE.Color('#000000')}
        />
      )}

      {/* ── SMAA: Sharpening pass for ultra quality ── */}
      {enableSMAA && (
        <SMAA />
      )}
    </EffectComposer>
  );
}
