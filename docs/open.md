## [2026-07-07] Missing nature asset pack after public move
- Why/non-obvious: Nature placeables depend on `kenney_nature-kit/Isometric` sprites, but only roads/commercial/industrial/suburban/characters exist under `public/assets`; public assets cannot be discovered with source globs at build time.
- Files: src/game/placed-assets.ts, public/assets
- Status: open
