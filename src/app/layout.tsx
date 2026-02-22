import type { Metadata } from "next";
import { ConvexClientProvider } from "@/providers/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Townbase - Your personal command center",
    default: "Townbase - Your personal command center",
  },
  description:
    "Your personal command center. A private vault for notes, tasks, links, and secrets with profiles that match how you actually live. Self-hosted. Encrypted. Yours.",
  keywords: ["notes", "tasks", "productivity", "self-hosted", "encrypted"],
  authors: [{ name: "armancurr" }],
  openGraph: {
    title: "Townbase",
    description:
      "Your personal command center. A private vault for notes, tasks, links, and secrets. Self-hosted. Encrypted. Yours.",
    type: "website",
    siteName: "Townbase",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
