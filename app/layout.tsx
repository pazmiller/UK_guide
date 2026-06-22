import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}
