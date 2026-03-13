"use client";

import { useMemo } from "react";

import {
  CheckCircle,
  Circle,
  ListChecks,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const orderedTasks = [...activeTasks, ...completedTasks];

  if (orderedTasks.length === 0) {
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
    <section className="flex flex-col gap-2">
      {orderedTasks.map((task) => {
        const isCompleted = task.status === "done";

        return (
          <Card
            key={task.id}
            size="sm"
            className={isCompleted ? "opacity-50" : ""}
          >
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <p
                    className={
                      isCompleted
                        ? "whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground line-through"
                        : "whitespace-pre-wrap text-xs leading-relaxed text-foreground"
                    }
                  >
                    {task.body}
                  </p>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      next action
                    </span>
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
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant={isCompleted ? "secondary" : "outline"}
                    className="font-mono text-[10px]"
                  >
                    {isCompleted ? "done" : "active"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      if (isCompleted) {
                        markTaskActive(task.id);
                        return;
                      }

                      markTaskDone(task.id);
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={14} weight="fill" />
                    ) : (
                      <Circle size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <div className="px-4 pb-1 text-right">
              <time className="font-mono text-[10px] text-muted-foreground">
                {formatNoteTimestamp(task.completedAt ?? task.createdAt)}
              </time>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
