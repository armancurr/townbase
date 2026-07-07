import type { CharacterConfig, TileRotation } from "../../types";

export const DEFAULT_TILE_ROTATION: TileRotation = 180;
export const PLAYER_ROTATIONS: TileRotation[] = [0, 90, 180, 270];

export const CHARACTER_CONFIGS: CharacterConfig[] = [
	{
		id: "aria",
		name: "01",
		asset: {
			id: "characters:character-a",
			label: "Character A",
			category: "building",
			pack: "characters",
			previewUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Previews/character-a.png",
				import.meta.url,
			).href,
			modelUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Models/GLB format/character-a.glb",
				import.meta.url,
			).href,
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
			previewUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Previews/character-b.png",
				import.meta.url,
			).href,
			modelUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Models/GLB format/character-b.glb",
				import.meta.url,
			).href,
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
			previewUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Previews/character-c.png",
				import.meta.url,
			).href,
			modelUrl: new URL(
				"../../../assets/kenney_blocky-characters_20/Models/GLB format/character-c.glb",
				import.meta.url,
			).href,
		},
	},
];
