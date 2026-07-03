import type { Zone } from "../types/sim-types";

export interface ZoneBounds {
  zone: Zone;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const ZONE_BOUNDS: ZoneBounds[] = [
  { zone: "campsite", minX: 17, maxX: 22, minY: 12, maxY: 17 },
  { zone: "river", minX: 2, maxX: 7, minY: 0, maxY: 29 },
  { zone: "forage", minX: 27, maxX: 35, minY: 18, maxY: 26 },
  { zone: "treeline", minX: 30, maxX: 39, minY: 2, maxY: 12 },
  { zone: "lookout", minX: 10, maxX: 15, minY: 3, maxY: 8 },
];

export function zoneForTile(tileX: number, tileY: number): Zone {
  return (
    ZONE_BOUNDS.find(
      (bounds) =>
        tileX >= bounds.minX &&
        tileX <= bounds.maxX &&
        tileY >= bounds.minY &&
        tileY <= bounds.maxY,
    )?.zone ?? "clearing"
  );
}
