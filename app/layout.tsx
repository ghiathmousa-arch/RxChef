import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Outfit } from "next/font/google";
import { AnalysisProvider } from "./context/analysis-context";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RxChef — تجديد الوصفة الذكي",
  description:
    "فحص للتفاعلات، ترتيب للبدائل عند نقص التوفّر، وشرح واضح لكل اقتراح.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} ${outfit.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col text-ink"
        style={{
          backgroundImage:
            "radial-gradient(64% 42% at 78% 4%, rgba(52,143,128,.10), transparent 70%), radial-gradient(52% 38% at 10% 92%, rgba(216,154,131,.13), transparent 72%), linear-gradient(165deg,#F4F6F3,#F6F5F1 46%,#F8F1EC)",
          backgroundAttachment: "fixed",
        }}
      >
        <AnalysisProvider>{children}</AnalysisProvider>
      </body>
    </html>
  );
}
