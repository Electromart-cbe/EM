
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/layout/TopHeader";
import BottomFooter from "@/components/layout/BottomFooter";
import { CartProvider } from "@/context/ShoppingCartContext";
import { getAssetPath } from "@/lib/getAssetPath";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ELECTROMART | Fueling Tomorrow's Tech Today",
  description: "Affordable electronic components for engineering students across Tamil Nadu.",
  icons: {
    icon: getAssetPath("/images/website-icon.png"),
    shortcut: getAssetPath("/images/website-icon.png"),
    apple: getAssetPath("/images/website-icon.png"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <TopHeader />
          <main className="flex-grow">
            {children}
          </main>
          <BottomFooter />
        </CartProvider>
      </body>
    </html>
  );
}
