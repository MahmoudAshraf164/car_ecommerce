import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "معرض ولاد العم للسيارات وأفلام الحماية | منوف، المنوفية",
  description:
    "معرض ولاد العم للسيارات وأفلام الحماية في منوف، المنوفية، مصر. أجيال من الثقة والالتزام في بيع السيارات وتركيب PPF والنانو سيراميك بضمانات تصل إلى 10 سنوات.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-surface text-on-surface selection:bg-[#c5a059] selection:text-white">
        {children}
      </body>
    </html>
  );
}
