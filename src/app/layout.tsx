import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ScholarPress | Academic & Research Publishing",
    template: "%s | ScholarPress",
  },
  description:
    "An open-access academic and research publishing platform dedicated to empirical inquiry, systems architecture, and scientific discourse.",
  applicationName: "ScholarPress",
  authors: [{ name: "ScholarPress Author" }],
  creator: "ScholarPress Author",
  publisher: "ScholarPress",
  keywords: [
    "Academic Research",
    "Open Access",
    "Peer-Reviewed Articles",
    "Computer Science",
    "Scientific Journal",
    "Systems Architecture",
    "Scholarly Essays",
    "Empirical Studies",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ScholarPress",
    title: "ScholarPress | Academic & Research Publishing",
    description:
      "An open-access academic and research publishing platform dedicated to empirical inquiry, systems architecture, and scientific discourse.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScholarPress | Academic & Research Publishing",
    description:
      "An open-access academic and research publishing platform dedicated to empirical inquiry, systems architecture, and scientific discourse.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
