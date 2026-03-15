"use client";

import { ArrowElbowLeftDown, ArrowRight, ArrowUp } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "./notes-provider";

export function NotesCapture() {
  const pathname = usePathname();
  const { addInboxItem, isHydrated } = useNotes();
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isInboxRoute = pathname === "/notes/inbox";

  function saveCapture() {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    addInboxItem(trimmedDraft);
    setDraft("");
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  useEffect(() => {
    if (!isHydrated || !isInboxRoute) {
      return;
    }

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [isHydrated, isInboxRoute]);

  return (
    <section className="w-full">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.nativeEvent.isComposing ||
              event.key !== "Enter" ||
              event.shiftKey
            ) {
              return;
            }

            event.preventDefault();
            saveCapture();
          }}
          className="field-sizing-fixed h-56 max-h-56 resize-none overflow-y-auto rounded-xl border-neutral-800 bg-neutral-900 px-5 py-4 pb-16 text-md leading-relaxed text-stone-100 shadow-none placeholder:text-stone-400 focus-visible:border-stone-500 focus-visible:ring-0 md:text-md"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-300/78">
            <p className="flex items-center gap-2">
              <kbd className="inline-flex size-7 items-center justify-center rounded-md border border-stone-700 bg-stone-800/80 text-stone-100">
                <ArrowElbowLeftDown size={12} weight="bold" />
              </kbd>
              <span>Enter to save</span>
            </p>
            <span aria-hidden="true" className="h-3.5 w-px bg-stone-600/80" />
            <p className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex size-7 items-center justify-center rounded-md border border-stone-700 bg-stone-800/80 text-stone-100">
                  <ArrowUp size={12} weight="bold" />
                </kbd>
                <span className="text-stone-500">+</span>
                <kbd className="inline-flex size-7 items-center justify-center rounded-md border border-stone-700 bg-stone-800/80 text-stone-100">
                  <ArrowElbowLeftDown size={12} weight="bold" />
                </kbd>
              </span>
              <span>Shift + Enter for new line</span>
            </p>
          </div>
          <Button
            size="icon-sm"
            onClick={saveCapture}
            disabled={!draft.trim() || !isHydrated}
            className="pointer-events-auto rounded-full border border-stone-600/80 bg-stone-100 text-neutral-900 hover:bg-stone-200 cursor-pointer"
            aria-label="Capture note"
          >
            <ArrowRight size={14} weight="bold" />
          </Button>
        </div>
      </div>
    </section>
  );
}
