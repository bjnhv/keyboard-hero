import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAProvider } from "@/components/pwa";

export const metadata: Metadata = {
  title: "Keyboard Hero - Master Blind Touch-Typing",
  description: "Adaptive, offline-first blind touch-typing tutor powered by muscle memory isolation.",
  applicationName: "Keyboard Hero",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Keyboard Hero",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}
