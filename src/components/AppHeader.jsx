"use client";
import Link from "next/link"; // 👈 AÑADIDO

export default function AppHeader({ role, userName }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
            <span className="font-bold text-blue-700">TM</span>
          </div>
          <span className="font-semibold text-black">TrackMontt</span>
          <span className="text-sm text-black/60 hidden md:block">
          Usuario: <b>{userName || role}</b>
        </span>
        </div>

        {/* 👇 SECCIÓN MODIFICADA 👇 */}
        <div className="flex items-center gap-3">
          <Link 
            href="/notificaciones" 
            className="rounded-lg px-3 py-1.5 text-sm text-black hover:bg-black/5"
            title="Notificaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.017 5.454 1.31m5.714 0a23.842 23.842 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </Link>
          <form action="/api/logout" method="post">
            <button className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-black hover:bg-black/5">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}