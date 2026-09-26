import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function rowsToMatrix(columns, rows) {
  const headers = columns.map((c) => c.label);
  const body = rows.map((r) => columns.map((c) => String(c.exportValue ? c.exportValue(r) : r[c.key] ?? "")));
  return { headers, body };
}

export function exportCsv(filename, columns, rows) {
  const { headers, body } = rowsToMatrix(columns, rows);
  const csv = [headers, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportExcel(filename, columns, rows) {
  const { headers, body } = rowsToMatrix(columns, rows);
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "LEAMSE");
  XLSX.writeFile(book, `${filename}.xlsx`);
}

export function exportPdf(filename, columns, rows) {
  const { headers, body } = rowsToMatrix(columns, rows);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(`LEAMSE — ${filename}`, 14, 14);
  autoTable(doc, { head: [headers], body, startY: 20, styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] } });
  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
