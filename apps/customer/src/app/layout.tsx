import type { Metadata, Viewport } from "next";
import "./globals.css";
import { adineue, nunito } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export const metadata: Metadata = {
  title: "Kuddl — Joyful experiences for every child",
  description:
    "Discover trusted childcare, classes, parties and camps near you. Adventure, Bloom, Care & Discover — all in one playful place built for families.",
  keywords: [
    "kuddl",
    "childcare",
    "kids classes",
    "kids parties",
    "camps",
    "babysitting",
    "family",
  ],
  openGraph: {
    title: "Kuddl — Joyful experiences for every child",
    description:
      "Trusted childcare, classes, parties and camps near you — all in one playful place.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#EF9855",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${adineue.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-kuddl-cream text-kuddl-ink">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
