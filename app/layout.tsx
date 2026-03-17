import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "You And Me | Find Your Spark",
  description: "A premium dating experience inspired by Tinder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-dark selection:bg-primary-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}
