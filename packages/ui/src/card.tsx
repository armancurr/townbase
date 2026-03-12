import type { JSX, ReactNode } from "react";

interface CardProps {
  className?: string;
  title: string;
  children: ReactNode;
}

export function Card({ className, title, children }: CardProps): JSX.Element {
  return (
    <article className={className}>
      <h2>{title}</h2>
      <div>{children}</div>
    </article>
  );
}
