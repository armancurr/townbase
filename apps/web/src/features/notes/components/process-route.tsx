"use client";

import { useState } from "react";

import {
  ArrowArcRight,
  CheckSquare,
  CirclesThree,
  ClockCounterClockwise,
  Trash,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { EMPTY_PROCESS_TASK_DRAFT } from "../constants";
import { formatNoteTimestamp } from "../format";
import { getCurrentInboxItem } from "../selectors";
import type { InboxItem, ProcessTaskDraft } from "../types";
import { useNotes } from "./notes-provider";

function ProcessComposer({
  currentItem,
  createTaskFromInboxItem,
  deleteInboxItem,
  moveInboxItemToSomeday,
}: {
  currentItem: InboxItem;
  createTaskFromInboxItem: (inboxId: string, draft: ProcessTaskDraft) => void;
  deleteInboxItem: (id: string) => void;
  moveInboxItemToSomeday: (id: string) => void;
}) {
  const [draft, setDraft] = useState<ProcessTaskDraft>(
    EMPTY_PROCESS_TASK_DRAFT,
  );
  const isValid = draft.action.trim().length > 0;

  function saveTask() {
    if (!isValid) {
      return;
    }

    createTaskFromInboxItem(currentItem.id, draft);
  }

  return (
    <section className="flex flex-col gap-6">
      <article className="border border-border bg-card/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Now processing
            </p>
            <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {currentItem.body}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              One note at a time
            </p>
            <time className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {formatNoteTimestamp(currentItem.createdAt)}
            </time>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="border border-border bg-card/40 p-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Clear the note
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Discard it if it is noise, or move it aside if it belongs in the
                longer-term parking lot.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteInboxItem(currentItem.id)}
                className="justify-start"
              >
                <Trash size={14} data-icon="inline-start" />
                Trash note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveInboxItemToSomeday(currentItem.id)}
                className="justify-start"
              >
                <ArrowArcRight size={14} data-icon="inline-start" />
                Move to someday
              </Button>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card/60 p-4 sm:p-5">
          <div className="mb-4 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Turn it into action
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Write the next visible step, not the whole project.
            </p>
          </div>

          <Separator className="mb-4" />

          <div className="flex flex-col gap-4">
            <label
              htmlFor="process-next-action"
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            >
              Next action
            </label>
            <Textarea
              id="process-next-action"
              value={draft.action}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  action: event.target.value,
                }))
              }
              placeholder="What needs to be done?"
              className="min-h-28 resize-none border-0 bg-background px-0 py-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
            />
            <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ClockCounterClockwise size={14} />
                Capture the next move clearly enough to act on it later.
              </div>
              <Button size="sm" onClick={saveTask} disabled={!isValid}>
                <CheckSquare size={14} weight="fill" data-icon="inline-start" />
                Create task
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export function ProcessRoute() {
  const {
    createTaskFromInboxItem,
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
      createTaskFromInboxItem={createTaskFromInboxItem}
      deleteInboxItem={deleteInboxItem}
      moveInboxItemToSomeday={moveInboxItemToSomeday}
    />
  );
}
