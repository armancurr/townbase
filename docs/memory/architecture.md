## [2026-07-07] Static production container

- Learned: Production Docker builds compile the Vite app with Bun, then serve `dist` from nginx with SPA fallback and immutable asset caching.
- Files: Dockerfile, nginx.conf, .dockerignore
- Status: resolved

## [2026-07-07] Frontend-only compose

- Learned: Local Docker Compose intentionally runs only the Vite frontend; Convex dev remains a separate host process or external deployment URL via `VITE_CONVEX_URL`.
- Files: docker-compose.yml, README.md
- Status: resolved

## [2026-07-07] Packaged static CLI

- Learned: The npm binary serves the built `dist` app with Node's HTTP server so published installs can run with `npx townbase` or `bunx townbase`.
- Files: package.json, bin/townbase.js, README.md
- Status: resolved
