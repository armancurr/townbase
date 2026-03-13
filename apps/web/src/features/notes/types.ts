export type InboxItem = {
  id: string;
  body: string;
  createdAt: string;
};

export type TaskItem = {
  id: string;
  sourceInboxId: string;
  body: string;
  action: string;
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
};

export type NotesSection = "inbox" | "process" | "tasks" | "someday";

export type ProcessTaskDraft = {
  action: string;
};
