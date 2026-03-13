# Reframe `note` into a GTD task execution app

## Summary

Replace the current static `/note` placeholder with a real client-side GTD workflow built around four distinct sections: `Inbox`, `Process`, `Tasks`, and `Someday`. Rename the product surface to `notes` to match the new concept, remove the barrel export in `src/features/note/index.ts`, and wire the route directly to the feature entry component. Persist all app data in `localStorage` so captured items and processed tasks survive refreshes without introducing a backend yet.

## Scope

In scope:

- Rename the feature and route surface from singular `note` to plural `notes`
- Remove the barrel export pattern for this feature
- Replace the placeholder UI with a working GTD flow
- Add browser persistence with safe hydration handling
- Keep raw inbox items separate from committed tasks in both data model and UI

Out of scope:

- Backend or multi-user persistence
- Authentication/authorization changes
- Rich text editing, attachments, due dates, reminders, drag-and-drop
- User-defined context tags in this phase

## Routing and feature structure

Implement these structural changes:

- Rename route from `apps/web/src/app/(tools)/note/page.tsx` to `apps/web/src/app/(tools)/notes/page.tsx`
- Update the home card in `apps/web/src/app/page.tsx` to link to `/notes` and describe the new workflow
- Rename feature folder from `apps/web/src/features/note` to `apps/web/src/features/notes`
- Delete the barrel export file rather than replacing it
- Import the page component directly from its file, for example:
  `@/features/notes/components/notes-app`
- Update metadata to reflect the new product language:
  title: `Notes - Townbase`
  description: GTD-oriented execution engine for capturing and processing work

## UI and component plan

Build one route-level client component that composes focused subcomponents. Suggested structure:

- `components/notes-app.tsx`
  Root client component. Owns persisted state, derived collections, and high-level actions.
- `components/inbox-panel.tsx`
  Frictionless capture form plus raw inbox list.
- `components/process-panel.tsx`
  Single-item processing workspace showing exactly one inbox item at a time.
- `components/tasks-panel.tsx`
  Task list with context filter and completion toggle.
- `components/someday-panel.tsx`
  Parking-lot list for deferred ideas.
- `components/section-nav.tsx`
  Top/side navigation across the four sections with counts.
- `components/empty-state.tsx`
  Shared empty-state presentation where needed.

Keep the visual language aligned with the current Townbase aesthetic unless there is an established shell pattern that requires adjustment. The interface should feel more operational than editorial: inbox for capture, process for decisions, tasks for execution.

## State model

Use colocated feature types in `apps/web/src/features/notes/types.ts`.

Define the core entities:

```ts
export type ContextTag =
  | "@computer"
  | "@calls"
  | "@errands"
  | "@home"
  | "@anywhere";

export type InboxItem = {
  id: string;
  body: string;
  createdAt: string;
};

export type TaskItem = {
  id: string;
  sourceInboxId: string;
  title: string;
  project: string | null;
  context: ContextTag;
  nextAction: string;
  status: "active" | "done";
  createdAt: string;
  completedAt: string | null;
};

export type SomedayItem = {
  id: string;
  sourceInboxId: string;
  body: string;
  createdAt: string;
};

export type NotesStore = {
  inbox: InboxItem[];
  tasks: TaskItem[];
  someday: SomedayItem[];
  selectedContext: ContextTag | "all";
};
```

Important model rules:

- Raw captured text lives only in `inbox`
- Processed tasks live only in `tasks`
- Deferred ideas live only in `someday`
- Processing always removes the source item from `inbox`
- `nextAction` is mandatory for task creation
- `project` is optional free text
- Context tags are fixed to the five GTD contexts you specified

## Persistence and data flow

Use a small feature-local storage utility, for example `storage.ts`, with:

- `STORAGE_KEY = "townbase-notes-v1"`
- `loadNotesStore(): NotesStore`
- `saveNotesStore(store: NotesStore): void`

Implementation defaults:

- Seed with a small representative dataset if no storage exists
- Read from storage only on the client after mount
- Guard JSON parsing failures by falling back to defaults
- Persist on every meaningful state change
- Keep date fields as ISO strings to avoid hydration mismatches

State flow:

1. App mounts with a safe default state
2. Client hydrates from `localStorage`
3. User actions update local React state
4. A persistence effect writes the latest store back to `localStorage`
5. Derived selectors compute current process item, filtered active tasks, done counts, and section badges

## User workflows

### Inbox

- Single textarea or input optimized for fast capture
- Submit appends a new `InboxItem`
- Captured items remain unstructured and unmerged
- Inbox list shows newest first
- Optional inline delete is allowed, but no conversion controls here

### Process

- Shows exactly one inbox item at a time
- Default item: oldest inbox item first, so the queue gets cleared in order
- For the current item provide three decisions:
  - `Trash`: remove from inbox permanently
  - `Someday`: move into `someday`
  - `Create task`: reveal or show a structured form
- Task form fields:
  - `title` required
  - `project` optional
  - `context` required select from fixed tags
  - `nextAction` required textarea/input
- Disable submit until required fields are valid
- After processing, advance immediately to the next inbox item
- If inbox is empty, show a dedicated empty state instead of a blank form

### Tasks

- Show only `status === "active"` by default in the main task list
- Provide filter chips/tabs for `all` plus each context
- Task cards/rows display:
  - title
  - project if present
  - context tag
  - next action
- `Mark done` changes status to `done`
- Completed tasks should not mix into the active list; show them in a secondary collapsed section or count-only summary
- Do not show raw inbox text here

### Someday

- Show deferred ideas as a separate list
- Preserve the original captured body
- Show created date or relative label if already used consistently in the app
- No weekly review system is needed yet beyond the separate section itself
- Optional future-facing affordance like `Move back to inbox` should be excluded in this phase unless discovered as an obvious existing pattern

## Derived selectors and behavior

Implement pure helpers for:

- `getCurrentInboxItem(store)`
- `getActiveTasksByContext(store, selectedContext)`
- `getCompletedTaskCount(store)`
- `getSectionCounts(store)`

Behavior defaults:

- Process queue order: oldest-first
- Inbox display order: newest-first
- Task completion is reversible only if you explicitly decide to add an undo affordance during implementation; otherwise one-way for this phase
- Empty or whitespace-only inbox submissions are rejected
- Empty or whitespace-only task `title` and `nextAction` are rejected
- `project` should be normalized to `null` when blank

## Direct import change for barrel removal

After deleting the barrel file, page imports should become direct. Example target shape:

```ts
import { NotesApp } from "@/features/notes/components/notes-app";
```

There should be no `index.ts` barrel in this feature after the change.

## Public interface changes

These are the externally visible changes in this app:

- Route changes from `/note` to `/notes`
- Home page tool link updates accordingly
- Feature import path changes from `@/features/note` to a direct file path under `@/features/notes/...`
- Metadata/title/description updated to reflect GTD task execution instead of simple note-taking

## Validation and implementation notes

- Keep single-responsibility boundaries between storage, types, constants, selectors, and components
- Prefer semantic HTML:
  - `main` for page root
  - `section` for each major workflow area
  - `article` or `li` for task/inbox items
  - `nav` for section switching/filtering
- Minimize wrapper `div`s where a semantic element can carry the classes
- Use existing UI primitives from `src/components/ui` where they fit cleanly
- Mark interactive route-level UI with `'use client'`
- Avoid async client components
- Keep browser-only storage access inside effects or guarded branches

## Test cases and scenarios

Manual acceptance cases:

1. Visiting `/notes` shows the four GTD sections, not the old placeholder.
2. Home page card links to `/notes` and uses updated description copy.
3. Capturing a raw thought adds it to Inbox and persists after refresh.
4. Inbox items do not appear in Tasks until processed.
5. Process view shows exactly one inbox item at a time.
6. Trashing an inbox item removes it and advances the queue.
7. Sending an inbox item to Someday removes it from Inbox and shows it only in Someday.
8. Creating a task requires `title`, `context`, and `nextAction`.
9. A created task is removed from Inbox and appears in Tasks.
10. Tasks can be filtered by each context and `all`.
11. Marking a task done removes it from the active task list.
12. Refreshing the browser preserves inbox, tasks, someday items, and selected context filter.
13. Corrupt `localStorage` payload falls back safely to seeded defaults instead of crashing.
14. No imports remain from `@/features/note` or `@/features/notes` barrel paths.

Static verification after implementation:

- `bun run lint`
- `bun run format`
- Type-check command should use the actual script name present in this repo; currently that is `bun run check-types`, unless you also want the script renamed to match AGENTS

## Assumptions and defaults chosen

- Renaming to `notes` is intentional and should apply to route, feature folder, metadata, and home-card copy
- Persistence for this phase is browser `localStorage`, not backend storage
- Context tags are fixed, not user-configurable
- Projects are optional free text
- Processing order is oldest-first to encourage queue clearing
- Completed tasks remain separate from active tasks
- The AGENTS checklist references `bun run type-check`, but the repo currently exposes `check-types`; implementation should either use the existing script or include a separate script-alias change if you want the checklist normalized
