import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}