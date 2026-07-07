import type { CharacterConfig, TileRotation } from "../../types";

export const DEFAULT_TILE_ROTATION: TileRotation = 180;
export const PLAYER_ROTATIONS: TileRotation[] = [0, 90, 180, 270];

const characterAssetBase = "/assets/kenney_blocky-characters_20";

export const CHARACTER_CONFIGS: CharacterConfig[] = [
	{
		id: "aria",
		name: "01",
		asset: {
			id: "characters:character-a",
			label: "Character A",
			category: "building",
			pack: "characters",
			previewUrl: `${characterAssetBase}/Previews/character-a.png`,
			modelUrl: `${characterAssetBase}/Models/GLB format/character-a.glb`,
		},
	},
	{
		id: "milo",
		name: "02",
		asset: {
			id: "characters:character-b",
			label: "Character B",
			category: "building",
			pack: "characters",
			previewUrl: `${characterAssetBase}/Previews/character-b.png`,
			modelUrl: `${characterAssetBase}/Models/GLB format/character-b.glb`,
		},
	},
	{
		id: "nora",
		name: "03",
		asset: {
			id: "characters:character-c",
			label: "Character C",
			category: "building",
			pack: "characters",
			previewUrl: `${characterAssetBase}/Previews/character-c.png`,
			modelUrl: `${characterAssetBase}/Models/GLB format/character-c.glb`,
		},
	},
];
