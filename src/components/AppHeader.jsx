"use client";
export default function AppHeader({ role }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
            <span className="font-bold text-blue-700">TM</span>
          </div>
          <span className="font-semibold text-black">TrackMontt</span>
          <span className="text-sm text-black/60">· {role}</span>
        </div>
        <form action="/api/logout" method="post">
          <button className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-black hover:bg-black/5">
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
