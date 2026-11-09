import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAProvider } from "@/components/pwa";
import { GuestMergeModal } from "@/components/auth";

export const metadata: Metadata = {
  title: "Keyboard Hero - Master Blind Touch-Typing",
  description: "Adaptive, offline-first blind touch-typing tutor powered by muscle memory isolation.",
  applicationName: "Keyboard Hero",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://keyboard-hero-app.vercel.app"),
  openGraph: {
    title: "Keyboard Hero - Master Blind Touch-Typing",
    description: "Adaptive, offline-first blind touch-typing tutor powered by muscle memory isolation.",
    url: "https://keyboard-hero-app.vercel.app",
    siteName: "Keyboard Hero",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Keyboard Hero - Touch-Typing Tutor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyboard Hero - Master Blind Touch-Typing",
    description: "Adaptive, offline-first blind touch-typing tutor powered by muscle memory isolation.",
    images: ["/og-image.png"],
  },
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
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
      <head>
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Keyboard Hero - Master Blind Touch-Typing" />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                var regFn = function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[PWA] Service Worker registered with scope:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[PWA] Service Worker registration failed:', err);
                    });
                };
                if (document.readyState === 'complete') {
                  regFn();
                } else {
                  window.addEventListener('load', regFn);
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <PWAProvider>
          {children}
          <GuestMergeModal />
        </PWAProvider>
      </body>
    </html>
  );
}
