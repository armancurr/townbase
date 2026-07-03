import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH, SIM_TICK_MS, TILE_SIZE } from "../constants/tuning";
import { getState, subscribe, tickSimulation } from "../sim-state";
import type { SimState } from "../types/sim-types";
import { CharacterSprite } from "./character-sprite";
import { Pathfinder } from "./pathfinding";
import {
  createCampMap,
  inBounds,
  mapPixelHeight,
  mapPixelWidth,
  pixelToTile,
  TILE_COLORS,
  tileCenter,
} from "./tile-map";

export class MainScene extends Phaser.Scene {
  private map = createCampMap();
  private pathfinder!: Pathfinder;
  private character!: CharacterSprite;
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private fireGlow?: Phaser.GameObjects.Arc;
  private unsubscribe?: () => void;
  private latestState = getState();

  constructor() {
    super("main-scene");
  }

  create() {
    this.pathfinder = new Pathfinder(this.map);
    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight);
    this.drawMap();
    this.drawZoneLabels();
    this.drawCampObjects();

    const start = this.latestState.character;
    this.character = new CharacterSprite(this, start.tileX, start.tileY);
    this.nightOverlay = this.add
      .rectangle(0, 0, mapPixelWidth, mapPixelHeight, 0x07111f, 0)
      .setOrigin(0)
      .setDepth(50);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      void this.handlePointer(pointer);
    });

    this.time.addEvent({
      delay: SIM_TICK_MS,
      loop: true,
      callback: () => tickSimulation(),
    });

    this.unsubscribe = subscribe((state) => {
      this.latestState = state;
      this.updateFire(state);
      this.updateNightOverlay(state);
    });
  }

  update() {
    this.character?.pulse(this.latestState.character.currentAction !== "idle");
  }

  destroy() {
    this.unsubscribe?.();
  }

  private drawMap() {
    const graphics = this.add.graphics();

    for (const row of this.map) {
      for (const tile of row) {
        graphics.fillStyle(TILE_COLORS[tile.kind], 1);
        graphics.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x000000, 0.1);
        graphics.strokeRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    graphics.lineStyle(2, 0xe8d6a4, 0.25);
    graphics.strokeRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  }

  private drawZoneLabels() {
    const labels = [
      { text: "Camp", x: 20, y: 12 },
      { text: "River", x: 6, y: 3 },
      { text: "Forage", x: 31, y: 20 },
      { text: "Wood", x: 31, y: 7 },
      { text: "Lookout", x: 12, y: 5 },
    ];

    labels.forEach((label) => {
      const center = tileCenter(label.x, label.y);
      this.add
        .text(center.x, center.y, label.text, {
          fontFamily: "ui-sans-serif, system-ui",
          fontSize: "14px",
          color: "#f8fafc",
          stroke: "#111827",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(10);
    });
  }

  private drawCampObjects() {
    const camp = tileCenter(19, 14);
    this.add.rectangle(camp.x - 28, camp.y + 18, 40, 26, 0xc78b55).setDepth(8);
    this.add.triangle(camp.x - 28, camp.y - 4, 0, 20, 20, -16, 40, 20, 0xf8d19a).setDepth(9);
    this.add.circle(camp.x + 36, camp.y + 24, 9, 0x2a2118).setDepth(9);
  }

  private async handlePointer(pointer: Phaser.Input.Pointer) {
    if (this.character.isMoving()) return;

    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const target = pixelToTile(worldPoint.x, worldPoint.y);
    const current = getState().character;

    if (!inBounds(target.x, target.y) || !this.map[target.y][target.x].walkable) return;

    const path = await this.pathfinder.findPath(current.tileX, current.tileY, target.x, target.y);
    if (!path) return;
    await this.character.followPath(path);
  }

  private updateFire(state: SimState) {
    const fireCenter = tileCenter(21, 16);
    if (state.world.fireLit && !this.fireGlow) {
      this.fireGlow = this.add.circle(fireCenter.x, fireCenter.y, 20, 0xff9c2a, 0.55).setDepth(12);
      this.tweens.add({
        targets: this.fireGlow,
        scale: 1.25,
        alpha: 0.25,
        yoyo: true,
        repeat: -1,
        duration: 650,
      });
    }

    if (!state.world.fireLit && this.fireGlow) {
      this.fireGlow.destroy();
      this.fireGlow = undefined;
    }
  }

  private updateNightOverlay(state: SimState) {
    const hour = state.world.timeOfDay;
    const nightAlpha = hour < 5 || hour >= 21 ? 0.45 : hour < 7 || hour >= 19 ? 0.25 : 0.03;
    this.nightOverlay.setAlpha(nightAlpha);
  }
}
