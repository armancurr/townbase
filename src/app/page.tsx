import { Blacksmith } from "./town/buildings/blacksmith";
import { Chapel } from "./town/buildings/chapel";
import { GuildHall } from "./town/buildings/guild-hall";
import { MarketSquare } from "./town/buildings/market-square";
import { OldForest } from "./town/buildings/old-forest";
import { RowHouses } from "./town/buildings/row-houses";
import { SacredGrove } from "./town/buildings/sacred-grove";

const BUILDINGS = [
  { name: "Blacksmith", block: Blacksmith },
  { name: "Old Forest", block: OldForest },
  { name: "Guild Hall", block: GuildHall },
  { name: "Row Houses", block: RowHouses },
  { name: "Market Square", block: MarketSquare },
  { name: "Chapel", block: Chapel },
  { name: "Sacred Grove", block: SacredGrove },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-auto bg-black p-8 text-white">
      <div className="grid w-max grid-cols-3 items-start gap-x-16 gap-y-14">
        {BUILDINGS.map((building) => (
          <figure key={building.name} className="min-w-max">
            <figcaption className="mb-3 text-[11px] uppercase tracking-[0.4em] text-white">
              {building.name}
            </figcaption>
            <pre className="whitespace-pre font-mono text-[13px] leading-[1.45] text-white">
              {building.block.length > 0
                ? building.block.join("\n")
                : "[ empty lot ]"}
            </pre>
          </figure>
        ))}
      </div>
    </main>
  );
}
