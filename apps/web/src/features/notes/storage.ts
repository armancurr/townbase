import { DEFAULT_STORE, STORAGE_KEY } from "./constants";
import type { InboxItem, NotesStore, SomedayItem, TaskItem } from "./types";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isInboxItem(value: unknown): value is InboxItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.id) &&
    isString(candidate.body) &&
    isString(candidate.createdAt)
  );
}

function isTaskItem(value: unknown): value is TaskItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.id) &&
    isString(candidate.sourceInboxId) &&
    isString(candidate.body) &&
    isString(candidate.details) &&
    (candidate.status === "active" || candidate.status === "done") &&
    isString(candidate.createdAt) &&
    (candidate.completedAt === null || isString(candidate.completedAt))
  );
}

function normalizeLegacyTaskItem(
  value: unknown,
  inboxItems: InboxItem[],
): TaskItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    !isString(candidate.id) ||
    !isString(candidate.sourceInboxId) ||
    (candidate.status !== "active" && candidate.status !== "done") ||
    !isString(candidate.createdAt) ||
    (candidate.completedAt !== null && !isString(candidate.completedAt))
  ) {
    return null;
  }

  const linkedInboxItem = inboxItems.find((item) => {
    return item.id === candidate.sourceInboxId;
  });
  const body = isString(candidate.body)
    ? candidate.body
    : (linkedInboxItem?.body ??
      (isString(candidate.title)
        ? candidate.title
        : isString(candidate.nextAction)
          ? candidate.nextAction
          : null));
  const details = isString(candidate.details)
    ? candidate.details
    : isString(candidate.action)
      ? candidate.action
      : isString(candidate.nextAction)
        ? candidate.nextAction
        : "";

  if (!body) {
    return null;
  }

  return {
    id: candidate.id,
    sourceInboxId: candidate.sourceInboxId,
    body,
    details,
    status: candidate.status,
    createdAt: candidate.createdAt,
    completedAt: candidate.completedAt,
  };
}

function isSomedayItem(value: unknown): value is SomedayItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.id) &&
    isString(candidate.sourceInboxId) &&
    isString(candidate.body) &&
    isString(candidate.createdAt)
  );
}

function sanitizeStore(value: unknown): NotesStore {
  if (!value || typeof value !== "object") {
    return DEFAULT_STORE;
  }

  const candidate = value as Record<string, unknown>;

  const inbox = Array.isArray(candidate.inbox)
    ? candidate.inbox.filter(isInboxItem)
    : DEFAULT_STORE.inbox;

  return {
    inbox,
    tasks: Array.isArray(candidate.tasks)
      ? candidate.tasks.flatMap((task) => {
          if (isTaskItem(task)) {
            return [task];
          }

          const normalizedTask = normalizeLegacyTaskItem(task, inbox);

          return normalizedTask ? [normalizedTask] : [];
        })
      : DEFAULT_STORE.tasks,
    someday: Array.isArray(candidate.someday)
      ? candidate.someday.filter(isSomedayItem)
      : DEFAULT_STORE.someday,
  };
}

export function loadNotesStore(): NotesStore {
  if (typeof window === "undefined") {
    return DEFAULT_STORE;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return DEFAULT_STORE;
    }

    return sanitizeStore(JSON.parse(storedValue));
  } catch {
    return DEFAULT_STORE;
  }
}

export function saveNotesStore(store: NotesStore): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
