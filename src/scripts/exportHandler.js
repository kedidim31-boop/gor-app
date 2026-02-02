// src/scripts/exportHandler.js – globales Modul für Datenexport (CSV, PDF)
// Mehrsprachig + Neon-Feedback + optimiertes Error-Handling

import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 CSV Export
// -------------------------------------------------------------
export function exportToCSV(filename, rows) {
  try {
    if (!rows || !rows.length) {
      console.warn("⚠️ Keine Daten für CSV-Export vorhanden");
      showFeedback(t("errors.load"), "warning");
      return;
    }

    const separator = ",";
    const keys = Object.keys(rows[0]);

    const csvContent = [
      keys.join(separator),
      ...rows.map(row =>
        keys.map(k => `"${row[k] ?? ""}"`).join(separator)
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.click();

    console.log(`📄 CSV exportiert: ${filename}`);
    showFeedback(`${t("feedback.ok")} CSV`, "success");

  } catch (error) {
    console.error("❌ Fehler beim CSV-Export:", error);
    showFeedback(t("errors.fail"), "error");
  }
}

// -------------------------------------------------------------
// 🔹 PDF Export
// -------------------------------------------------------------
export async function exportToPDF(filename, elementId) {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(`⚠️ Element '${elementId}' nicht gefunden`);
      showFeedback(t("errors.load"), "warning");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#0d0d1a" },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    await html2pdf().set(opt).from(element).save();

    console.log(`📄 PDF exportiert: ${filename}`);
    showFeedback(`${t("feedback.ok")} PDF`, "success");

  } catch (error) {
    console.error("❌ Fehler beim PDF-Export:", error);
    showFeedback(t("errors.fail"), "error");
  }
}

// -------------------------------------------------------------
// 🔹 (Optional) UI-Notification-Fallback – falls showFeedback nicht greift
// -------------------------------------------------------------
function notifySuccess(message) {
  const box = document.createElement("div");
  box.className = "notification success";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function notifyError(message) {
  const box = document.createElement("div");
  box.className = "notification error";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);

  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}
