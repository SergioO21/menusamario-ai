import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenúSamario AI — DevFest Santa Marta 2026",
  description: "Digitalización gastronómica con IA multimodal para Santa Marta y el Caribe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
