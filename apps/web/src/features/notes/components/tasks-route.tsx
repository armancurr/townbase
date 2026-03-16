"use client";

import { useMemo } from "react";
import { getActiveTasks, getCompletedTasks } from "../selectors";
import { useNotes } from "./notes-provider";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksList } from "./tasks-list";

export function TasksRoute() {
  const { markTaskActive, markTaskDone, store } = useNotes();

  const activeTasks = useMemo(() => {
    return getActiveTasks(store);
  }, [store]);

  const completedTasks = useMemo(() => {
    return getCompletedTasks(store);
  }, [store]);

  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <section className="flex flex-col gap-8">
      <TasksList tasks={activeTasks} onToggle={markTaskDone} />
      <TasksList tasks={completedTasks} onToggle={markTaskActive} />
    </section>
  );
}
