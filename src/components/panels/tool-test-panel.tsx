import type { SimulationMode, ToolTestStatus, ToolTestStep } from "../../types";

type ToolTestPanelProps = {
  plan: ToolTestStep[];
  stepIndex: number;
  status: ToolTestStatus;
  isRunning: boolean;
  mode: SimulationMode;
  onRunStep: () => void;
  onReset: () => void;
};

export function ToolTestPanel({
  plan,
  stepIndex,
  status,
  isRunning,
  mode,
  onRunStep,
  onReset,
}: ToolTestPanelProps) {
  const step = plan[stepIndex];
  const isComplete = plan.length > 0 && stepIndex >= plan.length;
  const progress =
    plan.length === 0 ? "0 / 0" : `${Math.min(stepIndex + 1, plan.length)} / ${plan.length}`;
  const disabled = isRunning || mode !== "auto" || plan.length === 0 || isComplete;
  const statusClass =
    status.tone === "error"
      ? "text-[#ffd0c9]"
      : status.tone === "success"
        ? "text-[#d9e4cd]"
        : status.tone === "running"
          ? "text-[#ffe2a3]"
          : "text-[#cdd8c4]/75";

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3" aria-label="Tool test runner">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#f7fbf2]">Tool Test</h2>
          <p className="mt-1 text-xs text-[#cdd8c4]/70">Validate agent tool calls.</p>
        </div>
        <span className="text-xs text-[#cdd8c4]/70">{progress}</span>
      </div>
      <div className="rounded bg-[#17201d]/80 p-3 font-['Geist_Mono'] text-xs leading-5">
        {isComplete ? (
          <div className="text-[#d9e4cd]">All tool test steps completed.</div>
        ) : step ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-[#f7fbf2]">{step.characterId}</span>
              <span className="rounded bg-[#273338] px-1.5 py-0.5 text-[#cdd8c4]">
                {step.toolName}
              </span>
            </div>
            <div className="truncate text-[#cdd8c4]">{step.task}</div>
            {step.message ? <div className="break-words text-[#f7fbf2]">{step.message}</div> : null}
          </>
        ) : (
          <div className="text-[#cdd8c4]/70">No test plan loaded.</div>
        )}
      </div>
      <div className={`font-['Geist_Mono'] text-xs ${statusClass}`}>{status.text}</div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onRunStep}
          className="rounded bg-[#f2b84b] px-2 py-1 text-xs text-[#17201d] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isRunning ? "Running..." : "Run Test Step"}
        </button>
        <button
          type="button"
          disabled={isRunning || stepIndex === 0}
          onClick={onReset}
          className="rounded bg-[#17201d] px-2 py-1 text-xs text-[#cdd8c4] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
