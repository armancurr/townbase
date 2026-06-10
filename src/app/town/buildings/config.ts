import type { AsciiBlock } from "../types";
import { TownHall } from "./town-hall";
import { Hospital } from "./hospital";
import { School } from "./school";
import { College } from "./college";
import { Supermarket } from "./supermarket";
import { ClothingStore } from "./clothing-store";
import { Salon } from "./salon";
import { Bank } from "./bank";
import { Diner } from "./diner";
import { Cafe } from "./cafe";
import { Bakery } from "./bakery";

type BuildingConfig = {
  name: string;
  block: AsciiBlock;
};

export const BUILDINGS = [
  { name: "Town Hall", block: TownHall },
  { name: "Hospital", block: Hospital },
  { name: "School", block: School },
  { name: "College", block: College },
  { name: "Supermarket", block: Supermarket },
  { name: "Clothing Store", block: ClothingStore },
  { name: "Salon", block: Salon },
  { name: "Bank", block: Bank },
  { name: "Diner", block: Diner },
  { name: "Cafe", block: Cafe },
  { name: "Bakery", block: Bakery },
] satisfies BuildingConfig[];
