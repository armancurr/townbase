import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Townbase",
  description: "Sign in to your Townbase workspace.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
