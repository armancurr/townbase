"use client";

import { useMemo } from "react";

import {
  CheckCircle,
  Circle,
  ListChecks,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
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
  title,
  description,
  tasks,
  emptyTitle,
  emptyDescription,
  onToggle,
}: {
  title: string;
  description: string;
  tasks: Array<{
    id: string;
    body: string;
    action: string;
    status: "active" | "done";
    createdAt: string;
    completedAt: string | null;
  }>;
  emptyTitle: string;
  emptyDescription: string;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-mono text-sm uppercase tracking-[0.18em] text-foreground">
            {title}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {tasks.length} total
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="border border-dashed border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {emptyTitle}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.status === "done";

            return (
              <article
                key={task.id}
                className="border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isCompleted ? "secondary" : "outline"}
                        className="font-mono text-[10px] uppercase tracking-[0.16em]"
                      >
                        {isCompleted ? "done" : "active"}
                      </Badge>
                    </div>
                    <p
                      className={
                        isCompleted
                          ? "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
                          : "whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                      }
                    >
                      {task.body}
                    </p>
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                        Next action
                      </p>
                      <p
                        className={
                          isCompleted
                            ? "text-xs leading-relaxed text-muted-foreground"
                            : "text-xs leading-relaxed text-foreground/80"
                        }
                      >
                        {task.action}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggle(task.id)}
                      className="shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle
                          size={14}
                          weight="fill"
                          data-icon="inline-start"
                        />
                      ) : (
                        <Circle size={14} data-icon="inline-start" />
                      )}
                      {isCompleted ? "Mark active" : "Mark done"}
                    </Button>
                    <time className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {formatNoteTimestamp(task.completedAt ?? task.createdAt)}
                    </time>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
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
    <section className="flex flex-col gap-10">
      <TaskGroup
        title="Active work"
        description="Only the tasks that still need attention."
        tasks={activeTasks}
        emptyTitle="No active tasks"
        emptyDescription="Process an inbox item when you're ready to define the next action."
        onToggle={markTaskDone}
      />
      <TaskGroup
        title="Completed"
        description="Finished items stay visible as a short trail of recent progress."
        tasks={completedTasks}
        emptyTitle="Nothing completed yet"
        emptyDescription="Completed tasks will collect here once you mark work as done."
        onToggle={markTaskActive}
      />
    </section>
  );
}
