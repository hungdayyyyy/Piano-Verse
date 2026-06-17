import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PianoVerse AI",
    template: "%s | PianoVerse AI",
  },
  description:
    "AI-powered piano learning platform. Practice, create, and master piano with real-time AI feedback.",
  keywords: ["piano", "music", "AI", "learning", "practice", "composition"],
  authors: [{ name: "PianoVerse" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PianoVerse AI",
    title: "PianoVerse AI — Learn Piano with AI",
    description: "AI-powered piano learning platform.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
