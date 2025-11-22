// src/lib/csvUtils.js

export function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headLine = headers.join(",");
  const body = rows
    .map((r) =>
      headers
        .map((h) => {
          const val = r[h] ?? "";
          // escapar comillas y comas
          const str = String(val).replaceAll('"', '""');
          return /[",\n]/.test(str) ? `"${str}"` : str;
        })
        .join(",")
    )
    .join("\n");
  return `${headLine}\n${body}`;
}

export function download(filename, text) {
  // ✨ CORRECCIÓN AQUÍ: Agregamos \uFEFF al inicio
  // Esto le dice a Excel: "¡Hola! Soy un archivo UTF-8, respeta mis tildes".
  const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}