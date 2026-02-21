import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { PresenceListener } from "@/components/PresenceListener";
import { ModerationOverlay } from "@/components/ui/ModerationOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oi! Lend Me - Campus Lending Platform",
  description: "The premium college lending app. Share, borrow, and build trust.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground min-h-screen antialiased selection:bg-blue-500/30 selection:text-blue-200")}>
        <main className="min-h-screen relative overflow-hidden">
            {children}
            <PresenceListener />
            <ModerationOverlay />
            <Toaster />
        </main>
      </body>
    </html>
  );
}
