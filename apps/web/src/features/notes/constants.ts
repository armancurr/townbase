import type { NotesSection, NotesStore } from "./types";

export const STORAGE_KEY = "townbase-notes-v1";

export const SECTION_ORDER: NotesSection[] = [
  "inbox",
  "process",
  "tasks",
  "someday",
];

export const SECTION_COPY: Record<
  NotesSection,
  { label: string; description: string }
> = {
  inbox: {
    label: "Inbox",
    description: "Capture first. Organize later.",
  },
  process: {
    label: "Process",
    description: "Decide the next move for one item at a time.",
  },
  tasks: {
    label: "Tasks",
    description: "Keep active work and completed work in one ordered list.",
  },
  someday: {
    label: "Someday",
    description: "Park ideas without losing them.",
  },
};

export const DEFAULT_STORE: NotesStore = {
  inbox: [],
  tasks: [],
  someday: [],
};

export const SEEDED_STORE: NotesStore = {
  inbox: [
    {
      id: "inbox-clarify-dashboard-copy",
      body: "Clarify the dashboard headline before next week's walkthrough.",
      createdAt: "2026-03-10T09:15:00.000Z",
    },
    {
      id: "inbox-check-call-notes",
      body: "Review call notes from Tuesday and decide if they become follow-up tasks.",
      createdAt: "2026-03-11T14:40:00.000Z",
    },
  ],
  tasks: [
    {
      id: "task-ship-billing-copy",
      sourceInboxId: "seed-billing-copy",
      body: "Tighten billing page copy",
      details:
        "Rewrite the opening paragraph to explain plan differences in one pass.",
      status: "active",
      createdAt: "2026-03-09T08:30:00.000Z",
      completedAt: null,
    },
    {
      id: "task-book-contractor-call",
      sourceInboxId: "seed-contractor-call",
      body: "Book contractor check-in",
      details: "Call Sam after lunch and confirm the Friday review slot.",
      status: "active",
      createdAt: "2026-03-10T12:10:00.000Z",
      completedAt: null,
    },
    {
      id: "task-drop-off-returns",
      sourceInboxId: "seed-returns",
      body: "Drop off hardware returns",
      details: "Bring the labeled box to the courier on the way home.",
      status: "done",
      createdAt: "2026-03-08T16:20:00.000Z",
      completedAt: "2026-03-08T18:10:00.000Z",
    },
  ],
  someday: [
    {
      id: "someday-voice-memos",
      sourceInboxId: "seed-voice-memos",
      body: "Explore whether quick voice memos could feed the inbox later.",
      createdAt: "2026-03-07T11:00:00.000Z",
    },
  ],
};
