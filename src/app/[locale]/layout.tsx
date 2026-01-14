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
import { ConverterStatus } from '@/components/status/ConverterStatus';
import { Toaster } from '@/components/ui/sonner';
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
  title: "aepoconvert",
  description: "Free online file converter",
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
          <GradientBackground />
          <Header />
          <main className="min-h-[calc(100vh-7rem)]">
            {children}
          </main>
          <Footer />
          <DragOverlay />
          <ConverterStatus />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
