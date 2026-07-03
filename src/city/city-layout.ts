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
  | "building-skyscraper-a"
  | "building-skyscraper-b"
  | "building-skyscraper-c"
  | "building-skyscraper-d"
  | "building-skyscraper-e"
  | "chimney-basic"
  | "chimney-small"
  | "chimney-medium"
  | "chimney-large"
  | "detail-awning"
  | "detail-awning-wide"
  | "detail-overhang"
  | "detail-overhang-wide"
  | "detail-parasol-a"
  | "detail-parasol-b"
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
  | "construction-barrier"
  | "construction-cone"
  | "light-curved"
  | "light-curved-cross"
  | "light-curved-double"
  | "light-square"
  | "light-square-cross"
  | "light-square-double"
  | "road-bend"
  | "road-bend-sidewalk"
  | "road-crossing"
  | "road-crossroad"
  | "road-crossroad-line"
  | "road-curve"
  | "road-curve-intersection"
  | "road-driveway-double"
  | "road-driveway-single"
  | "road-end"
  | "road-end-round"
  | "road-intersection"
  | "road-intersection-line"
  | "road-roundabout"
  | "road-side"
  | "road-side-entry"
  | "road-side-exit"
  | "road-slant"
  | "road-slant-curve"
  | "road-split"
  | "road-square"
  | "road-straight"
  | "road-straight-half"
  | "sign-highway"
  | "sign-highway-wide";

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
  pack?: "commercial" | "industrial" | "suburban";
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

const TILE_SIZE = 8;
const HALF_TURN = Math.PI;
const QUARTER_TURN = Math.PI / 2;

const homeAssets = [
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
  "building-type-q",
  "building-type-r",
  "building-type-s",
  "building-type-t",
  "building-type-u",
] as const satisfies readonly CityAssetKey[];

const roadTileMap = new Map<string, RoadTileDefinition>();
let roadId = 0;

function isRoadFurniture(asset: RoadAssetKey) {
  return (
    asset.startsWith("light-") ||
    asset.startsWith("sign-") ||
    asset.startsWith("construction-")
  );
}

function addRoad(
  asset: RoadAssetKey,
  gridX: number,
  gridZ: number,
  rotation: RoadTileDefinition["rotation"] = 0,
) {
  const key = isRoadFurniture(asset) ? `${gridX}:${gridZ}:${asset}:${roadId}` : `${gridX}:${gridZ}`;
  roadTileMap.set(key, {
    id: `road-${roadId}-${asset}-${gridX}-${gridZ}`,
    asset,
    gridX,
    gridZ,
    rotation,
  });
  roadId += 1;
}

function horizontalRoad(gridZ: number, startX: number, endX: number) {
  for (let gridX = startX; gridX <= endX; gridX += 1) {
    addRoad("road-straight", gridX, gridZ, 0);
  }
}

function verticalRoad(gridX: number, startZ: number, endZ: number) {
  for (let gridZ = startZ; gridZ <= endZ; gridZ += 1) {
    addRoad("road-straight", gridX, gridZ, 90);
  }
}

function placeLightsAlongHorizontal(gridZ: number, startX: number, endX: number, side: -1 | 1) {
  for (let gridX = startX; gridX <= endX; gridX += 2) {
    addRoad("light-curved", gridX, gridZ + side, side === 1 ? 180 : 0);
  }
}

function placeLightsAlongVertical(gridX: number, startZ: number, endZ: number, side: -1 | 1) {
  for (let gridZ = startZ; gridZ <= endZ; gridZ += 2) {
    addRoad("light-square", gridX + side, gridZ, side === 1 ? 270 : 90);
  }
}

function buildRoadNetwork() {
  horizontalRoad(0, -13, 13);
  horizontalRoad(-7, -12, 3);
  horizontalRoad(7, -11, 11);
  horizontalRoad(-3, -12, -5);
  horizontalRoad(-3, 3, 11);
  horizontalRoad(4, -4, 11);
  horizontalRoad(10, -7, 5);

  verticalRoad(-10, -7, 7);
  verticalRoad(-5, -4, 10);
  verticalRoad(4, -8, 10);
  verticalRoad(9, -3, 7);
  verticalRoad(12, -1, 4);

  addRoad("road-roundabout", -2, 0, 0);
  addRoad("road-crossroad", -10, 0, 0);
  addRoad("road-crossroad", -5, 0, 0);
  addRoad("road-crossroad", 4, 0, 0);
  addRoad("road-crossroad", 9, 0, 0);
  addRoad("road-intersection", -10, -7, 90);
  addRoad("road-intersection", -10, 7, 180);
  addRoad("road-intersection", -5, 7, 0);
  addRoad("road-intersection", 4, 7, 270);
  addRoad("road-intersection", 9, 7, 180);
  addRoad("road-intersection", 4, -7, 90);
  addRoad("road-intersection", 4, -3, 0);
  addRoad("road-intersection", 9, -3, 270);
  addRoad("road-intersection", -5, -3, 180);
  addRoad("road-crossing", -8, 0, 0);
  addRoad("road-crossing", 1, 0, 0);
  addRoad("road-crossing", 6, 4, 0);
  addRoad("road-crossing", -2, 7, 0);

  addRoad("road-curve", -12, -7, 180);
  addRoad("road-curve", 3, -7, 270);
  addRoad("road-curve", -12, 7, 90);
  addRoad("road-curve", 11, 7, 0);
  addRoad("road-curve", -7, 10, 90);
  addRoad("road-curve", 5, 10, 0);
  addRoad("road-curve-intersection", 12, 4, 0);
  addRoad("road-bend", 12, -1, 180);

  addRoad("road-end-round", -13, 0, 270);
  addRoad("road-end-round", 13, 0, 90);
  addRoad("road-end-round", -12, -3, 270);
  addRoad("road-end-round", 11, -3, 90);
  addRoad("road-end-round", -11, 7, 270);
  addRoad("road-end-round", 11, 7, 90);

  addRoad("road-slant", 6, -6, 0);
  addRoad("road-slant", 7, -5, 0);
  addRoad("road-slant-curve", 8, -4, 0);
  addRoad("road-split", 2, 4, 0);

  placeLightsAlongHorizontal(0, -12, 12, -1);
  placeLightsAlongHorizontal(7, -10, 10, 1);
  placeLightsAlongVertical(4, -7, 9, 1);
  placeLightsAlongVertical(-10, -6, 6, -1);
  addRoad("sign-highway-wide", -12, -1, 0);
  addRoad("sign-highway", 12, 1, 180);
}

buildRoadNetwork();

type HouseInput = {
  x: number;
  z: number;
  rotationY: number;
  scale?: number;
  assetOffset?: number;
  driveway?: "long" | "short";
  drivewayX?: number;
  drivewayZ?: number;
  drivewayRotationY?: number;
};

function home(input: HouseInput, index: number): CityObjectDefinition {
  return {
    asset: homeAssets[(index + (input.assetOffset ?? 0)) % homeAssets.length],
    pack: "suburban",
    x: input.x,
    z: input.z,
    rotationY: input.rotationY,
    scale: input.scale ?? 3.6,
  };
}

const northVillage: HouseInput[] = [
  { x: -88, z: -64, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: -69, z: -65, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: -50, z: -63, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: -30, z: -64, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: -10, z: -62, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: 17, z: -64, rotationY: HALF_TURN, drivewayZ: -56 },
  { x: -82, z: -42, rotationY: 0, drivewayZ: -48 },
  { x: -61, z: -41, rotationY: 0, drivewayZ: -48 },
  { x: -40, z: -42, rotationY: 0, drivewayZ: -48 },
  { x: -18, z: -40, rotationY: 0, drivewayZ: -48 },
  { x: 16, z: -40, rotationY: 0, drivewayZ: -48 },
  { x: 36, z: -45, rotationY: QUARTER_TURN, drivewayX: 28, drivewayZ: -45, drivewayRotationY: QUARTER_TURN },
];

const centralVillage: HouseInput[] = [
  { x: -92, z: -18, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: -72, z: -19, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: -41, z: -18, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: 28, z: -19, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: 50, z: -20, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: 73, z: -19, rotationY: HALF_TURN, drivewayZ: -24, assetOffset: 3 },
  { x: -87, z: 17, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
  { x: -67, z: 18, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
  { x: -41, z: 18, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
  { x: 22, z: 18, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
  { x: 48, z: 18, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
  { x: 75, z: 19, rotationY: 0, drivewayZ: 8, assetOffset: 6 },
];

const eastGarden: HouseInput[] = [
  { x: 72, z: -54, rotationY: HALF_TURN, drivewayZ: -48, assetOffset: 8 },
  { x: 91, z: -50, rotationY: HALF_TURN, drivewayZ: -48, assetOffset: 8 },
  { x: 101, z: -22, rotationY: -QUARTER_TURN, drivewayX: 92, drivewayZ: -22, drivewayRotationY: -QUARTER_TURN, assetOffset: 8 },
  { x: 105, z: 21, rotationY: -QUARTER_TURN, drivewayX: 96, drivewayZ: 21, drivewayRotationY: -QUARTER_TURN, assetOffset: 8 },
  { x: 87, z: 50, rotationY: 0, drivewayZ: 40, assetOffset: 8 },
  { x: 66, z: 51, rotationY: 0, drivewayZ: 40, assetOffset: 8 },
];

const southVillage: HouseInput[] = [
  { x: -89, z: 43, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: -68, z: 44, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: -39, z: 43, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: -13, z: 44, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: 24, z: 43, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: 50, z: 43, rotationY: HALF_TURN, drivewayZ: 32, assetOffset: 11 },
  { x: -84, z: 76, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
  { x: -61, z: 78, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
  { x: -35, z: 77, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
  { x: -9, z: 76, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
  { x: 20, z: 76, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
  { x: 44, z: 77, rotationY: 0, drivewayZ: 64, assetOffset: 14 },
];

const culDeSacs: HouseInput[] = [
  { x: -103, z: -39, rotationY: QUARTER_TURN, drivewayX: -96, drivewayZ: -39, drivewayRotationY: QUARTER_TURN, assetOffset: 17 },
  { x: -105, z: 43, rotationY: QUARTER_TURN, drivewayX: -96, drivewayZ: 43, drivewayRotationY: QUARTER_TURN, assetOffset: 18 },
  { x: 8, z: 92, rotationY: 0, drivewayZ: 80, assetOffset: 19 },
  { x: 35, z: 93, rotationY: 0, drivewayZ: 80, assetOffset: 20 },
  { x: 80, z: 80, rotationY: -QUARTER_TURN, drivewayX: 72, drivewayZ: 80, drivewayRotationY: -QUARTER_TURN, assetOffset: 2 },
  { x: 99, z: 68, rotationY: -QUARTER_TURN, drivewayX: 88, drivewayZ: 68, drivewayRotationY: -QUARTER_TURN, assetOffset: 5 },
];

const houseInputs = [...northVillage, ...centralVillage, ...eastGarden, ...southVillage, ...culDeSacs];

const houses = houseInputs.map(home);

const driveways: CityObjectDefinition[] = houseInputs.map((house) => ({
  asset: house.driveway === "long" ? "driveway-long" : "driveway-short",
  pack: "suburban",
  x: house.drivewayX ?? house.x,
  z: house.drivewayZ ?? house.z,
  rotationY: house.drivewayRotationY ?? (house.rotationY === 0 ? HALF_TURN : 0),
  scale: house.driveway === "long" ? 5.5 : 5,
}));

const amenities: CityObjectDefinition[] = [
  { asset: "building-a", pack: "commercial", x: -12, z: -16, rotationY: HALF_TURN, scale: 3.5 },
  { asset: "building-c", pack: "commercial", x: 9, z: -15, rotationY: HALF_TURN, scale: 3.4 },
  { asset: "building-h", pack: "commercial", x: 16, z: 16, rotationY: 0, scale: 3.5 },
  { asset: "building-k", pack: "commercial", x: -16, z: 19, rotationY: 0, scale: 3.2 },
  { asset: "building-b", pack: "commercial", x: 92, z: 2, rotationY: -QUARTER_TURN, scale: 3.3 },
  { asset: "building-f", pack: "commercial", x: -72, z: 1, rotationY: HALF_TURN, scale: 3.3 },
];

const amenityProps: CityObjectDefinition[] = [
  { asset: "detail-awning-wide", pack: "commercial", x: -12, z: -25, rotationY: HALF_TURN, scale: 3.2 },
  { asset: "detail-overhang", pack: "commercial", x: 9, z: -24, rotationY: HALF_TURN, scale: 3 },
  { asset: "detail-parasol-a", pack: "commercial", x: -3, z: 13, scale: 3 },
  { asset: "detail-parasol-b", pack: "commercial", x: 4, z: 13, scale: 3 },
  { asset: "detail-awning", pack: "commercial", x: 83, z: 2, rotationY: -QUARTER_TURN, scale: 3 },
];

function pocketPark(cx: number, cz: number, scale = 1): CityObjectDefinition[] {
  return [
    { asset: "path-stones-long", pack: "suburban", x: cx - 5 * scale, z: cz, rotationY: QUARTER_TURN, scale: 4.2 * scale },
    { asset: "path-stones-long", pack: "suburban", x: cx + 5 * scale, z: cz, rotationY: QUARTER_TURN, scale: 4.2 * scale },
    { asset: "path-stones-short", pack: "suburban", x: cx, z: cz - 5 * scale, scale: 4 * scale },
    { asset: "tree-large", pack: "suburban", x: cx - 9 * scale, z: cz - 7 * scale, scale: 4.2 * scale },
    { asset: "tree-small", pack: "suburban", x: cx + 9 * scale, z: cz - 6 * scale, scale: 3.6 * scale },
    { asset: "tree-large", pack: "suburban", x: cx + 8 * scale, z: cz + 8 * scale, scale: 4 * scale },
    { asset: "planter", pack: "suburban", x: cx - 2 * scale, z: cz + 7 * scale, scale: 3.6 * scale },
  ];
}

const parks: CityObjectDefinition[] = [
  ...pocketPark(-58, -54, 0.9),
  ...pocketPark(59, -36, 0.85),
  ...pocketPark(-62, 55, 1),
  ...pocketPark(31, 58, 0.9),
];

const lotDetails: CityObjectDefinition[] = houses.flatMap((house, index) => {
  const side = index % 2 === 0 ? -1 : 1;
  const rear = Math.sin(house.rotationY ?? 0) === 0 ? (house.rotationY === 0 ? 1 : -1) : 0;

  return [
    {
      asset: index % 3 === 0 ? "tree-small" : "planter",
      pack: "suburban",
      x: house.x + side * 6,
      z: house.z + (rear === 0 ? side * 4 : rear * 5),
      scale: index % 3 === 0 ? 3.1 : 2.9,
    },
    {
      asset: index % 4 === 0 ? "fence-1x2" : "fence-low",
      pack: "suburban",
      x: house.x - side * 4,
      z: house.z + (rear === 0 ? -side * 5 : rear * 8),
      rotationY: index % 2 === 0 ? 0 : QUARTER_TURN,
      scale: 3,
    },
  ];
});

const neighborhoodEdges: CityObjectDefinition[] = [
  { asset: "fence-1x4", pack: "suburban", x: -83, z: -78, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: -50, z: -78, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: -17, z: -78, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: 22, z: -78, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: -76, z: 96, rotationY: HALF_TURN, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: -42, z: 96, rotationY: HALF_TURN, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: -8, z: 96, rotationY: HALF_TURN, scale: 4.2 },
  { asset: "fence-1x4", pack: "suburban", x: 28, z: 96, rotationY: HALF_TURN, scale: 4.2 },
  { asset: "tree-large", pack: "suburban", x: -104, z: -69, scale: 4.6 },
  { asset: "tree-small", pack: "suburban", x: -108, z: 12, scale: 3.8 },
  { asset: "tree-large", pack: "suburban", x: 106, z: -68, scale: 4.6 },
  { asset: "tree-small", pack: "suburban", x: 113, z: 42, scale: 3.8 },
];

const roadDecor: CityObjectDefinition[] = [
  { asset: "path-long", pack: "suburban", x: -28, z: -16, rotationY: QUARTER_TURN, scale: 4.2 },
  { asset: "path-long", pack: "suburban", x: 31, z: 16, rotationY: QUARTER_TURN, scale: 4.2 },
  { asset: "path-stones-messy", pack: "suburban", x: -3, z: 29, scale: 4 },
  { asset: "planter", pack: "suburban", x: -22, z: 4, scale: 3.2 },
  { asset: "planter", pack: "suburban", x: 19, z: 4, scale: 3.2 },
  { asset: "tree-small", pack: "suburban", x: -24, z: -4, scale: 3.5 },
  { asset: "tree-large", pack: "suburban", x: 19, z: -5, scale: 4 },
];

function isLoadableObject(definition: CityObjectDefinition) {
  return definition.pack !== "suburban";
}

const lots: LotDefinition[] = [
  ...amenities.map((building) => ({ x: building.x, z: building.z, width: 15, depth: 14 })),
];

export const cityLayout: CityLayout = {
  roadTiles: Array.from(roadTileMap.values()),
  lots,
  buildings: [...houses, ...amenities].filter(isLoadableObject),
  props: [
    ...driveways,
    ...amenityProps,
    ...parks,
    ...lotDetails,
    ...neighborhoodEdges,
    ...roadDecor,
  ].filter(isLoadableObject),
};

export const cityObjectCount =
  cityLayout.buildings.length + cityLayout.props.length;
export const cityRoadTileCount = cityLayout.roadTiles.length;
export const cityLotCount = cityLayout.lots.length;
export const suburbanHomeCount = cityLayout.buildings.filter(
  (building) => building.pack === "suburban",
).length;

export const cityMapWorldSize = {
  width: 235,
  depth: 205,
  tileSize: TILE_SIZE,
} as const;
