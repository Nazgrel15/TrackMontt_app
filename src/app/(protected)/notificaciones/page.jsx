import NotificacionesClient from "./NotificacionesClient"; // Este lo creamos en el paso 2

export default function NotificacionesPage() {
  // el layout (protected) ya nos protege de anónimos.
  return <NotificacionesClient />;
}