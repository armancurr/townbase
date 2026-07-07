import { isKnownAssetId, isTileRotation } from "../game/tile-utils";
import type { PlacedTile } from "../../types";

export const LOCAL_IMPORT_DONE_KEY = "townbase:convex-imported-local-tiles:v1";

const PLACED_TILES_STORAGE_KEY = "bystanderland:placed-tiles:v1";

export function loadLocalPlacedTiles() {
  const raw = window.localStorage.getItem(PLACED_TILES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((tile): tile is PlacedTile => {
      if (!tile || typeof tile !== "object") {
        return false;
      }
      const candidate = tile as Partial<PlacedTile>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.assetId === "string" &&
        isKnownAssetId(candidate.assetId) &&
        typeof candidate.col === "number" &&
        Number.isInteger(candidate.col) &&
        typeof candidate.row === "number" &&
        Number.isInteger(candidate.row) &&
        isTileRotation(candidate.rotation)
      );
    });
  } catch {
    return [];
  }
}
