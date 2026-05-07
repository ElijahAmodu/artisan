import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtisanConnect — Hire Trusted Professionals",
  description:
    "Connect with vetted artisans for plumbing, electrical, carpentry and more. Secure escrow payments. Real-time job tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
