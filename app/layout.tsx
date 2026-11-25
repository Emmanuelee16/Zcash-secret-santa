import type { Metadata } from "next";
import { Inter_Tight, Fraunces } from "next/font/google";
import Nav from "@/components/Nav";
import Motion from "@/components/Motion";
import Snow from "@/components/Snow";
import "./globals.css";

const tight = Inter_Tight({ subsets: ["latin"], variable: "--font-tight", weight: ["400", "500", "600", "700"] });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Zcash Secret Santa",
  description: "One name. One gift. Nobody knows who sent what.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tight.variable} ${serif.variable}`}>
      <body>
        <Snow />
        <Nav />
        <Motion />
        {children}
      </body>
    </html>
  );
}
