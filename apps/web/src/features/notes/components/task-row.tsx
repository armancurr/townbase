"use client";

import { CheckCircle, Circle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNoteTimestamp } from "../format";
import type { TaskItem } from "../types";

type TaskRowProps = {
  task: TaskItem;
  onToggle?: (id: string) => void;
  variant?: "route" | "widget";
};

export function TaskRow({ task, onToggle, variant = "route" }: TaskRowProps) {
  const isCompleted = task.status === "done";
  const isWidget = variant === "widget";

  return (
    <article
      className={cn(
        "group flex items-start justify-between gap-4 border-b border-border/70",
        isWidget ? "py-3 last:border-b-0" : "pb-5 last:border-b-0 last:pb-0",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <p
          className={cn(
            "whitespace-pre-wrap font-medium text-foreground",
            isWidget ? "text-sm leading-6" : "text-md leading-relaxed",
            isCompleted && "text-muted-foreground",
          )}
        >
          {task.body}
        </p>
        {task.details ? (
          <p
            className={cn(
              "whitespace-pre-wrap text-muted-foreground",
              isWidget ? "text-xs leading-5" : "text-sm leading-relaxed",
            )}
          >
            {task.details}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center text-neutral-900",
          isWidget ? "gap-2.5" : "gap-3",
        )}
      >
        <time
          className={cn(
            "font-mono uppercase text-neutral-900",
            isWidget ? "text-[10px] tracking-[0.18em]" : "text-sm",
          )}
        >
          {formatNoteTimestamp(task.completedAt ?? task.createdAt)}
        </time>
        <span
          aria-hidden="true"
          className={cn("w-px bg-neutral-900/20", isWidget ? "h-3" : "h-3.5")}
        />
        <Button
          variant="ghost"
          size={isWidget ? "icon-xs" : "icon-sm"}
          onClick={() => onToggle?.(task.id)}
          className="text-neutral-900 hover:bg-transparent hover:text-neutral-900"
          aria-label={isCompleted ? "Mark task active" : "Mark task done"}
          disabled={!onToggle}
        >
          {isCompleted ? (
            <CheckCircle size={isWidget ? 12 : 14} weight="fill" />
          ) : (
            <Circle size={isWidget ? 12 : 14} />
          )}
        </Button>
      </div>
    </article>
  );
}
