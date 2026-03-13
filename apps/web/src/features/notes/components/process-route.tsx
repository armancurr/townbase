"use client";

import { useEffect, useState } from "react";

import {
  ArrowArcRight,
  CheckSquare,
  CirclesThree,
  Trash,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { ProcessTaskDraft } from "../types";
import { useNotes } from "./notes-provider";

export function ProcessRoute() {
  const {
    createTaskFromInboxItem,
    deleteInboxItem,
    moveInboxItemToSomeday,
    store,
  } = useNotes();
  const [draft, setDraft] = useState<ProcessTaskDraft>(
    EMPTY_PROCESS_TASK_DRAFT,
  );

  const currentItem = getCurrentInboxItem(store);

  useEffect(() => {
    setDraft(EMPTY_PROCESS_TASK_DRAFT);
  }, [currentItem?.id]);

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

  const isValid = draft.action.trim().length > 0;

  return (
    <section className="flex flex-col gap-4">
      {/* Current item */}
      <Card size="sm">
        <CardContent>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
            {currentItem.body}
          </p>
        </CardContent>
        <div className="px-4 pb-1 text-right">
          <time className="font-mono text-[10px] text-muted-foreground">
            {formatNoteTimestamp(currentItem.createdAt)}
          </time>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => deleteInboxItem(currentItem.id)}
        >
          <Trash size={14} data-icon="inline-start" />
          Trash
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => moveInboxItemToSomeday(currentItem.id)}
        >
          <ArrowArcRight size={14} data-icon="inline-start" />
          Someday
        </Button>
      </div>

      <Separator />

      {/* Create task form */}
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();

          if (!isValid) {
            return;
          }

          createTaskFromInboxItem(currentItem.id, draft);
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Next action
          </span>
          <Textarea
            value={draft.action}
            onChange={(event) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                action: event.target.value,
              }))
            }
            placeholder="What needs to be done?"
            className="min-h-20 resize-none"
          />
        </label>
        <div className="flex justify-end">
          <Button size="sm" type="submit" disabled={!isValid}>
            <CheckSquare size={14} weight="fill" data-icon="inline-start" />
            Create task
          </Button>
        </div>
      </form>
    </section>
  );
}
