"use client";

import { useEffect, useRef, useState } from "react";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

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
    <section className="w-full space-y-2">
      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            saveCapture();
          }
        }}
        placeholder="What's on your mind?"
        className="min-h-20 resize-none"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-wide text-muted-foreground">
          shift+enter to save
        </p>
        <Button
          size="sm"
          onClick={saveCapture}
          disabled={!draft.trim() || !isHydrated}
        >
          <PaperPlaneTilt size={14} weight="fill" data-icon="inline-start" />
          Capture
        </Button>
      </div>
    </section>
  );
}
