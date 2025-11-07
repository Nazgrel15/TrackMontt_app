import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeAuth } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();                // <- async
  const cookie = cookieStore.get("tm_auth")?.value;   // <- OK
  const session = decodeAuth(cookie);

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-white">
      <AppHeader role={session.role} />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <Sidebar role={session.role} />
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
