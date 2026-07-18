/**
 * Root layout — sets up fonts, theme init script (FOUC prevention),
 * and the data-theme attribute system per ui-guidelines.md §2.
 *
 * The inline <script> runs synchronously before paint so the correct
 * data-theme is applied before any CSS is rendered, eliminating flash.
 */

import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { getThemeInitScript } from "@/lib/utils/theme";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import "./globals.css";

// ── Fonts ────────────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// ── Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "SkillForge AI — Personalized Learning Roadmaps",
    template: "%s | SkillForge AI",
  },
  description:
    "AI-powered career roadmaps tailored to your goals, skills, and schedule. Build expertise with a personal AI career coach.",
};

// ── Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/*
          Inline script injected before any CSS/HTML renders.
          Reads localStorage → falls back to prefers-color-scheme.
          suppressHydrationWarning on <html> prevents React's mismatch
          warning since data-theme is set client-side before hydration.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
        />
      </head>
      <body className="bg-bg text-text min-h-dvh flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
