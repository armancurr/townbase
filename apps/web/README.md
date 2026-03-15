# townbase web

The Next.js web application for townbase — a workspace for teams to manage work, write docs, and review analytics.

## About

This is the main web interface for townbase. It provides:

- **Landing page** — Product overview and tool directory
- **Authentication** — Sign-in flow for workspace access
- **Dashboard** — Central hub for workspace activity
- **Notes** — Full GTD-style note management with inbox, tasks, process, and someday views

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **React 19** — Latest React with concurrent features
- **Tailwind CSS v4** — Utility-first styling
- **Bun** — Runtime and package management

## Development

```bash
# Install dependencies (from monorepo root)
bun install

# Start development server
bun run dev
```

The app runs at `http://localhost:3000`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with tool directory |
| `/sign-in` | Authentication screen |
| `/dashboard` | Workspace dashboard |
| `/notes` | Notes workspace (redirects to inbox) |
| `/notes/inbox` | Capture loose inputs |
| `/notes/tasks` | Active tasks and next actions |
| `/notes/process` | Process and organize inputs |
| `/notes/someday` | Parked ideas for later |

## Scripts

```bash
# Development
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint
bun run lint

# Type check
bun run check-types
```

## Project Structure

```
app/
├── (auth)/           # Auth group routes
│   └── sign-in/
├── (dashboard)/      # Dashboard group routes
│   └── dashboard/
├── (tools)/          # Tool group routes
│   └── notes/
│       ├── inbox/
│       ├── tasks/
│       ├── process/
│       └── someday/
├── layout.tsx        # Root layout with fonts
├── page.tsx          # Landing page
└── globals.css       # Global styles

components/
└── ui/               # shadcn/ui components

features/
└── notes/            # Notes feature components
    ├── components/
    └── hooks/

lib/
└── utils.ts          # Utility functions
```

## Notes

- Uses `next/font` for optimized font loading
- Built in standalone mode for Docker deployment
- React Compiler enabled for optimized builds
