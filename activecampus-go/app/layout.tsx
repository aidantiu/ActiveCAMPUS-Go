import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const kenneyFont = localFont({
  src: '../public/fonts/Kenney Mini.ttf',
  variable: '--font-kenney',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "ActiveCAMPUS Go",
  description: "Campus management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kenneyFont.variable}>
      <body className={kenneyFont.className}>
        {children}
      </body>
    </html>
  );
}