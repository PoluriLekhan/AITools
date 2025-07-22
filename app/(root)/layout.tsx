import Navbar from "@/components/Navbar";
import ClientProviders from "./ClientProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientProviders>
      <Navbar />
      {children}
    </ClientProviders>
  );
}