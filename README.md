<div align="center">

<img src="./apps/web/public/favicon.svg" width="120" height="120" alt="Townbase logo">

# townbase

> A singular workspace housing every tool you need. Built for depth, designed for focus.

</div>

## About

Townbase is a Bun-powered Next.js workspace app prototype for teams that want a single place to manage work, write docs, and review analytics. It uses Turborepo for the monorepo workflow and Docker for production-style local runs.

## Stack

- **Bun** — Package management and production runtime
- **Next.js** — App Router for the web application
- **Turborepo** — Monorepo workflow orchestration
- **Docker** — Production-style local runs

## Quick Start

### Prerequisites

- Bun `1.3.10` or higher
- Docker (optional, for containerized runs)

### Run locally

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

Open `http://localhost:3000`.

### Run with Docker

```bash
# Build and run with Docker
docker build -t townbase-web .
docker run --rm -p 3000:3000 townbase-web
```

Or use Docker Compose:

```bash
# Start
docker compose up --build

# Stop
docker compose down
```

## Development

### Available routes

| Route | Description |
|-------|-------------|
| `/` | Landing page for the workspace product |
| `/sign-in` | Authentication screen |
| `/dashboard` | Dashboard placeholder |
| `/notes` | Notes workspace with inbox, tasks, process, and someday views |

### Useful commands

```bash
# Lint all packages
bun run lint

# Format code
bun run format

# Type check
bun run check-types

# Build for production
bun run build
```

## Project structure

```text
townbase
├── apps
│   └── web
│       ├── Next.js 16 with App Router
│       ├── React 19
│       └── Tailwind CSS v4
├── packages
│   ├── typescript-config
│   └── ui
├── Dockerfile
└── docker-compose.yml
```

## Notes

- The production image uses `oven/bun:1.3.10-alpine` as the runtime
- The Next.js app is built in standalone mode for smaller image size
- The build stage uses Node.js for compatibility, while the final server runs on Bun
