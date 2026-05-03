import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SurvivorId = 'marcus' | 'elena' | 'viktor' | 'sara' | 'dexter';
export type WeaponType = 'knife' | 'pistol' | 'silencedPistol' | 'shotgun' | 'wrench' | 'rifle' | 'grenade';
export type ItemId = 'medkit' | 'bandage' | 'ammo' | 'battery' | 'keycard1' | 'keycard2' | 'keycard3' | 'grenade_item' | 'armor';

export interface Survivor {
  id: SurvivorId;
  name: string;
  role: string;
  abilityName: string;
  abilityDescription: string;
  abilityCooldown: number;
  passiveDescription: string;
  backstory: string;
  maxHealth: number;
  speed: number;
  damage: number;
  abilityPower: number;
  startWeapon: WeaponType;
  healthBonus: number;
  speedBonus: number;
  damageBonus: number;
  color: string;
  unlocked: boolean;
}

export interface Weapon {
  id: WeaponType;
  name: string;
  damage: number;
  range: number;
  fireRate: number;
  ammoMax: number;
  reloadTime: number;
  spread: number;
  isRanged: boolean;
}

export interface InventoryItem {
  id: ItemId;
  name: string;
  quantity: number;
  description: string;
}

export const SURVIVORS: Record<SurvivorId, Survivor> = {
  marcus: {
    id: 'marcus',
    name: 'MARCUS',
    role: 'Ex-Military (Tank)',
    abilityName: 'Shield Bash',
    abilityDescription: 'Stun all zombies in 5m radius for 2 seconds',
    abilityCooldown: 20,
    passiveDescription: '+50% melee damage, +30% max health',
    backstory: 'Former special forces who lost his squad in the outbreak. His military training keeps him alive.',
    maxHealth: 130,
    speed: 4,
    damage: 8,
    abilityPower: 7,
    startWeapon: 'knife',
    healthBonus: 0.3,
    speedBonus: 0,
    damageBonus: 0.5,
    color: '#4a7c59',
    unlocked: true,
  },
  elena: {
    id: 'elena',
    name: 'ELENA',
    role: 'Field Medic (Healer)',
    abilityName: 'Heal Burst',
    abilityDescription: 'Restore 40% health to self and nearby allies',
    abilityCooldown: 25,
    passiveDescription: '+50% healing item effectiveness, revive teammates 50% faster',
    backstory: 'Combat medic who watched her hospital fall. She refuses to let anyone else die.',
    maxHealth: 100,
    speed: 5,
    damage: 5,
    abilityPower: 9,
    startWeapon: 'pistol',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0,
    color: '#7c4a6e',
    unlocked: true,
  },
  viktor: {
    id: 'viktor',
    name: 'VIKTOR',
    role: 'Engineer (Support)',
    abilityName: 'Deploy Turret',
    abilityDescription: 'Auto-targeting turret lasts 15 seconds',
    abilityCooldown: 30,
    passiveDescription: '+25% weapon durability, repair barricades, +15% ammo found',
    backstory: 'Building maintenance worker who knows every duct and wire in the building.',
    maxHealth: 110,
    speed: 4,
    damage: 6,
    abilityPower: 8,
    startWeapon: 'wrench',
    healthBonus: 0.1,
    speedBonus: 0,
    damageBonus: 0.1,
    color: '#6e7c4a',
    unlocked: true,
  },
  sara: {
    id: 'sara',
    name: 'SARA',
    role: 'Scout (Stealth)',
    abilityName: 'Shadow Step',
    abilityDescription: 'Invisibility for 5 seconds',
    abilityCooldown: 25,
    passiveDescription: '+40% movement speed, silent footsteps, +20% crit chance',
    backstory: 'Thief who was breaking in when the outbreak hit. Now she fights to survive.',
    maxHealth: 80,
    speed: 8,
    damage: 6,
    abilityPower: 6,
    startWeapon: 'silencedPistol',
    healthBonus: 0,
    speedBonus: 0.4,
    damageBonus: 0,
    color: '#4a5e7c',
    unlocked: true,
  },
  dexter: {
    id: 'dexter',
    name: 'DEXTER',
    role: 'Demolition (DPS)',
    abilityName: 'Frag Toss',
    abilityDescription: 'Grenade deals massive AoE damage',
    abilityCooldown: 35,
    passiveDescription: '+50% explosive damage, +20% ranged damage',
    backstory: 'Demolition worker who turned his tools into weapons. Everything goes boom.',
    maxHealth: 90,
    speed: 5,
    damage: 9,
    abilityPower: 7,
    startWeapon: 'shotgun',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0.5,
    color: '#7c5a4a',
    unlocked: true,
  },
};

export const WEAPONS: Record<WeaponType, Weapon> = {
  knife: { id: 'knife', name: 'Combat Knife', damage: 25, range: 2, fireRate: 0.5, ammoMax: Infinity, reloadTime: 0, spread: 0, isRanged: false },
  wrench: { id: 'wrench', name: 'Wrench', damage: 20, range: 2.5, fireRate: 0.7, ammoMax: Infinity, reloadTime: 0, spread: 0, isRanged: false },
  pistol: { id: 'pistol', name: 'Pistol', damage: 30, range: 30, fireRate: 0.3, ammoMax: 12, reloadTime: 1.5, spread: 0.02, isRanged: true },
  silencedPistol: { id: 'silencedPistol', name: 'Silenced Pistol', damage: 25, range: 25, fireRate: 0.25, ammoMax: 10, reloadTime: 1.8, spread: 0.01, isRanged: true },
  shotgun: { id: 'shotgun', name: 'Shotgun', damage: 80, range: 10, fireRate: 0.8, ammoMax: 6, reloadTime: 2.5, spread: 0.1, isRanged: true },
  rifle: { id: 'rifle', name: 'Assault Rifle', damage: 20, range: 40, fireRate: 0.1, ammoMax: 30, reloadTime: 2.0, spread: 0.03, isRanged: true },
  grenade: { id: 'grenade', name: 'Frag Grenade', damage: 150, range: 8, fireRate: 0, ammoMax: 3, reloadTime: 0, spread: 0, isRanged: true },
};

interface PlayerState {
  selectedSurvivor: SurvivorId;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  isSprinting: boolean;
  isAttacking: boolean;
  isReloading: boolean;
  currentWeapon: WeaponType;
  secondaryWeapon: WeaponType | null;
  ammo: Record<WeaponType, number>;
  inventory: InventoryItem[];
  abilityCooldownRemaining: number;
  abilityActive: boolean;
  flashlightOn: boolean;
  flashlightBattery: number;
  isDead: boolean;
  killsThisRun: number;
  coinsThisRun: number;
  damageDirection: number | null;
  damageTimer: number;
  headBobPhase: number;
  breathingPhase: number;
  isInvincible: boolean;
  invincibilityTimer: number;

  selectSurvivor: (id: SurvivorId) => void;
  takeDamage: (amount: number, direction?: number) => void;
  heal: (amount: number) => void;
  setPosition: (pos: [number, number, number]) => void;
  setRotation: (rot: number) => void;
  setMoving: (moving: boolean) => void;
  setSprinting: (sprinting: boolean) => void;
  setAttacking: (attacking: boolean) => void;
  setReloading: (reloading: boolean) => void;
  switchWeapon: (weapon: WeaponType) => void;
  useAmmo: (weapon: WeaponType, count: number) => boolean;
  reload: (weapon: WeaponType) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: ItemId, count?: number) => void;
  useItem: (itemId: ItemId) => void;
  activateAbility: () => void;
  tickAbility: (delta: number) => void;
  toggleFlashlight: () => void;
  drainBattery: (delta: number) => void;
  rechargeBattery: (amount: number) => void;
  die: () => void;
  revive: (healthPercent: number) => void;
  resetPlayer: () => void;
  addKill: () => void;
  addCoins: (amount: number) => void;
  setDamageDirection: (direction: number | null) => void;
  tickTimers: (delta: number) => void;
  setInvincible: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      selectedSurvivor: 'marcus',
      health: 100,
      maxHealth: 100,
      position: [0, 1.6, 0],
      rotation: 0,
      isMoving: false,
      isSprinting: false,
      isAttacking: false,
      isReloading: false,
      currentWeapon: 'knife',
      secondaryWeapon: null,
      ammo: {
        knife: Infinity,
        wrench: Infinity,
        pistol: 12,
        silencedPistol: 10,
        shotgun: 6,
        rifle: 30,
        grenade: 3,
      },
      inventory: [],
      abilityCooldownRemaining: 0,
      abilityActive: false,
      flashlightOn: true,
      flashlightBattery: 100,
      isDead: false,
      killsThisRun: 0,
      coinsThisRun: 0,
      damageDirection: null,
      damageTimer: 0,
      headBobPhase: 0,
      breathingPhase: 0,
      isInvincible: false,
      invincibilityTimer: 0,

      selectSurvivor: (id) => {
        const survivor = SURVIVORS[id];
        set({
          selectedSurvivor: id,
          maxHealth: survivor.maxHealth,
          health: survivor.maxHealth,
          currentWeapon: survivor.startWeapon,
        });
      },

      takeDamage: (amount, direction) => {
        const state = get();
        if (state.isInvincible || state.isDead) return;
        const newHealth = Math.max(0, state.health - amount);
        set({
          health: newHealth,
          damageDirection: direction ?? null,
          damageTimer: 0.5,
        });
        if (newHealth <= 0) {
          get().die();
        }
      },

      heal: (amount) => {
        const state = get();
        const survivor = SURVIVORS[state.selectedSurvivor];
        const healBonus = survivor.id === 'elena' ? 1.5 : 1;
        const newHealth = Math.min(state.maxHealth, state.health + amount * healBonus);
        set({ health: newHealth });
      },

      setPosition: (pos) => set({ position: pos }),
      setRotation: (rot) => set({ rotation: rot }),
      setMoving: (moving) => set({ isMoving: moving }),
      setSprinting: (sprinting) => set({ isSprinting: sprinting }),
      setAttacking: (attacking) => set({ isAttacking: attacking }),
      setReloading: (reloading) => set({ isReloading: reloading }),

      switchWeapon: (weapon) => set({ currentWeapon: weapon }),

      useAmmo: (weapon, count) => {
        const state = get();
        const current = state.ammo[weapon];
        if (current < count) return false;
        set({ ammo: { ...state.ammo, [weapon]: current - count } });
        return true;
      },

      reload: (weapon) => {
        const state = get();
        const weaponData = WEAPONS[weapon];
        set({ ammo: { ...state.ammo, [weapon]: weaponData.ammoMax } });
      },

      addItem: (item) => {
        const state = get();
        const existing = state.inventory.find((i) => i.id === item.id);
        if (existing) {
          set({
            inventory: state.inventory.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ inventory: [...state.inventory, item] });
        }
      },

      removeItem: (itemId, count = 1) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === itemId);
        if (!item) return;
        if (item.quantity <= count) {
          set({ inventory: state.inventory.filter((i) => i.id !== itemId) });
        } else {
          set({
            inventory: state.inventory.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - count } : i
            ),
          });
        }
      },

      useItem: (itemId) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === itemId);
        if (!item) return;
        switch (itemId) {
          case 'medkit':
            get().heal(50);
            break;
          case 'bandage':
            get().heal(20);
            break;
          case 'ammo':
            get().reload(state.currentWeapon);
            break;
          case 'battery':
            get().rechargeBattery(50);
            break;
          case 'armor':
            get().setInvincible(10);
            break;
        }
        get().removeItem(itemId);
      },

      activateAbility: () => {
        const state = get();
        if (state.abilityCooldownRemaining > 0 || state.abilityActive) return;
        const survivor = SURVIVORS[state.selectedSurvivor];
        set({ abilityActive: true, abilityCooldownRemaining: survivor.abilityCooldown });
        setTimeout(() => set({ abilityActive: false }), 5000);
      },

      tickAbility: (delta) => {
        const state = get();
        if (state.abilityCooldownRemaining > 0) {
          set({ abilityCooldownRemaining: Math.max(0, state.abilityCooldownRemaining - delta) });
        }
      },

      toggleFlashlight: () => set((s) => ({ flashlightOn: !s.flashlightOn })),

      drainBattery: (delta) => {
        const state = get();
        if (!state.flashlightOn) return;
        const newBattery = Math.max(0, state.flashlightBattery - (delta / 120) * 100);
        set({ flashlightBattery: newBattery });
        if (newBattery <= 0) set({ flashlightOn: false });
      },

      rechargeBattery: (amount) => {
        set((s) => ({ flashlightBattery: Math.min(100, s.flashlightBattery + amount) }));
      },

      die: () => set({ isDead: true, health: 0 }),

      revive: (healthPercent) => {
        const state = get();
        const health = state.maxHealth * healthPercent;
        set({ isDead: false, health, isInvincible: true, invincibilityTimer: 3 });
      },

      resetPlayer: () => {
        const state = get();
        const survivor = SURVIVORS[state.selectedSurvivor];
        set({
          health: survivor.maxHealth,
          maxHealth: survivor.maxHealth,
          position: [0, 1.6, 0],
          rotation: 0,
          isMoving: false,
          isSprinting: false,
          isAttacking: false,
          isReloading: false,
          currentWeapon: survivor.startWeapon,
          secondaryWeapon: null,
          ammo: {
            knife: Infinity,
            wrench: Infinity,
            pistol: 12,
            silencedPistol: 10,
            shotgun: 6,
            rifle: 30,
            grenade: 3,
          },
          inventory: [],
          abilityCooldownRemaining: 0,
          abilityActive: false,
          flashlightOn: true,
          flashlightBattery: 100,
          isDead: false,
          killsThisRun: 0,
          coinsThisRun: 0,
          damageDirection: null,
          damageTimer: 0,
          isInvincible: false,
          invincibilityTimer: 0,
        });
      },

      addKill: () => set((s) => ({ killsThisRun: s.killsThisRun + 1 })),
      addCoins: (amount) => set((s) => ({ coinsThisRun: s.coinsThisRun + amount })),
      setDamageDirection: (direction) => set({ damageDirection: direction }),

      tickTimers: (delta) => {
        const state = get();
        const updates: Partial<PlayerState> = {};
        if (state.damageTimer > 0) updates.damageTimer = Math.max(0, state.damageTimer - delta);
        if (state.damageTimer <= 0 && state.damageDirection !== null) updates.damageDirection = null;
        if (state.isInvincible) {
          updates.invincibilityTimer = state.invincibilityTimer - delta;
          if (state.invincibilityTimer - delta <= 0) {
            updates.isInvincible = false;
            updates.invincibilityTimer = 0;
          }
        }
        updates.headBobPhase = state.headBobPhase + delta * (state.isSprinting ? 12 : state.isMoving ? 8 : 0);
        updates.breathingPhase = state.breathingPhase + delta * 1.5;
        set(updates as PlayerState);
      },

      setInvincible: (duration) => set({ isInvincible: true, invincibilityTimer: duration }),
    }),
    {
      name: 'apocalypse-player-state',
      partialize: (state) => ({
        selectedSurvivor: state.selectedSurvivor,
      }),
    }
  )
);
