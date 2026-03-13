import { NotesProvider, NotesShell } from "@/features/notes";

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
