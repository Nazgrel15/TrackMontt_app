// Devuelve true si hay choque de bus en la misma fecha y franja horaria.
export function hasBusConflict(services, { busId, date, start, end }, excludeId) {
  const toMin = (hhmm) => {
    if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const sNew = toMin(start), eNew = toMin(end);

  return services.some(s => {
    if (s.id === excludeId) return false;
    if (s.status === 'cancelado') return false;
    if (s.busId !== busId) return false;
    if (s.date !== date) return false;

    const sA = toMin(s.start), eA = toMin(s.end);
    if ([sNew, eNew, sA, eA].some(v => v === null)) return true; // sin horas = día completo

    return sA < eNew && eA > sNew; // solapamiento
  });
}
