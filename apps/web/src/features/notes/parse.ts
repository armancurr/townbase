import type { ProcessTaskDraft, TaskItem } from "./types";

function normalizeTaskText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function cleanCandidateLine(line: string) {
  return line.trim().replace(/^([-*]|\d+[.)])\s+/, "");
}

export function createParsedTaskDrafts(body: string): ProcessTaskDraft[] {
  const seen = new Set<string>();

  return body.split(/\r?\n+/).flatMap((line, index) => {
    const cleanedLine = cleanCandidateLine(line);

    if (!cleanedLine) {
      return [];
    }

    const normalizedLine = normalizeTaskText(cleanedLine);

    if (!normalizedLine || seen.has(normalizedLine)) {
      return [];
    }

    seen.add(normalizedLine);

    return [
      {
        id: `draft-${index}-${normalizedLine.replace(/[^a-z0-9]+/g, "-")}`,
        body: cleanedLine,
        details: "",
      },
    ];
  });
}

export function normalizeTaskDrafts(
  drafts: ProcessTaskDraft[],
): ProcessTaskDraft[] {
  const seen = new Set<string>();

  return drafts.flatMap((draft) => {
    const body = cleanCandidateLine(draft.body);
    const details = draft.details.trim();
    const normalizedBody = normalizeTaskText(body);

    if (!normalizedBody || seen.has(normalizedBody)) {
      return [];
    }

    seen.add(normalizedBody);

    return [
      {
        ...draft,
        body,
        details,
      },
    ];
  });
}

export function filterNewTaskDrafts(
  drafts: ProcessTaskDraft[],
  tasks: TaskItem[],
): ProcessTaskDraft[] {
  const existingTaskBodies = new Set(
    tasks.map((task) => normalizeTaskText(task.body)),
  );

  return drafts.filter(
    (draft) => !existingTaskBodies.has(normalizeTaskText(draft.body)),
  );
}
