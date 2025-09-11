import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { LocalizationProvider } from "@/hooks/use-translation";

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

export const metadata: Metadata = {
  title: "NutriGenius",
  description: "AI-powered meal planning and nutrition tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocalizationProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`font-sans ${ptSans.variable} ${ptSansHeadline.variable}`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </LocalizationProvider>
  );
}
