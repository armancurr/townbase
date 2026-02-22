"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

type ConvexClientProviderProps = {
  children: React.ReactNode;
};

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(
  convexUrl ?? "https://placeholder-convex-url.convex.cloud",
);

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
