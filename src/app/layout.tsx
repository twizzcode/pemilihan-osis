import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "PILKOSPAPI — Pemilihan Ketua OSPA & OSPI",
    template: "%s · PILKOSPAPI",
  },
  description:
    "PILKOSPAPI adalah sistem pemilihan ketua OSPA & OSPI online: kelola data pemilih, paslon putra & putri, dan rekap hasil suara secara real-time dalam satu portal.",
  applicationName: "PILKOSPAPI",
  keywords: [
    "PILKOSPAPI",
    "pemilihan ketua OSPA OSPI",
    "e-voting sekolah",
    "pemilu OSPA OSPI online",
    "voting online",
    "sistem pemilihan ketua OSPA OSPI",
  ],
  authors: [{ name: "PILKOSPAPI" }],
  creator: "PILKOSPAPI",
  category: "education",
  openGraph: {
    type: "website",
    siteName: "PILKOSPAPI",
    title: "PILKOSPAPI — Pemilihan Ketua OSPA & OSPI",
    description:
      "Sistem pemilihan ketua OSPA & OSPI online dengan pemisahan paslon putra & putri, satu NIS satu suara.",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "PILKOSPAPI — Pemilihan Ketua OSPA & OSPI",
    description:
      "Sistem pemilihan ketua OSPA & OSPI online dengan pemisahan paslon putra & putri, satu NIS satu suara.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5b3df0" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1533" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${grotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
