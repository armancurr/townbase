import { actionDefinitions } from "../actions";
import { resetSimulation } from "../sim-state";
import { ActionButton } from "./action-button";
import { DebugPanel } from "./debug-panel";
import { ResourceCounter } from "./resource-counter";
import { StatBar } from "./stat-bar";
import { useSimState } from "./use-sim-state";

function formatTime(timeOfDay: number) {
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function HudPanel() {
  const state = useSimState();
  const { character, world } = state;

  return (
    <aside className="flex max-h-screen min-h-screen flex-col overflow-y-auto bg-slate-950 px-5 py-5 text-slate-100">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold">Camp Survival</h1>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-300">
          <div>
            Zone: <span className="font-medium capitalize text-slate-50">{character.zone}</span>
          </div>
          <div>
            Action:{" "}
            <span className="font-medium capitalize text-slate-50">
              {character.currentAction.replace("_", " ")}
            </span>
          </div>
          <div>
            Day: <span className="font-medium text-slate-50">{world.day}</span>
          </div>
          <div>
            Time: <span className="font-medium text-slate-50">{formatTime(world.timeOfDay)}</span>
          </div>
        </div>
      </header>

      <section className="mt-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Stats</h2>
        <StatBar label="Hunger" value={character.stats.hunger} tone="green" />
        <StatBar label="Thirst" value={character.stats.thirst} tone="blue" />
        <StatBar label="Energy" value={character.stats.energy} tone="amber" />
        <StatBar label="Warmth" value={character.stats.warmth} tone="red" />
        <StatBar label="Safety" value={character.stats.safety} tone="slate" />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Supplies
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <ResourceCounter label="Firewood" value={world.firewood} />
          <ResourceCounter label="Water" value={world.water} />
          <ResourceCounter label="Raw Food" value={world.rawFood} />
          <ResourceCounter label="Meals" value={world.cookedMeals} />
          <ResourceCounter label="Fire" value={world.fireLit ? "Lit" : "Out"} />
          <ResourceCounter label="Burn Time" value={`${world.fireTimer.toFixed(1)}h`} />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Actions
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {actionDefinitions.map((action) => (
            <ActionButton key={action.id} action={action} state={state} />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
        {state.lastMessage}
      </section>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={resetSimulation}
          className="h-10 rounded border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-100 hover:border-emerald-400"
        >
          Reset
        </button>
      </div>

      <div className="mt-4">
        <DebugPanel state={state} />
      </div>
    </aside>
  );
}
