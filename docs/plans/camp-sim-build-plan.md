# Camp Survival Sim — Phase 1 Build Plan

**Goal:** One character, one map, a full set of manually-triggered actions that work correctly. No AI yet. This phase proves the game mechanics before any agent touches them.

---

## Tech Stack

- **TypeScript** throughout, no plain JS
- **Phaser 3** (game engine, tile rendering, sprite animation, input)
- **easystar.js** (A\* pathfinding on the tile grid) — needed even for manual play, since "click to move" should path around obstacles
- **Vite** (bundler/dev server) with the React + TS template
- **React** for the DOM-layer HUD (stats, resources, action buttons, and later per-agent thought/debug panels)
- **Tailwind** for styling the HUD only — it cannot and does not touch anything Phaser draws inside the canvas
- Placeholder art first: colored circle/triangle for the character (facing direction = triangle point), simple tile-color forest (green = grass, brown = dirt path, blue = water, dark green = treeline). Swap in real sprites later — don't block on art.

---

## Architecture Split (read before writing any code)

Three layers, cleanly separated so Phase 2 (LLM tool-calling) is a drop-in, not a rewrite:

```
sim-state (plain TS objects)  <--reads/writes-->  actions (plain TS functions)
        ^                                              ^
  Phaser reads this to render                  Debug UI (React) buttons call these
  (sprite position, tints,                     later: LLM tool calls invoke the
  HUD numbers via subscription)                 exact same functions
```

- **`sim-state`**: a plain TS singleton module. No Phaser types, no React types. Just data (character stats, world resources, time of day). This is the shape that will later be serialized as LLM context.
- **`actions`**: plain exported TS functions (`gatherWood()`, `tendFire()`, ...) that read/mutate `sim-state` and return a result object (`{ success: boolean, reason?: string }`). No Phaser or React imports here either. Callable identically from a debug button or, later, a tool-call handler.
- **`game` (Phaser)**: owns rendering, input, animation, camera. Reads `sim-state` every frame to decide what to draw. Player clicks/keypresses get translated into calls to `actions`, not handled as game logic themselves.
- **`ui` (React + Tailwind)**: HUD overlay outside the canvas. Subscribes to `sim-state` (simple pub/sub or polling on a tick — no need for Redux/Zustand at this scale) and renders stat bars, resource counts, and action buttons that call `actions` directly.

Rule of thumb while building: if a file needs to `import Phaser`, it belongs in `game/`. If it needs to `import React`, it belongs in `ui/`. Everything else (`sim-state`, `actions`) should import neither.

---

## Folder Structure (kebab-case, scalable toward multi-agent + Phase 2 tools)

```
camp-sim/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                     # mounts React app + boots Phaser game instance
│   ├── sim-state/
│   │   ├── character-state.ts       # hunger, thirst, energy, warmth, safety, zone
│   │   ├── world-state.ts           # firewood, food, water, fire-lit, fire-timer, time-of-day
│   │   └── index.ts                 # exported singleton, combined state accessors
│   ├── actions/
│   │   ├── gather-wood.ts
│   │   ├── fetch-water.ts
│   │   ├── forage-food.ts
│   │   ├── tend-fire.ts
│   │   ├── cook.ts
│   │   ├── eat.ts
│   │   ├── drink.ts
│   │   ├── sleep.ts
│   │   ├── rest.ts
│   │   ├── idle.ts
│   │   └── index.ts                 # action registry (name -> fn), used by debug UI now, tool-calling later
│   ├── game/
│   │   ├── main-scene.ts            # Phaser Scene: loads map, places character, update loop
│   │   ├── tile-map.ts              # grid definition, zone regions, walkable/blocked tiles
│   │   ├── pathfinding.ts           # easystar.js setup/wrapper
│   │   ├── character-sprite.ts      # placeholder sprite, facing direction, tween-based movement
│   │   ├── day-night-cycle.ts       # time-of-day tint overlay, decay modifiers
│   │   └── game-config.ts           # Phaser.Game config object
│   ├── ui/
│   │   ├── hud-panel.tsx            # top-level HUD layout
│   │   ├── stat-bar.tsx             # reusable stat bar (hunger, thirst, etc.)
│   │   ├── resource-counter.tsx     # firewood/food/water counts
│   │   ├── action-button.tsx        # generic button wired to an action registry entry
│   │   └── debug-panel.tsx          # current zone, current action, raw state dump
│   ├── types/
│   │   ├── sim-types.ts             # shared TS types/interfaces (Stats, WorldResources, Zone, ActionResult)
│   │   └── action-types.ts          # ActionFn signature, action metadata (name, description, preconditions)
│   └── constants/
│       ├── zones.ts                 # zone names/coordinates
│       └── tuning.ts                # decay rates, action costs/yields — all magic numbers live here
└── assets/
    └── placeholders/                # swap for real sprite/tileset packs later
```

**Why this shape scales:**

- `sim-state/` and `actions/` stay agent-agnostic — going from 1 to 3 agents (man/woman/kid) later means each gets its own `character-state` instance keyed by ID, not a restructure.
- `actions/index.ts` as a registry is what becomes the Phase 2 tool schema — each entry can carry a name, description, and precondition check, which maps almost directly to an LLM function-calling spec.
- `constants/tuning.ts` isolated so balancing (how fast hunger decays, how much wood a `gather_wood` call yields) never requires touching logic files.
- `types/` centralized so `sim-state`, `actions`, `game`, and `ui` all agree on shape without circular imports.

---

## Phase 1A — Map & Viewport

- Build a tile grid (e.g. 40x30 tiles at 32px) representing a forest clearing.
- Zones to mark on the grid (just tile regions, no special logic yet):
  - Campsite center (tent + fire pit)
  - River / water source
  - Foraging area (berries/plants)
  - Treeline (firewood source)
  - Lookout point (optional, cosmetic for now)
- Camera: fixed or simple pan/zoom, viewport shows the whole clearing if possible.
- Walkable vs blocked tiles defined (e.g. can't walk into water, can't walk into dense trees).
- Deliverable: static map renders correctly in the browser viewport, zones visually distinguishable.

## Phase 1B — Single Character

- Place one character sprite at the campsite.
- Implement point-and-click (or WASD) movement:
  - Click a tile/zone → easystar computes path → character walks tile-by-tile with smooth tween, not teleport.
  - Character has a facing direction that updates with movement.
  - Idle animation/state when not moving.
- Deliverable: you can click anywhere walkable on the map and the character walks there naturally.

---

## Phase 1C — Manual Action Set

This is the core of the phase. Each action below should be triggerable **manually by you** (button in a debug UI panel, or keybind) once the character is in the right zone. Build and test them **one at a time**, in this order (roughly: simple state changes → resource interactions → dependent actions):

| #   | Action        | Preconditions                                   | Effect                                                          | Notes                                    |
| --- | ------------- | ----------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| 1   | `gather_wood` | at treeline                                     | +1 to firewood pile (world resource), small energy cost         | tests "world resource" concept           |
| 2   | `fetch_water` | at river                                        | +1 to water stock, small energy cost                            |                                          |
| 3   | `forage_food` | at foraging area                                | +1 to food stock, small energy cost                             |                                          |
| 4   | `tend_fire`   | at campsite, firewood > 0                       | consumes 1 firewood, fire "lit" state = true, warmth stat rises | fire should decay over time (burns down) |
| 5   | `cook`        | at campsite, food stock > 0, fire lit           | consumes food stock, produces "cooked meal"                     | tests dependency between two resources   |
| 6   | `eat`         | cooked meal available (or raw food as fallback) | hunger stat decreases, meal consumed                            |                                          |
| 7   | `drink`       | water stock > 0                                 | thirst stat decreases                                           |                                          |
| 8   | `sleep`       | at campsite (tent)                              | energy stat rises over time, only fast/safe if fire lit         | test day/night + safety interaction      |
| 9   | `rest`        | anywhere                                        | small energy regen, slower than sleep                           | lightweight fallback action              |
| 10  | `idle`        | anywhere                                        | no effect, just stands                                          | default/no-op state                      |

**Needs/stats to track on the character:** hunger, thirst, energy, warmth, safety (0-100 each, decay over time on a tick).
**World/shared state to track:** firewood pile, food stock, water stock, fire lit (bool) + fire timer, time of day (for day/night cycle).

Build a simple debug HUD panel showing: character's stats, world resource counts, current zone, current action — this is essential for you to verify each action is doing the right thing when you manually trigger it.

**Test criteria for Phase 1C completion:** you can walk the character around, manually trigger every action above via the debug UI, and watch stats/resources update correctly in real time. A full "day" (sped up if needed) should be survivable by manually doing: gather wood → tend fire → forage → cook → eat → fetch water → drink → sleep, in whatever order keeps stats from hitting 0.

---

## Phase 1D — Day/Night Cycle

- Simple time-of-day variable (e.g. 0–24 in-game hours, ticking on a timer).
- Visual tint shift (lighter/darker overlay) for day vs night.
- Night should increase decay rate of "safety" stat unless near a lit fire.
- This doesn't require new actions, just a modifier layered on existing stats — build after 1C works.

---

## Phase 2 — Wrap Actions as Callable Tools (next phase, not this build)

Once every action in the table above has been manually triggered and verified correct, each becomes a discrete function with:

- A clear name (matches the action column above)
- Explicit preconditions (checked before execution, return a fail reason if unmet — e.g. `"no firewood"`)
- A defined effect (deterministic state mutation)
- A short natural-language description (for an LLM to know when to call it)

This turns the debug-UI buttons into a tool schema (JSON function-calling format) that a small LLM can call instead of you clicking. The character, world state, and stat system don't change at all — only _who_ is calling the actions changes (you → model). This is why getting Phase 1 fully correct manually matters: it's the exact same action surface the agent will use later.

---

## Explicit Non-Goals for This Phase

- No multiple agents yet (man/woman/kid comes after single-agent loop is solid)
- No LLM/decision-making yet
- No real art assets required to start (placeholders are fine)
- No memory system yet (that's Phase 3, once multiple agents need to react to each other)
