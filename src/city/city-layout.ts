export type CityAssetKey =
  | "building-a"
  | "building-b"
  | "building-c"
  | "building-d"
  | "building-e"
  | "building-f"
  | "building-g"
  | "building-h"
  | "building-i"
  | "building-j"
  | "building-k"
  | "building-l"
  | "building-m"
  | "building-n"
  | "building-o"
  | "building-p"
  | "building-q"
  | "building-r"
  | "building-s"
  | "building-t"
  | "chimney-basic"
  | "chimney-small"
  | "chimney-medium"
  | "chimney-large"
  | "detail-tank"
  | "building-type-a"
  | "building-type-b"
  | "building-type-c"
  | "building-type-d"
  | "building-type-e"
  | "building-type-f"
  | "building-type-g"
  | "building-type-h"
  | "building-type-i"
  | "building-type-j"
  | "building-type-k"
  | "building-type-l"
  | "building-type-m"
  | "building-type-n"
  | "building-type-o"
  | "building-type-p"
  | "building-type-q"
  | "building-type-r"
  | "building-type-s"
  | "building-type-t"
  | "building-type-u"
  | "driveway-short"
  | "driveway-long"
  | "fence"
  | "fence-low"
  | "fence-1x2"
  | "fence-1x3"
  | "fence-1x4"
  | "fence-2x2"
  | "fence-2x3"
  | "fence-3x2"
  | "fence-3x3"
  | "path-short"
  | "path-long"
  | "path-stones-short"
  | "path-stones-long"
  | "path-stones-messy"
  | "planter"
  | "tree-large"
  | "tree-small";

export type RoadAssetKey =
  | "road-straight"
  | "road-straight-half"
  | "road-intersection"
  | "road-crossroad"
  | "road-curve"
  | "road-bend"
  | "road-square"
  | "road-end"
  | "road-roundabout"
  | "road-side"
  | "road-side-entry"
  | "road-side-exit"
  | "road-driveway-single"
  | "road-driveway-double";

export type RoadTileDefinition = {
  id: string;
  asset: RoadAssetKey;
  gridX: number;
  gridZ: number;
  rotation: 0 | 90 | 180 | 270;
};

export type LotDefinition = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

export type CityObjectDefinition = {
  asset: CityAssetKey;
  pack?: "industrial" | "suburban";
  x: number;
  z: number;
  rotationY?: number;
  scale?: number;
  variant?: "a" | "b" | "c";
};

export type CityLayout = {
  roadTiles: RoadTileDefinition[];
  lots: LotDefinition[];
  buildings: CityObjectDefinition[];
  props: CityObjectDefinition[];
};

const GRID_MIN = -6;
const GRID_MAX = 6;
const ROAD_ROWS = [-3, 0, 3] as const;
const ROAD_COLUMNS = [-4, 0, 4] as const;

const roadTiles: RoadTileDefinition[] = [
  ...ROAD_ROWS.flatMap((gridZ) =>
    Array.from({ length: GRID_MAX - GRID_MIN + 1 }, (_, index) => {
      const gridX = GRID_MIN + index;
      const isCrossroad = ROAD_COLUMNS.includes(gridX as (typeof ROAD_COLUMNS)[number]);

      return {
        id: `road-row-${gridZ}-${gridX}`,
        asset: isCrossroad ? "road-crossroad" : "road-straight",
        gridX,
        gridZ,
        rotation: 0,
      } satisfies RoadTileDefinition;
    }),
  ),
  ...ROAD_COLUMNS.flatMap((gridX) =>
    ([-2, -1, 1, 2] as const).map((gridZ) => ({
        id: `road-col-${gridX}-${gridZ}`,
        asset: "road-straight",
        gridX,
        gridZ,
        rotation: 90,
      }) satisfies RoadTileDefinition),
  ),
];

const houseRows = [
  { z: -38, rotationY: Math.PI, drivewayZ: -30 },
  { z: -12, rotationY: 0, drivewayZ: -6 },
  { z: 12, rotationY: Math.PI, drivewayZ: 6 },
  { z: 38, rotationY: 0, drivewayZ: 30 },
] as const;

const houseColumns = [-48, -16, 16, 48] as const;

const houseAssets = [
  "building-type-a",
  "building-type-b",
  "building-type-c",
  "building-type-d",
  "building-type-e",
  "building-type-f",
  "building-type-g",
  "building-type-h",
  "building-type-i",
  "building-type-j",
  "building-type-k",
  "building-type-l",
  "building-type-m",
  "building-type-n",
  "building-type-o",
  "building-type-p",
] as const satisfies readonly CityAssetKey[];

const houses: CityObjectDefinition[] = houseRows.flatMap((row, rowIndex) =>
  houseColumns.map((x, columnIndex) => {
    const index = rowIndex * houseColumns.length + columnIndex;

    return {
      asset: houseAssets[index],
      pack: "suburban",
      x,
      z: row.z,
      rotationY: row.rotationY,
      scale: 4,
    };
  }),
);

const driveways: CityObjectDefinition[] = houseRows.flatMap((row, rowIndex) =>
  houseColumns.map((x) => ({
    asset: "driveway-short",
    pack: "suburban",
    x,
    z: row.drivewayZ,
    rotationY: rowIndex % 2 === 0 ? 0 : Math.PI,
    scale: 6,
  })),
);

const lotAccentAssets = ["tree-large", "tree-small", "planter"] as const satisfies readonly CityAssetKey[];

const greenery: CityObjectDefinition[] = [
  ...houses.map((house, index) => ({
    asset: lotAccentAssets[index % lotAccentAssets.length],
    pack: "suburban" as const,
    x: house.x + (index % 2 === 0 ? -6 : 6),
    z: house.z + (index % 4 < 2 ? -5 : 5),
    scale: index % 3 === 2 ? 3.5 : 4.5,
  })),
  { asset: "tree-large", pack: "suburban", x: -62, z: -24, scale: 5 },
  { asset: "tree-small", pack: "suburban", x: 62, z: -24, scale: 4 },
  { asset: "tree-large", pack: "suburban", x: -62, z: 24, scale: 5 },
  { asset: "tree-small", pack: "suburban", x: 62, z: 24, scale: 4 },
];

const boundaryFences: CityObjectDefinition[] = [
  { asset: "fence-1x4", pack: "suburban", x: -48, z: -48, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: -16, z: -48, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: 16, z: -48, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: 48, z: -48, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: -48, z: 48, rotationY: Math.PI, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: -16, z: 48, rotationY: Math.PI, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: 16, z: 48, rotationY: Math.PI, scale: 6 },
  { asset: "fence-1x4", pack: "suburban", x: 48, z: 48, rotationY: Math.PI, scale: 6 },
];

export const cityLayout: CityLayout = {
  roadTiles,
  lots: houses.map((house) => ({ x: house.x, z: house.z, width: 14, depth: 14 })),
  buildings: houses,
  props: [...driveways, ...greenery, ...boundaryFences],
};

export const cityObjectCount =
  cityLayout.buildings.length + cityLayout.props.length;
export const cityRoadTileCount = cityLayout.roadTiles.length;
export const cityLotCount = cityLayout.lots.length;
export const suburbanHomeCount = cityLayout.buildings.filter(
  (building) => building.pack === "suburban",
).length;
