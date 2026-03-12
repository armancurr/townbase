"use client";

import {
  HouseSimple,
  CheckCircleIcon,
  ChatCircleIcon,
  CurrencyDollarSimpleIcon,
} from "@phosphor-icons/react";

const tools = [
  {
    icon: CheckCircleIcon,
    name: "Tasks",
    description: "Organize work with kanban boards and track progress.",
  },
  {
    icon: ChatCircleIcon,
    name: "Docs",
    description: "Write, collaborate, and share documents in real-time.",
  },
  {
    icon: CurrencyDollarSimpleIcon,
    name: "Analytics",
    description: "Visualize data and gain insights from your workspace.",
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

        <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.name} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <tool.icon size="24" className="text-teal-800" weight="fill" />
                <h3 className="font-mono text-base font-semibold text-stone-900">
                  {tool.name}
                </h3>
              </div>
              <p className="text-sm text-stone-600">{tool.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
