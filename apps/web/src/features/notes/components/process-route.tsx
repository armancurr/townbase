"use client";

import {
  CheckSquare,
  CirclesThree,
  CloudSun,
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
  const isValid = hasDrafts;

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
          <p className="whitespace-pre-wrap text-md leading-relaxed text-foreground">
            {currentItem.body}
          </p>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <time className="font-mono text-sm uppercase text-neutral-900">
              {formatNoteTimestamp(currentItem.createdAt)}
            </time>
            <div className="flex items-center gap-1 sm:justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteInboxItem(currentItem.id)}
                className="text-neutral-900 hover:bg-muted hover:text-neutral-900"
                aria-label="Delete note"
                title="Delete"
              >
                <Trash size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => moveInboxItemToSomeday(currentItem.id)}
                className="text-neutral-900 hover:bg-muted hover:text-neutral-900"
                aria-label="Move note to someday"
                title="Move to someday"
              >
                <CloudSun size={14} />
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
                    size="icon-sm"
                    onClick={() =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.filter(
                          (currentDraft) => currentDraft.id !== draft.id,
                        ),
                      )
                    }
                    className="shrink-0 hover:bg-muted"
                    aria-label="Remove task draft"
                    title="Remove"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`process-task-details-${draft.id}`}
                    className="text-sm leading-none text-foreground"
                  >
                    Task details
                  </label>
                  <Textarea
                    id={`process-task-details-${draft.id}`}
                    value={draft.details}
                    onChange={(event) =>
                      setDrafts((currentDrafts) =>
                        currentDrafts.map((currentDraft) => {
                          if (currentDraft.id !== draft.id) {
                            return currentDraft;
                          }

                          return {
                            ...currentDraft,
                            details: event.target.value,
                          };
                        }),
                      )
                    }
                    placeholder="Optional details, notes, or constraints"
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
