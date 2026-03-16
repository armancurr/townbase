import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { HomeWidgetGrid } from "@/components/home/home-widget-grid";
import { HomeWidgetShell } from "@/components/home/home-widget-shell";
import { NotesProvider } from "@/features/notes/components/notes-provider";
import { TasksWidget } from "@/features/notes/components/tasks-widget";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-200">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <HomeSectionHeader />

        <HomeWidgetGrid>
          <NotesProvider>
            {/*<HomeWidgetShell
              title="Notes"
              description="Current tasks"
              icon={
                <CheckCircleIcon
                  size={16}
                  weight="fill"
                  className="text-teal-800"
                />
              }
            >
              <TasksWidget />
            </HomeWidgetShell>*/}
          </NotesProvider>
        </HomeWidgetGrid>
      </div>
    </main>
  );
}
