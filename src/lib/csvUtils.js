// src/lib/csvUtils.js

// (Copiado desde ReportsPage)
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
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}