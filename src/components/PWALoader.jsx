"use client";
import { useEffect } from "react";

export default function PWALoader() {
  useEffect(() => {
    // Registrar el Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js") // La ruta al archivo que creamos
        .then((registration) => {
          console.log("Service Worker registrado con éxito:", registration);
        })
        .catch((error) => {
          console.error("Error al registrar Service Worker:", error);
        });
    }
  }, []);

  return null; // Este componente no renderiza nada
}