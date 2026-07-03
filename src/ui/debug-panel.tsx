import type { SimState } from "../types/sim-types";

interface DebugPanelProps {
  state: SimState;
}

export function DebugPanel({ state }: DebugPanelProps) {
  return (
    <details className="rounded border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
      <summary className="cursor-pointer text-sm font-medium text-slate-100">Debug State</summary>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap">
        {JSON.stringify(state, null, 2)}
      </pre>
    </details>
  );
}
