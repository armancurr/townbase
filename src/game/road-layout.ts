import type { RoadAssetKey } from "../city/city-layout";

export type RoadRotation = 0 | 90 | 180 | 270;

// A single road piece placed on the isometric grid. Each piece fills exactly
// one cell. `rotation` is applied while baking the glb model into a sprite so
// bends/crossroads orient correctly.
export type RoadTile = {
  col: number;
  row: number;
  asset: RoadAssetKey;
  rotation?: RoadRotation;
};

// Unique texture key for a baked (asset, rotation) combination.
export function roadSpriteKey(asset: RoadAssetKey, rotation: RoadRotation = 0) {
  return `road-sprite:${asset}@${rotation}`;
}

// Starting layout: a short straight stub of road running through the grid
// centre (the character spawns at col/row 20). Extend this list to build out
// the full town road network.
export const roadLayout: RoadTile[] = [
  { col: 18, row: 20, asset: "road-straight" },
  { col: 19, row: 20, asset: "road-straight" },
  { col: 20, row: 20, asset: "road-straight" },
  { col: 21, row: 20, asset: "road-straight" },
  { col: 22, row: 20, asset: "road-straight" },
];
