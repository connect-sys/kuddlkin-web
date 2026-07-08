"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";
import { LocationProvider } from "@/lib/location";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>{children}</LocationProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#2c2620",
              color: "#fffaf3",
              borderRadius: "14px",
              fontWeight: 600,
            },
            success: { iconTheme: { primary: "#267d71", secondary: "#fff" } },
            error: { iconTheme: { primary: "#fb5261", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
