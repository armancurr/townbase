import Phaser from "phaser";
import type { MovementSceneData } from "./movement-game-config";
import { roadSpriteKey } from "./road-layout";

const CHARACTER_URL = new URL(
  "../../assets/kenney_blocky-characters_20/Previews/character-a.png",
  import.meta.url,
).href;

// Grid dimensions - the land is a rectangular grid of equally sized cells.
const GRID_COLS = 40;
const GRID_ROWS = 40;

// Each cell is a 2:1 isometric diamond. Every asset placed on the land
// occupies exactly one of these cells.
const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;

// Land and site background share the same flat color.
const BG_COLOR = "#9AD872";
const LAND_COLOR = 0x9ad872;
const GRID_LINE_COLOR = 0x000000;
const GRID_LINE_ALPHA = 0.28;

const MOVE_DURATION = 200;

const BLOCK_FILL_COLOR = 0xffffff;
const BLOCK_FILL_ALPHA = 0.16;
const BLOCK_HOVER_ALPHA = 0.32;

// Roads render in a depth band well below the hover cells (depth 9) and the
// character (depth 10) so the player and highlighted cells always sit on top.
const ROAD_DEPTH_BASE = -1000;

type GridDirection = "up" | "down" | "left" | "right";

// Each direction moves the character exactly one cell along a single grid
// axis. This keeps every step axis-aligned (no diagonal movement) while
// still reading as a diagonal glide on screen, matching the isometric
// projection.
const DIRECTION_DELTA: Record<GridDirection, { col: number; row: number }> = {
  up: { col: -1, row: 0 },
  down: { col: 1, row: 0 },
  left: { col: 0, row: -1 },
  right: { col: 0, row: 1 },
};

const DIRECTIONS: GridDirection[] = ["up", "down", "left", "right"];

type DirectionControl = {
  graphics: Phaser.GameObjects.Graphics;
  zone: Phaser.GameObjects.Zone;
};

export class IsometricMovementScene extends Phaser.Scene {
  private character?: Phaser.GameObjects.Image;
  private origin = new Phaser.Math.Vector2(0, 0);
  private gridCol = Math.floor(GRID_COLS / 2);
  private gridRow = Math.floor(GRID_ROWS / 2);
  private isMoving = false;
  private lastFacingCol = 1;
  private controls: Partial<Record<GridDirection, DirectionControl>> = {};

  constructor() {
    super("isometric-movement-scene");
  }

  preload() {
    this.load.image("character-a", CHARACTER_URL);
  }

  create() {
    this.cameras.main.setBackgroundColor(BG_COLOR);

    const worldWidth = (GRID_COLS + GRID_ROWS) * (TILE_WIDTH / 2);
    const worldHeight = (GRID_COLS + GRID_ROWS) * (TILE_HEIGHT / 2);
    this.origin.set(worldWidth / 2, TILE_HEIGHT);

    this.cameras.main.setBounds(
      -worldWidth * 0.15,
      -TILE_HEIGHT * 2,
      worldWidth * 1.3,
      worldHeight + TILE_HEIGHT * 4,
    );

    this.drawLand();
    this.drawRoads();

    const start = this.gridToScreen(this.gridCol, this.gridRow);
    this.character = this.add
      .image(start.x, start.y, "character-a")
      // Nudge the sprite down so the standing figure reads as centered
      // within the isometric diamond (the frame has more headroom than
      // footroom, which otherwise makes it look like it floats high).
      .setOrigin(0.5, 0.70)
      .setScale(1.1)
      .setDepth(10);

    this.cameras.main.startFollow(this.character, true, 0.12, 0.12);
    this.cameras.main.centerOn(start.x, start.y);

    this.createDirectionControls();
    this.updateDirectionControls();
  }

  private createDirectionControls() {
    for (const direction of DIRECTIONS) {
      const graphics = this.add.graphics().setDepth(9);
      const zone = this.add
        .zone(0, 0, TILE_WIDTH, TILE_HEIGHT)
        .setDepth(9)
        .setInteractive({
          // Phaser normalizes hit-test coordinates to the object's
          // top-left corner (it adds displayOriginX/Y before calling the
          // callback), so this polygon must be defined in [0, width] x
          // [0, height] space rather than centered on (0, 0).
          hitArea: new Phaser.Geom.Polygon([
            TILE_WIDTH / 2, 0,
            TILE_WIDTH, TILE_HEIGHT / 2,
            TILE_WIDTH / 2, TILE_HEIGHT,
            0, TILE_HEIGHT / 2,
          ]),
          hitAreaCallback: Phaser.Geom.Polygon.Contains,
          useHandCursor: true,
        });

      zone.on("pointerover", () => this.drawDirectionBlock(direction, BLOCK_HOVER_ALPHA));
      zone.on("pointerout", () => this.drawDirectionBlock(direction, BLOCK_FILL_ALPHA));
      zone.on("pointerdown", () => this.stepInDirection(direction));

      this.controls[direction] = { graphics, zone };
    }
  }

  private drawDirectionBlock(direction: GridDirection, alpha: number) {
    const control = this.controls[direction];
    if (!control) {
      return;
    }

    const delta = DIRECTION_DELTA[direction];
    const targetCol = this.gridCol + delta.col;
    const targetRow = this.gridRow + delta.row;
    const points = this.cellCorners(targetCol, targetRow);

    control.graphics.clear();
    control.graphics.fillStyle(BLOCK_FILL_COLOR, alpha);
    control.graphics.fillPoints(points, true, true);
  }

  private updateDirectionControls() {
    for (const direction of DIRECTIONS) {
      const control = this.controls[direction];
      if (!control) {
        continue;
      }

      const delta = DIRECTION_DELTA[direction];
      const targetCol = this.gridCol + delta.col;
      const targetRow = this.gridRow + delta.row;
      const withinBounds = this.isInBounds(targetCol, targetRow);

      control.graphics.setVisible(withinBounds);
      control.zone.setVisible(withinBounds);
      if (control.zone.input) {
        control.zone.input.enabled = withinBounds;
      }

      if (!withinBounds) {
        continue;
      }

      const target = this.gridToScreen(targetCol, targetRow);
      control.zone.setPosition(target.x, target.y);
      this.drawDirectionBlock(direction, BLOCK_FILL_ALPHA);
    }
  }

  private stepInDirection(direction: GridDirection) {
    if (this.isMoving || !this.character) {
      return;
    }

    const delta = DIRECTION_DELTA[direction];
    const nextCol = this.gridCol + delta.col;
    const nextRow = this.gridRow + delta.row;

    if (!this.isInBounds(nextCol, nextRow)) {
      return;
    }

    if (delta.col !== 0) {
      this.lastFacingCol = delta.col;
      this.character.setFlipX(this.lastFacingCol < 0);
    }

    this.gridCol = nextCol;
    this.gridRow = nextRow;

    const target = this.gridToScreen(nextCol, nextRow);
    this.isMoving = true;

    for (const control of Object.values(this.controls)) {
      control?.graphics.setVisible(false);
      control?.zone.setVisible(false);
    }

    this.tweens.add({
      targets: this.character,
      x: target.x,
      y: target.y,
      duration: MOVE_DURATION,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.updateDirectionControls();
      },
    });
  }

  private isInBounds(col: number, row: number) {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
  }

  private gridToScreen(col: number, row: number) {
    return new Phaser.Math.Vector2(
      this.origin.x + (col - row) * (TILE_WIDTH / 2),
      this.origin.y + (col + row) * (TILE_HEIGHT / 2),
    );
  }

  private drawRoads() {
    const data = this.registry.get("movementSceneData") as
      | MovementSceneData
      | undefined;
    if (!data) {
      return;
    }

    const { roadLayout, roadSprites } = data;

    // Register each baked canvas as a Phaser texture (once).
    for (const [key, canvas] of roadSprites.canvases) {
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, canvas);
      }
    }

    // Baked diamonds are larger than the on-screen cell for crispness; scale
    // down so the tile footprint matches the grid cell exactly.
    const scale = TILE_WIDTH / roadSprites.diamondPx;

    for (const tile of roadLayout) {
      const key = roadSpriteKey(tile.asset, tile.rotation ?? 0);
      if (!this.textures.exists(key)) {
        continue;
      }

      const center = this.gridToScreen(tile.col, tile.row);
      this.add
        .image(center.x, center.y, key)
        // The footprint centre is baked at the canvas centre, so origin
        // (0.5, 0.5) seats the tile flush in the diamond while raised elements
        // extend upward.
        .setOrigin(0.5, 0.5)
        .setScale(scale)
        // Keep roads in a depth band beneath the hover cells (depth 9) and the
        // character (depth 10) so the player walks over them, while still
        // sorting roads among themselves by grid distance.
        .setDepth(ROAD_DEPTH_BASE + tile.col + tile.row);
    }
  }

  private drawLand() {
    const graphics = this.add.graphics();
    // Land sits beneath the road band so baked road tiles render on top of it.
    graphics.setDepth(ROAD_DEPTH_BASE - 1000);

    // Solid land fill - one diamond per cell, all in the same flat color.
    graphics.fillStyle(LAND_COLOR, 1);
    for (let col = 0; col < GRID_COLS; col += 1) {
      for (let row = 0; row < GRID_ROWS; row += 1) {
        const points = this.cellCorners(col, row);
        graphics.fillPoints(points, true, true);
      }
    }

    // Grid marking - stroke each cell so every asset slot on the land is
    // clearly outlined.
    graphics.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
    for (let col = 0; col < GRID_COLS; col += 1) {
      for (let row = 0; row < GRID_ROWS; row += 1) {
        const points = this.cellCorners(col, row);
        graphics.strokePoints(points, true, true);
      }
    }
  }

  private cellCorners(col: number, row: number) {
    const center = this.gridToScreen(col, row);
    const top = new Phaser.Math.Vector2(center.x, center.y - TILE_HEIGHT / 2);
    const right = new Phaser.Math.Vector2(center.x + TILE_WIDTH / 2, center.y);
    const bottom = new Phaser.Math.Vector2(center.x, center.y + TILE_HEIGHT / 2);
    const left = new Phaser.Math.Vector2(center.x - TILE_WIDTH / 2, center.y);
    return [top, right, bottom, left];
  }
}
