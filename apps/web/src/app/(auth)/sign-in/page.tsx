"use client";

import { House, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" weight="regular" />
        <span>Back to home</span>
      </Link>

      {/* Auth Card */}
      <section className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <House className="h-8 w-8 text-teal-800" weight="regular" />
            <span className="text-2xl font-semibold tracking-tight text-stone-900">
              townbase
            </span>
          </div>
          <p className="text-sm text-stone-600">
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Auth Form Placeholder */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="h-11 w-full border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none"
          />
          <button
            type="button"
            className="h-11 w-full bg-teal-800 text-sm font-medium text-white transition-colors hover:bg-teal-900"
          >
            Continue
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-500">
            Don&apos;t have an account?{" "}
            <span className="cursor-pointer text-teal-800 underline-offset-4 hover:underline">
              Get started
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
