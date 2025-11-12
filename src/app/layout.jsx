import "./globals.css";
import "leaflet/dist/leaflet.css";
import PWALoader from "@/components/PWALoader";

export const metadata = {
  title: "TrackMontt",
  description:
    "Plataforma SaaS para monitorear y optimizar los traslados de trabajadores en empresas salmoneras.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white text-black antialiased">
        {children}
        <PWALoader />
      </body>
    </html>
  );
}
