import Phaser from "phaser";
import { IsometricMovementScene } from "./isometric-movement-scene";
import type { RoadTile } from "./road-layout";
import type { BakedRoadSprites } from "./road-sprite-baker";

export type MovementSceneData = {
  roadLayout: RoadTile[];
  roadSprites: BakedRoadSprites;
};

export function createMovementGameConfig(
  parent: HTMLElement,
  data: MovementSceneData,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth,
    height: parent.clientHeight,
    backgroundColor: "#9AD872",
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
