"use client";

import { CloudSun } from "@phosphor-icons/react";
import { useMemo } from "react";

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
