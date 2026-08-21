import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RampWatch",
  description: "Stellar anchor compliance monitor, metered via x402.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
