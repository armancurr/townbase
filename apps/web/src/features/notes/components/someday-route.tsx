"use client";

import { useMemo } from "react";

import { CloudSun } from "@phosphor-icons/react";

import { Card, CardContent } from "@/components/ui/card";
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
    <section className="flex flex-col gap-2">
      {items.map((item) => (
        <Card key={item.id} size="sm">
          <CardContent>
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
              {item.body}
            </p>
          </CardContent>
          <div className="px-4 pb-1 text-right">
            <time className="font-mono text-[10px] text-muted-foreground">
              {formatNoteTimestamp(item.createdAt)}
            </time>
          </div>
        </Card>
      ))}
    </section>
  );
}
