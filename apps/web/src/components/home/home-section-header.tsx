import { HouseSimple } from "@phosphor-icons/react/dist/ssr";

export function HomeSectionHeader() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-neutral-900">
        <HouseSimple size={30} weight="fill" className="text-teal-800" />
        <h1 className="font-mono text-4xl font-semibold tracking-tight text-stone-900">
          townbase
        </h1>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-neutral-900">
        A singular workspace housing every tool you need. Built for depth,
        designed for focus.
      </p>
    </section>
  );
}
