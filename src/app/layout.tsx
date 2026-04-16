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

import { GlobalNav } from "@/components/GlobalNav";

export const metadata: Metadata = {
  title: "EASTDAWN | AI-Native Cybersecurity Platform",
  description: "Type a prompt. Master any cybersecurity domain. Live AI-generated learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${shareTechMono.variable} h-full antialiased dark`}
    >
      <body className="font-sans flex flex-col min-h-screen relative overflow-x-hidden pt-14">
        <GlobalNav />
        <div className="scanline" />
        {children}
      </body>
    </html>
  );
}
