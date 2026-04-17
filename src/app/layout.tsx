import type { Metadata } from "next";
import { Inter, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

import { createClient } from '@/utils/supabase/server'
import { ParticleBackground } from "@/components/ParticleBackground";
import { GlobalNav } from "@/components/GlobalNav";

export const metadata: Metadata = {
  title: "EASTDAWN | AI-Native Cybersecurity Platform",
  description: "Type a prompt. Master any cybersecurity domain. Live AI-generated learning.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${shareTechMono.variable} h-full antialiased dark`}
    >
      <body className="font-sans flex flex-col min-h-screen relative overflow-x-hidden pt-14 bg-[var(--color-base)]">
        <ParticleBackground isAuth={Boolean(user)} className="fixed inset-0 z-0 opacity-40" />
        <GlobalNav />
        <div className="scanline" />
        <main className="relative z-10 flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
