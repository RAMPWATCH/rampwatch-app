import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConstellationBackground } from "@/components/ConstellationBackground";

export const metadata: Metadata = {
  title: "SEPGATE",
  description: "Stellar anchor compliance monitor, metered via x402.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-bg-primary text-text-primary antialiased">
        <ConstellationBackground />
        <div className="relative z-10">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
