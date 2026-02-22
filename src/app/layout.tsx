import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
