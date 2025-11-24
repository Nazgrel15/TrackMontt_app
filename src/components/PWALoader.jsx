"use client";
import { useEffect } from "react";

export default function PWALoader() {
  useEffect(() => {
    // Registrar el Service Worker
    if ("serviceWorker" in navigator) {
      // 🔥 LIMPIEZA: Desregistrar SWs antiguos para forzar actualización
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          console.log("[PWA] Limpiando SW antiguo...");
          registration.unregister();
        });
      }).then(() => {
        // Registrar el nuevo SW v3
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker v3 registrado con éxito:", registration);
          })
          .catch((error) => {
            console.error("[PWA] Error al registrar Service Worker:", error);
          });
      });
    }
  }, []);

  return null; // Este componente no renderiza nada
}