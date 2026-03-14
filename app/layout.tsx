import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-app",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Centre de sterilisation",
  description: "Suivi operationnel du cycle de sterilisation des dispositifs medicaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} prototype-shell antialiased`}>
        {children}
      </body>
    </html>
  );
}
