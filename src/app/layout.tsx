import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["400", "500", "700"],
});

const notoSerifTc = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "和安中醫診所 | 傳統智慧與現代照護",
  description: "和安中醫診所官方網站，提供線上預約、醫師團隊與健康專欄資訊。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansTc.variable} ${notoSerifTc.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
