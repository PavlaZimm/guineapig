import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morče Tamagotchi 🐾",
  description: "Virtuální morče — krmit, hrát si, česat a nechat spát!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
