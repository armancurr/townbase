# Notes Capture and Task Simplification Plan

## Summary

Update the `/notes` tool so `/notes/inbox` becomes a keyboard-first capture surface with a header-anchored textarea that auto-focuses on page load, expands into a large anchored popover while editing, and saves with `Shift+Enter`. At the same time, simplify processing/tasks by removing task title, project, and context/tag concepts entirely, leaving each task as the original inbox note plus one required action field labeled `What to do`.

This plan targets the currently wired components:

- `apps/web/src/features/notes/components/notes-shell.tsx`
- `apps/web/src/features/notes/components/inbox-route.tsx`
- `apps/web/src/features/notes/components/process-route.tsx`
- `apps/web/src/features/notes/components/tasks-route.tsx`
- `apps/web/src/features/notes/components/notes-provider.tsx`
- `apps/web/src/features/notes/types.ts`
- `apps/web/src/features/notes/constants.ts`
- `apps/web/src/features/notes/storage.ts`

It does not migrate the currently unused `*-panel.tsx` components unless they become the intended live UI later.

## Important API, Type, and State Changes

### Task model

Replace the current task shape with a stripped-down version:

- Remove `title`
- Remove `project`
- Remove `context`
- Keep `id`
- Keep `sourceInboxId`
- Keep the original note text as `body`
- Rename `nextAction` to `action`
- Keep `status`
- Keep `createdAt`
- Keep `completedAt`

Proposed `TaskItem` shape:

```ts
type TaskItem = {
  id: string;
  sourceInboxId: string;
  body: string;
  action: string;
  status: "active" | "done";
  createdAt: string;
  completedAt: string | null;
};
```

### Process draft model

Replace the process draft type with a single-field draft:

```ts
type ProcessTaskDraft = {
  action: string;
};
```

### Notes store

Remove task context selection from persisted state:

- Delete `selectedContext` from `NotesStore`
- Delete `DEFAULT_SELECTED_CONTEXT`
- Delete `CONTEXT_TAGS`
- Delete any context-based selectors and sanitization paths

### Storage compatibility

Update `sanitizeStore()` so older persisted task data still loads safely:

- Accept old task objects if present
- Normalize them into the new `TaskItem` shape
- Map old `nextAction` to new `action`
- Map old task `title/project/context` out of existence
- Populate `body` from the old stored task title if needed only as a fallback
- Prefer preserving the source inbox note body when converting newly created tasks going forward

Assumption:

- Backward compatibility is limited to reading old local-storage data without crashing. We do not need a formal migration UI.

## Implementation Plan

### 1. Build a dedicated inbox capture controller in the notes shell

Add a focused capture component inside the header of `NotesShell` and keep the behavior local to the notes feature.

Implementation shape:

- Extract header capture into a new component, for example `notes-capture.tsx`
- Keep it rendered inside the notes header so it is visually centralized
- Use a small resting textarea footprint in the header
- When focused, open a larger anchored popover/panel using the existing Base UI popover primitive or an always-mounted anchored panel if focus retention is easier to control
- The expanded panel should contain:
  - the same textarea element or a logically continuous focused editor
  - helper text for shortcuts
  - save affordance
- The input remains a textarea, not an input, because `Enter` must insert newlines

Interaction rules:

- On `/notes/inbox`, autofocus the capture textarea after hydration
- Also listen for printable-key presses at the page level when focus is not already inside another form control, and route them into the inbox capture so typing starts immediately without a click
- While on `/notes/inbox`, keep the capture re-focused after save and after popover transitions unless the user explicitly focuses another interactive control
- On other `/notes/*` routes, keep the capture available in the header but do not steal focus on page load
- `Enter` inserts newline normally
- `Shift+Enter` saves the note
- After save:
  - trim the note
  - add it to inbox
  - clear draft
  - keep focus in the capture
  - collapse back to resting state only if the draft is empty and the interaction feels stable; otherwise keep it expanded
- Empty draft does nothing on save

Focus management details:

- Use a `ref` on the textarea plus a route-aware `useEffect`
- Guard autofocus until `isHydrated` is true to avoid hydration mismatch and focusing before storage load
- Add a small utility to determine whether a global keystroke should be captured:
  - ignore meta/ctrl/alt combinations
  - ignore composition events
  - ignore when target is input/textarea/select/contenteditable
- Prefer maintaining focus by re-focusing the textarea on popover open and after submit, not by blocking blur globally

### 2. Move keyboard shortcuts into a dedicated scalable registry

Create a notes-local shortcut layer rather than embedding key logic directly in route components.

Recommended structure:

- `apps/web/src/features/notes/shortcuts.ts`
- optionally `apps/web/src/features/notes/hooks/use-notes-shortcuts.ts`

Contents:

- declarative shortcut definitions with:
  - `id`
  - `description`
  - key matcher
  - route scope
  - enabled predicate
  - handler
- initial shortcuts:
  - `capture-save` => `Shift+Enter`, scoped to notes capture
  - `capture-autostart` => printable keys on `/notes/inbox`, scoped to page
- helper utilities:
  - normalize keyboard event checks
  - decide whether to ignore events from editable targets

Reason for this shape:

- future shortcuts can be added without spreading ad hoc `onKeyDown` logic across the feature
- route scoping remains explicit

### 3. Simplify `/notes/process`

Refactor `ProcessRoute` to remove title/project/context and only ask for one field.

UI changes:

- Keep the current inbox item preview card
- Keep `Trash` and `Move to someday`
- Replace the current task creation form with one textarea only
- Rename label and placeholder to match the chosen language:
  - label: `What to do`
  - placeholder: plain instruction such as `Describe the next thing you need to do`
- Validation: required if trimmed `action` is non-empty
- Button label can remain `Create task`

Behavior changes:

- `createTaskFromInboxItem()` now copies `currentItem.body` into the task `body`
- The process form resets to `{ action: "" }` when the current inbox item changes

### 4. Simplify `/notes/tasks`

Refactor `TasksRoute` so it shows a single ordered task list without context filters.

Rendering rules:

- Active tasks first
- Completed tasks appended at the end of the same list
- Completed tasks styled as disabled:
  - lower contrast
  - muted border/background
  - subdued text
  - completion icon retained
- Each task card shows:
  - original note body
  - `What to do` value
  - timestamp
- Completed cards show a `Redo` action
- Active cards show `Mark done`

Behavior changes:

- Add `markTaskActive(id)` in provider
- `markTaskDone(id)` sets:
  - `status: "done"`
  - `completedAt: new Date().toISOString()`
- `markTaskActive(id)` sets:
  - `status: "active"`
  - `completedAt: null`
- Ordering:
  - active tasks sorted descending by `createdAt`
  - completed tasks sorted descending by `completedAt ?? createdAt`
  - rendered as `[...]active, ...completed]`

### 5. Clean up selectors/constants/provider

Adjust supporting modules to match the simplified model.

Changes:

- `constants.ts`
  - remove context-related constants
  - replace `EMPTY_PROCESS_TASK_DRAFT` with `{ action: "" }`
  - update seeded store data to the new task shape
- `selectors.ts`
  - delete context-based task selector logic
  - keep only selectors still used
- `notes-provider.tsx`
  - remove `setSelectedContext`
  - remove context from context value type
  - add `markTaskActive`
  - update `createTaskFromInboxItem()` to create the new task object
- `storage.ts`
  - remove `selectedContext` sanitization
  - normalize legacy task data into the new shape

### 6. Keep the header capture visually central and intentional

Use the current notes-shell header layout but rebalance it so the capture area is the focal point.

Visual direction:

- capture block sits prominently in the header, not off to one side as a secondary control
- resting state is compact enough not to dominate the page
- expanded state becomes a large anchored writing surface
- preserve the existing stone/teal visual language instead of inventing a new one
- avoid unnecessary wrapper divs; use semantic `header` and `section` structure where possible

## Test Cases and Scenarios

### Capture behavior

1. Load `/notes/inbox` with hydrated client state.
   Expected: capture textarea is focused automatically.

2. Land on `/notes/inbox` and type a printable key without clicking.
   Expected: capture opens/expands and the first typed character appears in the textarea.

3. Press `Enter` while typing in the inbox capture.
   Expected: newline inserted, no save triggered.

4. Press `Shift+Enter` with non-empty capture draft.
   Expected: note saved to inbox, draft cleared, capture remains focused.

5. Press `Shift+Enter` with only whitespace.
   Expected: nothing saved, no crash, focus remains.

6. Focus another explicit form field on the page.
   Expected: global auto-capture does not hijack typing meant for that field.

### Process flow

1. Open `/notes/process` with an inbox item available.
   Expected: only one required field labeled `What to do` appears.

2. Submit with empty action.
   Expected: task is not created.

3. Submit with valid action.
   Expected: inbox item removed, task created with original note body plus action.

4. Move item to someday or trash it.
   Expected: current process item advances to the next oldest inbox item.

### Tasks behavior

1. Open `/notes/tasks` with mixed active/completed tasks.
   Expected: active tasks render first, completed tasks render at the end.

2. Mark an active task done.
   Expected: task moves into the completed portion and looks disabled.

3. Click `Redo` on a completed task.
   Expected: task returns to the active section and regains active styling.

4. Refresh after done/redo transitions.
   Expected: task state persists from local storage.

### Legacy storage

1. Load app with pre-change local storage containing old task objects.
   Expected: notes screen loads without runtime errors and tasks display in the new simplified format.

## Assumptions and Defaults

- The live implementation should modify the currently used `*-route.tsx` components, not the unused `*-panel.tsx` components.
- Removing “tags entirely” means removing task contexts and the tasks filter UI, not only hiding labels.
- `What to do` is the final replacement label for the former `Next action` field.
- Tasks should preserve the original inbox note body for reference after processing.
- `Shift+Enter` is the only save shortcut in this iteration; future shortcuts will be added through the dedicated notes shortcut registry.
- Autofocus and automatic key capture apply specifically to `/notes/inbox`, not to `/notes/process`, `/notes/tasks`, or `/notes/someday`.
- Completed tasks should remain visible on the tasks page rather than being hidden behind a collapsible section.

## Verification

After implementation, run:

1. `bun run lint`
2. `bun run format`
3. `bun run type-check`
