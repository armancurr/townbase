export type TileRotation = 0 | 90 | 180 | 270;

export type PlaceableAssetCategory = "road" | "building" | "nature";

export type AssetPack =
  | "roads"
  | "commercial"
  | "industrial"
  | "suburban"
  | "nature"
  | "characters";

export type BakedAssetPack = "roads" | "commercial" | "industrial" | "suburban" | "characters";

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

export type SpriteFootprint = {
  cols: number;
  rows: number;
};

export type BakedPlaceableSprite = {
  canvas: HTMLCanvasElement;
  originX: number;
  originY: number;
  footprint: SpriteFootprint;
};

export type BakedPlaceableSprites = {
  sprites: Map<string, BakedPlaceableSprite>;
  diamondPx: number;
};

export type GridCell = {
  col: number;
  row: number;
};

export type WorldPlace = {
  id: string;
  kind: "home_or_building" | "work_site" | "nature_spot" | "road_patrol";
  label: string;
  entryCell: GridCell;
  tileId?: string;
};

export type WorldModel = {
  cols: number;
  rows: number;
  blockedCellKeys: Set<string>;
  occupiedCellKeys: Set<string>;
  home: WorldPlace;
  places: Record<WorldPlace["kind"], WorldPlace>;
};

export type ActionResult = { success: true; message?: string } | { success: false; reason: string };

export type CellClickAction = "place" | "erase";

export type PlacementPreview = {
  cells: GridCell[];
  isValid: boolean;
  intent: "place" | "remove";
  assetId?: string;
  rotation?: TileRotation;
  textureKey?: string;
  footprint?: SpriteFootprint;
};

export type MovementSceneData = {
  placedTiles: PlacedTile[];
  placeableSprites: BakedPlaceableSprites;
  characters: Array<{
    id: string;
    name: string;
    cell: GridCell;
    sprites: Map<TileRotation, BakedPlaceableSprite>;
  }>;
  allowKeyboardMovement: boolean;
  onCellClick: (col: number, row: number, action: CellClickAction) => void;
  getPlacementPreview: (col: number, row: number) => PlacementPreview | null;
};

export type CharacterActivity = "idle" | "moving" | "wandering" | "talking" | "waiting";

export type CharacterAgentState = {
  id: string;
  name: string;
  cell: GridCell;
  activity: CharacterActivity;
  conversationId: string | null;
  lastSpokeAt: number;
  chatCooldownUntil: number;
  currentTask: AgentTask | null;
  nextTaskAt: number;
};

export type ChatMessage = {
  id: string;
  fromCharacterId: string;
  fromName: string;
  target: "all" | string[];
  text: string;
  createdAt: number;
};

export type ConversationState = {
  id: string;
  participantIds: string[];
  speakerIndex: number;
  turnCount: number;
  maxTurns: number;
  lastMessageAt: number;
};

export type AgentActionId =
  | "visit_place"
  | "inspect_place"
  | "patrol_area"
  | "meet_character"
  | "wander"
  | "move_to_cell"
  | "say"
  | "wait"
  | "leave_conversation";

export type AgentTaskId = AgentActionId;

export type AgentTask = {
  taskId: AgentTaskId;
  target: GridCell | null;
  status: "active" | "pausing" | "complete";
  startedAt: number;
};

export type AgentDecision = {
  actionId: AgentActionId;
  reason: string;
  targetCell?: GridCell;
  targetCharacterId?: string;
  message?: string;
  target?: "all" | string[];
};

export type PlayerBrainSnapshot = {
  status: "paused" | "idle" | "moving" | "waiting" | "blocked";
  goal: "go_home" | "wander" | "wait";
  action: "none" | "pathfind" | "walk" | "wait";
  targetCell: GridCell | null;
  pathLength: number;
  lastMessage: string;
  isPaused: boolean;
};
