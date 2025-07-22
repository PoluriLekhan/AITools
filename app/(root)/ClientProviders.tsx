"use client";
import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
} 