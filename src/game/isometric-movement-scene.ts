import Phaser from "phaser";
import type { MovementSceneData } from "./movement-game-config";
import { placeableSpriteKey, type PlacedTile } from "./placed-assets";

const GRID_COLS = 40;
const GRID_ROWS = 40;
const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const BG_COLOR = "#9AD872";
const LAND_COLOR = 0x9ad872;
const GRID_LINE_COLOR = 0x000000;
const GRID_LINE_ALPHA = 0.28;
const CAMERA_DRAG_THRESHOLD = 4;
const LAND_DEPTH = -3000;
const ASSET_DEPTH_BASE = -1000;

export class IsometricMovementScene extends Phaser.Scene {
  private origin = new Phaser.Math.Vector2(0, 0);
  private placedTiles: PlacedTile[] = [];
  private placedAssetGroup?: Phaser.GameObjects.Group;
  private activeDragPointerId: number | null = null;
  private isCameraDragging = false;
  private dragStart = new Phaser.Math.Vector2(0, 0);
  private lastDragPointer = new Phaser.Math.Vector2(0, 0);

  constructor() {
    super("isometric-movement-scene");
  }

  create() {
    const data = this.registry.get("movementSceneData") as
      | MovementSceneData
      | undefined;

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
    this.registerPlaceableTextures(data);
    this.placedTiles = data?.placedTiles ?? [];
    this.placedAssetGroup = this.add.group();
    this.drawPlacedAssets();
    this.cameras.main.centerOn(this.origin.x, this.origin.y + worldHeight * 0.35);
    this.createPointerControls();
  }

  setPlacedTiles(placedTiles: PlacedTile[]) {
    this.placedTiles = placedTiles;
    if (!this.placedAssetGroup) {
      return;
    }
    this.drawPlacedAssets();
  }

  private registerPlaceableTextures(data: MovementSceneData | undefined) {
    if (!data) {
      return;
    }

    for (const [key, canvas] of data.placeableSprites.canvases) {
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, canvas);
      }
    }
  }

  private createPointerControls() {
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.input.on("pointerupoutside", this.handlePointerUpOutside, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.activeDragPointerId !== null) {
      return;
    }

    this.activeDragPointerId = pointer.id;
    this.isCameraDragging = false;
    this.dragStart.set(pointer.x, pointer.y);
    this.lastDragPointer.copy(this.dragStart);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.activeDragPointerId !== pointer.id || !pointer.isDown) {
      return;
    }

    if (!this.isCameraDragging) {
      const distance = Phaser.Math.Distance.Between(
        this.dragStart.x,
        this.dragStart.y,
        pointer.x,
        pointer.y,
      );

      if (distance < CAMERA_DRAG_THRESHOLD) {
        return;
      }

      this.isCameraDragging = true;
    }

    const deltaX = pointer.x - this.lastDragPointer.x;
    const deltaY = pointer.y - this.lastDragPointer.y;
    this.cameras.main.scrollX -= deltaX / this.cameras.main.zoom;
    this.cameras.main.scrollY -= deltaY / this.cameras.main.zoom;
    this.lastDragPointer.set(pointer.x, pointer.y);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (this.activeDragPointerId !== pointer.id) {
      return;
    }

    const wasDragging = this.isCameraDragging;
    this.activeDragPointerId = null;
    this.isCameraDragging = false;

    if (wasDragging) {
      return;
    }

    const data = this.registry.get("movementSceneData") as
      | MovementSceneData
      | undefined;
    const cell = this.screenToGrid(pointer);
    if (!cell || !data) {
      return;
    }

    data.onCellClick(cell.col, cell.row);
  }

  private handlePointerUpOutside(pointer: Phaser.Input.Pointer) {
    if (this.activeDragPointerId !== pointer.id) {
      return;
    }

    this.activeDragPointerId = null;
    this.isCameraDragging = false;
  }

  private screenToGrid(pointer: Phaser.Input.Pointer) {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const dx = world.x - this.origin.x;
    const dy = world.y - this.origin.y;
    const projectedCol = (dx / (TILE_WIDTH / 2) + dy / (TILE_HEIGHT / 2)) / 2;
    const projectedRow = (dy / (TILE_HEIGHT / 2) - dx / (TILE_WIDTH / 2)) / 2;
    const col = Math.floor(projectedCol + 0.5);
    const row = Math.floor(projectedRow + 0.5);

    if (!this.isInBounds(col, row)) {
      return null;
    }

    return { col, row };
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

  private drawPlacedAssets() {
    this.placedAssetGroup?.clear(true, true);

    const data = this.registry.get("movementSceneData") as
      | MovementSceneData
      | undefined;
    if (!data) {
      return;
    }

    const scale = TILE_WIDTH / data.placeableSprites.diamondPx;
    for (const tile of this.placedTiles) {
      const key = placeableSpriteKey(tile.assetId, tile.rotation);
      if (!this.textures.exists(key)) {
        continue;
      }

      const center = this.gridToScreen(tile.col, tile.row);
      const sprite = this.add
        .image(center.x, center.y, key)
        .setOrigin(0.5, 0.5)
        .setScale(scale)
        .setDepth(ASSET_DEPTH_BASE + tile.col + tile.row);

      this.placedAssetGroup?.add(sprite);
    }
  }

  private drawLand() {
    const graphics = this.add.graphics().setDepth(LAND_DEPTH);

    graphics.fillStyle(LAND_COLOR, 1);
    for (let col = 0; col < GRID_COLS; col += 1) {
      for (let row = 0; row < GRID_ROWS; row += 1) {
        graphics.fillPoints(this.cellCorners(col, row), true, true);
      }
    }

    graphics.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
    for (let col = 0; col < GRID_COLS; col += 1) {
      for (let row = 0; row < GRID_ROWS; row += 1) {
        graphics.strokePoints(this.cellCorners(col, row), true, true);
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
