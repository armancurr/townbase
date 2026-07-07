# Centralize Shared Type Definitions

## Goal

Create a central `src/types/` layer for shared app and game type definitions. Keep runtime constants, asset loading, and behavior in their current feature modules.

## Proposed Structure

```text
src/types/
  index.ts
  game.ts
  ui.ts
```

## Move To `src/types/ui.ts`

Move the contents of `src/ui-types.ts` here:

- `SimulationMode`
- `ToolTestStep`
- `ToolTestStatus`

Use the correct relative Convex import from the new file:

```ts
import type { Doc } from "../../convex/_generated/dataModel";
```

After moving, remove `src/ui-types.ts` if no imports remain.

## Move To `src/types/game.ts`

Move shared game shape types here.

From `src/game/placed-assets.ts`:

- `TileRotation`
- `PlaceableAssetCategory`
- `AssetPack`
- `BakedAssetPack`
- `PlaceableAsset`
- `PlacedTile`

From `src/game/placeable-sprite-baker.ts`:

- `SpriteFootprint`
- `BakedPlaceableSprite`
- `BakedPlaceableSprites`

From `src/game/grid-world.ts`:

- `GridCell`
- `WorldPlace`
- `WorldModel`
- `ActionResult`

From `src/game/movement-game-config.ts`:

- `CellClickAction`
- `PlacementPreview`
- `MovementSceneData`

From `src/game/agent-brain.ts`:

- `CharacterActivity`
- `CharacterAgentState`
- `ChatMessage`
- `ConversationState`
- `AgentActionId`
- `AgentTaskId`
- `AgentTask`
- `AgentDecision`

From `src/game/player-brain.ts`:

- `PlayerBrainSnapshot`

## Add Barrel Export

Create `src/types/index.ts`:

```ts
export type * from "./game";
export type * from "./ui";
```

## Keep Runtime Code In Place

Do not move runtime constants, data loading, functions, or classes.

Keep these in `src/game/placed-assets.ts`:

- `assetPackLabels`
- `assetPackOrder`
- `bakedAssetPacks`
- `natureIsoModules`
- `natureIsoUrl`
- `placeableAssets`
- `placeableAssetsById`
- `placeableSpriteKey`

Keep these in `src/game/placeable-sprite-baker.ts`:

- `TARGET_DIAMOND_PX`
- `createSpriteStore`
- `bakeSprite`
- `bakePlaceableSprites`

Keep behavior/runtime logic in:

- `src/game/grid-world.ts`
- `src/game/movement-game-config.ts`
- `src/game/agent-brain.ts`
- `src/game/player-brain.ts`
- `src/game/isometric-movement-scene.ts`
- `src/game/sprite-cache.ts`

## Import Updates

Update type imports across `src/` to import shared types from `src/types`.

Examples:

```ts
import type { GridCell, PlacedTile, TileRotation } from "../types";
```

From files directly under `src/`:

```ts
import type { GridCell, PlacedTile, TileRotation } from "./types";
```

Preserve value imports from runtime modules. For example, keep this kind of split when both values and types are needed:

```ts
import { placeableSpriteKey, placeableAssets } from "./game/placed-assets";
import type { PlaceableAsset, PlacedTile, TileRotation } from "./types";
```

## Important Notes

- Use `import type` for type-only imports.
- Avoid circular runtime imports by keeping `src/types/*` type-only.
- Do not add backward compatibility re-exports unless needed to reduce churn temporarily.
- Prefer the smallest correct change.
- Use Bun for verification.
- Do not run the dev server.

## Suggested Verification

1. Check `package.json` for available scripts.
2. Run the typecheck script if present, for example `bun run typecheck`.
3. If there is no typecheck script, run `bun run build` or the closest existing static check.
4. Search for stale imports:

```sh
rg "ui-types|type .*from ['\"].*game/(placed-assets|placeable-sprite-baker|grid-world|movement-game-config|agent-brain|player-brain)" src
```

Expect value imports from game modules to remain; only shared type imports should move.
