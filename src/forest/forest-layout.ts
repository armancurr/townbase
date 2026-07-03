export const natureAssetKeys = [
  "campfire_logs",
  "flower_purpleA",
  "flower_redA",
  "flower_yellowA",
  "grass",
  "grass_large",
  "grass_leafs",
  "grass_leafsLarge",
  "ground_grass",
  "log",
  "log_large",
  "log_stack",
  "mushroom_redGroup",
  "mushroom_tanGroup",
  "plant_bush",
  "plant_bushDetailed",
  "plant_bushLarge",
  "plant_bushSmall",
  "rock_largeA",
  "rock_largeD",
  "rock_smallA",
  "rock_smallD",
  "stump_old",
  "stump_round",
  "tent_detailedOpen",
  "tree_default",
  "tree_default_dark",
  "tree_detailed",
  "tree_fat",
  "tree_oak",
  "tree_oak_dark",
  "tree_pineRoundA",
  "tree_pineRoundC",
  "tree_pineTallA",
  "tree_pineTallB",
  "tree_simple",
  "tree_tall",
] as const;

export type NatureAssetKey = (typeof natureAssetKeys)[number];

export type ForestObjectDefinition = {
  asset: NatureAssetKey;
  x: number;
  z: number;
  rotationY?: number;
  scale?: number;
};

export type ForestLayout = {
  terrain: ForestObjectDefinition[];
  trees: ForestObjectDefinition[];
  undergrowth: ForestObjectDefinition[];
  camp: ForestObjectDefinition[];
};

const TILE_SIZE = 8;
const TERRAIN_RADIUS = 22;
const TERRAIN_HALF_SIZE = TERRAIN_RADIUS * TILE_SIZE;
const CAMP_CLEARING = { x: 0, z: 0, radiusX: 54, radiusZ: 46, rotation: 0.08 };

type Patch = { x: number; z: number; radiusX: number; radiusZ: number; rotation: number };

const treeAssets = [
  "tree_oak",
  "tree_default",
  "tree_detailed",
  "tree_pineTallA",
  "tree_pineRoundA",
  "tree_fat",
  "tree_tall",
  "tree_oak_dark",
  "tree_default_dark",
  "tree_pineTallB",
  "tree_pineRoundC",
  "tree_simple",
] as const satisfies readonly NatureAssetKey[];

const undergrowthAssets = [
  "plant_bush",
  "plant_bushDetailed",
  "plant_bushLarge",
  "plant_bushSmall",
  "grass",
  "grass_large",
  "grass_leafs",
  "grass_leafsLarge",
  "rock_smallA",
  "rock_smallD",
  "mushroom_redGroup",
  "mushroom_tanGroup",
] as const satisfies readonly NatureAssetKey[];

const camp: ForestObjectDefinition[] = [
  { asset: "tent_detailedOpen", x: 0, z: 0, rotationY: 0, scale: 7.4 },
  { asset: "campfire_logs", x: -14, z: 10, rotationY: 0.6, scale: 3.6 },
  { asset: "log_stack", x: 20, z: -12, rotationY: 1.2, scale: 2.8 },
  { asset: "stump_round", x: -26, z: -18, rotationY: 0.3, scale: 2.8 },
  { asset: "stump_old", x: 30, z: 20, rotationY: 2.4, scale: 2.6 },
  { asset: "grass_large", x: -34, z: 8, rotationY: 0.2, scale: 3.4 },
  { asset: "grass_leafsLarge", x: 36, z: -2, rotationY: 1.1, scale: 3.2 },
  { asset: "plant_bushSmall", x: -38, z: 25, rotationY: 2.4, scale: 3.1 },
  { asset: "plant_bush", x: 38, z: 31, rotationY: 0.4, scale: 3 },
  { asset: "flower_yellowA", x: -18, z: 34, scale: 2.3 },
  { asset: "flower_redA", x: 18, z: 35, scale: 2.1 },
  { asset: "rock_largeA", x: -35, z: -5, rotationY: 1.7, scale: 2.7 },
  { asset: "rock_largeD", x: 37, z: 11, rotationY: 0.8, scale: 2.5 },
];

const openPatches = [
  CAMP_CLEARING,
  { x: -92, z: 68, radiusX: 20, radiusZ: 12, rotation: 0.55 },
  { x: 65, z: -72, radiusX: 18, radiusZ: 10, rotation: -0.75 },
  { x: 104, z: 36, radiusX: 26, radiusZ: 15, rotation: -0.35 },
  { x: -80, z: -96, radiusX: 22, radiusZ: 13, rotation: 0.2 },
  { x: 14, z: 126, radiusX: 30, radiusZ: 12, rotation: 0.15 },
] as const satisfies readonly Patch[];

const densePatches = [
  { x: -126, z: 92, radiusX: 50, radiusZ: 34, rotation: -0.2 },
  { x: 104, z: -108, radiusX: 48, radiusZ: 42, rotation: 0.35 },
  { x: -52, z: -118, radiusX: 58, radiusZ: 33, rotation: 0.1 },
  { x: 118, z: 84, radiusX: 48, radiusZ: 30, rotation: -0.45 },
  { x: -154, z: 4, radiusX: 28, radiusZ: 74, rotation: 0.1 },
  { x: 10, z: -150, radiusX: 68, radiusZ: 24, rotation: -0.15 },
] as const satisfies readonly Patch[];

function hash(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function ellipseValue(x: number, z: number, patch: Patch) {
  const dx = x - patch.x;
  const dz = z - patch.z;
  const cos = Math.cos(patch.rotation);
  const sin = Math.sin(patch.rotation);
  const rx = dx * cos - dz * sin;
  const rz = dx * sin + dz * cos;

  return (rx * rx) / (patch.radiusX * patch.radiusX) + (rz * rz) / (patch.radiusZ * patch.radiusZ);
}

function isInsidePatch(x: number, z: number, patch: Patch) {
  return ellipseValue(x, z, patch) < 1;
}

function clearingPenalty(x: number, z: number) {
  return openPatches.some((patch) => isInsidePatch(x, z, patch));
}

function densityAt(x: number, z: number) {
  const edgeDistance = Math.max(Math.abs(x), Math.abs(z)) / TERRAIN_HALF_SIZE;
  const edgeBoost = edgeDistance > 0.82 ? 0.24 : 0;
  const wave = Math.sin(x * 0.064 + z * 0.029) * 0.1 + Math.cos(z * 0.049 - x * 0.018) * 0.08;
  let density = 0.56 + edgeBoost + wave;

  for (const patch of densePatches) {
    const value = ellipseValue(x, z, patch);
    if (value < 1.7) {
      density += (1.7 - value) * 0.22;
    }
  }

  for (const patch of openPatches) {
    const value = ellipseValue(x, z, patch);
    if (value < 2.5) {
      density -= (2.5 - value) * 0.22;
    }
  }

  return Math.max(0.06, Math.min(0.92, density));
}

function terrainTiles() {
  const tiles: ForestObjectDefinition[] = [];

  for (let z = -TERRAIN_RADIUS; z <= TERRAIN_RADIUS; z += 1) {
    for (let x = -TERRAIN_RADIUS; x <= TERRAIN_RADIUS; x += 1) {
      tiles.push({
        asset: "ground_grass",
        x: x * TILE_SIZE,
        z: z * TILE_SIZE,
        rotationY: ((x + z + TERRAIN_RADIUS) % 4) * (Math.PI / 2),
        scale: TILE_SIZE,
      });
    }
  }

  return tiles;
}

function forestTrees() {
  const trees: ForestObjectDefinition[] = [];
  let index = 0;

  for (let z = -TERRAIN_HALF_SIZE + 5; z <= TERRAIN_HALF_SIZE - 5; z += 6) {
    for (let x = -TERRAIN_HALF_SIZE + 5; x <= TERRAIN_HALF_SIZE - 5; x += 6) {
      const px = x + (hash(index + 3) - 0.5) * 5.4;
      const pz = z + (hash(index + 11) - 0.5) * 5.4;

      if (clearingPenalty(px, pz) || hash(index + 31) > densityAt(px, pz)) {
        index += 1;
        continue;
      }

      trees.push({
        asset: treeAssets[index % treeAssets.length],
        x: px,
        z: pz,
        rotationY: hash(index + 61) * Math.PI * 2,
        scale: 5.2 + hash(index + 7) * 3.4,
      });
      index += 1;
    }
  }

  return trees;
}

function undergrowth() {
  const objects: ForestObjectDefinition[] = [];
  let index = 0;

  for (let z = -TERRAIN_HALF_SIZE + 5; z <= TERRAIN_HALF_SIZE - 5; z += 6) {
    for (let x = -TERRAIN_HALF_SIZE + 5; x <= TERRAIN_HALF_SIZE - 5; x += 6) {
      const px = x + (hash(index + 17) - 0.5) * 5;
      const pz = z + (hash(index + 23) - 0.5) * 5;

      if (clearingPenalty(px, pz) || hash(index + 53) > densityAt(px, pz) + 0.13) {
        index += 1;
        continue;
      }

      objects.push({
        asset: undergrowthAssets[index % undergrowthAssets.length],
        x: px,
        z: pz,
        rotationY: hash(index + 43) * Math.PI * 2,
        scale: 2 + hash(index + 73) * 2.7,
      });
      index += 1;
    }
  }

  return objects;
}

export const forestLayout: ForestLayout = {
  terrain: terrainTiles(),
  trees: forestTrees(),
  undergrowth: undergrowth(),
  camp,
};

export const forestStats = {
  terrainTiles: forestLayout.terrain.length,
  trees: forestLayout.trees.length,
  undergrowth: forestLayout.undergrowth.length + forestLayout.camp.length,
  shelters: forestLayout.camp.filter((definition) => definition.asset === "tent_detailedOpen").length,
} as const;

export const forestWorldSize = {
  width: TILE_SIZE * (TERRAIN_RADIUS * 2 + 1),
  depth: TILE_SIZE * (TERRAIN_RADIUS * 2 + 1),
} as const;
