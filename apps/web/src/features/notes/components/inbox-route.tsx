"use client";

import { useMemo } from "react";
import { Tray } from "@phosphor-icons/react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatNoteTimestamp, getDescendingByTimestamp } from "../format";
import { useNotes } from "./notes-provider";

export function InboxRoute() {
  const { store } = useNotes();

  const items = useMemo(() => {
    return getDescendingByTimestamp(store.inbox, (item) => item.createdAt);
  }, [store.inbox]);

  if (items.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tray size={16} />
          </EmptyMedia>
          <EmptyTitle>Inbox is empty</EmptyTitle>
          <EmptyDescription>
            Capture a thought above. It will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {items.map((item) => (
        <article key={item.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <p className="max-w-2xl whitespace-pre-wrap text-md leading-relaxed text-foreground">
              {item.body}
            </p>
            <time className="shrink-0 font-mono text-sm uppercase text-neutral-900">
              {formatNoteTimestamp(item.createdAt)}
            </time>
          </div>
        </article>
      ))}
    </section>
  );
}
