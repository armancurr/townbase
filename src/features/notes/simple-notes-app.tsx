"use client";

import {
  MagnifyingGlassIcon,
  NotePencilIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect, useMemo, useReducer } from "react";
import {
  Group,
  type LayoutStorage,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

type NotesState = {
  selectedNoteId: string | null;
  draft: string;
  searchQuery: string;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
};

type NotesAction =
  | { type: "sync-selection"; notes: Note[] }
  | { type: "sync-draft"; content: string }
  | { type: "select-note"; noteId: string }
  | { type: "set-draft"; draft: string }
  | { type: "set-search-query"; searchQuery: string }
  | { type: "set-delete-dialog-open"; isOpen: boolean }
  | { type: "set-is-deleting"; isDeleting: boolean }
  | { type: "created-note"; noteId: string }
  | { type: "deleted-note" };

const initialState: NotesState = {
  selectedNoteId: null,
  draft: "",
  searchQuery: "",
  isDeleteDialogOpen: false,
  isDeleting: false,
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "sync-selection": {
      if (action.notes.length === 0) {
        if (state.selectedNoteId === null && state.draft === "") {
          return state;
        }

        return {
          ...state,
          selectedNoteId: null,
          draft: "",
        };
      }

      const hasSelectedNote =
        state.selectedNoteId !== null &&
        action.notes.some((note) => note._id === state.selectedNoteId);

      if (hasSelectedNote) {
        return state;
      }

      const first = action.notes[0];

      return {
        ...state,
        selectedNoteId: first._id,
        draft: first.content,
      };
    }
    case "sync-draft": {
      if (state.draft === action.content) {
        return state;
      }

      return {
        ...state,
        draft: action.content,
      };
    }
    case "select-note": {
      if (state.selectedNoteId === action.noteId) {
        return state;
      }

      return {
        ...state,
        selectedNoteId: action.noteId,
      };
    }
    case "set-draft": {
      if (state.draft === action.draft) {
        return state;
      }

      return {
        ...state,
        draft: action.draft,
      };
    }
    case "set-search-query": {
      if (state.searchQuery === action.searchQuery) {
        return state;
      }

      return {
        ...state,
        searchQuery: action.searchQuery,
      };
    }
    case "set-delete-dialog-open": {
      if (state.isDeleteDialogOpen === action.isOpen) {
        return state;
      }

      return {
        ...state,
        isDeleteDialogOpen: action.isOpen,
      };
    }
    case "set-is-deleting": {
      if (state.isDeleting === action.isDeleting) {
        return state;
      }

      return {
        ...state,
        isDeleting: action.isDeleting,
      };
    }
    case "created-note": {
      return {
        ...state,
        selectedNoteId: action.noteId,
        draft: "",
      };
    }
    case "deleted-note": {
      return {
        ...state,
        selectedNoteId: null,
        draft: "",
        isDeleteDialogOpen: false,
      };
    }
    default: {
      return state;
    }
  }
}

const notesApi = {
  list: makeFunctionReference<"query">("notes:list"),
  create: makeFunctionReference<"mutation">("notes:create"),
  update: makeFunctionReference<"mutation">("notes:update"),
  remove: makeFunctionReference<"mutation">("notes:remove"),
};

export function SimpleNotesApp() {
  const notes = (useQuery(notesApi.list, {}) as Note[] | undefined) ?? [];
  const createNote = useMutation(notesApi.create);
  const updateNote = useMutation(notesApi.update);
  const deleteNote = useMutation(notesApi.remove);
  const [state, dispatch] = useReducer(notesReducer, initialState);
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
    dispatch({ type: "sync-selection", notes });
  }, [notes]);

  const selected = useMemo(
    () => notes.find((note) => note._id === state.selectedNoteId) ?? null,
    [notes, state.selectedNoteId],
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = state.searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) =>
      note.content.toLowerCase().includes(normalizedQuery),
    );
  }, [notes, state.searchQuery]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    if (state.draft === selected.content) {
      return;
    }

    dispatch({ type: "sync-draft", content: selected.content });
  }, [selected, state.draft]);

  useEffect(() => {
    if (state.isDeleting || !selected || state.draft === selected.content) {
      return;
    }

    const timeout = setTimeout(() => {
      void updateNote({ noteId: selected._id, content: state.draft });
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [selected, state.draft, state.isDeleting, updateNote]);

  async function handleCreate() {
    const noteId = await createNote({ content: "" });
    dispatch({ type: "created-note", noteId: noteId as string });
  }

  function handleDeleteSelected() {
    if (!selected) {
      return;
    }

    const noteId = selected._id;

    dispatch({ type: "set-is-deleting", isDeleting: true });

    void deleteNote({ noteId })
      .then(() => {
        dispatch({ type: "deleted-note" });
      })
      .finally(() => {
        dispatch({ type: "set-is-deleting", isDeleting: false });
      });
  }

  return (
    <main className="relative h-screen w-screen bg-stone-100 text-stone-900">
      <section className="absolute right-3 top-3 z-10 flex items-center gap-2">
        {selected ? (
          <AlertDialog
            onOpenChange={(isOpen) => {
              dispatch({ type: "set-delete-dialog-open", isOpen });
            }}
            open={state.isDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                disabled={state.isDeleting}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <TrashIcon size={16} weight="bold" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This note will be permanently deleted and cannot be restored.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={state.isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={state.isDeleting}
                  onClick={handleDeleteSelected}
                  variant="destructive"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <Button
          className="border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
          onClick={handleCreate}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <PlusIcon size={16} weight="bold" />
        </Button>
      </section>

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
                    dispatch({
                      type: "set-search-query",
                      searchQuery: event.target.value,
                    });
                  }}
                  placeholder="Search notes"
                  value={state.searchQuery}
                />
              </label>
            </section>

            <section className="min-h-0 flex-1 space-y-1 overflow-auto px-2 pb-2">
              {filteredNotes.map((note) => (
                <button
                  className={cn(
                    "h-11 w-full px-3 text-left text-sm transition",
                    state.selectedNoteId === note._id
                      ? "bg-stone-200"
                      : "hover:bg-stone-100",
                  )}
                  key={note._id}
                  onClick={() => {
                    dispatch({ type: "select-note", noteId: note._id });
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
                  dispatch({ type: "set-draft", draft: event.target.value });
                }}
                placeholder="Start writing..."
                value={state.draft}
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
