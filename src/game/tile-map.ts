import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../constants/tuning";
import { zoneForTile } from "../constants/zones";
import type { Zone } from "../types/sim-types";

export type TileKind =
  | "grass"
  | "dirt"
  | "water"
  | "riverbank"
  | "trees"
  | "treeline"
  | "forage"
  | "campsite"
  | "lookout";

export interface CampTile {
  x: number;
  y: number;
  kind: TileKind;
  zone: Zone;
  walkable: boolean;
}

export const TILE_COLORS: Record<TileKind, number> = {
  grass: 0x3f7f3d,
  dirt: 0x8b6f42,
  water: 0x2d76a8,
  riverbank: 0x557c54,
  trees: 0x183d25,
  treeline: 0x285b32,
  forage: 0x4f8f40,
  campsite: 0x9b7b43,
  lookout: 0x6d7568,
};

export const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
export const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;

function isRiver(x: number) {
  return x === 3 || x === 4 || (x === 5 && x % 2 === 1);
}

function isRiverbank(x: number) {
  return x === 2 || x === 5 || x === 6;
}

function isDirtPath(x: number, y: number) {
  const horizontal = y >= 14 && y <= 16 && x >= 6 && x <= 31;
  const verticalToLookout = x >= 12 && x <= 13 && y >= 6 && y <= 16;
  const verticalToForage = x >= 29 && x <= 30 && y >= 15 && y <= 22;
  return horizontal || verticalToLookout || verticalToForage;
}

function tileKindFor(x: number, y: number): TileKind {
  const zone = zoneForTile(x, y);

  if (isRiver(x)) return "water";
  if (isRiverbank(x)) return "riverbank";
  if (zone === "campsite") return "campsite";
  if (zone === "forage") return "forage";
  if (zone === "lookout") return "lookout";

  if (zone === "treeline") {
    return x >= 36 || y <= 4 ? "trees" : "treeline";
  }

  if (x >= 37 || y <= 1 || y >= 28 || (x >= 32 && y <= 14)) {
    return "trees";
  }

  if (isDirtPath(x, y)) return "dirt";
  return "grass";
}

export function isWalkableKind(kind: TileKind) {
  return kind !== "water" && kind !== "trees";
}

export function createCampMap(): CampTile[][] {
  return Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => {
      const kind = tileKindFor(x, y);
      return {
        x,
        y,
        kind,
        zone: zoneForTile(x, y),
        walkable: isWalkableKind(kind),
      };
    }),
  );
}

export function tileCenter(tileX: number, tileY: number) {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  };
}

export function pixelToTile(pixelX: number, pixelY: number) {
  return {
    x: Math.floor(pixelX / TILE_SIZE),
    y: Math.floor(pixelY / TILE_SIZE),
  };
}

export function inBounds(tileX: number, tileY: number) {
  return tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT;
}
