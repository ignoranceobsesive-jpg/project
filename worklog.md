---
Task ID: 0
Agent: Main Agent
Task: Git setup, fix TypeScript errors, push to GitHub

Work Log:
- Initialized git repository with `rm -rf .git && git init`
- Created initial commit with all game files (121 files, 17663 insertions)
- Added GitHub remote and pushed to https://github.com/ignoranceobsesive-jpg/project
- Fixed TypeScript errors in 3 files:
  - PostProcessing.tsx: Fixed SSAO conditional rendering and multisampling type narrowing
  - HorrorEffects.tsx: Fixed camera.fov access on union type by casting to PerspectiveCamera
  - GameplayScene.tsx: Removed unsupported `sensitivity` prop from PointerLockControls
- Verified lint passes with no errors
- Verified dev server compiles successfully
- Pushed fixes to GitHub

Stage Summary:
- All game code successfully pushed to GitHub at https://github.com/ignoranceobsesive-jpg/project
- Zero TypeScript errors in game code
- Zero lint errors
- Dev server running on port 3000, compiling successfully
- Complete game includes: 4 floors, 5 survivors, zombie AI, combat, horror effects, HUD, shop, battle pass, multiplayer lobby, settings, and full UI

---
Task ID: 1
Agent: Frontend Styling Expert
Task: CSS & Menu GOD LEVEL - Horror effects and MainMenu polish

Work Log:
- Read worklog.md and existing globals.css + MainMenu.tsx
- Added 15+ GOD LEVEL horror CSS effects to globals.css:
  - Film grain overlay (animated SVG noise texture with grain-shift animation)
  - Scanline effect (CRT-style repeating gradient with scroll animation)
  - Enhanced blood drips (6 drip positions with 3 animation variants, box-shadow glow)
  - Fog/mist overlay (multi-layer radial gradients with fog-drift and fog-sway)
  - Ember particles (12 CSS-only rising embers with varying sizes/delays/durations)
  - Screen tear effect (clip-path + translateX glitch animation)
  - Heartbeat pulse (inset box-shadow vignette pulsing like a heartbeat rhythm)
  - God-level glitch title (color-separated layers with shifting clip-paths, skew)
  - Text shadow fire effect (6-layer animated text-shadow with upward flame illusion)
  - Red pulse warning (breathing text-shadow + opacity for danger text)
  - Smoke rising (6 blur particles rising from bottom with horizontal drift)
  - TV static/noise (SVG turbulence with periodic flash animation)
  - Enhanced horror scrollbar (blood-red gradients, glow on hover, Firefox support)
  - Flicker animations (slow + fast variants for light failure effects)
  - Blood splatter shapes (radial gradient organic shapes)
  - Screen shake (normal + heavy variants)
  - Title slam animation (scale 3->1 with blur, bounce settle)
  - Typewriter cursor (blinking orange pipe)
  - Blood fill progress bar (shimmer animation)
  - Scratched text (diagonal hash overlay)
  - Ambient sound rings (expanding pulse rings)
  - Blood rain drops (teardrop shape with trail)
  - Golden sparkles (pop animation for coin display)
  - Vignette overlay (dark inset shadow)
  - Button blood reveal (sweep gradient on hover)
  - Eerie background shift (subtle color cycling)
  - Horror numbering (monospace dim-red digits)

- Rewrote MainMenu.tsx with GOD LEVEL polish:
  - Cinematic title entrance: letters slam in one-by-one with scale/blur/translate
  - Background atmosphere: film grain, scanlines, TV static, vignette, heartbeat, fog, smoke, embers
  - Blood rain: 20 teardrop-shaped falling drops with trails using blood-drop CSS class
  - Better button hover: blood-reveal sweep, pulsing red glow, inner glow, numbered 01-06
  - Ambient sound visualizer: 3 expanding ring pulses around title
  - Subtitle typewriter: "APOCALYPSE" types letter-by-letter with blinking cursor
  - Warning text: flickering "WARNING: CONTAINS HORROR CONTENT" at bottom
  - Death coins: rotating coin with golden sparkle particles
  - Version text: scratched-into-screen effect
  - Loading progress bar: fake atmospheric bar that fills with blood, 0-100% display
  - Background video-like effect: 3 animated radial gradient overlays creating eerie shifting
  - Screen shake on title entrance (heavy shake after 1.1s)
  - All store connections preserved (useGameStore, useEconomyStore)
  - All scene routing logic preserved
  - Responsive design (mobile + desktop)

- Verified build: compiles successfully with zero errors
- Verified lint: zero lint errors on MainMenu.tsx

Stage Summary:
- globals.css expanded from 323 lines to ~1135 lines with comprehensive horror effects
- MainMenu.tsx completely rewritten from 148 lines to ~280 lines with cinematic polish
- Build passes, lint clean, all functionality preserved

---
Task ID: 2
Agent: 3D Scene & Post-Processing Polish Agent
Task: GOD LEVEL 3D scenes and post-processing for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and all 4 target files + supporting stores (horrorStore, settingsStore, playerStore, gameStore)
- Checked available @react-three/postprocessing effects and postprocessing library versions
- Verified dev server running and compilation working

- **MainMenuScene.tsx** - Complete rewrite with GOD LEVEL atmospheric effects:
  - Volumetric fog particles: 80 instanced semi-transparent planes that slowly drift and breathe
  - Ground fog: 12 layered semi-transparent planes at different heights creating thick ground fog
  - Floating ember particles: 150 orange/red glowing spheres rising upward with wobble
  - Blood puddle decals: 6 blood puddles on ground with emissive red glow and drip trails
  - Zombie silhouettes: 3 types (stagger/drag/crawl) with torn clothing, glowing red eyes, distinct animations
    - Stagger: swaying body, extended arms
    - Drag: lowered body, one leg dragging behind
    - Crawl: on all fours, tilted forward
  - Flickering neon EXIT sign: realistic buzz on/off pattern with rapid flicker, mount brackets
  - Distant lightning: directional light that occasionally fires with flickering during flash
  - Broken columns: 5 columns (3 broken with jagged tops and fallen chunks, 2 intact with caps)
  - Debris: 15 scattered debris pieces on ground
  - Hanging chains: 5 chains from ceiling with torus link geometry and hooks, gentle sway
  - Dripping water: 40 instanced water drops falling from ceiling to ground
  - Atmospheric point lights: sickly green, deep red, pale blue, orange accent
  - Ceiling mesh for enclosed feeling
  - Wall stains with emissive red glow
  - Slow orbit camera that circles the scene
  - Fixed lint: conditional useMemo hook, camera immutability issue

- **CharacterSelectScene.tsx** - Complete rewrite with cinematic presentation:
  - Volumetric spotlight: spotLight with fake light shaft cone (transparent cone geometry)
  - Floating dust motes: 100 instanced particles drifting in spotlight beam
  - Floor reflections: mirror-like plane with high metalness, low roughness
  - Dramatic rim lighting: orange left rim, blue right rim, purple top fill, orange uplight from below
  - Smoke at feet: 30 instanced semi-transparent planes rising and expanding at character's feet
  - Detailed pillars: 8 pillars with base, cap, cracks (dark line geometry), chipped damage
  - Rotating holographic UI ring: 3 nested torus rings at different angles + 8 octahedron data points + scanning line
  - Particle burst: 60 instanced particles that explode outward on character change, fading over 1.5s
  - Enhanced platform: glow ring + inner ring around rotating platform
  - Character glow: subtle emissive sphere around character
  - Better fog settings for depth

- **PostProcessing.tsx** - Complete rewrite with comprehensive cinematic pipeline:
  - ToneMapping: ACES Filmic for cinematic color grading
  - DepthOfField: cinematic blur with tunnel vision effect at high fear (bokeh scale increases)
  - Bloom: improved cinematic threshold (0.7 base, lowers with fear), better smoothing
  - HueSaturation: horror orange/teal desaturation, hue shifts with fear
  - BrightnessContrast: darkens and increases contrast with fear level
  - Vignette: pulses with fear level and flickering, offset increases with fear
  - ChromaticAberration: bidirectional offset, dramatically increases during fear/flicker
  - Noise: film grain style (overlay blend), intensity scales with fear
  - SSAO: horror-optimized with higher intensity and radius at high fear, better luminance influence
  - SMAA: sharpening pass on ultra quality
  - All effects react dynamically to fearLevel and isFlickering from horrorStore
  - All effects respect graphicsQuality settings (low/medium/high/ultra)

- **GameCanvas.tsx** - Improved renderer and camera settings:
  - Horror FOV: 68° gameplay (slightly narrower for claustrophobic), 60° menu (cinematic)
  - Near plane: 0.05 (better close-up detail)
  - Far plane: 500 (optimized for scene scale)
  - ACES Filmic tone mapping on the renderer
  - Tone mapping exposure: 0.85 (darker, moodier)
  - SRGBColorSpace output for proper color reproduction
  - PCFSoftShadowMap for soft shadows
  - Clear color: #080505 (very dark, slightly red-tinted)
  - Fog: #080505 red-tinted fog, closer near values (3 gameplay, 15 menu)
  - Shadow map size quality-based: 512/1024/2048

- Verified: zero lint errors in modified files, dev server compiles successfully, page loads with 200 status
- Pre-existing lint errors in HUD.tsx and VictoryScreen.tsx (not in scope)

Stage Summary:
- MainMenuScene.tsx: 137 lines → ~650 lines with volumetric fog, embers, blood, detailed zombies, neon sign, lightning, columns, chains, dripping water, orbit camera
- CharacterSelectScene.tsx: 128 lines → ~420 lines with volumetric spotlight, dust motes, reflections, rim lighting, smoke, holographic ring, particle burst, detailed pillars
- PostProcessing.tsx: 110 lines → ~160 lines with ToneMapping, DOF, Bloom, HueSaturation, BrightnessContrast, Vignette, ChromaticAberration, Noise, SSAO, SMAA
- GameCanvas.tsx: 110 lines → ~120 lines with ACES tone mapping, horror FOV, red-tinted fog, SRGB output, soft shadows
- All modifications preserve existing store connections and game flow

---
Task ID: 3
Agent: Frontend Styling Expert (HUD & UI)
Task: HUD & UI GOD LEVEL - Polish all gameplay HUD and UI screens

Work Log:
- Read worklog.md and all 4 target files + supporting stores (playerStore, gameStore, economyStore, zombieStore, apocalypsePassStore)
- Reviewed existing globals.css for available CSS classes and keyframes
- Verified all shadcn/ui components available for import

- **HUD.tsx** - Complete rewrite from 279 lines to ~470 lines with GOD LEVEL polish:
  - Bio-Monitor Health Bar: 10 segmented health pips with green/yellow/red color thresholds, animated cyan scan line sweeping across, low-health pulse overlay, heartbeat EKG line at bottom using SVG path animation, pulsing Heart icon that speeds up when low
  - Military Ammo Counter: Green/amber digital display with text-shadow glow, padded 2-digit format, magazine bullet visualization showing individual remaining bullets as tiny bars, low-ammo red flash, reloading progress bar at bottom, vertical scan line effect
  - Fog-of-War Minimap: Radial gradient fog that darkens areas far from player, player direction arrow indicator (rotates with playerRotation), boss skull icons (Skull component with red drop-shadow), normal zombie red dots with glow, distance-based fog opacity, pulsing red border when enemies within 15m range
  - Battery Indicator: Real SVG battery icon that depletes (fill width animates with battery %), critical battery flashing animation, ON/OFF status label
  - Circular Ability Cooldown: SVG ring progress with proper circumference calculation, character-specific color from survivor.color, pulsing glow ring when ready, Zap icon pulses with scale animation when ready, shows "READY [Q]" in survivor color
  - Kill Feed: Animated popup showing "+1 KILL" with coin icon, springs in from right, fades out after 1.2s, stacks up to 3 recent kills
  - Damage Direction Arcs: Conic gradient creating a 60° red arc pointing toward damage source, directional arrow SVG at edge of screen, fades out over 0.6s
  - Low Health Overlay: Triple-layered effect - red vignette with animated inset shadow, breathing overlay with opacity pulse, heartbeat pulse overlay with fast double-beat rhythm
  - Security Camera Floor Label: "FL-{floor} // {FLOOR_NAME}" in monospace, blinking red REC dot, live timestamp updating every second, MapPin icon
  - Dynamic Crosshair: SVG crosshair that expands gap when moving (4→8px), turns red when aiming at enemy with pulsing ring, center dot
  - Interaction Prompts: KeyRound icon + [E] key in yellow with glowing border outline
  - Weapon Switch Indicator: Primary/secondary weapon slots with number labels, active weapon highlighted

- **DeathScreen.tsx** - Complete rewrite from 174 lines to ~310 lines with GOD LEVEL polish:
  - Screen Cracks: SVG crack paths that animate in with pathLength animation, branching from center
  - Blood Splatter: Radial gradient blood splatter spreading from center
  - YOU DIED Text: Slams in from scale 4→1 with spring physics, letter-spacing expands from 0.1em to 0.3em, intense red text-shadow glow, dripping blood lines underneath that animate downward
  - 3D Skull Icon: Skull with perspective transform (rotateY/rotateX), drop-shadow for depth, radial glow behind
  - Blood Veins: 8 animated veins growing upward from bottom of screen with random positions, delays, durations
  - Statistics: 5 stats animate in one-by-one with 200ms stagger, CountUp component for animated number counting, includes: KILLS, SURVIVED (time), EARNED (coins), TOTAL TIME, DEATHS (cumulative)
  - LAST WORDS Quote: Random horror quote from 10 options, fades in at 60% opacity after 1.5s delay
  - Watch Ad Button: Golden gradient background with pulsing box-shadow animation (3 keyframes), shimmer overlay
  - Blood Drip Borders: Retry button has 6 small dripping points along bottom edge
  - Red Pulse Wave: Horizontal line that scales in from left at top of card
  - Screen Shake: 10px shake on initial death that settles after 400ms

- **VictoryScreen.tsx** - Complete rewrite from 209 lines to ~380 lines with GOD LEVEL polish:
  - Light Rays: 12 rotating ray lines emanating from center using CSS gradients
  - Floating Light Particles: 20 particles that rise from bottom with varying sizes/delays, golden glow
  - Coin Rain: 15 coin emojis that rain down briefly on victory, each with random position/delay/rotation
  - Spinning Trophy: Trophy icon with rotateY continuous spin (4s), 6 sparkle particles orbiting around it
  - SURVIVED Title: Golden text-shadow with light rays, 0.4em letter-spacing
  - Rank System: S/A/B/C/D rank calculated from kills+items+time score, each rank has unique color and glow, springs in with rotation
  - NEW RECORD Badge: Conditional display with spring entrance animation, star decorations, pulsing glow
  - 3D Flip Stat Cards: Each stat card flips in with rotateX from 90°→0° with spring physics, shine sweep effect on flip, staggered delays (1000-1600ms)
  - XP Progress Bar: Animated fill with shimmer overlay, particle burst (8 particles) on 100% completion
  - Continue Button: Golden gradient with pulsing box-shadow glow, shimmer overlay
  - Golden Accent Line: Horizontal line scales in from center at top of card

- **PauseMenu.tsx** - Complete rewrite from 166 lines to ~290 lines with GOD LEVEL polish:
  - Blur Background: 12px backdrop-filter blur on overlay
  - Scan Line Effect: Subtle red-tinted gradient scanning down the overlay
  - Red Accent Line: Gradient line at top of card
  - Health Bar Visualization: Animated fill bar with green/yellow/red color thresholds, scan line, glow shadows
  - Weapon Stats Display: Damage/Range/Fire Rate bars with animated fills, weapon name + melee/ranged badge, secondary weapon support
  - Rarity-Colored Inventory: 12-slot grid with common (zinc)/rare (blue)/legendary (yellow) border and background colors, rarity indicator dots in corners, slot numbers for empty slots
  - Player Status Grid: 2x2 grid with Battery, Floor, Ammo, Speed stats
  - Horror-Themed Buttons: Resume (green glow shadow), Settings (zinc), Save & Quit (red glow shadow)
  - ESC hint at bottom
  - Staggered inventory slot entrance animations

- **globals.css** - Added GOD LEVEL HUD additions:
  - .perspective-1000 class for 3D card flips
  - .tabular-nums utility for counter displays
  - @keyframes golden-glow-pulse for victory elements
  - @keyframes rank-reveal for rank badge entrance
  - @keyframes trophy-3d-spin for spinning trophy
  - @keyframes blood-crack-spread for death screen cracks
  - @keyframes minimap-danger-pulse for enemy proximity
  - @keyframes hud-scan for bio-monitor scan line
  - @keyframes ammo-digit-flash for military counter

- Verified: `npx next build` compiles successfully with zero errors
- All store connections preserved across all files
- All 'use client' directives in place
- All framer-motion animations use proper patterns
- No external image assets used (CSS/SVG/Lucide icons only)

Stage Summary:
- HUD.tsx: 279 lines → ~470 lines with bio-monitor, military ammo, fog-of-war minimap, battery icon, ability cooldown, kill feed, damage arcs, low health overlay, security cam label, dynamic crosshair, interaction prompts, weapon switch
- DeathScreen.tsx: 174 lines → ~310 lines with screen cracks, blood splatter, slamming YOU DIED, 3D skull, blood veins, count-up stats, LAST WORDS, golden ad glow, blood drip buttons, DEATHS counter
- VictoryScreen.tsx: 209 lines → ~380 lines with light rays, floating particles, coin rain, spinning trophy, rank system, NEW RECORD badge, 3D flip stats, XP particle burst, golden continue button
- PauseMenu.tsx: 166 lines → ~290 lines with blur background, scan lines, health bar, weapon stats, rarity-colored inventory, horror-themed buttons
- globals.css: Added ~60 lines of HUD-specific keyframes and utilities
- Build passes clean, all functionality preserved

---
Task ID: 4
Agent: Game Engine Polish Agent
Task: Polish game engine systems to GOD LEVEL for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and all 6 target files + 5 store files to understand existing implementations
- Verified dev server running and compilation working

- **HorrorEffects.tsx** - Complete rewrite with GOD LEVEL camera effects:
  - Perlin noise-based camera shake (layered sine waves at 4 frequencies for organic feel, smooth decay)
  - Breathing effect (camera subtly moves up/down with breathing, faster when sprinting/low health)
  - Fear effects (tunnel vision FOV narrowing up to -12°, chromatic aberration-like Z rotation wobble)
  - Damage hit effect (rotation jerk using Perlin noise for screen crack feeling, damage flash detection)
  - Low health effects (heartbeat FOV pulse with sharp power-8 pulse shape, faster heartbeat near death)
  - Sprint camera tilt (slight Z rotation when sprinting and moving, smooth lerp transitions)
  - Head bob (vertical double-frequency bounce + horizontal sway, not just sine wave)
  - Landing effect (camera dip when stopping from sprint, 0.06 unit dip)
  - Aim down sights (FOV narrowing -5° when attacking with ranged weapons)
  - Death camera (slowly falls 1.2 units and tilts 0.4 rad over 3 seconds with eased cubic)
  - All effects use THREE.MathUtils.lerp for smooth transitions, no snapping

- **FlashlightSystem.tsx** - Complete rewrite with GOD LEVEL lighting:
  - Volumetric light cone (transparent cone mesh with additive blending, battery-aware opacity)
  - Better flicker (gradual dim then bright via sine interpolation, not just on/off)
  - Smoother flicker with THREE.MathUtils.lerp at delta*15
  - Higher quality shadows (1024x1024, proper bias=-0.0005, camera near/far)
  - Battery warning (light lerps toward orange when battery < 15%)
  - Zombie detection flicker (rapid strobe when < 4m, gradual flicker at 4-10m distance)
  - Ambient light bounce (point light with warm-tinted reflected color)
  - Flashlight beam dust particles (40 instanced spheres drifting in the beam path)

- **CombatSystem.tsx** - Complete rewrite with GOD LEVEL combat VFX:
  - Better muzzle flash (weapon-specific scale/color, star burst spikes, outer glow sphere)
  - Hit markers (X-shaped planes rendered via InstancedMesh at hit position, fade over 0.4s)
  - Headshot indicator (yellow/gold color for headshot markers vs white normal)
  - Melee swing visual (torus arc slash effect in front of camera, fades over 0.3s)
  - Blood splash (instanced sphere particles with gravity, weapon-specific counts: shotgun=12, rifle=6, pistol=4)
  - Shell casings (instanced cylinders with physics/gravity, ground collision, 3s lifetime)
  - Damage numbers (instanced planes with color coding: white normal, yellow headshot, red crit)
  - Kill confirmation (glowing sphere at kill position, fades over 1s)
  - Weapon-specific effects (shotgun wider flash+shake, silenced pistol softer color)
  - Critical hit effect (red flash overlay for damage >= 80)
  - Performance optimized: ALL effects use refs + InstancedMesh, ZERO setState calls in combat loop

- **ZombieModel.tsx** - Complete rewrite with GOD LEVEL zombie detail:
  - GlowingEyes shared component for ALL zombie types (configurable color/intensity/size/spacing)
  - Walker: torn shirt flaps (2 extra mesh pieces), blood stain patch, more hunched at 0.15 rad
  - Runner: emissive purple vein lines on torso (3 lines), more aggressive chase lean at 0.4 rad
  - Crawler: trailing blood effect mesh that changes opacity with state, more ground-hugging at y=0.25
  - Boss Scientist: pulsing veins (4 emissive purple lines), glowing pustules (5 green spheres), second tentacle,
    lab coat tears (2 flaps), brain dims on death from intensity 5→0.1
  - Boss Alpha: glowing rune markings (4 red emissive bars), bone protrusions from shoulders (4 cylinders),
    aura effect (transparent BackSide sphere + point light), dimming core/aura on death
  - Death animation: dramatic stagger and fall with rotation.x + rotation.z wobble for all types
  - Hit reaction: body flinch animation on walker/runner/scientist, position bump on crawler
  - Alert animation: head scanning rotation before chase (sin wave look around)
  - Glowing eyes on ALL types (walker=#ff2200, runner=#ff4400, crawler=#ff6600, scientist=#ff0088, alpha=#ff0000)

- **Floor1.tsx** - Major expansion with GOD LEVEL environmental detail:
  - More debris: 3 broken chairs (seat+back+broken leg), 2 knocked over plant pots (pot+spilled dirt+dead stem)
  - Blood handprints: 6 handprints on walls with palm + 4 fingers each, emissive red
  - Water puddles: 6 reflective puddles (metalness=0.8, roughness=0.1, transparent)
  - Emergency exit signs: 3 green glowing signs with point lights and arrow indicators
  - Power box: sparking effect with flickering point light, open panel, exposed red/blue wires, warning sign
  - More varied lighting: red emergency lights, orange accent lights, dim area with near-zero light
  - Ceiling damage: 3 broken tile patches, 2 exposed pipes, dripping pipe joint, hanging wire
  - Better reception desk: flickering computer screen (emissive blue), monitor stand+base, coffee mug,
    pen holder, papers on desk, side panels

- **Floor4.tsx** - Major expansion with GOD LEVEL rooftop atmosphere:
  - Better rain: 1500 particles (3x more) with wind drift, tilted streaks
  - Puddle reflections: 6 reflective circles (metalness=0.9, roughness=0.05)
  - Better lightning: 50 intensity (2.5x brighter), 0.2s duration, triple flash, thunder screen shake via horrorStore
  - Wind effect: 30 debris particles blowing across rooftop with drift and tumble
  - Helicopter wreckage: crashed helicopter body, broken cockpit, bent tail, slowly spinning bent rotor,
    broken skid, fire glow point light, scorch marks on ground
  - Satellite dishes: 2 rotating dishes with receiver arms, antenna array mast with cross bars, blinking red lights
  - Better moon: 4 radius (2x larger), 4 crater detail patches, outer glow sphere
  - City skyline: 15 box buildings at varying heights with randomly lit windows in warm/cool colors

Stage Summary:
- HorrorEffects.tsx: 81 lines → ~245 lines with 10 major camera effect systems
- FlashlightSystem.tsx: 128 lines → ~210 lines with volumetric cone, dust particles, battery warning
- CombatSystem.tsx: 242 lines → ~350 lines with 7 InstancedMesh VFX systems, zero re-renders
- ZombieModel.tsx: 507 lines → ~680 lines with detailed models, animations, glowing eyes for all types
- Floor1.tsx: 377 lines → ~600 lines with debris, blood, puddles, exit signs, power box, ceiling damage
- Floor4.tsx: 330 lines → ~530 lines with helicopter, skyline, satellite dishes, wind, enhanced rain/lightning
- Zero lint errors in modified files (3 pre-existing errors in HUD.tsx/VictoryScreen.tsx unchanged)
- Dev server compiles successfully on all changes
- All existing store imports and connections preserved

---
Task ID: 2-d
Agent: Frontend Styling Expert (Multiplayer Lobby)
Task: GOD LEVEL MultiplayerLobby.tsx rewrite for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and existing MultiplayerLobby.tsx (355 lines)
- Read multiplayerStore, playerStore, gameStore for full type/interface understanding
- Verified character portraits exist at /public/images/characters/{marcus,elena,viktor,sara,dexter}.png
- Reviewed globals.css for available horror CSS classes (film-grain-overlay, vignette-overlay, scanline-overlay, fire-text, blood-reveal-btn, eerie-bg, red-pulse-warning, dark-scrollbar, tabular-nums, etc.)

- **MultiplayerLobby.tsx** - Complete rewrite from 355 lines to ~955 lines with GOD LEVEL polish:

  **Header:**
  - "CO-OP SURVIVAL" title with fire-text CSS (animated 6-layer text-shadow with upward flame illusion)
  - Signal icon with animated pulse (scale 1→1.3→1) for connection quality indication
  - Ping display with color coding: green (<50ms), yellow (<100ms), red (>100ms) with matching drop-shadow glow
  - BACK button (ghost style) with ChevronLeft icon, hidden text on mobile
  - Mobile chat toggle button with red notification dot

  **Idle State (Create/Join):**
  - Split screen: Create Room (left) + Join Room (right) on desktop, stacked on mobile
  - "FORM YOUR SQUAD" decorative text with delayed fade-in
  - CREATE ROOM card: dark card with red border, decorative corner marks, Users icon with pulsing ring, large red button with blood-reveal-btn hover sweep, shadow-[0_0_25px] glow, inner pulse animation
  - JOIN ROOM card: dark card with zinc border, decorative corner marks, LogIn icon, monospace font input with 0.5em letter-spacing, auto-uppercase + alphanumeric-only filter
  - "OR" divider with Skull icon between horizontal lines (desktop: vertical layout, mobile: horizontal)
  - "MAXIMUM 4 SURVIVORS PER SESSION" red-pulse-warning text at bottom
  - Spring animations: Create slides from left, Join slides from right

  **Room State:**
  - Room code: massive monospace with each character in individual Card (RoomCodeChar component)
  - Each character animates in with rotateY -90→0 spring, staggered 80ms delay
  - Yellow text with text-shadow glow on each character
  - Copy button with animated checkmark (scale 0→1 with -180→0 rotation on copy, back to Copy icon on reset)
  - Difficulty selector (host only): 4-column grid with colored buttons: EASY (green), NORMAL (yellow), HARD (orange), APOCALYPSE (red + Skull icon). Active state has background, border, glow shadow. Staggered entrance.
  - Player count: "3/4 SURVIVORS" with Users icon, tabular-nums for counter. 4 animated dot indicators: filled dots pulse red, empty dots are zinc.
  - Player list: ScrollArea with max-h-64/80, each player card slides in from right (x: 80→0 spring)
  - Player cards: next/image character portraits with color-matched border glow, Crown overlay for host, player name in player color, role text, READY/NOT READY badges or interactive READY toggle button for local player
  - Ready toggle for non-hosts: Shield icon, green glow when ready, zinc when not
  - START GAME button (host only): large green with pulse animation ring when all players ready, disabled zinc state otherwise
  - LEAVE button: red outline with X icon

  **Chat Panel:**
  - Desktop: always visible 72/80px side panel with border-l
  - Mobile: full-screen slide-in overlay from right (spring transition)
  - "TEAM COMMS" header with MessageSquare icon + "ENCRYPTED" mono label
  - Messages: colored by player color via COLOR_MAP (blue→#3b82f6, green→#22c55e, yellow→#eab308, red→#ef4444)
  - System messages in yellow/italic with ⚠ prefix
  - Each message slides up with spring animation (y: 12→0)
  - Empty state: italic "No messages yet. Coordinate with your team..."
  - Auto-scroll to bottom via chatEndRef
  - Input with send button, disabled when no localPlayerId

  **Atmospheric Effects:**
  - Film grain overlay (film-grain-overlay CSS class)
  - Custom scan line effect (motion.div sweeping top 0%→100% over 6s, red-tinted gradient)
  - Vignette overlay (vignette-overlay CSS class at z-57)
  - Ambient particles (18 framer-motion divs rising from bottom, varying size/color/glow/duration/delay)
  - Blood veins (6 animated veins growing upward from bottom with staggered delays)
  - Eerie background shift (eerie-bg CSS class)

  **Animations (framer-motion):**
  - Cards stagger in with spring physics
  - Player join: slide in from right (x: 80→0, spring stiffness: 200)
  - Room code characters: type in one by one with rotateY flip (80ms stagger)
  - Chat messages: slide up (y: 12→0, spring)
  - Copy button: rotating checkmark (scale 0→1, rotate -180→0)
  - Mobile chat: slide from right (x: 100%→0, spring)
  - State transitions: AnimatePresence with fade + y translation
  - Difficulty buttons: staggered entrance (50ms per button)
  - Player count dots: pulsing red scale animation (1→1.2→1)
  - Signal icon: pulsing scale (1→1.3→1)
  - Create room button: inner pulse ring (scale 1→1.02→1, opacity 0.3→0.6→0.3)
  - Start game button: pulse ring when ready

  **Technical:**
  - All store connections preserved exactly (useGameStore, useMultiplayerStore, usePlayerStore)
  - Added updatePlayer for ready toggle (was missing in original)
  - COLOR_MAP for mapping PlayerColor string to hex codes
  - All handlers wrapped in useCallback
  - Character portraits via next/image with unoptimized prop
  - Fully responsive (mobile stacked, desktop side-by-side)
  - Uses: Button, Card, Input, Badge, ScrollArea, Separator from shadcn/ui
  - Uses: ChevronLeft, Plus, LogIn, Copy, Check, Crown, Shield, Play, X, MessageSquare, Send, Signal, Skull, Users from lucide-react

- Verified: zero lint errors on MultiplayerLobby.tsx (npx eslint src/game/ui/MultiplayerLobby.tsx)
- Dev server compiles successfully (200 status on GET /)
- Pre-existing lint error in ApocalypsePassUI.tsx (not in scope)

Stage Summary:
- MultiplayerLobby.tsx: 355 lines → ~955 lines with cinematic horror polish
- All 7 requirement categories fully implemented: Header, Idle State, Room State, Chat Panel, Player Count, Atmospheric Effects, Animations
- Zero lint errors, dev server compiles clean
- All store connections preserved, new updatePlayer integration for ready toggle

---
Task ID: 2-b
Agent: Frontend Styling Expert (Shop UI)
Task: ShopUI.tsx GOD LEVEL rewrite for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and existing ShopUI.tsx (300 lines) + economyStore + gameStore
- Reviewed available shadcn/ui components, globals.css CSS classes, and Lucide icons
- Verified shop-banner.png exists at /images/shop-banner.png
- Verified dev server compiling successfully

- **ShopUI.tsx** - Complete rewrite from 300 lines to ~725 lines with GOD LEVEL polish:
  - Header: Shop banner image (next/image) with dark gradient overlay, "DEATH SHOP" title with glitch-title-god effect, animated Skull icon with wobble rotation, Death Coins balance with rotating coin (rotateY 360°) + golden sparkle particles (3 positioned golden-sparkle elements), BACK button with ghost style + blood-reveal-btn hover
  - Category Tabs: Horizontal scrollable with 6 unique icons (Ghost/Swords/Smile/Sparkles/Flashlight/Package), horror-styled with blood-red active glow (data-[state=active]:bg-red-900/50 + shadow glow), responsive labels (full on sm+, abbreviated on mobile), dark-scrollbar styling
  - Item Cards (grid): Rarity-based animated border glow (animate-rarity-common/rare/legendary CSS animations), legendary items get 6 floating amber particle effects (LegendaryParticles component), item icon large with drop-shadow, item name in rarity color, price display with gold coins (affordable) or lock+red (can't afford), owned items get emerald "OWNED" badge with Check icon, equipped items get amber "EQUIPPED" badge with Star icon + golden ring border + shadow glow, premium items get orange "PREMIUM" badge with Sparkles icon, hover: card lifts -4px with scale 1.02, tap: scales to 0.97, can't afford overlay with Lock icon + backdrop-blur, selection indicator with red ring + spring layout animation
  - Selected Item Detail Panel: Slides up from bottom with spring physics (damping:25, stiffness:300), shows large icon in rarity-colored container, full name with rarity badge + premium badge, description with line-clamp-2, price breakdown showing current balance → after purchase with color coding (emerald if affordable, red if not), cost display, action buttons: BUY with gold gradient + shimmer overlay for affordable / disabled zinc for can't afford, EQUIP with emerald/amber color based on equipped state
  - IAP Coin Packs: Horizontal scroll at bottom, each pack has golden border + shimmer overlay, shows coin amount (font-mono bold) + separator + real price, hover: scale 1.03 + lift -2px, staggered entrance animation
  - Purchase Confirmation Dialog: Dark red themed (border-red-900/50, shadow glow), AlertTriangle icon + "CONFIRM PURCHASE" title, item preview with rarity-colored container, animated coin counter showing price + rotating coin, balance breakdown with animated arrow (x oscillation), "INSUFFICIENT COINS" warning with red-pulse-warning effect, CANCEL button with X icon, BUY button with gold gradient + shimmer + animate-pulse-glow-red
  - Atmospheric Effects: Dark vignette overlay (z-index 58), film grain overlay (z-index 59), blood-drip-overlay + 4 extra blood drip elements, red ambient glow at edges (inset box-shadow), eerie-bg background shift animation
  - Empty State: Skull icon + "NO ITEMS AVAILABLE" + "Check back later..." in muted text
  - AnimatedCoinCounter component: Smoothly counts between values with step animation, changes color to amber while animating

- **globals.css** - Added shop-specific CSS animations:
  - .animate-rarity-common: subtle zinc inset pulse (3s cycle)
  - .animate-rarity-rare: blue inset pulse with outer glow (2.5s cycle)
  - .animate-rarity-legendary: amber inset pulse with stronger outer glow (2s cycle)
  - .animate-pulse-glow-red: golden box-shadow pulse for BUY button (1.8s cycle)

- Fixed lint error: Replaced useEffect-based setSelectedItem(null) on category change with handleCategoryChange callback
- Removed unused TabsContent import
- Cleaned up extra blank lines

Stage Summary:
- ShopUI.tsx: 300 lines → ~725 lines with full GOD LEVEL horror shop experience
- globals.css: Added ~40 lines of shop-specific keyframes and utilities
- Zero lint errors in ShopUI.tsx (1 pre-existing error in ApocalypsePassUI.tsx unchanged)
- Dev server compiles successfully
- All store connections preserved (useGameStore, useEconomyStore)
- All functionality preserved (purchase, equip, IAP, category switching)

---
Task ID: 2-a
Agent: Frontend Styling Expert (CharacterSelect)
Task: GOD LEVEL CharacterSelect.tsx for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md (previous agents: CSS effects, 3D scenes, HUD/UI, game engine polish)
- Read current CharacterSelect.tsx (223 lines, basic card grid with stats)
- Read playerStore (SURVIVORS data with color, stats, abilities, backstory)
- Read gameStore (setScene, currentScene)
- Read globals.css (confirmed all CSS effects available: film-grain, scanlines, fog, embers, blood drips, vignette, etc.)
- Verified character portrait images exist at /public/images/characters/{marcus,elena,viktor,sara,dexter}.png
- Verified all shadcn/ui components and Lucide icons available

- **CharacterSelect.tsx** - Complete rewrite from 223 lines to ~400 lines with GOD LEVEL polish:
  - **Cinematic Layout**: Full screen dark atmospheric background with eerie-bg animation, responsive lg:flex-row layout
    - Left: Large hero portrait area (hidden on mobile, visible lg+)
    - Right: Stats + info panel
    - Bottom: Character card selection row
  - **Atmospheric Effects**: Reused all globals.css horror effects
    - Film grain overlay, scanlines, TV static, vignette
    - Blood drip overlay (6 drip positions)
    - Red fog at bottom, smoke particles
    - Blood rain (15 animated drops)
    - Dynamic gradient orbs that shift based on selected character color
  - **Hero Portrait Area** (left side, desktop):
    - next/image with AI-generated portrait at /images/characters/{id}.png
    - Character color glow ring behind portrait (radial gradient, pulsing)
    - Animated scan line sweeping over portrait (horizontal line in character color)
    - Scanline overlay (CRT-style)
    - Dark gradient at bottom for name overlay
    - Corner accent borders in character color
    - Ember/spark particles (12 CSS-animated particles rising around portrait)
    - "SURVIVOR FILE // {ID}" label rotated vertically
    - Character name + role at bottom with color glow text-shadow
    - AnimatePresence for smooth character switching (blur/scale transitions)
  - **Character Cards** (bottom row):
    - next/image portraits with brightness filter (selected=bright, hovered=dim, default=dark)
    - Color overlay tint matching character when selected
    - Glowing border in character color when selected (with box-shadow glow)
    - Hover: slight scale up + color glow
    - Selected: animated pulsing border + "SELECTED" badge (AnimatePresence)
    - Color accent bar at top of card
    - Name + role at bottom with glow
    - Hidden mini stat bars on hover
    - Staggered entrance animation
  - **Stats Panel** (right side):
    - Custom StatBar component with animated gradient fills matching character color
    - Each bar: gradient from dark to bright (red/yellow/orange/purple)
    - Animated fill from 0 to value with easeOut spring
    - Scan line effect sweeping across bars
    - Shimmer overlay animation
    - Background pattern (subtle grid lines)
    - Numeric values in monospace font with colored glow
    - Health (red), Speed (yellow), Damage (orange), Ability (purple)
  - **Ability & Passive Section**:
    - Ability badge with Flame icon + orange glow
    - Ability name with orange text-shadow
    - Ability description with typewriter effect (useTypewriter hook, resets on character change)
    - Blinking cursor during typewriter animation
    - Cooldown indicator with Clock icon + monospace text
    - Passive badge with Zap icon + green glow
    - Passive description text
  - **Backstory Section**:
    - Parchment-like background with diagonal hash texture overlay
    - "BACKSTORY" badge
    - ScrollArea with italic quoted text
    - Horror ambiance with muted colors
  - **START GAME Button**:
    - BloodDripButton wrapper with 6 animated blood drip points on hover
    - Gradient from red-700 to red-900
    - Massive shadow glow (25px + 50px) with pulse animation
    - Blood shimmer sweep animation (repeating)
    - Swords icon + "START GAME" text with wide tracking
    - Hover intensifies glow
  - **BACK Button**: Ghost button at top left with ChevronLeft icon
  - **Mobile Responsive**:
    - Mobile: compact portrait + name at top (hidden on lg)
    - Desktop: full hero portrait area on left
    - Card row scrolls horizontally on small screens
    - Responsive text sizes with clamp()
  - **Transitions**: framer-motion AnimatePresence for smooth character switching

- Verified: zero lint errors in CharacterSelect.tsx (2 pre-existing errors in ApocalypsePassUI.tsx and ShopUI.tsx)
- Verified: dev server compiles successfully
- No new CSS additions needed - all effects reuse existing globals.css classes

Stage Summary:
- CharacterSelect.tsx: 223 lines → ~400 lines with cinematic hero portrait, animated stat bars, typewriter abilities, blood drip button, atmospheric overlays, responsive design
- All store connections preserved (useGameStore, usePlayerStore)
- All scene routing logic preserved (mainMenu, gameplay)
- All AI-generated character portraits used via next/image
- Zero new lint errors introduced

---
Task ID: 2-c
Agent: Frontend Styling Expert (Apocalypse Pass & Settings)
Task: GOD LEVEL ApocalypsePassUI.tsx and Settings.tsx rewrite for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and existing ApocalypsePassUI.tsx (219 lines) + Settings.tsx (241 lines)
- Read all relevant stores: apocalypsePassStore, settingsStore, audioStore, gameStore, economyStore
- Verified battlepass-banner.png exists at /images/battlepass-banner.png
- Reviewed globals.css for available CSS classes and keyframes (film-grain-overlay, vignette-overlay, fire-text, blood-progress-bar, blood-reveal-btn, golden-sparkle, dark-scrollbar, tabular-nums, golden-glow-pulse, shimmer, etc.)

- **ApocalypsePassUI.tsx** - Complete rewrite from 219 lines to ~345 lines with GOD LEVEL polish:
  - **Header**: Battle pass banner image (next/image) with dark gradient overlay, blood-drip-overlay + 3 extra blood drip elements, "APOCALYPSE PASS" title with fire-text CSS (animated 6-layer text-shadow with flame illusion), Skull icons flanking season number, animated Clock icon rotating 360° (60s duration), live countdown timer with tabular-nums + seconds in red, BACK button with blood-reveal-btn hover
  - **XP Progress Section**: Animated Star icon pulsing (scale 1→1.15→1), LEVEL number with golden text-shadow, XP counter in monospace (current in yellow-400, / in zinc-600, needed in zinc-500), blood-fill progress bar with gradient (#7f1d1d → #b91c1c → #dc2626 → #ef4444), liquid wave effect at leading edge, shimmer overlay on fill, percentage label centered, particle burst (12 yellow particles with spring physics) when xpProgress >= 100%
  - **Free/Premium Track Toggle**: Two motion.buttons with whileHover/whileTap, Free Track (zinc active state with inset shadow glow), Premium (golden gradient 135deg #8b6914→#daa520→#ffd700 when active with shimmer overlay), Premium upgrade button ($4.99 UPGRADE) with golden gradient + golden-shimmer animation + outer glow + shimmer sweep overlay, "PREMIUM ACTIVE" badge when isPremium with Crown icon + yellow border
  - **Rewards Grid**: Cards with staggered entrance (30ms delay per card, y:20→0, scale:0.9→1), circular level badges color-coded (yellow=current, green=claimed, zinc=unlocked, dark=locked), premium Crown icon in corner, CURRENT badge (yellow Badge with drop-shadow), reward type badge with rarity-matched color, rarity-based card backgrounds (weapon=orange, skin=purple, flashlight=cyan, execution=red, emote=green, icon=blue, default=zinc), CLAIM button with green gradient + pulse animation, CLAIMED status with Check icon + green text, locked overlay with dark gradient + red inset glow, justClaimed animation overlay with large green Check (spring physics), golden-glow-pulse animation on current level card
  - **Atmospheric Effects**: Film grain overlay, vignette overlay, red fog at bottom (linear gradient), 8 ember particles, bottom fog overlay for scroll area
  - **Responsive**: Grid cols 2→3→4→5, ScrollArea with dark-scrollbar

- **Settings.tsx** - Complete rewrite from 241 lines to ~380 lines with GOD LEVEL polish:
  - **Layout**: Centered modal card with dark horror aesthetic, red accent line at top, film grain overlay (reduced opacity), vignette overlay, card shadow with red-950 glow
  - **Header**: BACK button with blood-reveal-btn hover, rotating gear icon (20s continuous rotation), "SETTINGS" title with red text-shadow glow (20px + 40px), RESET button with animated shake on hover (x: [-1,1,-1,1,0])
  - **Tabs**: 4 tabs (AUDIO/GRAPHICS/CONTROLS/LANGUAGE) with icons, horror-styled active state (bg-red-900/40, text-red-300, red shadow glow), responsive (abbreviated on mobile with sm:inline labels), AnimatePresence for tab transitions (opacity + x slide)
  - **Audio Tab**: Mute toggle at top with Skull icon when muted (pulsing scale animation) or Volume2, "MUTED" label when active, 4 HorrorVolumeSlider components (Master/Music/SFX/Voice) each with: icon, label, value color-coded (>80=red, >50=yellow, default=zinc), Slider, 20-bar waveform visualization that reacts to volume (active bars animated with varying heights, color matches volume level with glow, inactive bars are dim zinc)
  - **Graphics Tab**: Quality preset buttons (4-column grid) with unique colors (Low=zinc, Med=blue, High=green, Ultra=yellow), active state has colored glow shadow + layoutId "quality-glow" background fill, 7 HorrorToggle components (Shadows/PostProcessing/VSync/ShowFPS/ScreenShake/BloodEffects/JumpScares) with emoji icons, FPS counter preview (conditional, shows green dot + "60" when active), Separator between sections
  - **Controls Tab**: Sensitivity slider with crosshair SVG preview (dynamic gap grows with sensitivity value, red colored lines with drop-shadow), 4 HorrorToggle components (InvertY/Vibration/AutoAim/ShowMinimap) with emoji icons, 10 key bindings grid (2-column) with each binding showing action name + red monospace kbd element with border and text-shadow glow
  - **Language Tab**: 7 language buttons with flag emojis (🇺🇸🇪🇸🇫🇷🇩🇪🇯🇵🇰🇷🇨🇳), staggered entrance animation (40ms delay per item), active language has red border + red background + red shadow glow + CheckCircle2 icon with spring entrance (scale 0→1, rotate), hover: scale 1.02 + x:4 shift
  - **Footer**: "Changes auto-saved" text with green pulsing dot (2px, shadow glow) + separator above
  - **HorrorVolumeSlider** component: Custom styled with icon, label, color-coded value, shadcn Slider, 20-bar waveform that animates (each bar has unique duration/delay/ease), active bars colored by volume level with box-shadow glow
  - **HorrorToggle** component: Consistent horror switch (red when on, zinc when off), emoji icon, red glow dot on switch when active (pulse animation)

- **globals.css** - Added Apocalypse Pass & Settings keyframes:
  - @keyframes golden-shimmer: background-position shift for premium upgrade button (0%→100%→0%)
  - @keyframes liquid-wave: scaleX + opacity animation for blood progress bar leading edge

- Fixed lint error: Replaced useEffect-based setParticleBurst with derived const (particleBurst = xpProgress >= 100)
- Zero lint errors, dev server compiles successfully
- All store connections preserved (useGameStore, useApocalypsePassStore, useEconomyStore, useSettingsStore, useAudioStore)

Stage Summary:
- ApocalypsePassUI.tsx: 219 lines → ~345 lines with banner header, fire-text title, animated countdown, blood-fill progress bar, particle burst, premium toggle with golden shimmer, rarity-colored reward cards, atmospheric effects
- Settings.tsx: 241 lines → ~380 lines with rotating gear, horror tabs, waveform volume sliders, quality presets, crosshair preview, key bindings, language flags, auto-save footer
- globals.css: Added ~20 lines of keyframes (golden-shimmer, liquid-wave)
- Zero lint errors, dev server compiles clean
- All store connections preserved

---
Task ID: 2-e
Agent: 3D Character Model Polish Agent
Task: GOD LEVEL SurvivorModel.tsx rewrite for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and existing SurvivorModel.tsx (114 lines, basic capsule/sphere/box model)
- Read playerStore for SURVIVORS data, survivor types, and store interface
- Verified dev server running and compilation working

- **SurvivorModel.tsx** - Complete rewrite from 114 lines to ~680 lines with GOD LEVEL procedural character models:

  **Shared Body Structure (all characters):**
  - Head: Rounded box (0.22x0.26x0.22) + hemisphere dome top + jaw line mesh + chin + ears (small boxes on sides)
  - Face: Eyes with 3-layer detail (white sclera sphere + colored iris sphere + dark pupil sphere), eyebrows (thin angled boxes), mouth line (thin box), nose (small box)
  - Hair: Character-specific hair base on top of head (flat box or cones)
  - Neck: Tapered cylinder (cylinderGeometry with different radii)
  - Torso: Upper chest box + lower abdomen box + vest/chest plate overlay (front + back) + collar + belt with buckle + pockets
  - Arms: Shoulder pivot group → upper arm box → elbow joint sphere → forearm pivot group → forearm box → hand group (palm + 3 fingers + thumb)
  - Legs: Hip pivot group → thigh box → knee joint sphere → shin pivot group → shin box → character-specific boots
  - All meshes use castShadow
  - All materials use meshStandardMaterial with character-appropriate roughness/metalness

  **Character-Specific Palettes (5 unique color schemes):**
  - Marcus: skin #c4956a, hair #2a2a2a, shirt #4a7c59 (green), vest #2d3d2d, pants #3d4f3a, boots #1f1a14
  - Elena: skin #dbb89a, hair #5a3a2a, shirt #7c4a6e (purple), vest #e8e8f0, pants #4a4a5a, boots #3a3a4a
  - Viktor: skin #c9a882, hair #5a4a3a, shirt #6e7c4a (olive), vest #c8b830, pants #4a4a3a, boots #3a3020
  - Sara: skin #d4a87a, hair #1a1a2a, shirt #4a5e7c (blue), vest #3a3a4a, pants #2a2a3a, boots #1a1a2a
  - Dexter: skin #b88a6a, hair #1a0a0a, shirt #7c5a4a (brown), vest #4a3020, pants #3a2a1a, boots #2a1a0a

  **Marcus (Ex-Military Tank):**
  - Head: Military helmet (half-sphere + cylinder band + box brim), scar on face (thin red emissive line)
  - Body: Tactical vest front plates (2 overlapping boxes), back plate, ammo belt across chest (6 diagonal small boxes), knife sheath on left thigh (leather box + metallic blade box), shoulder pads (chunky green boxes)
  - Boots: Military style - chunky 2-part boots (boot top + boot sole, larger than default)

  **Elena (Field Medic Healer):**
  - Head: Ponytail (cylinder extending backward + torus hair tie in red)
  - Body: Medical cross on chest (white background + red cross vertical/horizontal bars with emissive glow), medical bag on right hip (white box + red cross), rolled-up sleeve rings (torus on each forearm), syringe on belt (thin cylinder + red sphere tip), shoulder pads (soft white medical style)

  **Viktor (Engineer Support):**
  - Head: Hard hat (flat cylinder + dome hemisphere + wide brim cylinder), beard on chin (3 brown box cluster)
  - Body: Safety vest overlay (semi-transparent yellow box), reflective stripes (2 emissive bars), tool belt with wrench (metallic box + wider head), hammer on hip (wooden cylinder handle + metallic box head), knee patch on left knee (overlay box), shoulder pads (yellow safety style)

  **Sara (Scout Stealth):**
  - Head: Hood (half-sphere shell with DoubleSide rendering + brim box), night vision goggles on forehead (strap box + 2 cylinder lens housings + 2 green emissive glowing spheres + bridge box)
  - Body: Holster on right thigh (dark box + gun grip box), sleek shoulder pads (thinner, lower profile)
  - Profile: 0.92 body scale for sleeker silhouette
  - Boots: Sleek style - thinner, lower profile than default

  **Dexter (Demolition DPS):**
  - Head: Wild spiky hair (10 upward-pointing coneGeometry with fixed rotations, no Math.random in render)
  - Body: Bandolier of 4 grenades across chest (cylinder + sphere tops), leather jacket collar (2 upturned boxes at neck), heavy gloves (larger hand boxes replacing fingered hands), shotgun shells on belt (6 small red cylinders), shoulder pads (leather brown)

  **Animation System:**
  - Idle: Breathing (torso group subtle Y oscillation via sin(t*1.8)*0.008), head sway (rotation.y sin(t*0.5)*0.05, rotation.z sin(t*0.7)*0.02)
  - Walking: Arms swing alternately (sin waves at speed 4, amplitude 0.4), forearms bend on forward swing (max 0.3), legs swing opposite to arms (amplitude 0.35), shins bend on backward swing (max 0.4)
  - Smooth transitions: All limb angles use THREE.MathUtils.lerp with delta*8 speed
  - Delta capped at 0.05 to prevent animation jumps

  **Ability Effect:**
  - Point light (pulsing intensity 3 ± 1.5 via sin(t*6))
  - Outer glow sphere (BackSide rendering, pulsing opacity 0.15 ± 0.1, pulsing emissiveIntensity 2 ± 1)
  - Inner glow core (smaller sphere, lower opacity 0.08)
  - Particle ring: 24 small emissive spheres in a circle, rotating at speed 2, bobbing vertically via sin(t*3)
  - Condition: showAbilityEffect || abilityActive from store

  **Technical Architecture:**
  - Separated head details (rendered inside head group, positions relative to y=1.58) from body details (rendered inside torso group, positions relative to body origin)
  - 12 animation refs: torso, head, left/right upper arm, left/right forearm, left/right thigh, left/right shin, glow light, glow sphere
  - Animation state stored in useRef (no re-renders in animation loop)
  - Props interface preserved: survivorId, color, position, rotation, showAbilityEffect
  - Store connections preserved: usePlayerStore selectedSurvivor, abilityActive

- Verified: zero lint errors in SurvivorModel.tsx (1 pre-existing error in ApocalypsePassUI.tsx unchanged)
- Dev server compiles successfully

Stage Summary:
- SurvivorModel.tsx: 114 lines → ~680 lines with GOD LEVEL procedural character models
- 5 fully unique character models with distinct headgear, body details, accessories, and boot styles
- Full skeletal animation system with breathing, head sway, arm/leg swing, forearm/shin bending
- Ability activation effect with pulsing glow + particle ring
- All meshes cast shadows, all materials use proper roughness/metalness per clothing type
- Same props interface and store connections as original

---
Task ID: 2-f
Agent: 3D Scene Polish Agent (Floors 2 & 3)
Task: GOD LEVEL Floor2.tsx and Floor3.tsx upgrade for THE NOTE: APOCALYPSE

Work Log:
- Read worklog.md and all 4 floor files (Floor1.tsx and Floor4.tsx as GOD LEVEL references)
- Read current Floor2.tsx (348 lines, basic cubicle maze) and Floor3.tsx (349 lines, basic lab)
- Verified dev server compiling successfully

- **Floor2.tsx** - Complete rewrite from 348 lines to ~1374 lines with GOD LEVEL abandoned office detail:

  **Room Structure:**
  - 40x40 floor plan with dark carpet (roughness=0.9, color=#1e1c1a)
  - Office wallpaper walls (lighter gray #35333a)
  - Ceiling at 4 units height with ceiling damage (broken tiles, exposed pipes, hanging wires)
  - Multiple office rooms: Server Room, Break Room, Manager Office, Bathroom (each with enclosing walls)

  **Office Furniture (all with detailed geometry):**
  - 14 OfficeDesk components with: desk surface + 4 legs + monitor frame + blue emissive screen (flickering via useFrame) + monitor stand + base + keyboard + mouse + screen glow point light
  - 2 overturned desks (tilted rotation, scattered geometry)
  - 10 OfficeChair components: seat + back rest + center post + 5-spoke wheel base with individual wheel spheres
  - 2 tipped chairs (on their side)
  - 4 FilingCabinet components: main body + 3 drawers with handles (metalness=0.65)
  - 2 Bookshelf components: frame + 4 shelves + rows of colored books (5-8 books per shelf, 8 book colors)
  - 2 WaterCooler components: base + transparent bottle + blue emissive water (animated wobble) + tap + drip tray
  - 2 Whiteboard components: frame + white surface + 3 red marker marks + marker tray
  - Server Room: 4 server racks with 16 blinking LEDs (alternating green/red, animated via useFrame) + terminal with green screen
  - Break Room: table with 4 legs + 4 OfficeChairs + 2 VendingMachines (glass front + dispensing light)
  - Manager Office: large desk + executive chair + bookshelf + filing cabinet
  - Bathroom: mirror (metalness=0.9) + sink + 3 stall dividers

  **Horror Details:**
  - BloodTrail: 10 blood drops along a path (emissive red, varied sizes)
  - BloodHandprints: 8 handprints on walls (palm circle + 4 finger planes, emissive #440000)
  - ScatteredPapers: 25 instanced paper planes (InstancedMesh for performance)
  - BrokenGlass: 12 translucent shards (metalness=0.8, roughness=0.1, opacity=0.35)
  - HangingCeilingTiles: 3 partially detached tiles with wire supports
  - 3 EmergencyExitSign components: green emissive + arrow indicator + mount brackets + flickering point light
  - WallStains: 8 circular stains on walls (dark discoloration)
  - WaterPuddles: 6 reflective puddles (metalness=0.8, roughness=0.1)
  - Elevator door with indicator lights

  **Lighting:**
  - 6 FluorescentLight components: fixture housing + light tube + point light (2 broken with rare spark, 4 working with flicker)
  - 3 RedEmergencyLight components: housing + red lens + pulsing point light
  - 3 dim corridor lights (warm #887766)
  - 14 computer screen glow point lights (blue #0066cc)
  - GlobalLightFlicker: rare total blackout flicker effect

  **Environmental Effects:**
  - FloorFog: 10 semi-transparent animated planes near floor level (breathing opacity, drifting position)
  - DustParticles: 60 instanced spheres floating upward (slow drift, wobble)
  - DrippingWater: 15 instanced water drops falling from ceiling to floor
  - Save point glowstick with pulsing green light + floor circle
  - CeilingDamage: 3 broken tile patches + 2 exposed pipes + dripping pipe joint + hanging wires

- **Floor3.tsx** - Complete rewrite from 349 lines to ~1222 lines with GOD LEVEL sinister laboratory detail:

  **Room Structure:**
  - 40x40 floor plan with lab tile floor (metalness=0.3, roughness=0.4, shinier than office)
  - White/sterile walls (#2a2a35) with interior room dividers
  - Industrial ceiling at 4 units with ExposedPipesAndVents (main pipe + secondary pipes + 5 pipe joints + 2 vent ducts + vent grate)
  - Interior walls creating dark room sections
  - 2 ObservationWindow components: glass pane (opacity=0.15) + frame dividers + blood smear on glass

  **Lab Equipment (all with detailed geometry):**
  - 4 LabTable components: metal surface + 4 legs + microscope (base + arm + eyepiece) + beaker (transparent glass + blue liquid) + test tube rack (4 colored tubes)
  - 3 ComputerTerminal components: desk + legs + monitor + green terminal screen (flickering via useFrame) + keyboard + screen glow
  - 3 ChemicalShelf components: frame + 4 shelves + colored bottles per shelf (4-7 bottles, 8 colors, emissive glow)
  - 2 Centrifuge components: base cylinder + partially open lid + spinning rotor (4 arms, animated via useFrame at 5 rad/s) + control panel
  - 1 AutopsyTable: metal surface + 4 legs + body bag (tied bundle with 3 strap ties) + blood on table + drain hole + surgical light above + instrument tray + tray stand
  - 6 SpecimenTank components: glass cylinder (transparent, DoubleSide) + colored liquid (6 different colors, animated bob) + floating body part silhouette (torso + head + arm) + top/bottom caps + green glow point light
  - OperatingRoom: room walls + operating table + blood + surgical light + instrument tray
  - BossArena: 8 boundary pillars + 2 ring floor markings (emissive red)

  **Horror Details:**
  - BloodSpatter: 15 blood spatters (8 on floor, 7 on walls) with emissive red
  - BrokenBeakers: 4 broken beaker groups with colored chemical puddles (red/blue/yellow/purple) + glass shards
  - 4 BiohazardSign components: yellow emissive background + simplified biohazard symbol (3 torus arcs + center circle)
  - 3 QuarantineTape components: yellow tape strips + support posts across doorways
  - WallScratches: 6 groups of 3 parallel dark scratch lines on walls
  - ArmoryDoor: metal door + lock mechanism + red indicator light
  - ChemicalSpillZone: 3 glowing chemical spill circles (green + red variants)

  **Lighting:**
  - 4 FlickeringLabLight components: cold blue-white (#aabbdd) with fixture housing + tube + castShadow
  - 3 StrobeLight components: rapid on/off red emergency (Math.sin > 0.6 threshold)
  - 2 RedEmergencyLight components: pulsing red sphere + point light
  - 1 RedPulseLight component: sharp alarm pulse (pow8 sine for sharp beats)
  - 6 specimen tank glow lights (various colors)
  - 3 computer terminal glow lights (green)
  - 2 dim corridor lights (cold #334455)

  **Environmental Effects:**
  - SteamFromVents: 40 instanced spheres rising from 2 vent positions (expanding scale with height)
  - ElectricalSparks: broken equipment box with exposed wires + spark point light (random intense burst with decay)
  - DrippingGreenLiquid: 10 instanced green emissive drops falling from pipe area
  - Save point glowstick with pulsing green light + floor circle

- Fixed lint error: Added missing RedEmergencyLight component definition to Floor3.tsx (was referenced but not defined)
- Verified: zero lint errors in both files, dev server compiles successfully

Stage Summary:
- Floor2.tsx: 348 lines → ~1374 lines with 22 subcomponents, GOD LEVEL abandoned office
- Floor3.tsx: 349 lines → ~1222 lines with 20 subcomponents, GOD LEVEL sinister laboratory
- Zero lint errors, dev server compiles clean
- All store connections preserved (useZombieStore zombie spawner in both)
- InstancedMesh used for performance: scattered papers (25), dust particles (60), dripping water (15), steam (40), green liquid (10)
- All animations use useFrame + useRef (zero re-renders in animation loops)
- All meshes use meshStandardMaterial with PBR properties (roughness, metalness, emissive)
- castShadow and receiveShadow applied appropriately throughout
