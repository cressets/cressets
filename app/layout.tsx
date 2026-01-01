import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as per premium design
import "./globals.css"; // Import global SCSS
import EmotionRegistry from "./registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cressets | Market Insights",
  description: "Discover market insights and manage your assets with clarity and confidence.",
};

import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <EmotionRegistry>
          <main className="main-content">{children}</main>
        </EmotionRegistry>
      </body>
    </html>
  );
}
