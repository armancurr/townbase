export type TileRotation = 0 | 90 | 180 | 270;

export type PlaceableAssetCategory = "road" | "building";

export type AssetPack =
  | "roads"
  | "commercial"
  | "industrial";

export type PlaceableAsset = {
  id: string;
  label: string;
  category: PlaceableAssetCategory;
  pack: AssetPack;
  previewUrl: string;
  modelUrl: string;
};

export type PlacedTile = {
  id: string;
  assetId: string;
  col: number;
  row: number;
  rotation: TileRotation;
};

export const assetPackLabels: Record<AssetPack, string> = {
  roads: "Roads",
  commercial: "Commercial",
  industrial: "Industrial",
};

export const assetPackOrder: AssetPack[] = [
  "roads",
  "commercial",
  "industrial",
];

const emptyPreview =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const modelModules = {
  roads: import.meta.glob("../../assets/kenney_city-kit-roads/Models/GLB format/*.glb", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>,
  commercial: import.meta.glob(
    "../../assets/kenney_city-kit-commercial_2.1/Models/GLB format/*.glb",
    { query: "?url", import: "default", eager: true },
  ) as Record<string, string>,
  industrial: import.meta.glob(
    "../../assets/kenney_city-kit-industrial_1.0/Models/GLB format/*.glb",
    { query: "?url", import: "default", eager: true },
  ) as Record<string, string>,
} satisfies Record<AssetPack, Record<string, string>>;

const previewModules = {
  roads: import.meta.glob("../../assets/kenney_city-kit-roads/Previews/*.png", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>,
  commercial: import.meta.glob("../../assets/kenney_city-kit-commercial_2.1/Previews/*.png", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>,
  industrial: import.meta.glob("../../assets/kenney_city-kit-industrial_1.0/Previews/*.png", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>,
} satisfies Record<AssetPack, Record<string, string>>;

function fileStem(path: string, extension: string) {
  return path.split("/").pop()?.replace(new RegExp(`\\.${extension}$`), "") ?? "";
}

function titleCase(asset: string) {
  return asset
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryForPack(pack: AssetPack): PlaceableAssetCategory {
  if (pack === "roads") {
    return "road";
  }

  return "building";
}

function previewUrlFor(pack: AssetPack, assetName: string) {
  const previews = previewModules[pack];
  const expectedPath = Object.keys(previews).find((path) => path.endsWith(`/${assetName}.png`));
  if (expectedPath) {
    return previews[expectedPath];
  }

  const fallbackPath = Object.keys(previews).find((path) =>
    path.split("/").pop()?.startsWith(assetName),
  );
  return fallbackPath ? previews[fallbackPath] : emptyPreview;
}

function assetsForPack(pack: AssetPack): PlaceableAsset[] {
  return Object.entries(modelModules[pack])
    .map(([path, modelUrl]) => {
      const assetName = fileStem(path, "glb");
      return {
        id: `${pack}:${assetName}`,
        label: titleCase(assetName),
        category: categoryForPack(pack),
        pack,
        modelUrl,
        previewUrl: previewUrlFor(pack, assetName),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const placeableAssets: PlaceableAsset[] = assetPackOrder.flatMap(assetsForPack);

export const placeableAssetsById = new Map(
  placeableAssets.map((asset) => [asset.id, asset]),
);

export function placeableSpriteKey(assetId: string, rotation: TileRotation = 0) {
  return `placeable-sprite:${assetId}@${rotation}`;
}
