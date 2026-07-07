import type { Doc } from "../../convex/_generated/dataModel";
import type { PlaceableAsset } from "./game";

export type EditorTool = "explore" | "asset" | "remove";

export type PlaceKind = Doc<"tiles">["placeKind"];

export type TownState = {
	world: Doc<"worlds">;
	tiles: Doc<"tiles">[];
	places: Doc<"places">[];
	characters: Doc<"characters">[];
	actions: Doc<"agentActions">[];
	chatMessages: Doc<"chatMessages">[];
};

export type CharacterConfig = {
	id: string;
	name: string;
	asset: PlaceableAsset;
};
