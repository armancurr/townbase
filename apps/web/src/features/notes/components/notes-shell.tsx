"use client";

import { cn } from "@/lib/utils";
import {
  PenNibIcon,
  PencilSimpleIcon,
  CheckCircleIcon,
  TrayIcon,
  TimerIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NotesSection } from "../types";
import { NotesCapture } from "./notes-capture";
import { useNotes } from "./notes-provider";

const routes = [
  {
    href: "/notes/inbox",
    section: "inbox" as NotesSection,
    label: "Inbox",
    icon: TrayIcon,
  },
  {
    href: "/notes/process",
    section: "process" as NotesSection,
    label: "Process",
    icon: PencilSimpleIcon,
  },
  {
    href: "/notes/tasks",
    section: "tasks" as NotesSection,
    label: "Tasks",
    icon: CheckCircleIcon,
  },
  {
    href: "/notes/someday",
    section: "someday" as NotesSection,
    label: "Someday",
    icon: TimerIcon,
  },
];

export function NotesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useNotes();

  return (
    <main className="min-h-screen bg-stone-200">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PenNibIcon
                    size={28}
                    weight="fill"
                    className="text-neutral-900"
                  />
                  <h1 className="font-mono text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                    notes
                  </h1>
                </div>
                <p className="max-w-lg text-sm leading-relaxed text-neutral-900">
                  Capture loose thoughts, clear the inbox one note at a time,
                  and keep active work moving without losing what can wait.
                </p>
              </div>
            </div>
          </div>

          <NotesCapture />
        </header>

        <section className="mt-10">
          <nav
            aria-label="Notes sections"
            className="flex flex-wrap gap-x-6 gap-y-4 py-4"
          >
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-w-0 items-center gap-2 pb-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={18} weight="fill" />
                  <span className="font-mono text-sm uppercase">
                    {route.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </section>

        <section className="min-h-[40vh] py-8">{children}</section>
      </div>
    </main>
  );
}
