import { getDescendingByTimestamp } from "./format";
import type { InboxItem, NotesSection, NotesStore, TaskItem } from "./types";

function getAscByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return items.reduce<T[]>((orderedItems, item) => {
    const insertionIndex = orderedItems.findIndex((orderedItem) => {
      return item.createdAt.localeCompare(orderedItem.createdAt) < 0;
    });

    if (insertionIndex === -1) {
      return [...orderedItems, item];
    }

    return [
      ...orderedItems.slice(0, insertionIndex),
      item,
      ...orderedItems.slice(insertionIndex),
    ];
  }, []);
}

export function getCurrentInboxItem(store: NotesStore): InboxItem | null {
  if (store.inbox.length === 0) {
    return null;
  }

  return getAscByCreatedAt(store.inbox)[0] ?? null;
}

export function getSectionCounts(
  store: NotesStore,
): Record<NotesSection, number> {
  return {
    inbox: store.inbox.length,
    process: store.inbox.length,
    tasks: store.tasks.filter((task) => task.status === "active").length,
    someday: store.someday.length,
  };
}

export function getActiveTasks(store: NotesStore): TaskItem[] {
  return getDescendingByTimestamp(
    store.tasks.filter((task) => task.status === "active"),
    (task) => task.createdAt,
  );
}

export function getCompletedTasks(store: NotesStore): TaskItem[] {
  return getDescendingByTimestamp(
    store.tasks.filter((task) => task.status === "done"),
    (task) => task.completedAt ?? task.createdAt,
  );
}

export function getNotesOverview(store: NotesStore) {
  const activeTaskCount = getActiveTasks(store).length;
  const completedTaskCount = getCompletedTasks(store).length;

  return {
    inboxCount: store.inbox.length,
    processCount: store.inbox.length,
    activeTaskCount,
    completedTaskCount,
    somedayCount: store.someday.length,
  };
}
