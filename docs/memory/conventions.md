## [2026-07-07] Container install convention

- Learned: Container installs set `HUSKY=0` to keep Bun installs deterministic and avoid Husky trying to install hooks outside a Git checkout.
- Files: Dockerfile, docker-compose.yml
- Status: resolved

## [2026-07-07] Biome lint and format

- Learned: Biome is the single lint/format tool; generated, vendor/static asset, `.agents`, and `docs` paths are excluded from Biome checks.
- Files: package.json, biome.json, bun.lock
- Status: resolved
