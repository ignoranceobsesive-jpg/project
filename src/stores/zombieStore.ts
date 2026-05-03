import { create } from 'zustand';

export type ZombieType = 'walker' | 'runner' | 'crawler' | 'boss_scientist' | 'boss_alpha';
export type ZombieState = 'idle' | 'wander' | 'alert' | 'chase' | 'attack' | 'stunned' | 'dead' | 'playingDead';

export interface Zombie {
  id: string;
  type: ZombieType;
  state: ZombieState;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  detectionRange: number;
  attackRange: number;
  attackCooldown: number;
  attackCooldownRemaining: number;
  isBoss: boolean;
  bossPhase: number;
  wanderTarget: [number, number, number] | null;
  stateTimer: number;
  playDeadTimer: number;
  stunTimer: number;
  flashStunTimer: number;
  trailTimer: number;
}

export interface ZombieSpawnConfig {
  type: ZombieType;
  count: number;
  positions: [number, number, number][];
}

export const ZOMBIE_CONFIGS: Record<ZombieType, Omit<Zombie, 'id' | 'position' | 'rotation' | 'stateTimer' | 'playDeadTimer' | 'stunTimer' | 'flashStunTimer' | 'trailTimer' | 'wanderTarget' | 'attackCooldownRemaining' | 'state'>> = {
  walker: {
    type: 'walker',
    health: 90,
    maxHealth: 90,
    speed: 1.5,
    damage: 10,
    detectionRange: 15,
    attackRange: 2,
    attackCooldown: 1.5,
    isBoss: false,
    bossPhase: 0,
  },
  runner: {
    type: 'runner',
    health: 120,
    maxHealth: 120,
    speed: 5,
    damage: 15,
    detectionRange: 20,
    attackRange: 2,
    attackCooldown: 1.0,
    isBoss: false,
    bossPhase: 0,
  },
  crawler: {
    type: 'crawler',
    health: 60,
    maxHealth: 60,
    speed: 3,
    damage: 8,
    detectionRange: 5,
    attackRange: 2,
    attackCooldown: 2.0,
    isBoss: false,
    bossPhase: 0,
  },
  boss_scientist: {
    type: 'boss_scientist',
    health: 800,
    maxHealth: 800,
    speed: 2.5,
    damage: 25,
    detectionRange: 25,
    attackRange: 10,
    attackCooldown: 2.0,
    isBoss: true,
    bossPhase: 1,
  },
  boss_alpha: {
    type: 'boss_alpha',
    health: 1500,
    maxHealth: 1500,
    speed: 3,
    damage: 35,
    detectionRange: 30,
    attackRange: 5,
    attackCooldown: 2.5,
    isBoss: true,
    bossPhase: 1,
  },
};

interface ZombieStoreState {
  zombies: Zombie[];
  nextId: number;
  spawnZombies: (configs: ZombieSpawnConfig[]) => void;
  updateZombie: (id: string, updates: Partial<Zombie>) => void;
  removeZombie: (id: string) => void;
  damageZombie: (id: string, damage: number, isHeadshot?: boolean) => number;
  setZombieState: (id: string, state: ZombieState) => void;
  stunZombie: (id: string, duration: number) => void;
  flashStunZombie: (id: string, duration: number) => void;
  tickZombies: (delta: number, playerPos: [number, number, number]) => void;
  clearZombies: () => void;
  getZombiesInRange: (pos: [number, number, number], range: number) => Zombie[];
  getNearestZombie: (pos: [number, number, number]) => Zombie | null;
}

let idCounter = 0;

export const useZombieStore = create<ZombieStoreState>()((set, get) => ({
  zombies: [],
  nextId: 0,

  spawnZombies: (configs) => {
    const newZombies: Zombie[] = [];
    for (const config of configs) {
      const zombieConfig = ZOMBIE_CONFIGS[config.type];
      for (let i = 0; i < config.count; i++) {
        const pos = config.positions[i % config.positions.length];
        newZombies.push({
          id: `zombie_${idCounter++}`,
          ...zombieConfig,
          position: [...pos] as [number, number, number],
          rotation: Math.random() * Math.PI * 2,
          state: 'idle',
          stateTimer: Math.random() * 3,
          playDeadTimer: 0,
          stunTimer: 0,
          flashStunTimer: 0,
          trailTimer: 0,
          wanderTarget: null,
          attackCooldownRemaining: 0,
        });
      }
    }
    set((s) => ({ zombies: [...s.zombies, ...newZombies] }));
  },

  updateZombie: (id, updates) =>
    set((s) => ({
      zombies: s.zombies.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    })),

  removeZombie: (id) =>
    set((s) => ({ zombies: s.zombies.filter((z) => z.id !== id) })),

  damageZombie: (id, damage, isHeadshot = false) => {
    const zombie = get().zombies.find((z) => z.id === id);
    if (!zombie || zombie.state === 'dead') return 0;
    const actualDamage = isHeadshot ? damage * 2 : damage;
    const newHealth = Math.max(0, zombie.health - actualDamage);

    if (newHealth <= 0) {
      // Walker has 20% chance to play dead and get back up
      if (zombie.type === 'walker' && zombie.state !== 'playingDead' && Math.random() < 0.2) {
        set((s) => ({
          zombies: s.zombies.map((z) =>
            z.id === id ? { ...z, health: 0, state: 'playingDead' as ZombieState, playDeadTimer: 3 } : z
          ),
        }));
      } else {
        set((s) => ({
          zombies: s.zombies.map((z) =>
            z.id === id ? { ...z, health: 0, state: 'dead' as ZombieState } : z
          ),
        }));
      }
    } else {
      set((s) => ({
        zombies: s.zombies.map((z) =>
          z.id === id
            ? {
                ...z,
                health: newHealth,
                state: z.state === 'idle' || z.state === 'wander' ? 'alert' : z.state,
                stateTimer: 0,
              }
            : z
        ),
      }));
      // Boss phase transitions
      if (zombie.isBoss) {
        const healthPercent = newHealth / zombie.maxHealth;
        let newPhase = zombie.bossPhase;
        if (zombie.type === 'boss_scientist') {
          if (healthPercent <= 0.3) newPhase = 3;
          else if (healthPercent <= 0.6) newPhase = 2;
        } else if (zombie.type === 'boss_alpha') {
          if (healthPercent <= 0.25) newPhase = 3;
          else if (healthPercent <= 0.5) newPhase = 2;
        }
        if (newPhase !== zombie.bossPhase) {
          set((s) => ({
            zombies: s.zombies.map((z) =>
              z.id === id ? { ...z, bossPhase: newPhase, speed: z.speed * 1.2 } : z
            ),
          }));
        }
      }
    }
    return actualDamage;
  },

  setZombieState: (id, state) =>
    set((s) => ({
      zombies: s.zombies.map((z) => (z.id === id ? { ...z, state, stateTimer: 0 } : z)),
    })),

  stunZombie: (id, duration) =>
    set((s) => ({
      zombies: s.zombies.map((z) =>
        z.id === id ? { ...z, state: 'stunned', stunTimer: duration } : z
      ),
    })),

  flashStunZombie: (id, duration) => {
    const zombie = get().zombies.find((z) => z.id === id);
    if (zombie?.type === 'runner') {
      set((s) => ({
        zombies: s.zombies.map((z) =>
          z.id === id ? { ...z, state: 'stunned', flashStunTimer: duration } : z
        ),
      }));
    }
  },

  tickZombies: (delta, playerPos) => {
    const state = get();
    const updatedZombies = state.zombies.map((z) => {
      const z2 = { ...z };
      z2.stateTimer += delta;
      z2.attackCooldownRemaining = Math.max(0, z2.attackCooldownRemaining - delta);

      // Stun handling
      if (z2.state === 'stunned') {
        z2.stunTimer -= delta;
        z2.flashStunTimer -= delta;
        if (z2.stunTimer <= 0 && z2.flashStunTimer <= 0) {
          z2.state = 'chase';
          z2.stunTimer = 0;
          z2.flashStunTimer = 0;
        }
        return z2;
      }

      // Playing dead
      if (z2.state === 'playingDead') {
        z2.playDeadTimer -= delta;
        if (z2.playDeadTimer <= 0) {
          z2.health = z2.maxHealth * 0.3;
          z2.state = 'chase';
          z2.playDeadTimer = 0;
        }
        return z2;
      }

      // Dead
      if (z2.state === 'dead') return z2;

      // Distance to player
      const dx = playerPos[0] - z2.position[0];
      const dz = playerPos[2] - z2.position[2];
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      // State machine
      switch (z2.state) {
        case 'idle':
          if (distToPlayer < z2.detectionRange) {
            z2.state = 'alert';
            z2.stateTimer = 0;
          } else if (z2.stateTimer > 3) {
            z2.state = 'wander';
            z2.stateTimer = 0;
            z2.wanderTarget = [
              z2.position[0] + (Math.random() - 0.5) * 10,
              z2.position[1],
              z2.position[2] + (Math.random() - 0.5) * 10,
            ];
          }
          break;

        case 'wander':
          if (distToPlayer < z2.detectionRange) {
            z2.state = 'alert';
            z2.stateTimer = 0;
          } else if (z2.wanderTarget) {
            const wdx = z2.wanderTarget[0] - z2.position[0];
            const wdz = z2.wanderTarget[2] - z2.position[2];
            const wDist = Math.sqrt(wdx * wdx + wdz * wdz);
            if (wDist < 1) {
              z2.state = 'idle';
              z2.stateTimer = 0;
            } else {
              const moveSpeed = z2.speed * 0.3 * delta;
              z2.position = [
                z2.position[0] + (wdx / wDist) * moveSpeed,
                z2.position[1],
                z2.position[2] + (wdz / wDist) * moveSpeed,
              ];
              z2.rotation = Math.atan2(wdx, wdz);
            }
          } else {
            z2.state = 'idle';
          }
          break;

        case 'alert':
          z2.rotation = Math.atan2(dx, dz);
          if (z2.stateTimer > 0.5) {
            z2.state = 'chase';
            z2.stateTimer = 0;
          }
          break;

        case 'chase': {
          const moveSpeed = z2.speed * delta;
          z2.position = [
            z2.position[0] + (dx / distToPlayer) * moveSpeed,
            z2.position[1],
            z2.position[2] + (dz / distToPlayer) * moveSpeed,
          ];
          z2.rotation = Math.atan2(dx, dz);
          if (distToPlayer < z2.attackRange && z2.attackCooldownRemaining <= 0) {
            z2.state = 'attack';
            z2.stateTimer = 0;
          }
          if (distToPlayer > z2.detectionRange * 1.5) {
            z2.state = 'idle';
            z2.stateTimer = 0;
          }
          break;
        }

        case 'attack':
          if (z2.stateTimer > 0.5 && z2.attackCooldownRemaining <= 0) {
            z2.attackCooldownRemaining = z2.attackCooldown;
            z2.state = 'chase';
            z2.stateTimer = 0;
          }
          break;
      }

      return z2;
    });

    set({ zombies: updatedZombies });
  },

  clearZombies: () => set({ zombies: [] }),

  getZombiesInRange: (pos, range) => {
    return get().zombies.filter((z) => {
      if (z.state === 'dead') return false;
      const dx = pos[0] - z.position[0];
      const dz = pos[2] - z.position[2];
      return Math.sqrt(dx * dx + dz * dz) <= range;
    });
  },

  getNearestZombie: (pos) => {
    const zombies = get().zombies.filter((z) => z.state !== 'dead');
    if (zombies.length === 0) return null;
    return zombies.reduce((nearest, z) => {
      const d1 = Math.sqrt((pos[0] - z.position[0]) ** 2 + (pos[2] - z.position[2]) ** 2);
      const d2 = Math.sqrt((pos[0] - nearest.position[0]) ** 2 + (pos[2] - nearest.position[2]) ** 2);
      return d1 < d2 ? z : nearest;
    });
  },
}));
