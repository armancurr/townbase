# Townbase Tool-Oriented Next.js Structure

## Summary

Structure the app so each tool owns one top-level route segment and an isolated feature module, while shared UI, domain contracts, and cross-tool primitives live in workspace packages.

Given the current repo shape:

- Keep the Next app in `apps/web`
- Keep reusable presentational UI in `packages/ui`
- Add tool-oriented boundaries inside `apps/web/src`
- Use route groups for app shells, not for feature ownership
- Treat `/notes` as the first tool, but design the layout so `/chat`, `/calendar`, `/finance`, etc. can be added without reshuffling the repo

This matches your stated goals:

- Tools feel isolated
- All tools use the same database
- Data can flow between tools later
- Folder structure stays sane as the number of tools grows

## Recommended Structure

### 1. Route structure in `apps/web/src/app`

Use route segments as the public tool boundary.

```text
apps/web/src/app
  /(marketing)
    page.tsx
    layout.tsx
  /(auth)
    sign-in/page.tsx
    layout.tsx
  /(tools)
    layout.tsx
    notes/
      page.tsx
      loading.tsx
      error.tsx
      new/page.tsx
      [noteId]/page.tsx
      [noteId]/edit/page.tsx
      settings/page.tsx
    chat/
      page.tsx
  api/
    ...
  layout.tsx
  globals.css
  not-found.tsx
  error.tsx
```

Rules:

- Public URL = tool name: `/notes`, `/chat`
- Route group `(tools)` provides the shared authenticated app shell
- Each tool can own nested routes under its segment
- Do not put tool business logic directly inside route files beyond page composition, metadata, and small route-specific concerns

### 2. Feature structure in `apps/web/src/features`

Each tool gets one feature directory that owns its domain, server access, and UI composition.

```text
apps/web/src/features
  notes/
    components/
      note-list.tsx
      note-editor.tsx
      note-toolbar.tsx
      notes-empty-state.tsx
    server/
      queries.ts
      mutations.ts
      mappers.ts
    lib/
      note-tree.ts
      note-filters.ts
      note-search.ts
    hooks/
      use-note-selection.ts
      use-note-drafts.ts
    types.ts
    constants.ts
    validators.ts
    index.ts
  chat/
    ...
```

Rules:

- `components/`: tool-specific UI only
- `server/`: server-only reads/writes for that tool
- `lib/`: pure utilities for the tool
- `hooks/`: client hooks for the tool
- `types.ts` and `validators.ts`: local contracts and validation stay close to the feature
- `index.ts`: explicit exports for route files and other consumers

This is the main cleanliness lever: routes stay thin, features stay isolated.

### 3. Shared app-level code in `apps/web/src`

Only keep code here if it is app-wide, not tool-specific.

```text
apps/web/src
  app/
  components/
    shell/
      app-sidebar.tsx
      topbar.tsx
    providers/
      theme-provider.tsx
      query-provider.tsx
  lib/
    auth/
    db/
    env/
    routing/
  styles/
  features/
```

Rules:

- `src/components/ui` should stay generic if you continue to keep some UI local
- `src/components/shell` is for cross-tool layout chrome
- `src/lib/db` is for shared database client/config only, not feature queries
- Avoid a giant `src/lib/utils` pattern for feature logic

### 4. Workspace package boundaries

Use packages only for code with a clear cross-tool reuse case.

Recommended package expansion:

```text
packages/
  ui/
    src/
      ...
  domain/
    src/
      notes.ts
      tasks.ts
      links.ts
      ids.ts
  db/
    src/
      client.ts
      schema/
      shared-types.ts
  typescript-config/
```

Use these boundaries:

- `packages/ui`: design system and primitive reusable components
- `packages/db`: shared DB client, schema definitions, common DB helpers
- `packages/domain`: cross-tool domain contracts, shared entities, typed IDs, relation models

Do not move notes-specific application logic into packages yet unless another tool truly needs it.

## How `/notes` should be wired

### Route-to-feature mapping

Each route file under `/notes` should mostly compose from `src/features/notes`.

Example mapping:

- `app/(tools)/notes/page.tsx`
  - loads notes dashboard/list view
  - imports server reads from `features/notes/server/queries`
  - renders feature components from `features/notes/components`

- `app/(tools)/notes/[noteId]/page.tsx`
  - loads a single note
  - passes normalized data into `note-editor` or `note-view`

- `app/(tools)/notes/new/page.tsx`
  - initializes creation flow
  - does not duplicate editor logic

### Isolation rule

A future `chat` tool should not import from `features/notes/*` directly.

If `chat` needs note references later:

- Extract shared contracts into `packages/domain`
- Expose cross-tool lookup primitives from `packages/db` or a narrow shared module
- Keep notes rendering/editor logic inside `features/notes`

## Database access model

Use feature-owned adapters over a shared DB foundation.

That means:

- Shared DB config/schema lives in `packages/db`
- Each tool owns its own queries/mutations in `features/<tool>/server`
- Shared entities/relations can be extracted into `packages/domain` when more than one tool needs them

Example responsibility split:

- `packages/db`
  - connection setup
  - schema types
  - low-level helpers
- `features/notes/server`
  - `getNotesForWorkspace`
  - `getNoteById`
  - `createNote`
  - `updateNoteTitle`
  - `archiveNote`
- `features/chat/server`
  - chat-specific queries/mutations only

This keeps tool logic isolated while still using one database.

## Cross-tool data passing strategy

Design for shared data through explicit references, not feature imports.

Recommended model:

- Every shared entity gets stable IDs and typed ownership fields
- Cross-tool relationships are stored as references in the DB
- Shared reference types live in `packages/domain`

Examples for later:

- A chat message links to a note ID
- A note references a project ID
- A task is generated from a note block

Implementation rule:

- Cross-tool interaction happens through shared contracts and DB relations
- Cross-tool UI composition happens at route/shell level, not by coupling tool internals

## Naming and ownership rules

Use these conventions consistently:

- Tool name is singular in code if entity-centric, plural in URL if product-centric
- Prefer `features/notes`, `features/chat`
- Route file names stay framework-native: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Keep one exported public surface per feature via `index.ts`
- Avoid `misc`, `helpers`, `shared` inside features unless the scope is exact

## Shell and auth structure

Use the existing route groups to formalize app layers:

- `(marketing)` for public landing pages
- `(auth)` for sign-in and account entry
- `(tools)` for logged-in tool routes

`app/(tools)/layout.tsx` should eventually own:

- workspace shell
- sidebar/tool switcher
- top navigation
- global command menu
- shared providers needed only for authenticated product routes

This keeps the shell separate from each tool implementation.

## Important public APIs / interfaces / types

These are the first contracts to standardize.

### Route contract

- Tool routes live at `/[tool-slug]`
- Nested views belong under the same segment
- Top-level slug is reserved for tool entry points

### Feature module contract

Each feature should expose a small public surface, for example:

```ts
// apps/web/src/features/notes/index.ts
export * from "./types";
export { getNoteById, getNotesForWorkspace } from "./server/queries";
export { NoteEditor } from "./components/note-editor";
export { NotesList } from "./components/note-list";
```

### Shared domain contract

In `packages/domain`, define reusable types such as:

```ts
type WorkspaceId = string;
type NoteId = string;
type ToolSlug = "notes" | "chat";
type EntityRef = {
  tool: ToolSlug;
  entityType: string;
  entityId: string;
};
```

These become the base for future cross-tool linking.

### Database boundary contract

In `packages/db`, expose only foundational interfaces:

- DB client
- schema types
- shared transaction/helper utilities

Do not expose “all app queries” from this package.

## What not to do

Avoid these patterns early:

- Putting all business logic in `app/` route files
- Creating one giant `src/modules` or `src/lib` with mixed concerns
- Extracting too much into packages before a second tool needs it
- Letting tool A import tool B internals directly
- Building `/notes` as a single monolithic page if you already expect multiple note views

## Migration path from the current repo

1. Convert the current root page into `app/(marketing)/page.tsx`.
2. Move the current dashboard concern into `app/(tools)/layout.tsx`.
3. Add `src/features/notes` as the first real feature boundary.
4. Create `/notes` routes under `app/(tools)/notes/...`.
5. Keep `packages/ui` for reusable visual primitives only.
6. Add `packages/db` and optionally `packages/domain` once the first shared contracts appear.

## Test cases and scenarios

### Structural checks

- Adding a new tool should require:
  - one new route segment under `app/(tools)/<tool>`
  - one new feature folder under `src/features/<tool>`
  - zero changes to existing tool internals

- Removing a tool should not break unrelated feature imports

### Routing scenarios

- `/notes` renders the notes index
- `/notes/new` renders creation flow without duplicating editor code
- `/notes/[noteId]` renders a single note
- `/chat` can be added later without touching notes implementation

### Isolation scenarios

- Notes UI can change without changing chat folders
- Chat cannot import notes-specific editor or hooks
- Shared DB/schema changes can be consumed by multiple tools without moving feature logic

### Cross-tool scenarios

- A note can later be referenced by another tool via shared typed references
- A future tool can reuse note IDs or workspace IDs from `packages/domain`
- Shared relations can be queried without exposing notes internals to other tools

### Developer experience scenarios

- A new engineer can find all notes logic under one feature directory
- Route files remain thin and readable
- Shared code has obvious placement: `ui`, `db`, or `domain`

## Assumptions and defaults chosen

- The app will remain a monorepo with `apps/web` as the main Next.js product app
- Each tool gets a top-level URL segment and may own nested subroutes
- Shared business logic should be promoted early only when it is truly cross-tool
- Database access should be feature-owned, built on a shared DB foundation
- `/notes` is the first production tool and should establish the pattern for future tools
- Route groups are used for shells and auth separation, not as a replacement for feature boundaries
