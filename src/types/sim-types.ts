export type Zone =
  | "campsite"
  | "river"
  | "forage"
  | "treeline"
  | "lookout"
  | "clearing";

export type ActionId =
  | "gather_wood"
  | "fetch_water"
  | "forage_food"
  | "tend_fire"
  | "cook"
  | "eat"
  | "drink"
  | "sleep"
  | "rest"
  | "idle";

export type CurrentAction = ActionId | "moving";

export interface CharacterStats {
  hunger: number;
  thirst: number;
  energy: number;
  warmth: number;
  safety: number;
}

export interface CharacterState {
  tileX: number;
  tileY: number;
  zone: Zone;
  currentAction: CurrentAction;
  stats: CharacterStats;
}

export interface WorldState {
  firewood: number;
  water: number;
  rawFood: number;
  cookedMeals: number;
  fireLit: boolean;
  fireTimer: number;
  timeOfDay: number;
  day: number;
}

export interface SimState {
  character: CharacterState;
  world: WorldState;
  lastMessage: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  reason?: string;
}
