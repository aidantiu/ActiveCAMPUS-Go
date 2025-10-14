import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActiveCAMPUS Go",
  description: "ActiveCAMPUS GO is a gamified fitness platform designed to promote student wellness by turning everyday walking around campus into a fun, rewarding, and social experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
