import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Matcha UG | Find Your Match in Uganda",
  description: "Uganda's premium dating app. Find real connections, real people, right here.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Matcha UG",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} antialiased bg-bg-dark selection:bg-primary-pink selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

