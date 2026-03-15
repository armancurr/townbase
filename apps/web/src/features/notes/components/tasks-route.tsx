"use client";

import {
  CheckCircle,
  Circle,
  ListChecks,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { formatNoteTimestamp, getDescendingByTimestamp } from "../format";
import { useNotes } from "./notes-provider";

function TaskGroup({
  tasks,
  onToggle,
}: {
  tasks: Array<{
    id: string;
    action: string;
    status: "active" | "done";
    createdAt: string;
    completedAt: string | null;
  }>;
  onToggle: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      {tasks.map((task) => {
        const isCompleted = task.status === "done";

        return (
          <article key={task.id} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className={
                    isCompleted
                      ? "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
                      : "whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                  }
                >
                  {task.action}
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle(task.id)}
                  className="h-auto px-0 text-neutral-900 hover:bg-transparent hover:text-neutral-900"
                >
                  <span className="flex items-center gap-3">
                    <time className="font-mono text-[10px] uppercase text-neutral-900">
                      {formatNoteTimestamp(task.completedAt ?? task.createdAt)}
                    </time>
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-px bg-neutral-900/30"
                    />
                    {isCompleted ? (
                      <CheckCircle size={14} weight="fill" />
                    ) : (
                      <Circle size={14} />
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function TasksRoute() {
  const { markTaskActive, markTaskDone, store } = useNotes();

  const activeTasks = useMemo(() => {
    return getDescendingByTimestamp(
      store.tasks.filter((task) => task.status === "active"),
      (task) => task.createdAt,
    );
  }, [store.tasks]);

  const completedTasks = useMemo(() => {
    return getDescendingByTimestamp(
      store.tasks.filter((task) => task.status === "done"),
      (task) => task.completedAt ?? task.createdAt,
    );
  }, [store.tasks]);

  if (activeTasks.length === 0 && completedTasks.length === 0) {
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

  return (
    <section className="flex flex-col gap-8">
      <TaskGroup tasks={activeTasks} onToggle={markTaskDone} />
      <TaskGroup tasks={completedTasks} onToggle={markTaskActive} />
    </section>
  );
}
