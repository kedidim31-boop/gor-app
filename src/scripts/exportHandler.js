// exportHandler.js – globales Modul für Datenexport (CSV, PDF)
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

// CSV Export
export function exportToCSV(filename, rows) {
  try {
    if (!rows || !rows.length) {
      console.warn("⚠️ Keine Daten für CSV-Export vorhanden");
      alert("Keine Daten zum Exportieren gefunden.");
      return;
    }

    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(separator),
      ...rows.map(row => keys.map(k => `"${row[k] ?? ""}"`).join(separator))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.click();

    console.log(`✅ CSV erfolgreich exportiert: ${filename}`);
    showSuccess(`CSV erfolgreich exportiert: ${filename}`);
  } catch (error) {
    console.error("❌ Fehler beim CSV-Export:", error);
    showError("Fehler beim CSV-Export – bitte erneut versuchen.");
  }
}

// PDF Export
export async function exportToPDF(filename, elementId) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`⚠️ Element mit ID '${elementId}' nicht gefunden`);
      alert("Export-Element nicht gefunden.");
      return;
    }

    const opt = {
      margin:       0.5,
      filename:     filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: "#0d0d1a" },
      jsPDF:        { unit: "in", format: "a4", orientation: "portrait" }
    };

    await html2pdf().set(opt).from(element).save();

    console.log(`✅ PDF erfolgreich exportiert: ${filename}`);
    showSuccess(`PDF erfolgreich exportiert: ${filename}`);
  } catch (error) {
    console.error("❌ Fehler beim PDF-Export:", error);
    showError("Fehler beim PDF-Export – bitte erneut versuchen.");
  }
}

// Hilfsfunktionen für UI-Feedback (aus uiHandler.js)
function showSuccess(message) {
  const box = document.createElement("div");
  box.className = "message-box success";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function showError(message) {
  const box = document.createElement("div");
  box.className = "message-box error";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);

  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}
