import { ACTION_TUNING, HOURS_PER_TICK, STAT_DECAY } from "../constants/tuning";
import { zoneForTile } from "../constants/zones";
import type { CurrentAction, SimState } from "../types/sim-types";

type Listener = (state: SimState) => void;

const listeners = new Set<Listener>();

const initialState: SimState = {
  character: {
    tileX: 20,
    tileY: 15,
    zone: "campsite",
    currentAction: "idle",
    stats: {
      hunger: 82,
      thirst: 80,
      energy: 78,
      warmth: 72,
      safety: 82,
    },
  },
  world: {
    firewood: 1,
    water: 1,
    rawFood: 1,
    cookedMeals: 0,
    fireLit: false,
    fireTimer: 0,
    timeOfDay: 8,
    day: 1,
  },
  lastMessage: "A quiet morning in the clearing.",
};

let state = structuredClone(initialState);

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value * 10) / 10));
}

function emit() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState(): SimState {
  return structuredClone(state);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(getState());
  return () => {
    listeners.delete(listener);
  };
}

export function mutateState(mutator: (draft: SimState) => void, message?: string) {
  mutator(state);
  state.character.stats.hunger = clamp(state.character.stats.hunger);
  state.character.stats.thirst = clamp(state.character.stats.thirst);
  state.character.stats.energy = clamp(state.character.stats.energy);
  state.character.stats.warmth = clamp(state.character.stats.warmth);
  state.character.stats.safety = clamp(state.character.stats.safety);
  state.world.fireTimer = Math.max(0, Math.round(state.world.fireTimer * 10) / 10);
  state.world.timeOfDay = Math.round(state.world.timeOfDay * 100) / 100;
  state.world.fireLit = state.world.fireTimer > 0;
  if (message) {
    state.lastMessage = message;
  }
  emit();
}

export function setCharacterTile(tileX: number, tileY: number) {
  mutateState((draft) => {
    draft.character.tileX = tileX;
    draft.character.tileY = tileY;
    draft.character.zone = zoneForTile(tileX, tileY);
  });
}

export function setCurrentAction(currentAction: CurrentAction, message?: string) {
  mutateState((draft) => {
    draft.character.currentAction = currentAction;
  }, message);
}

export function tickSimulation() {
  mutateState((draft) => {
    const world = draft.world;
    const stats = draft.character.stats;
    const isNight = world.timeOfDay < 6 || world.timeOfDay >= 19;
    const atCampsite = draft.character.zone === "campsite";
    const protectedByFire = world.fireLit && atCampsite;

    world.timeOfDay += HOURS_PER_TICK;
    if (world.timeOfDay >= 24) {
      world.timeOfDay -= 24;
      world.day += 1;
    }

    if (world.fireTimer > 0) {
      world.fireTimer -= HOURS_PER_TICK;
    }
    world.fireLit = world.fireTimer > 0;

    stats.hunger -= STAT_DECAY.hunger;
    stats.thirst -= STAT_DECAY.thirst;

    if (draft.character.currentAction !== "sleep" && draft.character.currentAction !== "rest") {
      stats.energy -= STAT_DECAY.energy;
    }

    if (world.fireLit && atCampsite) {
      stats.warmth += 0.7;
    } else {
      stats.warmth -= isNight ? STAT_DECAY.warmthNight : STAT_DECAY.warmthDay;
    }

    if (isNight) {
      stats.safety -= protectedByFire ? STAT_DECAY.safetyNightWithFire : STAT_DECAY.safetyNight;
    } else if (protectedByFire) {
      stats.safety += 0.3;
    } else {
      stats.safety -= STAT_DECAY.safetyDay;
    }

    if (draft.character.currentAction === "sleep") {
      stats.energy += protectedByFire
        ? ACTION_TUNING.sleepEnergyGainWithFire
        : ACTION_TUNING.sleepEnergyGain;
      if (protectedByFire) {
        stats.warmth += ACTION_TUNING.sleepWarmthGainWithFire;
        stats.safety += 0.8;
      }
    }

    if (draft.character.currentAction === "rest") {
      stats.energy += ACTION_TUNING.restEnergyGain;
    }
  });
}

export function resetSimulation() {
  state = structuredClone(initialState);
  emit();
}
