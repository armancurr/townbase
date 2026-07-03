import type { ActionDefinition } from "../types/action-types";
import type { SimState } from "../types/sim-types";

interface ActionButtonProps {
  action: ActionDefinition;
  state: SimState;
}

export function ActionButton({ action, state }: ActionButtonProps) {
  const availability = action.canRun(state);

  return (
    <button
      type="button"
      onClick={() => action.run()}
      disabled={!availability.success || state.character.currentAction === "moving"}
      title={availability.success ? action.description : availability.reason}
      className="min-h-11 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-emerald-400 hover:bg-slate-750 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500"
    >
      <span className="block font-medium">{action.label}</span>
      {!availability.success ? (
        <span className="mt-0.5 block text-xs text-rose-300">{availability.reason}</span>
      ) : null}
    </button>
  );
}
