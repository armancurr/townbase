import type { AsciiBlock } from "../types";
import { Bank } from "./bank";
import { Cafe } from "./cafe";
import { College } from "./college";
import { Diner } from "./diner";
import { Hospital } from "./hospital";
import { School } from "./school";
import { TownHall } from "./town-hall";

type BuildingConfig = {
  name: string;
  block: AsciiBlock;
};

export const BUILDINGS = [
  { name: "Town Hall", block: TownHall },
  { name: "Bank", block: Bank },
  { name: "Hospital", block: Hospital },
  { name: "School", block: School },
  { name: "College", block: College },
  { name: "Cafe", block: Cafe },
  { name: "Diner", block: Diner },
] satisfies BuildingConfig[];
