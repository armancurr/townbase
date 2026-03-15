"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { DEFAULT_STORE } from "../constants";
import { filterNewTaskDrafts, normalizeTaskDrafts } from "../parse";
import { loadNotesStore, saveNotesStore } from "../storage";
import type { NotesStore, ProcessTaskDraft, TaskItem } from "../types";

type NotesContextValue = {
  isHydrated: boolean;
  store: NotesStore;
  addInboxItem: (body: string) => void;
  deleteInboxItem: (id: string) => void;
  moveInboxItemToSomeday: (id: string) => void;
  createTasksFromInboxItem: (
    inboxId: string,
    drafts: ProcessTaskDraft[],
  ) => void;
  markTaskDone: (id: string) => void;
  markTaskActive: (id: string) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<NotesStore>(DEFAULT_STORE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setStore(loadNotesStore());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveNotesStore(store);
  }, [isHydrated, store]);

  const value = useMemo<NotesContextValue>(() => {
    return {
      isHydrated,
      store,
      addInboxItem: (body) => {
        const trimmedBody = body.trim();

        if (!trimmedBody) {
          return;
        }

        setStore((currentStore) => ({
          ...currentStore,
          inbox: [
            {
              id: createId(),
              body: trimmedBody,
              createdAt: new Date().toISOString(),
            },
            ...currentStore.inbox,
          ],
        }));
      },
      deleteInboxItem: (id) => {
        setStore((currentStore) => ({
          ...currentStore,
          inbox: currentStore.inbox.filter((item) => item.id !== id),
        }));
      },
      moveInboxItemToSomeday: (id) => {
        setStore((currentStore) => {
          const item = currentStore.inbox.find(
            (inboxItem) => inboxItem.id === id,
          );

          if (!item) {
            return currentStore;
          }

          return {
            ...currentStore,
            inbox: currentStore.inbox.filter(
              (inboxItem) => inboxItem.id !== id,
            ),
            someday: [
              {
                id: createId(),
                sourceInboxId: item.id,
                body: item.body,
                createdAt: new Date().toISOString(),
              },
              ...currentStore.someday,
            ],
          };
        });
      },
      createTasksFromInboxItem: (inboxId, drafts) => {
        setStore((currentStore) => {
          const item = currentStore.inbox.find(
            (inboxItem) => inboxItem.id === inboxId,
          );

          if (!item) {
            return currentStore;
          }

          const validDrafts = filterNewTaskDrafts(
            normalizeTaskDrafts(drafts),
            currentStore.tasks,
          );

          if (validDrafts.length === 0) {
            return currentStore;
          }

          const createdAt = new Date().toISOString();
          const newTasks: TaskItem[] = validDrafts.map((draft) => ({
            id: createId(),
            sourceInboxId: item.id,
            body: draft.body,
            details: draft.details,
            status: "active",
            createdAt,
            completedAt: null,
          }));

          return {
            ...currentStore,
            inbox: currentStore.inbox.filter(
              (inboxItem) => inboxItem.id !== inboxId,
            ),
            tasks: [...newTasks, ...currentStore.tasks],
          };
        });
      },
      markTaskDone: (id) => {
        setStore((currentStore) => ({
          ...currentStore,
          tasks: currentStore.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }

            return {
              ...task,
              status: "done",
              completedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      markTaskActive: (id) => {
        setStore((currentStore) => ({
          ...currentStore,
          tasks: currentStore.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }

            return {
              ...task,
              status: "active",
              completedAt: null,
            };
          }),
        }));
      },
    };
  }, [isHydrated, store]);

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const value = useContext(NotesContext);

  if (!value) {
    throw new Error("useNotes must be used within NotesProvider");
  }

  return value;
}
