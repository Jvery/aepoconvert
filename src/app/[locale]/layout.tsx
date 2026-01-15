import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { DragOverlay } from '@/components/layout/DragOverlay';
import { SkipLink } from '@/components/layout/SkipLink';
import { ConverterStatus } from '@/components/status/ConverterStatus';
import { StatusAnnouncer } from '@/components/status/StatusAnnouncer';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aepoconvert — Free Online File Converter",
  description: "Convert images, audio, and documents for free. 100% private — all processing happens in your browser.",
  keywords: ["file converter", "image converter", "audio converter", "document converter", "online converter", "free converter", "privacy", "browser-based", "WebAssembly"],
  authors: [{ name: "aepoconvert" }],
  creator: "aepoconvert",
  metadataBase: new URL("https://aepoconvert.com"),
  openGraph: {
    title: "aepoconvert — Free Online File Converter",
    description: "Convert images, audio, and documents for free. 100% private — all processing happens in your browser.",
    type: "website",
    url: "https://aepoconvert.com",
    siteName: "aepoconvert",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "aepoconvert — Free Online File Converter",
    description: "Convert images, audio, and documents for free. 100% private — all processing happens in your browser.",
    creator: "@aepoconvert",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SkipLink />
            <GradientBackground />
            <Header />
            <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-7rem)] focus:outline-none">
              {children}
            </main>
            <Footer />
            <DragOverlay />
            <ConverterStatus />
            <StatusAnnouncer />
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
