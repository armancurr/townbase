export const TILE_SIZE = 32;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;

export const SIM_TICK_MS = 1000;
export const HOURS_PER_TICK = 0.18;

export const FIRE_DURATION_HOURS = 4.2;

export const STAT_DECAY = {
  hunger: 0.7,
  thirst: 0.95,
  energy: 0.5,
  warmthDay: 0.35,
  warmthNight: 0.85,
  safetyDay: 0.12,
  safetyNight: 0.85,
  safetyNightWithFire: 0.18,
};

export const ACTION_TUNING = {
  gatherWoodEnergyCost: 7,
  fetchWaterEnergyCost: 5,
  forageFoodEnergyCost: 8,
  restEnergyGain: 10,
  sleepEnergyGain: 24,
  sleepEnergyGainWithFire: 34,
  sleepWarmthGainWithFire: 16,
  eatCookedHungerGain: 34,
  eatRawHungerGain: 18,
  drinkThirstGain: 32,
  tendFireWarmthGain: 18,
};
