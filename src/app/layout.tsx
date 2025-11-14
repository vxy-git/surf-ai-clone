import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { cookies } from "next/headers";
import type { Language } from "@/i18n/languages";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aqora AI",
  description: "The On-Chain AGI Infrastructure",
  icons: {
    icon: [
      { url: "/images/logo.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/images/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: ["/images/logo.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("language")?.value as Language | undefined;
  const initialLanguage: Language = cookieLanguage ?? "en";

  return (
    <html
      lang={initialLanguage}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody initialLanguage={initialLanguage}>{children}</ClientBody>
      </body>
    </html>
  );
}
