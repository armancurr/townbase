"use client";

import type { ReactNode } from "react";
import type { TaskItem } from "../types";
import { TaskRow } from "./task-row";

type TasksListProps = {
  tasks: TaskItem[];
  onToggle?: (id: string) => void;
  variant?: "route" | "widget";
  emptyState?: ReactNode;
};

export function TasksList({
  tasks,
  onToggle,
  variant = "route",
  emptyState,
}: TasksListProps) {
  if (tasks.length === 0) {
    return emptyState ?? null;
  }

  return (
    <section className={variant === "widget" ? "flex flex-col" : "space-y-5"}>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggle={onToggle}
          variant={variant}
        />
      ))}
    </section>
  );
}
