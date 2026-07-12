import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Special_Elite } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import MobileBackToTop from "@/components/MobileBackToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-noto-sans-sc",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-special-elite",
});


export const metadata: Metadata = {
  title: "Discover London | Your Guide to the UK's Capital",
  description: "Explore London's iconic landmarks, world-class museums, historic sites, and incredible restaurants. Your ultimate guide to the best of the UK.",
  keywords: ["London", "UK", "travel", "tourism", "attractions", "restaurants", "landmarks"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoSansSc.variable} ${specialElite.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Chatbot />
        <MobileBackToTop />
        <Footer />
      </body>
    </html>
  );
}
