import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Notes - Townbase",
  description:
    "Capture loose inputs, process them into next actions, and keep someday ideas parked.",
};

export default function NotesPage() {
  redirect("/notes/inbox");
}
