import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moje Morče 🐹",
  description: "Virtuální morče — mazlíček, o který se staráš!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
