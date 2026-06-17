"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import { hydrateFromCookie } from "@/features/auth/authSlice";
import { setHttpToken } from "@/services/http";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsHydrated, selectAccessToken } from "@/features/auth/authSlice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector(selectIsHydrated);
  const accessToken = useAppSelector(selectAccessToken);

  // Hydrate auth state từ cookie khi app load
  useEffect(() => {
    if (!isHydrated) dispatch(hydrateFromCookie());
  }, [dispatch, isHydrated]);

  // Sync access token vào http client mỗi khi thay đổi
  useEffect(() => {
    setHttpToken(accessToken);
  }, [accessToken]);

  // Apply theme từ user preferences
  useEffect(() => {
    try {
      const match = document.cookie.split("; ").find((r) => r.startsWith("pv_user="));
      if (match) {
        const user = JSON.parse(decodeURIComponent(match.split("=")[1])) as { preferences?: { theme?: string } };
        if (user?.preferences?.theme === "light") document.documentElement.classList.add("light");
        else document.documentElement.classList.remove("light");
      }
    } catch {}
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "var(--background-card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </AuthHydrator>
    </Provider>
  );
}
