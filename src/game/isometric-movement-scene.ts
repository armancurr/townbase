import Phaser from "phaser";
import type { CellClickAction, MovementSceneData } from "./movement-game-config";
import type { BakedPlaceableSprite, SpriteFootprint } from "./placeable-sprite-baker";
import {
  placeableAssetsById,
  placeableSpriteKey,
  type PlacedTile,
  type TileRotation,
} from "./placed-assets";

const GRID_COLS = 40;
const GRID_ROWS = 40;
const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const BG_COLOR = "#9CB080";
const LAND_COLOR = 0x9cb080;
const OCCUPIED_LAND_COLOR = 0xffffff;
const OCCUPIED_LAND_ALPHA = 0.55;
const GRID_LINE_COLOR = 0x000000;
const GRID_LINE_ALPHA = 0.28;
const VALID_PREVIEW_COLOR = 0x6ee07f;
const INVALID_PREVIEW_COLOR = 0xef4c42;
const PREVIEW_FILL_ALPHA = 0.34;
const PREVIEW_LINE_ALPHA = 0.9;
const CAMERA_DRAG_THRESHOLD = 4;
const LAND_DEPTH = -3000;
const PLACEMENT_PREVIEW_DEPTH = -2500;
const ASSET_DEPTH_BASE = -1000;
const PLAYER_TEXTURE_KEY = "player-character";
const PLAYER_START_CELL = { col: 20, row: 20 };
const PLAYER_MOVE_MS = 300;
const PLAYER_SCALE = 0.1;
const DEFAULT_PLAYER_ROTATION: TileRotation = 180;

export class IsometricMovementScene extends Phaser.Scene {
  private origin = new Phaser.Math.Vector2(0, 0);
  private placedTiles: PlacedTile[] = [];
  private landGraphics?: Phaser.GameObjects.Graphics;
  private placementPreviewGraphics?: Phaser.GameObjects.Graphics;
  private placedAssetGroup?: Phaser.GameObjects.Group;
  private hoveredCell: { col: number; row: number } | null = null;
  private activeDragPointerId: number | null = null;
  private isCameraDragging = false;
  private dragStart = new Phaser.Math.Vector2(0, 0);
  private lastDragPointer = new Phaser.Math.Vector2(0, 0);
  private playerCell = { ...PLAYER_START_CELL };
  private playerRotation: TileRotation = DEFAULT_PLAYER_ROTATION;
  private playerSprite?: Phaser.GameObjects.Image;
  private playerTween?: Phaser.Tweens.Tween;

  constructor() {
    super("isometric-movement-scene");
  }

  create() {
    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;

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
    this.registerPlayerTexture(data);
    this.placedTiles = data?.placedTiles ?? [];
    this.placedAssetGroup = this.add.group();
    this.drawPlacedAssets();
    this.createPlayer();
    this.cameras.main.centerOn(this.origin.x, this.origin.y + worldHeight * 0.35);
    this.createPointerControls();
    this.createKeyboardControls();
  }

  setPlacedTiles(placedTiles: PlacedTile[]) {
    this.placedTiles = placedTiles;
    // Sprites can be baked/loaded lazily after the scene was created (e.g.
    // the user just placed an asset that hadn't been baked yet), so make
    // sure any newly available textures get registered before redrawing.
    this.registerPlaceableTextures(
      this.registry.get("movementSceneData") as MovementSceneData | undefined,
    );
    this.drawLand();
    if (!this.placedAssetGroup) {
      return;
    }
    this.drawPlacedAssets();
    this.refreshPlacementPreview();
  }

  refreshPlacementPreview() {
    this.drawPlacementPreview(this.hoveredCell);
  }

  private registerPlaceableTextures(data: MovementSceneData | undefined) {
    if (!data) {
      return;
    }

    for (const [key, sprite] of data.placeableSprites.sprites) {
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, sprite.canvas);
      }
    }
  }

  private registerPlayerTexture(data: MovementSceneData | undefined) {
    if (!data) {
      return;
    }

    for (const [rotation, sprite] of data.playerSprites) {
      const key = this.playerTextureKey(rotation as TileRotation);
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, sprite.canvas);
      }
    }
  }

  private createPointerControls() {
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.input.on("pointerupoutside", this.handlePointerUpOutside, this);
    this.input.on("gameout", this.clearPlacementPreview, this);
  }

  private createKeyboardControls() {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      const direction = this.keyDirection(event.key);
      if (!direction) {
        return;
      }

      event.preventDefault();
      this.movePlayerBy(direction.col, direction.row);
    });
  }

  private keyDirection(key: string) {
    if (key === "ArrowUp" || key.toLowerCase() === "w") {
      return { col: 0, row: -1 };
    }

    if (key === "ArrowDown" || key.toLowerCase() === "s") {
      return { col: 0, row: 1 };
    }

    if (key === "ArrowLeft" || key.toLowerCase() === "a") {
      return { col: -1, row: 0 };
    }

    if (key === "ArrowRight" || key.toLowerCase() === "d") {
      return { col: 1, row: 0 };
    }

    return null;
  }

  private directionToRotation(deltaCol: number, deltaRow: number): TileRotation {
    if (deltaRow < 0) {
      return 180;
    }

    if (deltaCol > 0) {
      return 90;
    }

    if (deltaRow > 0) {
      return 0;
    }

    return 270;
  }

  private playerTextureKey(rotation: TileRotation) {
    return `${PLAYER_TEXTURE_KEY}@${rotation}`;
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
    if (this.activeDragPointerId === null || !pointer.isDown) {
      this.updatePlacementPreview(pointer);
      return;
    }

    if (this.activeDragPointerId !== pointer.id) {
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
      this.clearPlacementPreview();
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
      this.updatePlacementPreview(pointer);
      return;
    }

    const action = this.cellClickAction(pointer);
    if (!action) {
      return;
    }

    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    const cell = this.screenToGrid(pointer);
    if (!cell || !data) {
      return;
    }

    data.onCellClick(cell.col, cell.row, action);
  }

  private cellClickAction(pointer: Phaser.Input.Pointer): CellClickAction | null {
    if (pointer.rightButtonReleased()) {
      return "erase";
    }

    if (pointer.leftButtonReleased()) {
      return "place";
    }

    return null;
  }

  private handlePointerUpOutside(pointer: Phaser.Input.Pointer) {
    if (this.activeDragPointerId !== pointer.id) {
      return;
    }

    this.activeDragPointerId = null;
    this.isCameraDragging = false;
    this.clearPlacementPreview();
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

  private footprintStart(col: number, row: number, footprint: SpriteFootprint) {
    return {
      col: Math.round(col - (footprint.cols - 1) / 2),
      row: Math.round(row - (footprint.rows - 1) / 2),
    };
  }

  private footprintCenter(col: number, row: number, footprint: SpriteFootprint) {
    const start = this.footprintStart(col, row, footprint);
    return {
      col: start.col + (footprint.cols - 1) / 2,
      row: start.row + (footprint.rows - 1) / 2,
    };
  }

  private assetDepth(tile: PlacedTile, sprite: BakedPlaceableSprite) {
    const start = this.footprintStart(tile.col, tile.row, sprite.footprint);
    return (
      ASSET_DEPTH_BASE +
      start.col +
      sprite.footprint.cols -
      1 +
      start.row +
      sprite.footprint.rows -
      1
    );
  }

  private occupiedCellKeys(data: MovementSceneData | undefined) {
    const occupied = new Set<string>();
    if (!data) {
      return occupied;
    }

    for (const tile of this.placedTiles) {
      const key = placeableSpriteKey(tile.assetId, tile.rotation);
      const bakedSprite = data.placeableSprites.sprites.get(key);
      if (!bakedSprite) {
        continue;
      }

      const start = this.footprintStart(tile.col, tile.row, bakedSprite.footprint);
      for (let offsetCol = 0; offsetCol < bakedSprite.footprint.cols; offsetCol += 1) {
        for (let offsetRow = 0; offsetRow < bakedSprite.footprint.rows; offsetRow += 1) {
          occupied.add(`${start.col + offsetCol}:${start.row + offsetRow}`);
        }
      }
    }

    return occupied;
  }

  private blockedMovementCellKeys(data: MovementSceneData | undefined) {
    const blocked = new Set<string>();
    if (!data) {
      return blocked;
    }

    for (const tile of this.placedTiles) {
      const asset = placeableAssetsById.get(tile.assetId);
      if (asset?.category === "road") {
        continue;
      }

      const key = placeableSpriteKey(tile.assetId, tile.rotation);
      const bakedSprite = data.placeableSprites.sprites.get(key);
      if (!bakedSprite) {
        continue;
      }

      const start = this.footprintStart(tile.col, tile.row, bakedSprite.footprint);
      for (let offsetCol = 0; offsetCol < bakedSprite.footprint.cols; offsetCol += 1) {
        for (let offsetRow = 0; offsetRow < bakedSprite.footprint.rows; offsetRow += 1) {
          blocked.add(`${start.col + offsetCol}:${start.row + offsetRow}`);
        }
      }
    }

    return blocked;
  }

  private createPlayer() {
    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    const playerSprite = data?.playerSprites.get(this.playerRotation);
    const textureKey = this.playerTextureKey(this.playerRotation);
    if (!data || !playerSprite || !this.textures.exists(textureKey)) {
      return;
    }

    this.playerCell = this.firstAvailablePlayerCell(data);
    const position = this.gridToScreen(this.playerCell.col, this.playerCell.row);
    const scale = (TILE_WIDTH / data.placeableSprites.diamondPx) * PLAYER_SCALE;
    this.playerSprite = this.add
      .image(position.x, position.y, textureKey)
      .setOrigin(
        playerSprite.originX / playerSprite.canvas.width,
        playerSprite.originY / playerSprite.canvas.height,
      )
      .setScale(scale);
    this.updatePlayerDepth();
  }

  private firstAvailablePlayerCell(data: MovementSceneData) {
    const blocked = this.blockedMovementCellKeys(data);
    if (!blocked.has(`${PLAYER_START_CELL.col}:${PLAYER_START_CELL.row}`)) {
      return { ...PLAYER_START_CELL };
    }

    for (let radius = 1; radius < Math.max(GRID_COLS, GRID_ROWS); radius += 1) {
      for (
        let col = PLAYER_START_CELL.col - radius;
        col <= PLAYER_START_CELL.col + radius;
        col += 1
      ) {
        for (
          let row = PLAYER_START_CELL.row - radius;
          row <= PLAYER_START_CELL.row + radius;
          row += 1
        ) {
          if (this.isInBounds(col, row) && !blocked.has(`${col}:${row}`)) {
            return { col, row };
          }
        }
      }
    }

    return { ...PLAYER_START_CELL };
  }

  private movePlayerBy(deltaCol: number, deltaRow: number) {
    if (this.playerTween?.isPlaying()) {
      return;
    }

    const nextRotation = this.directionToRotation(deltaCol, deltaRow);
    const nextCell = {
      col: this.playerCell.col + deltaCol,
      row: this.playerCell.row + deltaRow,
    };
    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    if (
      !data ||
      !this.playerSprite ||
      !this.isInBounds(nextCell.col, nextCell.row) ||
      this.blockedMovementCellKeys(data).has(`${nextCell.col}:${nextCell.row}`)
    ) {
      return;
    }

    this.setPlayerRotation(nextRotation);
    this.playerCell = nextCell;
    const position = this.gridToScreen(nextCell.col, nextCell.row);
    this.updatePlayerDepth();
    this.playerTween = this.tweens.add({
      targets: this.playerSprite,
      x: position.x,
      y: position.y,
      duration: PLAYER_MOVE_MS,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.playerTween = undefined;
        this.updatePlayerDepth();
      },
    });
  }

  private updatePlayerDepth() {
    this.playerSprite?.setDepth(ASSET_DEPTH_BASE + this.playerCell.col + this.playerCell.row + 1);
  }

  private setPlayerRotation(rotation: TileRotation) {
    if (rotation === this.playerRotation || !this.playerSprite) {
      return;
    }

    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    const playerSprite = data?.playerSprites.get(rotation);
    const textureKey = this.playerTextureKey(rotation);
    if (!playerSprite || !this.textures.exists(textureKey)) {
      return;
    }

    this.playerRotation = rotation;
    this.playerSprite
      .setTexture(textureKey)
      .setOrigin(
        playerSprite.originX / playerSprite.canvas.width,
        playerSprite.originY / playerSprite.canvas.height,
      );
  }

  private drawPlacedAssets() {
    this.placedAssetGroup?.clear(true, true);

    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    if (!data) {
      return;
    }

    const scale = TILE_WIDTH / data.placeableSprites.diamondPx;
    for (const tile of this.placedTiles) {
      const key = placeableSpriteKey(tile.assetId, tile.rotation);
      const bakedSprite = data.placeableSprites.sprites.get(key);
      if (!bakedSprite || !this.textures.exists(key)) {
        continue;
      }

      const centerCell = this.footprintCenter(tile.col, tile.row, bakedSprite.footprint);
      const center = this.gridToScreen(centerCell.col, centerCell.row);
      const sprite = this.add
        .image(center.x, center.y, key)
        .setOrigin(
          bakedSprite.originX / bakedSprite.canvas.width,
          bakedSprite.originY / bakedSprite.canvas.height,
        )
        .setScale(scale)
        .setDepth(this.assetDepth(tile, bakedSprite));

      this.placedAssetGroup?.add(sprite);
    }
  }

  private drawLand() {
    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    const occupied = this.occupiedCellKeys(data);
    const graphics = this.landGraphics ?? this.add.graphics().setDepth(LAND_DEPTH);
    this.landGraphics = graphics;
    graphics.clear();

    for (let col = 0; col < GRID_COLS; col += 1) {
      for (let row = 0; row < GRID_ROWS; row += 1) {
        const isOccupied = occupied.has(`${col}:${row}`);
        graphics.fillStyle(
          isOccupied ? OCCUPIED_LAND_COLOR : LAND_COLOR,
          isOccupied ? OCCUPIED_LAND_ALPHA : 1,
        );
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

  private updatePlacementPreview(pointer: Phaser.Input.Pointer) {
    const cell = this.screenToGrid(pointer);
    this.hoveredCell = cell;
    this.drawPlacementPreview(cell);
  }

  private drawPlacementPreview(cell: { col: number; row: number } | null) {
    const graphics =
      this.placementPreviewGraphics ?? this.add.graphics().setDepth(PLACEMENT_PREVIEW_DEPTH);
    this.placementPreviewGraphics = graphics;
    graphics.clear();

    const data = this.registry.get("movementSceneData") as MovementSceneData | undefined;
    if (!data || !cell) {
      return;
    }

    const preview = data.getPlacementPreview(cell.col, cell.row);
    if (!preview) {
      return;
    }

    const color = preview.isValid ? VALID_PREVIEW_COLOR : INVALID_PREVIEW_COLOR;
    graphics.fillStyle(color, PREVIEW_FILL_ALPHA);
    for (const previewCell of preview.cells) {
      graphics.fillPoints(this.cellCorners(previewCell.col, previewCell.row), true, true);
    }

    graphics.lineStyle(3, color, PREVIEW_LINE_ALPHA);
    for (const previewCell of preview.cells) {
      graphics.strokePoints(this.cellCorners(previewCell.col, previewCell.row), true, true);
    }
  }

  private clearPlacementPreview() {
    this.hoveredCell = null;
    this.placementPreviewGraphics?.clear();
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
