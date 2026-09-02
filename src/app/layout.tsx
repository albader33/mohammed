import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ورّاق — أدوات PDF مجانية وآمنة في متصفحك",
    template: "%s | ورّاق",
  },
  description:
    "دمج، تقسيم، تحويل، وتحرير ملفات PDF مباشرة من متصفحك بدون رفع ملفاتك لأي سيرفر. سريع، مجاني، وخصوصيتك محفوظة بالكامل.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
