import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyboard Hero - Master Blind Touch-Typing",
  description: "Adaptive, offline-first blind touch-typing tutor powered by muscle memory isolation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

