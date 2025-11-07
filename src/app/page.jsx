import Image from "next/image";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import ContactSection from "../components/ContactSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Hero (azul/blanco/negro) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <HeroSection />
      </div>

      {/* Características (4 cards) */}
      <FeaturesSection />

      {/* Contacto (CTA) */}
      <ContactSection />
    </main>
  );
}
