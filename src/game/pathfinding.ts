import EasyStar from "easystarjs";
import type { CampTile } from "./tile-map";

const WALKABLE = 0;
const BLOCKED = 1;

export class Pathfinder {
  private readonly easyStar = new EasyStar.js();

  constructor(map: CampTile[][]) {
    this.easyStar.setGrid(map.map((row) => row.map((tile) => (tile.walkable ? WALKABLE : BLOCKED))));
    this.easyStar.setAcceptableTiles([WALKABLE]);
    this.easyStar.disableDiagonals();
  }

  findPath(startX: number, startY: number, endX: number, endY: number) {
    return new Promise<Array<{ x: number; y: number }> | null>((resolve) => {
      this.easyStar.findPath(startX, startY, endX, endY, (path) => resolve(path));
      this.easyStar.calculate();
    });
  }
}
