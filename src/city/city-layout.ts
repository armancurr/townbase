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
  | "detail-tank";

export type RoadDefinition = {
  x: number;
  z: number;
  width: number;
  length: number;
  orientation: "horizontal" | "vertical";
};

export type LotDefinition = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

export type CityObjectDefinition = {
  asset: CityAssetKey;
  x: number;
  z: number;
  rotationY?: number;
  scale?: number;
  variant?: "a" | "b" | "c";
};

export type CityLayout = {
  roads: RoadDefinition[];
  lots: LotDefinition[];
  buildings: CityObjectDefinition[];
  props: CityObjectDefinition[];
};

export const cityLayout: CityLayout = {
  roads: [
    { x: 0, z: -34, width: 7, length: 112, orientation: "horizontal" },
    { x: 0, z: 0, width: 8, length: 118, orientation: "horizontal" },
    { x: 0, z: 34, width: 7, length: 112, orientation: "horizontal" },
    { x: -38, z: 0, width: 7, length: 96, orientation: "vertical" },
    { x: 0, z: 0, width: 8, length: 104, orientation: "vertical" },
    { x: 38, z: 0, width: 7, length: 96, orientation: "vertical" },
  ],
  lots: [
    { x: -57, z: -51, width: 23, depth: 23 },
    { x: -19, z: -51, width: 25, depth: 23 },
    { x: 19, z: -51, width: 25, depth: 23 },
    { x: 57, z: -51, width: 23, depth: 23 },
    { x: -57, z: -17, width: 23, depth: 20 },
    { x: -19, z: -17, width: 25, depth: 20 },
    { x: 19, z: -17, width: 25, depth: 20 },
    { x: 57, z: -17, width: 23, depth: 20 },
    { x: -57, z: 17, width: 23, depth: 20 },
    { x: -19, z: 17, width: 25, depth: 20 },
    { x: 19, z: 17, width: 25, depth: 20 },
    { x: 57, z: 17, width: 23, depth: 20 },
    { x: -57, z: 51, width: 23, depth: 23 },
    { x: -19, z: 51, width: 25, depth: 23 },
    { x: 19, z: 51, width: 25, depth: 23 },
    { x: 57, z: 51, width: 23, depth: 23 },
  ],
  buildings: [
    { asset: "building-a", x: -58, z: -51, rotationY: 0, scale: 2.6, variant: "a" },
    { asset: "building-c", x: -18, z: -52, rotationY: Math.PI / 2, scale: 2.5, variant: "b" },
    { asset: "building-h", x: 20, z: -51, rotationY: Math.PI, scale: 2.4, variant: "c" },
    { asset: "building-k", x: 57, z: -52, rotationY: -Math.PI / 2, scale: 2.5, variant: "a" },
    { asset: "building-d", x: -58, z: -17, rotationY: Math.PI / 2, scale: 2.3, variant: "b" },
    { asset: "building-m", x: -20, z: -17, rotationY: 0, scale: 2.6, variant: "c" },
    { asset: "building-o", x: 20, z: -17, rotationY: -Math.PI / 2, scale: 2.5, variant: "a" },
    { asset: "building-f", x: 58, z: -17, rotationY: Math.PI, scale: 2.2, variant: "b" },
    { asset: "building-q", x: -58, z: 17, rotationY: Math.PI, scale: 2.4, variant: "c" },
    { asset: "building-b", x: -20, z: 17, rotationY: -Math.PI / 2, scale: 2.5, variant: "a" },
    { asset: "building-t", x: 20, z: 17, rotationY: 0, scale: 2.7, variant: "b" },
    { asset: "building-i", x: 58, z: 17, rotationY: Math.PI / 2, scale: 2.4, variant: "c" },
    { asset: "building-l", x: -58, z: 51, rotationY: -Math.PI / 2, scale: 2.4, variant: "a" },
    { asset: "building-e", x: -20, z: 51, rotationY: Math.PI, scale: 2.5, variant: "b" },
    { asset: "building-r", x: 20, z: 51, rotationY: Math.PI / 2, scale: 2.6, variant: "c" },
    { asset: "building-g", x: 58, z: 51, rotationY: 0, scale: 2.3, variant: "a" },
  ],
  props: [
    { asset: "chimney-large", x: -67, z: -41, scale: 2.6, variant: "b" },
    { asset: "detail-tank", x: -46, z: -60, rotationY: Math.PI / 3, scale: 2.1, variant: "c" },
    { asset: "chimney-medium", x: 9, z: -61, scale: 2.2, variant: "a" },
    { asset: "detail-tank", x: 47, z: -43, rotationY: Math.PI / 2, scale: 2.2, variant: "b" },
    { asset: "chimney-small", x: -48, z: -8, scale: 1.9, variant: "c" },
    { asset: "chimney-basic", x: 10, z: -8, scale: 2, variant: "a" },
    { asset: "detail-tank", x: 68, z: -25, rotationY: -Math.PI / 6, scale: 2, variant: "c" },
    { asset: "chimney-large", x: -69, z: 25, scale: 2.4, variant: "a" },
    { asset: "detail-tank", x: -8, z: 25, rotationY: Math.PI / 5, scale: 2, variant: "b" },
    { asset: "chimney-medium", x: 48, z: 8, scale: 2, variant: "c" },
    { asset: "detail-tank", x: -67, z: 60, rotationY: Math.PI / 4, scale: 2.2, variant: "a" },
    { asset: "chimney-small", x: 8, z: 60, scale: 2, variant: "b" },
    { asset: "detail-tank", x: 68, z: 43, rotationY: -Math.PI / 2, scale: 2.1, variant: "c" },
  ],
};

export const cityObjectCount = cityLayout.buildings.length + cityLayout.props.length;
