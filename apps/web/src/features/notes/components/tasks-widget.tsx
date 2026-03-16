"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getActiveTasks } from "../selectors";
import { useNotes } from "./notes-provider";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksList } from "./tasks-list";

const MAX_WIDGET_TASKS = 5;

export function TasksWidget() {
  const { markTaskDone, store } = useNotes();

  const activeTasks = useMemo(() => {
    return getActiveTasks(store);
  }, [store]);

  const visibleTasks = activeTasks.slice(0, MAX_WIDGET_TASKS);
  const overflowCount = Math.max(activeTasks.length - visibleTasks.length, 0);

  return (
    <section className="flex flex-col gap-4">

      <TasksList
        tasks={visibleTasks}
        onToggle={markTaskDone}
        variant="widget"
        emptyState={<TasksEmptyState variant="widget" />}
      />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <p className="text-xs text-muted-foreground">
          {overflowCount > 0
            ? `${overflowCount} more in notes`
            : "Open notes for the full list"}
        </p>
        <Button
          variant="outline"
          size="xs"
          render={<Link href="/notes/tasks" />}
        >
          View all
          <ArrowRight size={14} data-icon="inline-end" />
        </Button>
      </footer>
    </section>
  );
}
