---
Task ID: 4
Agent: Game Engine Polish Agent
Task: Polish game engine systems to GOD LEVEL for THE NOTE: APOCALYPSE survival horror game

Work Log:
- Read all 6 target files and 5 store files to understand existing implementations
- Improved HorrorEffects.tsx with:
  - Perlin noise-based camera shake (layered sine waves for organic feel)
  - Breathing effect (camera subtly moves up/down, faster when sprinting/low health)
  - Fear effects (tunnel vision FOV narrowing, chromatic aberration-like Z rotation wobble)
  - Damage hit effect (rotation jerk using Perlin noise, red flash detection)
  - Low health effects (heartbeat FOV pulse, stronger at lower health)
  - Sprint camera tilt (slight Z rotation when sprinting and moving)
  - Head bob (vertical + horizontal movement, double-frequency bounce, not just sine wave)
  - Landing effect (camera dip when stopping from sprint)
  - Aim down sights (FOV narrowing when attacking with ranged weapons)
  - Death camera (slowly falls and tilts over 3 seconds with eased cubic)
  - Smooth state transitions using THREE.MathUtils.lerp throughout

- Improved FlashlightSystem.tsx with:
  - Volumetric light cone (transparent cone mesh with additive blending)
  - Better flicker (gradual dim then bright, not just on/off; smooth interpolation)
  - Higher quality shadows (1024x1024, proper bias and camera near/far)
  - Battery warning (light turns yellow/orange when battery < 15%)
  - Zombie detection flicker (rapid strobe when very close < 4m, gradual flicker at 4-10m)
  - Ambient light bounce (colored point light simulating reflected light)
  - Flashlight beam dust particles (40 instanced spheres in the beam path)

- Improved CombatSystem.tsx with:
  - Better muzzle flash (larger, weapon-specific scale/color, star burst spikes)
  - Hit markers (X-shaped planes rendered via InstancedMesh at hit position)
  - Headshot indicator (yellow/gold color for headshot markers)
  - Melee swing visual (torus arc slash effect in front of camera)
  - Blood splash (instanced sphere particles with gravity, weapon-specific counts)
  - Shell casings (instanced cylinders with physics, ground collision)
  - Damage numbers (instanced planes with color coding: white/yellow/red)
  - Kill confirmation (glowing sphere skull icon at kill position)
  - Weapon-specific effects (shotgun wider flash+shake, pistol quick flash)
  - Critical hit effect (red flash overlay for high damage hits)
  - Performance optimized: all effects use refs + InstancedMesh, zero re-renders from combat

- Improved ZombieModel.tsx with:
  - GlowingEyes shared component for ALL zombie types
  - Walker: torn clothing flaps, blood stain patches, more hunched posture
  - Runner: emissive purple vein lines on torso, more aggressive lean, red eyes
  - Crawler: trailing blood effect mesh, more ground-hugging
  - Boss Scientist: pulsing veins across body, glowing pustules (5), second tentacle,
    lab coat tears, brain dims on death
  - Boss Alpha: glowing rune markings, bone protrusions from shoulders,
    aura effect (transparent pulsing sphere + point light), dimming on death
  - Death animation: dramatic stagger and fall with ragdoll-like rotation for all types
  - Hit reaction: flinch animation (body tilts on hit)
  - Alert animation: look around before chase (head rotation scanning)
  - Glowing eyes on ALL types (red/orange/purple with varying intensity)

- Improved Floor1.tsx with:
  - More debris: broken chairs, knocked over plant pots with spilled dirt, scattered files
  - Blood handprints on walls (6 handprints with palm + fingers, emissive red)
  - Water puddles with slight reflection (metalness=0.8, roughness=0.1)
  - Emergency exit signs (3 green glowing signs with point lights)
  - Power box with sparking effect (flickering point light, exposed wires)
  - More varied lighting (red/orange emergency lights, dim areas)
  - Ceiling damage (broken tiles, exposed pipes, hanging wires, dripping pipe joint)
  - Better reception desk (glowing computer screen with flicker, monitor stand/base,
    coffee mug, pen holder, papers on desk, side panels)

- Improved Floor4.tsx with:
  - Better rain (1500 particles instead of 500, wind-affected drift, tilted streaks)
  - Puddle reflections on ground (6 reflective circles, metalness=0.9, roughness=0.05)
  - Better lightning (brighter flash=50 intensity, longer duration, triple flash,
    thunder screen shake via horrorStore)
  - Wind effect (30 debris particles blowing across rooftop)
  - Helicopter wreckage (crashed helicopter with bent rotor slowly spinning,
    broken cockpit, tail boom, scorch marks, fire glow)
  - Satellite dishes and antenna array (2 dishes slowly rotating, antenna mast with cross bars)
  - Better moon (larger=4 radius, crater details, outer glow sphere)
  - City skyline (15 simple box buildings with lit windows at varying heights/colors)

Stage Summary:
- All 6 files successfully improved with GOD LEVEL polish
- Zero lint errors from modified files (3 pre-existing errors in HUD.tsx/VictoryScreen.tsx)
- Dev server compiles successfully on all changes
- Performance maintained: CombatSystem uses InstancedMesh + refs (zero re-renders)
- All existing store imports and connections preserved
- All 3D content is procedural (no external assets needed)
- Game functionality preserved (combat loop, zombie AI, horror system intact)
