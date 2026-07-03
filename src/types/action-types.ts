import type { ActionId, ActionResult, SimState } from "./sim-types";

export type ActionFn = () => ActionResult;

export interface ActionDefinition {
  id: ActionId;
  label: string;
  description: string;
  run: ActionFn;
  canRun: (state: SimState) => ActionResult;
}
