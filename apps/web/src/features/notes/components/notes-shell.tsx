"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclesThree,
  ListChecks,
  NotePencil,
  Tray,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { SECTION_COPY } from "../constants";
import { getSectionCounts } from "../selectors";
import type { NotesSection } from "../types";
import { NotesCapture } from "./notes-capture";
import { useNotes } from "./notes-provider";

const routes = [
  { href: "/notes/inbox", section: "inbox" as NotesSection, icon: NotePencil },
  {
    href: "/notes/process",
    section: "process" as NotesSection,
    icon: CirclesThree,
  },
  { href: "/notes/tasks", section: "tasks" as NotesSection, icon: ListChecks },
  { href: "/notes/someday", section: "someday" as NotesSection, icon: Tray },
];

export function NotesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store } = useNotes();
  const counts = getSectionCounts(store);

  const activeSection = routes.find((r) => pathname === r.href)?.section;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="font-mono text-lg font-medium tracking-tight text-foreground">
              notes
            </h1>
            <p className="text-xs text-muted-foreground">
              Capture first, then route the work into the right lane.
            </p>
          </div>

          <NotesCapture />
        </header>

        {/* Navigation */}
        <nav aria-label="Notes sections" className="mb-6 flex gap-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            const count = counts[route.section];
            const label = SECTION_COPY[route.section].label;

            return (
              <Button
                key={route.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-1.5",
                  isActive && "pointer-events-none",
                  !isActive && "text-muted-foreground",
                )}
                render={<Link href={route.href} />}
              >
                <Icon
                  size={14}
                  weight={isActive ? "fill" : "regular"}
                  data-icon="inline-start"
                />
                <span>{label}</span>
                {count > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "ghost"}
                    className="ml-0.5 font-mono text-[10px]"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Section description */}
        {activeSection && (
          <p className="mb-4 text-xs text-muted-foreground">
            {SECTION_COPY[activeSection].description}
          </p>
        )}

        <Separator className="mb-6" />

        {/* Content */}
        <section className="min-h-[40vh]">{children}</section>
      </div>
    </main>
  );
}
