"use client";

import { GithubLogoIcon, HouseSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-stone-200 font-sans">
      <div className="max-w-lg">
        <h1 className="text-6xl font-mono font-semibold tracking-tight text-stone-900 mb-6 flex items-center gap-3">
          <HouseSimpleIcon size={60} weight="fill" />
          Townbase
        </h1>
        <p className="text-lg leading-relaxed text-stone-600 mb-6">
          Your personal command center, a private vault for notes, tasks, links,
          and secrets, with profiles that match how you actually live, and a
          shared space to coordinate with the people who matter. Self-hosted.
          Encrypted. Yours.
        </p>
        <Button
          asChild
          className="bg-stone-800 hover:bg-stone-700 text-stone-100"
        >
          <Link
            href="https://github.com/armancurr/townbase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubLogoIcon size={20} weight="fill" />
            Contribute
          </Link>
        </Button>
      </div>
    </main>
  );
}
