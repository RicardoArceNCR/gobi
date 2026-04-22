"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, type ReactNode } from "react";
import { configurarToken } from "@/services/api";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function syncToken() {
      if (cancelled) return;

      await configurarToken(async () => {
        if (!isSignedIn) return null;
        return await getToken();
      });
    }

    syncToken();

    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, isLoaded]);

  return <>{children}</>;
}
