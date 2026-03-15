import { NotesProvider } from "@/features/notes/components/notes-provider";
import { NotesShell } from "@/features/notes/components/notes-shell";

export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NotesProvider>
      <NotesShell>{children}</NotesShell>
    </NotesProvider>
  );
}
