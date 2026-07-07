import Phaser from "phaser";
import { IsometricMovementScene } from "./isometric-movement-scene";
import type { MovementSceneData } from "../types";

export function createMovementGameConfig(
	parent: HTMLElement,
	data: MovementSceneData,
): Phaser.Types.Core.GameConfig {
	return {
		type: Phaser.AUTO,
		parent,
		width: parent.clientWidth,
		height: parent.clientHeight,
		backgroundColor: "#9CB080",
		disableContextMenu: true,
		scene: [IsometricMovementScene],
		callbacks: {
			preBoot: (game) => {
				game.registry.set("movementSceneData", data);
			},
		},
		render: {
			antialias: true,
			pixelArt: false,
			roundPixels: true,
		},
		scale: {
			mode: Phaser.Scale.RESIZE,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
	};
}
