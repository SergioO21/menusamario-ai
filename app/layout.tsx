import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MenúSamario AI",
  description: "Digitalización gastronómica con IA multimodal para Santa Marta y el Caribe",
  openGraph: {
    title: "MenúSamario AI",
    description: "Digitalización gastronómica con IA multimodal para Santa Marta y el Caribe",
  },
};

// viewportFit "cover" habilita env(safe-area-inset-*) en iPhone con notch
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={display.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
