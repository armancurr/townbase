"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Note = {
  _id: string;
  content: string;
  updatedAt: number;
};

const notesApi = {
  list: makeFunctionReference<"query">("notes:list"),
  create: makeFunctionReference<"mutation">("notes:create"),
  update: makeFunctionReference<"mutation">("notes:update"),
};

export function SimpleNotesApp() {
  const notes = (useQuery(notesApi.list, {}) as Note[] | undefined) ?? [];
  const createNote = useMutation(notesApi.create);
  const updateNote = useMutation(notesApi.update);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (notes.length === 0) {
      setSelectedNoteId(null);
      setDraft("");
      return;
    }

    if (!selectedNoteId || !notes.some((note) => note._id === selectedNoteId)) {
      const first = notes[0];
      setSelectedNoteId(first._id);
      setDraft(first.content);
    }
  }, [notes, selectedNoteId]);

  const selected = useMemo(
    () => notes.find((note) => note._id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  useEffect(() => {
    if (!selected) {
      return;
    }

    setDraft(selected.content);
  }, [selected]);

  useEffect(() => {
    if (!selected || draft === selected.content) {
      return;
    }

    const timeout = setTimeout(() => {
      void updateNote({ noteId: selected._id, content: draft });
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [draft, selected, updateNote]);

  async function handleCreate() {
    const noteId = await createNote({ content: "" });
    setSelectedNoteId(noteId as string);
    setDraft("");
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-stone-900 md:px-8">
      <section className="mx-auto grid h-[calc(100vh-3rem)] w-full max-w-6xl grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-3 shadow-sm md:grid-cols-[280px_1fr]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-stone-200 bg-white">
          <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <h1 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
              Notes
            </h1>
            <Button
              onClick={handleCreate}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <PlusIcon size={16} weight="bold" />
            </Button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {notes.length === 0 ? (
              <p className="px-2 py-3 text-sm text-stone-500">
                Create your first note with +
              </p>
            ) : (
              notes.map((note) => (
                <button
                  className={cn(
                    "mb-1 w-full rounded-lg border px-3 py-2 text-left transition",
                    selectedNoteId === note._id
                      ? "border-stone-400 bg-stone-100"
                      : "border-transparent hover:border-stone-200 hover:bg-stone-100/70",
                  )}
                  key={note._id}
                  onClick={() => {
                    setSelectedNoteId(note._id);
                  }}
                  type="button"
                >
                  <p className="line-clamp-2 text-sm text-stone-700">
                    {note.content.trim() || "Empty note"}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="min-h-0 rounded-xl border border-stone-200 bg-white p-3 md:p-4">
          <Textarea
            className="h-full min-h-[340px] resize-none border-none bg-transparent p-2 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder="Write your note..."
            value={draft}
          />
        </section>
      </section>
    </main>
  );
}
