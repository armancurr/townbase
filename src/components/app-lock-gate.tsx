"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

const UNLOCK_STORAGE_KEY = "townbase:app-unlocked";

type AppLockGateProps = {
  children: React.ReactNode;
};

export function AppLockGate({ children }: AppLockGateProps) {
  const configuredPassword = useMemo(
    () => (process.env.NEXT_PUBLIC_APP_PASSWORD ?? "").trim(),
    [],
  );
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [password, setPassword] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!configuredPassword) {
      setIsCheckingStorage(false);
      return;
    }

    try {
      const unlocked = window.sessionStorage.getItem(UNLOCK_STORAGE_KEY);
      if (unlocked === "true") {
        setIsUnlocked(true);
      }
    } finally {
      setIsCheckingStorage(false);
    }
  }, [configuredPassword]);

  function handleUnlock() {
    if (!configuredPassword) {
      return;
    }

    if (password !== configuredPassword) {
      setHasError(true);
      setPassword("");
      return;
    }

    try {
      window.sessionStorage.setItem(UNLOCK_STORAGE_KEY, "true");
    } finally {
      setIsUnlocked(true);
      setHasError(false);
      setPassword("");
    }
  }

  if (isCheckingStorage) {
    return null;
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-200 px-4">
      <Input
        aria-invalid={hasError}
        autoComplete="current-password"
        autoFocus
        className="w-full max-w-sm bg-white"
        disabled={!configuredPassword}
        id="app-password"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleUnlock();
          }
        }}
        onChange={(event) => {
          setPassword(event.target.value);
          if (hasError) {
            setHasError(false);
          }
        }}
        // placeholder={
        //   configuredPassword
        //     ? hasError
        //       ? "Incorrect password"
        //       : "Enter password"
        //     : "Missing NEXT_PUBLIC_APP_PASSWORD"
        // }
        type="password"
        value={password}
      />
    </main>
  );
}
