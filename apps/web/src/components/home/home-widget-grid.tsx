import type { ReactNode } from "react";

export function HomeWidgetGrid({ children }: { children: ReactNode }) {
  return <section className="grid gap-4">{children}</section>;
}
