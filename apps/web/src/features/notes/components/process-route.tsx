"use client";

import {
  CheckSquare,
  CirclesThree,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";

import { formatNoteTimestamp } from "../format";
import { createParsedTaskDrafts } from "../parse";
import { getCurrentInboxItem } from "../selectors";
import type { InboxItem, ProcessTaskDraft } from "../types";
import { useNotes } from "./notes-provider";

function ProcessComposer({
  currentItem,
  createTasksFromInboxItem,
  deleteInboxItem,
  moveInboxItemToSomeday,
}: {
  currentItem: InboxItem;
  createTasksFromInboxItem: (
    inboxId: string,
    drafts: ProcessTaskDraft[],
  ) => void;
  deleteInboxItem: (id: string) => void;
  moveInboxItemToSomeday: (id: string) => void;
}) {
  const [drafts, setDrafts] = useState<ProcessTaskDraft[]>(() => {
    return createParsedTaskDrafts(currentItem.body);
  });
  const hasDrafts = drafts.length > 0;
  const isValid =
    hasDrafts && drafts.every((draft) => draft.action.trim().length > 0);

  function saveTask() {
    if (!isValid) {
      return;
    }

    createTasksFromInboxItem(currentItem.id, drafts);
  }

  return (
    <section className="flex flex-col gap-8">
      <article>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {currentItem.body}
          </p>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <time className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-900">
              {formatNoteTimestamp(currentItem.createdAt)}
            </time>
            <div className="flex flex-col gap-2 sm:items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteInboxItem(currentItem.id)}
                className="justify-start px-0 text-neutral-900 hover:bg-transparent hover:text-neutral-900"
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveInboxItemToSomeday(currentItem.id)}
                className="justify-start px-0 text-neutral-900 hover:bg-transparent hover:text-neutral-900"
              >
                Move to someday
              </Button>
            </div>
          </div>
        </div>
      </article>

      <section className="space-y-4">
        {hasDrafts ? (
          <div className="space-y-6">
            {drafts.map((draft) => (
              <article key={draft.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {draft.body}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.filter(
                          (currentDraft) => currentDraft.id !== draft.id,
                        ),
                      )
                    }
                    className="shrink-0 px-0 hover:bg-transparent"
                  >
                    <Trash size={14} data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`process-next-action-${draft.id}`}
                    className="text-sm leading-none text-foreground"
                  >
                    Next action
                  </label>
                  <Textarea
                    id={`process-next-action-${draft.id}`}
                    value={draft.action}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) => {
                          if (currentDraft.id !== draft.id) {
                            return currentDraft;
                          }

                          return {
                            ...currentDraft,
                            action: event.target.value,
                          };
                        }),
                      )
                    }
                    placeholder="What's the next action?"
                    className="min-h-24 resize-none border-x-0 border-t-0 border-b border-border px-0 py-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              No task candidates
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Remove this note, move it to someday, or capture it again with one
              task per line.
            </p>
          </div>
        )}
        <div className="flex justify-end">
          <Button size="sm" onClick={saveTask} disabled={!isValid}>
            <CheckSquare size={14} weight="fill" data-icon="inline-start" />
            Create tasks
          </Button>
        </div>
      </section>
    </section>
  );
}

export function ProcessRoute() {
  const {
    createTasksFromInboxItem,
    deleteInboxItem,
    moveInboxItemToSomeday,
    store,
  } = useNotes();
  const currentItem = getCurrentInboxItem(store);

  if (!currentItem) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CirclesThree size={16} />
          </EmptyMedia>
          <EmptyTitle>All clear</EmptyTitle>
          <EmptyDescription>
            Nothing is waiting to be processed. Capture something first.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ProcessComposer
      key={currentItem.id}
      currentItem={currentItem}
      createTasksFromInboxItem={createTasksFromInboxItem}
      deleteInboxItem={deleteInboxItem}
      moveInboxItemToSomeday={moveInboxItemToSomeday}
    />
  );
}
