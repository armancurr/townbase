import { ACTION_TUNING, FIRE_DURATION_HOURS } from "../constants/tuning";
import { getState, mutateState, setCurrentAction } from "../sim-state";
import type { ActionDefinition } from "../types/action-types";
import type { ActionId, ActionResult, SimState, Zone } from "../types/sim-types";

function ok(message: string): ActionResult {
  return { success: true, message };
}

function fail(reason: string): ActionResult {
  return { success: false, message: reason, reason };
}

function requireZone(state: SimState, zone: Zone) {
  return state.character.zone === zone ? ok("Ready.") : fail(`Need to be at ${zone}.`);
}

function withResult(action: ActionId, result: ActionResult) {
  if (result.success) {
    setCurrentAction(action, result.message);
  } else {
    mutateState(() => undefined, result.reason);
  }
  return result;
}

export const actionDefinitions: ActionDefinition[] = [
  {
    id: "gather_wood",
    label: "Gather Wood",
    description: "Collect firewood from the treeline.",
    canRun: (state) => requireZone(state, "treeline"),
    run: () => {
      const state = getState();
      const allowed = requireZone(state, "treeline");
      if (!allowed.success) return withResult("gather_wood", allowed);
      mutateState((draft) => {
        draft.world.firewood += 1;
        draft.character.stats.energy -= ACTION_TUNING.gatherWoodEnergyCost;
      });
      return withResult("gather_wood", ok("Collected firewood."));
    },
  },
  {
    id: "fetch_water",
    label: "Fetch Water",
    description: "Fill a water container at the river.",
    canRun: (state) => requireZone(state, "river"),
    run: () => {
      const state = getState();
      const allowed = requireZone(state, "river");
      if (!allowed.success) return withResult("fetch_water", allowed);
      mutateState((draft) => {
        draft.world.water += 1;
        draft.character.stats.energy -= ACTION_TUNING.fetchWaterEnergyCost;
      });
      return withResult("fetch_water", ok("Fetched clean water."));
    },
  },
  {
    id: "forage_food",
    label: "Forage Food",
    description: "Search the berry patch for food.",
    canRun: (state) => requireZone(state, "forage"),
    run: () => {
      const state = getState();
      const allowed = requireZone(state, "forage");
      if (!allowed.success) return withResult("forage_food", allowed);
      mutateState((draft) => {
        draft.world.rawFood += 1;
        draft.character.stats.energy -= ACTION_TUNING.forageFoodEnergyCost;
      });
      return withResult("forage_food", ok("Found edible plants."));
    },
  },
  {
    id: "tend_fire",
    label: "Tend Fire",
    description: "Spend firewood to light or extend the campfire.",
    canRun: (state) => {
      if (state.character.zone !== "campsite") return fail("Need to be at campsite.");
      if (state.world.firewood <= 0) return fail("Need firewood.");
      return ok("Ready.");
    },
    run: () => {
      const state = getState();
      const allowed = actionDefinitionsById.tend_fire.canRun(state);
      if (!allowed.success) return withResult("tend_fire", allowed);
      mutateState((draft) => {
        draft.world.firewood -= 1;
        draft.world.fireTimer += FIRE_DURATION_HOURS;
        draft.world.fireLit = true;
        draft.character.stats.warmth += ACTION_TUNING.tendFireWarmthGain;
      });
      return withResult("tend_fire", ok("The campfire is burning."));
    },
  },
  {
    id: "cook",
    label: "Cook",
    description: "Cook one raw food item over a lit fire.",
    canRun: (state) => {
      if (state.character.zone !== "campsite") return fail("Need to be at campsite.");
      if (!state.world.fireLit) return fail("Need a lit fire.");
      if (state.world.rawFood <= 0) return fail("Need raw food.");
      return ok("Ready.");
    },
    run: () => {
      const state = getState();
      const allowed = actionDefinitionsById.cook.canRun(state);
      if (!allowed.success) return withResult("cook", allowed);
      mutateState((draft) => {
        draft.world.rawFood -= 1;
        draft.world.cookedMeals += 1;
      });
      return withResult("cook", ok("Cooked a meal."));
    },
  },
  {
    id: "eat",
    label: "Eat",
    description: "Eat a cooked meal, or raw food if no cooked meal is available.",
    canRun: (state) =>
      state.world.cookedMeals > 0 || state.world.rawFood > 0
        ? ok("Ready.")
        : fail("Need food."),
    run: () => {
      const state = getState();
      const allowed = actionDefinitionsById.eat.canRun(state);
      if (!allowed.success) return withResult("eat", allowed);
      const cooked = state.world.cookedMeals > 0;
      mutateState((draft) => {
        if (cooked) {
          draft.world.cookedMeals -= 1;
          draft.character.stats.hunger += ACTION_TUNING.eatCookedHungerGain;
        } else {
          draft.world.rawFood -= 1;
          draft.character.stats.hunger += ACTION_TUNING.eatRawHungerGain;
        }
      });
      return withResult("eat", ok(cooked ? "Ate a cooked meal." : "Ate raw forage."));
    },
  },
  {
    id: "drink",
    label: "Drink",
    description: "Drink from stored water.",
    canRun: (state) => (state.world.water > 0 ? ok("Ready.") : fail("Need water.")),
    run: () => {
      const state = getState();
      const allowed = actionDefinitionsById.drink.canRun(state);
      if (!allowed.success) return withResult("drink", allowed);
      mutateState((draft) => {
        draft.world.water -= 1;
        draft.character.stats.thirst += ACTION_TUNING.drinkThirstGain;
      });
      return withResult("drink", ok("Drank water."));
    },
  },
  {
    id: "sleep",
    label: "Sleep",
    description: "Sleep in the campsite tent.",
    canRun: (state) =>
      state.character.zone === "campsite" ? ok("Ready.") : fail("Need to be at campsite."),
    run: () => {
      const state = getState();
      const allowed = actionDefinitionsById.sleep.canRun(state);
      if (!allowed.success) return withResult("sleep", allowed);
      return withResult("sleep", ok("Sleeping at camp."));
    },
  },
  {
    id: "rest",
    label: "Rest",
    description: "Pause anywhere to recover a little energy.",
    canRun: () => ok("Ready."),
    run: () => withResult("rest", ok("Resting.")),
  },
  {
    id: "idle",
    label: "Idle",
    description: "Stand still and let time pass.",
    canRun: () => ok("Ready."),
    run: () => withResult("idle", ok("Standing by.")),
  },
];

export const actionDefinitionsById = Object.fromEntries(
  actionDefinitions.map((definition) => [definition.id, definition]),
) as Record<ActionId, ActionDefinition>;
