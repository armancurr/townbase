import type { Doc } from "../../../convex/_generated/dataModel";
import { placeableAssetsById } from "../../game/placed-assets";
import type { GridCell, PlaceKind, PlaceableAsset, PlacedTile, TileRotation, WorldModel } from "../../types";

export function labelFromAssetId(assetId: string) {
  return (
    assetId
      .split(":")
      .pop()
      ?.replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? assetId
  );
}

export function placeKindFromAsset(asset: PlaceableAsset): PlaceKind {
  if (asset.category === "road") {
    return "road";
  }
  if (asset.category === "nature") {
    return "nature";
  }
  if (asset.pack === "commercial" || asset.pack === "industrial") {
    return "work";
  }
  return "building";
}

export function convexTileToPlacedTile(tile: Doc<"tiles">): PlacedTile {
  return {
    id: tile.stableId,
    assetId: tile.assetId,
    col: tile.col,
    row: tile.row,
    rotation: tile.rotation,
  };
}

export function nearestWalkableCell(target: GridCell, world: WorldModel) {
  if (!world.blockedCellKeys.has(`${target.col}:${target.row}`)) {
    return target;
  }

  for (let radius = 1; radius < Math.max(world.cols, world.rows); radius += 1) {
    for (let col = target.col - radius; col <= target.col + radius; col += 1) {
      for (let row = target.row - radius; row <= target.row + radius; row += 1) {
        const cell = { col, row };
        if (
          col >= 0 &&
          col < world.cols &&
          row >= 0 &&
          row < world.rows &&
          !world.blockedCellKeys.has(`${col}:${row}`)
        ) {
          return cell;
        }
      }
    }
  }

  return target;
}

export function nextRotation(rotation: TileRotation, direction: 1 | -1) {
  const rotations: TileRotation[] = [0, 90, 180, 270];
  const index = rotations.indexOf(rotation);
  return rotations[(index + direction + rotations.length) % rotations.length];
}

export function isTileRotation(value: unknown): value is TileRotation {
  return value === 0 || value === 90 || value === 180 || value === 270;
}

export function isKnownAssetId(assetId: string) {
  return placeableAssetsById.has(assetId);
}
