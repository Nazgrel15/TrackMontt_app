const DashboardPreview = () => {
  return (
    <div className="w-full aspect-[16/9] bg-slate-50 rounded-xl overflow-hidden relative select-none">
      
      {/* --- Barra Lateral (Sidebar) --- */}
      <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-white border-r border-slate-100 p-4 hidden sm:flex flex-col gap-4">
        {/* Logo Falso */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-lg bg-blue-600"></div>
          <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
        </div>
        {/* Items Menú */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? 'bg-blue-50' : ''}`}>
            <div className={`h-4 w-4 rounded ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
            <div className={`h-2 w-24 rounded-full ${i === 0 ? 'bg-blue-300' : 'bg-slate-100'}`}></div>
          </div>
        ))}
      </div>

      {/* --- Contenido Principal --- */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[80%] bg-slate-50 p-6 flex flex-col gap-6">
        
        {/* Header Falso */}
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 w-32 bg-slate-300 rounded-full"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200"></div>
            <div className="h-8 w-8 rounded-full bg-blue-600"></div>
          </div>
        </div>

        {/* Tarjetas KPI (Top) */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className={`h-8 w-8 rounded-lg ${i===0 ? 'bg-blue-100' : i===1 ? 'bg-green-100' : 'bg-orange-100'}`}></div>
                <div className="h-2 w-8 bg-slate-100 rounded-full"></div>
              </div>
              <div className="h-6 w-16 bg-slate-800 rounded mb-1"></div>
              <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Gráfico y Mapa (Bottom) */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* Gráfico de Barras */}
          <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-end gap-2 items-start pl-4 pb-4">
             <div className="flex items-end gap-3 h-full w-full border-l border-b border-slate-100 p-2">
                {[40, 70, 50, 90, 60, 80].map((h, k) => (
                  <div key={k} className="flex-1 bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                ))}
             </div>
          </div>
          
          {/* Mapa Simulado */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
             {/* Rutas */}
             <svg className="absolute inset-0 h-full w-full text-blue-300 opacity-50" viewBox="0 0 100 100" fill="none">
                <path d="M10 90 Q 50 10 90 50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
             </svg>
             {/* Puntos (Buses) */}
             <div className="absolute top-1/3 left-1/4 h-3 w-3 bg-blue-600 rounded-full ring-4 ring-white shadow-lg"></div>
             <div className="absolute bottom-1/3 right-1/4 h-3 w-3 bg-green-500 rounded-full ring-4 ring-white shadow-lg"></div>
          </div>
        </div>

      </div>

      {/* Overlay de Brillo (Glass Effect) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none"></div>
    </div>
  );
};

export default DashboardPreview;