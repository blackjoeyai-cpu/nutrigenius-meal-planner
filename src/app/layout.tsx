
"use client";

import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import {
  LocalizationProvider,
  useTranslation,
} from "@/hooks/use-translation";
import { useEffect } from "react";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const ptSansHeadline = PT_Sans({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-headline",
});

// export const metadata: Metadata = {
//   title: "NutriGenius",
//   description: "AI-powered meal planning and nutrition tracking.",
// };

function AppBody({ children }: { children: React.ReactNode }) {
  const { language } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <body
      className={`font-sans ${ptSans.variable} ${ptSansHeadline.variable}`}
    >
      {children}
      <Toaster />
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocalizationProvider>
      <html lang="en" suppressHydrationWarning>
        <AppBody>{children}</AppBody>
      </html>
    </LocalizationProvider>
  );
}
