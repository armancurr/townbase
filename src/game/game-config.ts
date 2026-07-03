import Phaser from "phaser";
import { mapPixelHeight, mapPixelWidth } from "./tile-map";
import { MainScene } from "./main-scene";

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: mapPixelWidth,
    height: mapPixelHeight,
    backgroundColor: "#10140f",
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
