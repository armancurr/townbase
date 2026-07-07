import type { SimulationMode } from "../../types";

type ModePanelProps = {
	mode: SimulationMode;
	onSetMode: (mode: SimulationMode) => void;
	onRunPopulationStep: () => void;
	isRunning: boolean;
};

export function ModePanel({
	mode,
	onSetMode,
	onRunPopulationStep,
	isRunning,
}: ModePanelProps) {
	return (
		<section
			className="rounded-md bg-[#17201d]/72 p-3"
			aria-label="Simulation mode"
		>
			<div className="mb-2">
				<h2 className="text-sm font-semibold text-[#f7fbf2]">Simulation</h2>
				<p className="mt-1 text-xs text-[#cdd8c4]/70">
					Control population stepping.
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-1.5">
				<button
					type="button"
					onClick={() => onSetMode("auto")}
					className={`rounded px-2 py-1 text-xs ${mode === "auto" ? "bg-[#d9e4cd] text-[#17201d]" : "bg-[#101820] text-[#cdd8c4]"}`}
				>
					Auto
				</button>
				<button
					type="button"
					onClick={() => onSetMode("mock_manual")}
					className={`rounded px-2 py-1 text-xs ${mode === "mock_manual" ? "bg-[#d9e4cd] text-[#17201d]" : "bg-[#101820] text-[#cdd8c4]"}`}
				>
					Mock Manual
				</button>
				<button
					type="button"
					disabled={isRunning || mode !== "auto"}
					onClick={onRunPopulationStep}
					className="rounded bg-[#f2b84b] px-2 py-1 text-xs text-[#17201d] disabled:cursor-not-allowed disabled:opacity-45"
				>
					{isRunning ? "Running..." : "Run Step"}
				</button>
			</div>
		</section>
	);
}
