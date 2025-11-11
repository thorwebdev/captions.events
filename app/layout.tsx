import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiveCaptions - Real-time captions for your live events",
  description:
    "Broadcast live captions to your audience with ease. Perfect for conferences, webinars, and presentations.",
  generator: "v0.app",
  openGraph: {
    title: "LiveCaptions - Real-time captions for your live events",
    description:
      "Broadcast live captions to your audience with ease. Perfect for conferences, webinars, and presentations.",
    images: [
      {
        url: "/supa_scribe_og.jpg",
        width: 1200,
        height: 630,
        alt: "LiveCaptions - Real-time captions for your live events",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveCaptions - Real-time captions for your live events",
    description:
      "Broadcast live captions to your audience with ease. Perfect for conferences, webinars, and presentations.",
    images: ["/supa_scribe_og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>{children}</body>
    </html>
  );
}
