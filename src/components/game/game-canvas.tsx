import type { RefObject } from "react";

type GameCanvasProps = {
	containerRef: RefObject<HTMLDivElement | null>;
};

export function GameCanvas({ containerRef }: GameCanvasProps) {
	return (
		<div
			ref={containerRef}
			className="absolute inset-0 overflow-hidden cursor-crosshair [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full [&_canvas]:touch-none [&_canvas]:cursor-crosshair"
		/>
	);
}
