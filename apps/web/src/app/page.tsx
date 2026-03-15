"use client";

import { BookOpenTextIcon, HouseSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { Fragment } from "react";

import { Separator } from "@/components/ui/separator";

const tools = [
  {
    href: "/notes",
    icon: BookOpenTextIcon,
    name: "Notes",
    description:
      "Capture loose inputs, process them into next actions, and keep someday ideas parked.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-200 p-4">
      <div className="flex w-full max-w-3xl flex-col">
        <section className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            <HouseSimple size="36" className="text-teal-800" weight="fill" />
            <h1 className="font-mono text-4xl font-semibold tracking-tight text-stone-900">
              townbase
            </h1>
          </div>
          <p className="max-w-md text-left text-base text-stone-600">
            A singular workspace housing every tool you need. Built for depth,
            designed for focus.
          </p>
        </section>

        <section className="mt-16 flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
          {tools.map((tool, index) => (
            <Fragment key={tool.name}>
              <Link href={tool.href} className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <tool.icon
                    size="24"
                    className="text-teal-800"
                    weight="fill"
                  />
                  <h3 className="font-mono text-base font-semibold text-stone-900">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-sm text-stone-600">{tool.description}</p>
              </Link>

              {index < tools.length - 1 ? (
                <>
                  <Separator className="bg-stone-300 md:hidden" />
                  <Separator
                    orientation="vertical"
                    className="hidden bg-stone-300 md:block"
                  />
                </>
              ) : null}
            </Fragment>
          ))}
        </section>
      </div>
    </main>
  );
}
