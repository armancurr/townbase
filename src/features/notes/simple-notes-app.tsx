"use client";

import {
  MagnifyingGlassIcon,
  NotePencilIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect, useMemo, useState } from "react";
import {
  Group,
  type LayoutStorage,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const layoutStorage = useMemo<LayoutStorage>(
    () => ({
      getItem: (key) =>
        typeof window === "undefined" ? null : window.localStorage.getItem(key),
      setItem: (key, value) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
        }
      },
    }),
    [],
  );
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "townbase-notes-layout",
    storage: layoutStorage,
  });

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

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) =>
      note.content.toLowerCase().includes(normalizedQuery),
    );
  }, [notes, searchQuery]);

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
    <main className="relative h-screen w-screen bg-stone-100 text-stone-900">
      <Button
        className="absolute right-3 top-3 z-10 border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
        onClick={handleCreate}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <PlusIcon size={16} weight="bold" />
      </Button>

      <Group
        className="h-full w-full"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        orientation="horizontal"
      >
        <Panel
          className="min-h-0"
          defaultSize="28%"
          id="notes-sidebar"
          maxSize="42%"
          minSize="20%"
        >
          <aside className="flex h-full min-h-0 flex-col bg-stone-50">
            <section className="px-2 py-2">
              <label className="relative block" htmlFor="notes-search">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                  size={16}
                />
                <Input
                  className="h-11 w-full border-stone-300 bg-white pl-9 text-sm text-stone-700 placeholder:text-stone-400"
                  id="notes-search"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                  placeholder="Search notes"
                  value={searchQuery}
                />
              </label>
            </section>

            <section className="min-h-0 flex-1 space-y-1 overflow-auto px-2 pb-2">
              {filteredNotes.map((note) => (
                <button
                  className={cn(
                    "h-11 w-full px-3 text-left text-sm transition",
                    selectedNoteId === note._id
                      ? "bg-stone-200"
                      : "hover:bg-stone-100",
                  )}
                  key={note._id}
                  onClick={() => {
                    setSelectedNoteId(note._id);
                  }}
                  type="button"
                >
                  <p className="line-clamp-1 text-stone-700">
                    {note.content.trim() || "Empty note"}
                  </p>
                </button>
              ))}
            </section>
          </aside>
        </Panel>

        <Separator className="w-px cursor-col-resize bg-stone-300 transition hover:bg-stone-400" />

        <Panel className="min-h-0" defaultSize="72%" id="notes-content">
          <section className="flex h-full min-h-0 flex-col bg-stone-100">
            {selected ? (
              <Textarea
                className="h-full min-h-[340px] resize-none border-none bg-transparent px-6 py-5 text-[15px] leading-relaxed text-stone-800 shadow-none focus-visible:ring-0"
                onChange={(event) => {
                  setDraft(event.target.value);
                }}
                placeholder="Start writing..."
                value={draft}
              />
            ) : (
              <Empty className="m-6 border-stone-300/70 bg-stone-50/80">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="bg-stone-200 text-stone-700"
                  >
                    <NotePencilIcon size={20} weight="duotone" />
                  </EmptyMedia>
                  <EmptyTitle className="text-stone-800">
                    No note selected
                  </EmptyTitle>
                  <EmptyDescription className="text-stone-600">
                    Pick an existing note from the left or create a fresh one to
                    start writing.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    className="bg-stone-800 text-stone-100 hover:bg-stone-700"
                    onClick={handleCreate}
                    type="button"
                  >
                    <PlusIcon size={16} weight="bold" />
                    New note
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </section>
        </Panel>
      </Group>
    </main>
  );
}
