import type { Metadata } from "next";
import { Geist, Noto_Sans_Myanmar } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoMyanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "မြန်မာ ခရီး · Myanmar Trip",
  description:
    "Ask where you want to go in Myanmar. Get attractions, hotels, and buses on a map.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      className={`${geistSans.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden bg-sand text-ink font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
