import Phaser from "phaser";
import { TILE_SIZE } from "../constants/tuning";
import { setCharacterTile, setCurrentAction } from "../sim-state";
import { tileCenter } from "./tile-map";

export class CharacterSprite {
  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly pointer: Phaser.GameObjects.Triangle;
  private moving = false;

  constructor(private readonly scene: Phaser.Scene, tileX: number, tileY: number) {
    const center = tileCenter(tileX, tileY);
    this.body = scene.add.circle(0, 0, 11, 0xf6c453).setStrokeStyle(2, 0x281b0b);
    this.pointer = scene.add.triangle(0, -13, 0, -9, -7, 5, 7, 5, 0x1f2937);
    this.container = scene.add.container(center.x, center.y, [this.body, this.pointer]);
    this.container.setDepth(20);
  }

  isMoving() {
    return this.moving;
  }

  async followPath(path: Array<{ x: number; y: number }>) {
    if (path.length <= 1 || this.moving) return;

    this.moving = true;
    setCurrentAction("moving", "Walking.");

    for (let index = 1; index < path.length; index += 1) {
      const previous = path[index - 1];
      const next = path[index];
      this.face(next.x - previous.x, next.y - previous.y);
      await this.moveTo(next.x, next.y);
      setCharacterTile(next.x, next.y);
    }

    this.moving = false;
    setCurrentAction("idle", "Arrived.");
  }

  private face(deltaX: number, deltaY: number) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.pointer.rotation = deltaX > 0 ? Math.PI / 2 : -Math.PI / 2;
      return;
    }
    this.pointer.rotation = deltaY > 0 ? Math.PI : 0;
  }

  private moveTo(tileX: number, tileY: number) {
    const center = tileCenter(tileX, tileY);
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        x: center.x,
        y: center.y,
        duration: 150,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
  }

  pulse(active: boolean) {
    this.body.setScale(active ? 1.06 : 1);
    this.pointer.y = active ? -14 : -13;
  }

  getScreenRadius() {
    return TILE_SIZE / 2;
  }
}
