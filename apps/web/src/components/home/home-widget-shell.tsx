import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HomeWidgetShellProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function HomeWidgetShell({
  title,
  description,
  icon,
  action,
  children,
}: HomeWidgetShellProps) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b px-4 py-4 sm:px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-900">
              {icon}
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-900">
                {title}
              </CardTitle>
            </div>
            {description ? (
              <CardDescription className="text-xs/relaxed text-neutral-900">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="px-4 py-4">{children}</CardContent>
    </Card>
  );
}
