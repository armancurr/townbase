"use client";

import { ListChecks } from "@phosphor-icons/react/dist/ssr";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type TasksEmptyStateProps = {
  variant?: "route" | "widget";
};

export function TasksEmptyState({ variant = "route" }: TasksEmptyStateProps) {
  if (variant === "widget") {
    return (
      <Empty className="min-h-0 border border-dashed border-border/80 bg-muted/25 py-8">
        <EmptyHeader className="gap-1.5">
          <EmptyMedia variant="icon">
            <ListChecks size={16} />
          </EmptyMedia>
          <EmptyTitle>Nothing active</EmptyTitle>
          <EmptyDescription>
            Your next actions will show up here as soon as you process a note.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListChecks size={16} />
        </EmptyMedia>
        <EmptyTitle>No tasks yet</EmptyTitle>
        <EmptyDescription>
          Process an inbox item and create a task from it.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
