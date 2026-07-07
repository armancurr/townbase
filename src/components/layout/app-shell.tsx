import { GameCanvas } from "../game/game-canvas";
import { LoadingOverlay } from "../game/loading-overlay";
import { Sidebar } from "./sidebar";
import { useTownbaseController } from "../../hooks/town/use-townbase-controller";

export function AppShell() {
	const controller = useTownbaseController();

	return (
		<main className="relative h-full w-full overflow-hidden bg-[#9cb080]">
			<GameCanvas containerRef={controller.containerRef} />
			<Sidebar {...controller.sidebarProps} />
			<LoadingOverlay isVisible={controller.isLoading} />
		</main>
	);
}
