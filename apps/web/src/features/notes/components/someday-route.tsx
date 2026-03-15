"use client";

import { useMemo } from "react";

import { CloudSun } from "@phosphor-icons/react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { formatNoteTimestamp, getDescendingByTimestamp } from "../format";
import { useNotes } from "./notes-provider";

export function SomedayRoute() {
  const { store } = useNotes();

  const items = useMemo(() => {
    return getDescendingByTimestamp(store.someday, (item) => item.createdAt);
  }, [store.someday]);

  if (items.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CloudSun size={16} />
          </EmptyMedia>
          <EmptyTitle>Nothing parked</EmptyTitle>
          <EmptyDescription>
            Ideas you move to someday will live here until you need them.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="border-b border-border pb-4 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="space-y-2">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {item.body}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                parked for later
              </p>
            </div>
            <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {formatNoteTimestamp(item.createdAt)}
            </time>
          </div>
        </article>
      ))}
    </section>
  );
}
