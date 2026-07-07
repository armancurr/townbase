import type {
	AssetPack,
	BakedAssetPack,
	PlaceableAsset,
	PlaceableAssetCategory,
	TileRotation,
} from "../types";

const assetPackLabels: Record<AssetPack, string> = {
	roads: "Roads",
	commercial: "Commercial",
	industrial: "Industrial",
	suburban: "Suburban",
	nature: "Nature",
	characters: "Characters",
};

const assetPackOrder: AssetPack[] = [
	"roads",
	"commercial",
	"industrial",
	"suburban",
	"nature",
];

// Packs whose GLB models get baked into isometric sprites at runtime (see
// sprite-cache.ts). "nature" is excluded because Kenney already ships
// pre-rendered isometric sprites for it (see natureIsoModules below), so we
// skip the GLTF/WebGL baking step entirely for that pack.
const bakedAssetPacks: AssetPack[] = [
	"roads",
	"commercial",
	"industrial",
	"suburban",
];

const emptyPreview =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const assetBases = {
	roads: "/assets/kenney_city-kit-roads",
	commercial: "/assets/kenney_city-kit-commercial_2.1",
	industrial: "/assets/kenney_city-kit-industrial_1.0",
	suburban: "/assets/kenney_city-kit-suburban_20",
	characters: "/assets/kenney_blocky-characters_20",
} satisfies Record<BakedAssetPack, string>;

const modelNames = {
	roads: [
		"light-curved-cross",
		"light-curved-double",
		"light-curved",
		"road-bend-sidewalk",
		"road-bend-square",
		"road-bend",
		"road-bridge",
		"road-crossing",
		"road-crossroad-line",
		"road-crossroad-path",
		"road-crossroad",
		"road-curve-intersection",
		"road-curve-pavement",
		"road-curve",
		"road-driveway-double",
		"road-driveway-single",
		"road-end-round",
		"road-end",
		"road-intersection-line",
		"road-intersection-path",
		"road-intersection",
		"road-roundabout",
		"road-side-entry",
		"road-side-exit",
		"road-side",
		"road-slant-curve",
		"road-slant-flat-curve",
		"road-slant-flat-high",
		"road-slant-flat",
		"road-slant-high",
		"road-slant",
		"road-split",
		"road-square",
		"road-straight",
		"sign-highway-detailed",
		"sign-highway-wide",
		"sign-highway",
		"tile-high",
		"tile-low",
	],
	commercial: [
		"building-j",
		"building-m",
		"building-skyscraper-a",
		"building-skyscraper-b",
		"building-skyscraper-c",
		"building-skyscraper-d",
		"building-skyscraper-e",
	],
	industrial: [
		"building-a",
		"building-b",
		"building-c",
		"building-g",
		"building-m",
		"building-q",
		"building-r",
		"building-s",
		"building-t",
		"chimney-large",
		"chimney-medium",
		"detail-tank",
	],
	suburban: [
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
		"building-type-m",
		"building-type-n",
		"building-type-o",
		"building-type-p",
		"building-type-q",
		"building-type-s",
		"building-type-t",
		"building-type-u",
		"driveway-long",
		"fence-1x2",
		"fence-1x3",
		"fence-1x4",
		"fence-2x2",
		"fence-2x3",
		"fence-3x2",
		"fence-3x3",
		"path-stones-long",
		"planter",
		"tree-large",
		"tree-small",
	],
	characters: [],
} satisfies Record<BakedAssetPack, string[]>;

function publicRecord(paths: string[]): Record<string, string> {
	return Object.fromEntries(paths.map((path) => [path, path]));
}

function modelPath(pack: BakedAssetPack, name: string) {
	return `${assetBases[pack]}/Models/GLB format/${name}.glb`;
}

function previewPath(pack: BakedAssetPack, name: string) {
	return `${assetBases[pack]}/Previews/${name}.png`;
}

const modelModules: Record<BakedAssetPack, Record<string, string>> = {
	roads: publicRecord(modelNames.roads.map((name) => modelPath("roads", name))),
	commercial: publicRecord(
		modelNames.commercial.map((name) => modelPath("commercial", name)),
	),
	industrial: publicRecord(
		modelNames.industrial.map((name) => modelPath("industrial", name)),
	),
	suburban: publicRecord(
		modelNames.suburban.map((name) => modelPath("suburban", name)),
	),
	characters: {} as Record<string, string>,
};

const previewModules: Record<BakedAssetPack, Record<string, string>> = {
	roads: publicRecord(modelNames.roads.map((name) => previewPath("roads", name))),
	commercial: publicRecord(
		modelNames.commercial.map((name) => previewPath("commercial", name)),
	),
	industrial: publicRecord(
		modelNames.industrial.map((name) => previewPath("industrial", name)),
	),
	suburban: publicRecord(
		modelNames.suburban.map((name) => previewPath("suburban", name)),
	),
	characters: {} as Record<string, string>,
};

// Kenney's nature kit ships pre-rendered isometric sprites for every model,
// at four rotations (compass-suffixed). We use these directly instead of
// baking the GLTF models with three.js at runtime.
export const natureIsoModules: Record<string, string> = {};

const NATURE_ROTATION_SUFFIX: Record<TileRotation, string> = {
	0: "SW",
	90: "SE",
	180: "NE",
	270: "NW",
};

export function natureIsoUrl(assetName: string, rotation: TileRotation) {
	const suffix = NATURE_ROTATION_SUFFIX[rotation];
	const path = Object.keys(natureIsoModules).find((candidate) =>
		candidate.endsWith(`/${assetName}_${suffix}.png`),
	);
	return path ? natureIsoModules[path] : undefined;
}

function fileStem(path: string, extension: string) {
	return (
		path
			.split("/")
			.pop()
			?.replace(new RegExp(`\\.${extension}$`), "") ?? ""
	);
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

	if (pack === "nature") {
		return "nature";
	}

	return "building";
}

function previewUrlFor(pack: BakedAssetPack, assetName: string) {
	const previews = previewModules[pack];
	const expectedPath = Object.keys(previews).find((path) =>
		path.endsWith(`/${assetName}.png`),
	);
	if (expectedPath) {
		return previews[expectedPath];
	}

	const fallbackPath = Object.keys(previews).find((path) =>
		path.split("/").pop()?.startsWith(assetName),
	);
	return fallbackPath ? previews[fallbackPath] : emptyPreview;
}

function assetsForBakedPack(pack: BakedAssetPack): PlaceableAsset[] {
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

function natureAssetNames() {
	const names = new Set<string>();
	for (const path of Object.keys(natureIsoModules)) {
		const stem = fileStem(path, "png").replace(/_(NE|NW|SE|SW)$/, "");
		if (stem) {
			names.add(stem);
		}
	}
	return names;
}

function assetsForNaturePack(): PlaceableAsset[] {
	return Array.from(natureAssetNames())
		.map((assetName) => ({
			id: `nature:${assetName}`,
			label: titleCase(assetName),
			category: "nature" as const,
			pack: "nature" as const,
			modelUrl: natureIsoUrl(assetName, 0) ?? emptyPreview,
			previewUrl: natureIsoUrl(assetName, 0) ?? emptyPreview,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}

function assetsForPack(pack: AssetPack): PlaceableAsset[] {
	if (pack === "nature") {
		return assetsForNaturePack();
	}

	return assetsForBakedPack(pack);
}

export const placeableAssets: PlaceableAsset[] =
	assetPackOrder.flatMap(assetsForPack);

export const placeableAssetsById = new Map(
	placeableAssets.map((asset) => [asset.id, asset]),
);

export function placeableSpriteKey(
	assetId: string,
	rotation: TileRotation = 0,
) {
	return `placeable-sprite:${assetId}@${rotation}`;
}
