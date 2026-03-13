import { HouseSimple } from "@phosphor-icons/react/dist/ssr";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-200 p-4">
      <section className="flex w-full max-w-3xl flex-col gap-8 md:flex-row md:items-center md:gap-8">
        <div className="flex flex-1 flex-col items-start gap-6 md:items-end">
          <div className="flex items-center gap-3">
            <HouseSimple size="36" className="text-teal-800" weight="fill" />
            <h1 className="font-mono text-4xl font-semibold tracking-tight text-stone-900">
              townbase
            </h1>
          </div>
        </div>
        <div className="hidden self-stretch border-l border-stone-400/40 md:block" />
        <div className="h-px w-full bg-stone-400/40 md:hidden" />
        <p className="max-w-md text-left text-base text-stone-600">
          You need to sign in before entering this area. This workspace requires
          authentication to access its contents.
        </p>
      </section>
    </main>
  );
}
