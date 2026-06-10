# ASCII Village God-Sim Plan

## 1. Core Idea

This project is a cozy survival village simulator with an ASCII world.

The user is not a mayor, commander, or direct controller. The user is a god-like provider who can give resources, place basic infrastructure, and observe how villagers respond.

The village starts with a small group of pre-spawned people. The first version does not need birth, death, family trees, or long-term dynasties. The goal is to make the first village feel alive while the site is open.

The core fantasy:

> "I gave them food, water, wood, and shelter. Then I watched them figure out how to survive."

The villagers should feel like tiny people, not numbers. They move around, choose tasks, get hungry, rest, gather, build, and react to the resources the user provides.

The world only progresses while the site is running. There is no background process and no offline simulation.

---

## 2. Updated Product Direction

The new experience is:

- the user opens the game
- the village starts running live
- days pass while the user watches
- villagers act every few seconds
- the user provides resources or places simple infrastructure
- villagers decide how to use what exists
- the village visually changes through ASCII buildings, paths, storage, farms, fires, and gathering spots

This should feel like a tiny living diorama.

---

## 3. Player Role

The player is a god-like provider.

The player can:

- give basic resources
- place early infrastructure
- inspect villagers
- inspect buildings and resources
- watch village events
- toggle sentience for selected villagers
- possibly tweak villager stats later

The player cannot directly command villagers.

Bad:

```txt
Tell Mira to chop wood.
Tell Arun to build a hut.
Tell Dev to eat.
```

Good:

```txt
Provide wood.
Place a hut blueprint.
Provide berries.
Add a water source.
Watch villagers decide what matters.
```

The fun comes from indirect control. The user creates conditions, then villagers respond.

---

## 4. Village Start

The world should begin with a cozy but fragile starting scene.

MVP start:

- one generated village
- a small map
- a small group of pre-spawned villagers
- basic terrain
- no large civilization yet
- no complex economy yet

The original idea was one man and one woman. That can remain as the default origin story, but for the MVP it is better to support a small starting group so the village has visible activity immediately.

Recommended MVP starting population:

- 4 to 8 villagers
- each with a name
- each with basic stats
- each with a current need
- each with a visible position on the ASCII map
- each with a simple personality tag

Example starting villagers:

```txt
Aren - careful, hungry, good at gathering
Mira - calm, tired, good at building
Tovin - curious, thirsty, good at exploring
Lena - social, healthy, good at organizing
```

The village should begin with almost nothing:

- a campfire
- a rough storage pile
- open land
- trees nearby
- water nearby or a place where the user can provide water
- no permanent homes yet

---

## 5. Sentience Toggle

Not every villager needs to be AI-driven all the time.

Each villager should have a `sentient` toggle.

When sentience is off:

- the villager uses normal simulation logic
- decisions are fast and cheap
- behavior is based on needs, traits, and available tasks
- no AI model call is needed

When sentience is on:

- the villager can make richer decisions
- the villager can produce short thoughts
- the villager can choose between possible tasks with more personality
- the villager can remember important moments
- AI calls still stay limited

This gives the project a strong feature without making it expensive or chaotic.

Sentience should feel special. A sentient villager is not just "smarter"; they should feel more individual.

Example:

```txt
Mira is sentient.
Thought: "The others keep eating before we store enough. I should help build shelter before night."
Chosen action: work_on_shelter
```

Non-sentient villagers still act normally:

```txt
Aren is hungry.
Chosen action: eat_from_storage
```

---

## 6. Villager Stats

Villagers should survive based on personal stats.

MVP stats:

- hunger
- thirst
- energy
- health
- mood
- warmth/shelter
- current task
- location

Useful later stats:

- age
- fear
- trust
- loneliness
- skill levels
- relationships
- beliefs
- personality traits
- memory

Stats should be readable but not become the whole UI. The player should mostly understand villagers through visible behavior and small event text.

Example:

```txt
Mira
Status: tired but stable
Need: rest
Task: sleeping near the fire
Mood: calm
Sentient: on
```

Avoid turning the game into a spreadsheet.

---

## 7. Daily Time System

The game runs in days.

Days should pass quickly enough that the user sees progress during one short session.

Recommended MVP timing:

- every few seconds, villagers evaluate or continue actions
- after enough ticks, the day ends
- each day has morning, afternoon, evening, and night
- the village state is saved continuously in Convex

Example pacing:

```txt
1 real second = 1 village tick
20 village ticks = 1 village day
5 ticks morning
5 ticks afternoon
5 ticks evening
5 ticks night
```

This can be tuned later. The important part is that something visible happens while the user watches.

---

## 8. Villager Decision Loop

Villagers should not make AI calls every second.

Each villager should have a lightweight behavior loop:

1. Check urgent needs.
2. Continue current task if it still makes sense.
3. If no task or task is blocked, choose a new task.
4. If sentience is off, use normal rules.
5. If sentience is on, optionally ask the AI model to choose from a small list of valid actions.
6. Execute the selected task through controlled tool-like actions.
7. Save the result.
8. Add important events to the village log.

The AI should never freely invent world changes.

It should choose from valid actions such as:

- eat
- drink
- rest
- gather_wood
- gather_food
- fetch_water
- build_shelter
- repair_shelter
- warm_by_fire
- move_to
- help_villager
- store_resource
- idle_near_fire

This keeps the simulation stable.

---

## 9. AI Call Strategy

AI calls should be minimal and meaningful.

Use AI only when:

- a sentient villager needs a new task
- a sentient villager has multiple valid choices
- a major event affects them
- the player inspects their thoughts
- a memory should be summarized

Do not use AI for:

- movement every second
- stat decay
- hunger/thirst math
- basic pathing
- every tiny resource update
- every non-sentient villager

The AI prompt should include only compact context:

- villager name
- personality
- current stats
- current location
- nearby resources/buildings
- village situation
- valid actions only
- recent memories

The response should be structured:

```txt
chosen_action
short_reason
optional_thought
```

The game should validate the action before applying it.

---

## 10. God Gifts

For MVP, god gifts are unlimited.

The player can provide:

- food
- water
- wood
- stone
- firewood
- basic tools
- medicine/herbs
- cloth/fur

The player can also place simple infrastructure:

- campfire
- storage pile
- hut blueprint
- well/water point
- farm plot
- workshop area
- path

MVP should keep this simple. The player should have a small provider panel with obvious buttons.

Example:

```txt
Give Food
Give Water
Give Wood
Give Stone
Place Hut
Place Campfire
Place Storage
```

Resources should appear in the village world, not just in a number counter. If the player gives wood, villagers should be able to walk to the storage pile or resource drop.

---

## 11. Core Survival Loop

The village loop:

1. Villagers wake up.
2. Their needs decay over time.
3. Villagers choose tasks.
4. User notices shortages.
5. User provides resources or infrastructure.
6. Villagers use what was provided.
7. Buildings improve survival.
8. The day ends.
9. The village log summarizes what happened.

The player should feel useful without needing to micromanage.

Example session:

```txt
Day 1 morning:
The villagers gather around the fire.

Day 1 afternoon:
Food is low. Aren starts searching the trees.

Player gives food.

Day 1 evening:
Mira carries wood to the hut frame.
Tovin drinks from the water jar.

Day 1 night:
Two villagers sleep by the fire. Shelter is still unfinished.
```

---

## 12. ASCII World

The ASCII world is still the main visual identity.

The map should show:

- villagers
- terrain
- resources
- campfire
- storage pile
- hut frames
- finished huts
- paths
- farms
- water
- trees

ASCII should not be a decorative background. It should be the game board.

Villagers can be represented with small symbols or tiny labeled figures:

```txt
 o
/|\
/ \
```

For dense maps, use compact markers:

```txt
@A  Aren
@M  Mira
@T  Tovin
```

The map should visually change as villagers act.

Examples:

- wood pile grows when wood is gathered
- hut frame becomes a hut
- paths appear from repeated walking
- campfire burns low at night
- villagers gather near warmth
- storage appears full or empty

---

## 13. UI Layout

Recommended MVP layout:

```txt
┌──────────────────────────────────────────────────────────────┐
│ DAY 4 - EVENING        Cozy survival village        Stable   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                  LARGE ASCII VILLAGE MAP                     │
│                                                              │
├───────────────────────────────┬──────────────────────────────┤
│ GOD GIFTS                     │ SELECTED VILLAGER            │
│ Give Food                     │ Name: Mira                   │
│ Give Water                    │ Status: tired but safe       │
│ Give Wood                     │ Task: building hut           │
│ Place Campfire                │ Sentient: on/off             │
│ Place Hut                     │ Thought: ...                 │
├───────────────────────────────┼──────────────────────────────┤
│ VILLAGE LOG                   │ RESOURCES / BUILDINGS        │
│ Day 4: Mira worked on a hut.  │ Food: 12  Water: 8           │
│ Day 4: Aren ate berries.      │ Wood: 20  Huts: 1            │
└───────────────────────────────┴──────────────────────────────┘
```

The map should be the largest element. The UI should support observation and intervention.

---

## 14. Backend And Persistence

Use Convex as the backend and database.

Convex should store:

- worlds
- villagers
- villager stats
- villager sentience toggle
- resources
- buildings
- map tiles
- active tasks
- events
- memories
- player actions

The frontend should subscribe to live state from Convex.

When the player gives a resource:

1. frontend sends the gift action
2. Convex records the player action
3. Convex updates village resources or map objects
4. villagers can react on the next simulation tick

When simulation ticks:

1. current world state is loaded
2. villager needs update
3. villager tasks progress
4. new tasks are chosen if needed
5. AI is called only for sentient villagers when required
6. state changes are saved
7. important events are logged

No offline progression is required.

---

## 15. Data Model

Conceptual data model:

```txt
World
- id
- name
- day
- phase
- status
- createdAt
- updatedAt

Villager
- id
- worldId
- name
- symbol
- sentient
- personality
- stats
- skills
- location
- currentTask
- taskStartedAt
- memorySummary
- lastDecisionAt

Resource
- id
- worldId
- type
- amount
- location

Building
- id
- worldId
- type
- status
- progress
- location

Tile
- worldId
- x
- y
- terrain
- object
- discovered

Event
- id
- worldId
- day
- phase
- type
- text
- villagerIds

PlayerAction
- id
- worldId
- type
- payload
- createdAt
```

Keep render output out of the database. Store logical state, then render ASCII from that state.

---

## 16. Tools / Actions

Villagers should perform controlled actions.

These are not open-ended. They are allowed simulation operations.

MVP actions:

- move
- eat
- drink
- rest
- gather_food
- gather_wood
- carry_resource
- store_resource
- build
- warm_up
- idle

Each action has:

- requirements
- duration
- stat effects
- resource effects
- possible event text

Example:

```txt
Action: build
Requires: wood, unfinished building, enough energy
Duration: multiple ticks
Effects: building progress increases, energy decreases
Event: "Mira added new beams to the hut frame."
```

This keeps AI decisions grounded in actual game rules.

---

## 17. MVP Scope

Required MVP:

- Convex-backed world state
- one active village
- pre-spawned villagers
- villager stats
- live day/tick loop while site is open
- ASCII village map
- god gift panel
- basic resources
- basic buildings
- villagers choose their own tasks
- sentience toggle per villager
- AI-assisted decisions for sentient villagers only
- village event log
- selected villager panel
- save/load through backend

Not required for MVP:

- birth
- death
- children
- aging
- combat
- disease
- trading
- multiple villages
- offline simulation
- multiplayer
- complex economy
- advanced pathfinding
- full relationship system
- procedural world history

---

## 18. Implementation Phases

### Phase 1 - Static ASCII Village

Goal: prove the visual style.

Build:

- static ASCII map
- basic terrain
- campfire
- storage pile
- a few villagers
- side panels for gifts, villagers, and log

Success condition:

The first screen already feels like a cozy survival village.

### Phase 2 - Convex World State

Goal: make the village real and persistent.

Build:

- world record
- villagers
- resources
- buildings
- events
- frontend subscriptions
- player gift mutations

Success condition:

Giving food or wood updates the live village state and persists after refresh.

### Phase 3 - Tick Loop

Goal: make the village move.

Build:

- live tick while page is open
- day/phase progression
- stat decay
- task progress
- simple event logging

Success condition:

Villagers need food, water, rest, and warmth over time.

### Phase 4 - Rule-Based Villager Decisions

Goal: make non-sentient villagers useful.

Build:

- needs-based task selection
- basic task queue
- action validation
- resource usage
- building progress

Success condition:

Villagers survive and build without direct commands.

### Phase 5 - Sentience Toggle

Goal: add optional AI personality.

Build:

- sentience on/off per villager
- compact AI decision prompt
- valid action list
- structured AI response
- action validation
- short thought text

Success condition:

Turning sentience on makes a villager feel more personal without breaking the simulation.

### Phase 6 - Village Polish

Goal: make the toy memorable.

Build:

- better ASCII assets
- visible task animations
- day/night presentation
- clearer event writing
- villager inspection
- resource/building visual changes
- cozy UI styling

Success condition:

Watching the village for five minutes is fun even without optimizing anything.

---

## 19. Design Rules

Do not make it a stats dashboard.

The player should understand the village through:

- villagers moving
- buildings changing
- resources appearing and disappearing
- event text
- villager thoughts
- visible day/night rhythm

Keep direct control limited.

The player gives. Villagers decide.

Keep AI controlled.

AI chooses from valid actions. The simulation applies consequences.

Keep the tone cozy but survival-focused.

Villagers can struggle, but the game should not feel cruel in MVP.

---

## 20. Final Product Identity

Best description:

> A cozy ASCII god-sim where you provide for a tiny village and watch its people survive.

Alternate descriptions:

> A live ASCII village where people decide how to use your gifts.

> A tiny survival settlement powered by villagers, not commands.

> A god-provider village sim with optional AI sentience.

