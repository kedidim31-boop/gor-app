// diagramm.js – zentrales Modul für Chart.js Diagramme
// Ergänzt mit konsistentem Neon-Theme, Error-Handling und globalen Optionen

// Globale Chart.js Defaults für Neon-Look
Chart.defaults.color = "#e0e0e0";
Chart.defaults.font.family = "Segoe UI, sans-serif";
Chart.defaults.plugins.legend.labels.color = "#FFD300";
Chart.defaults.plugins.tooltip.backgroundColor = "#141432";
Chart.defaults.plugins.tooltip.titleColor = "#FFD300";
Chart.defaults.plugins.tooltip.bodyColor = "#70ffea";

// Hilfsfunktion für Canvas-Validierung
function getCanvasContext(ctxId) {
  const canvas = document.getElementById(ctxId);
  if (!canvas) {
    console.error(`❌ Canvas mit ID '${ctxId}' nicht gefunden`);
    notifyError(`Canvas mit ID '${ctxId}' nicht gefunden`);
    return null;
  }
  return canvas.getContext("2d");
}

// Donut-Diagramm
export function renderDonutChart(ctxId, label, value, color) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  try {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [label],
        datasets: [{
          data: [value],
          backgroundColor: [color],
          borderColor: "#0d0d1a",
          borderWidth: 2
        }]
      },
      options: {
        cutout: "70%",
        plugins: { legend: { display: false } }
      }
    });
    console.log(`✅ Donut-Diagramm '${ctxId}' erfolgreich gerendert`);
  } catch (error) {
    console.error("❌ Fehler beim Rendern des Donut-Diagramms:", error);
    notifyError("Fehler beim Rendern des Donut-Diagramms");
  }
}

// Balkendiagramm
export function renderBarChart(ctxId, labels, values, colors) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  try {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: "#FFD300",
          borderWidth: 1
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(255, 211, 0, 0.2)" } },
          y: { beginAtZero: true, grid: { color: "rgba(255, 211, 0, 0.2)" } }
        }
      }
    });
    console.log(`✅ Balkendiagramm '${ctxId}' erfolgreich gerendert`);
  } catch (error) {
    console.error("❌ Fehler beim Rendern des Balkendiagramms:", error);
    notifyError("Fehler beim Rendern des Balkendiagramms");
  }
}

// Liniendiagramm
export function renderLineChart(ctxId, labels, values, color) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  try {
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Verlauf",
          data: values,
          borderColor: color,
          backgroundColor: color,
          tension: 0.3,
          fill: false,
          pointBackgroundColor: "#FFD300",
          pointBorderColor: "#FFD300"
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "rgba(112, 255, 234, 0.2)" } },
          y: { beginAtZero: true, grid: { color: "rgba(112, 255, 234, 0.2)" } }
        }
      }
    });
    console.log(`✅ Liniendiagramm '${ctxId}' erfolgreich gerendert`);
  } catch (error) {
    console.error("❌ Fehler beim Rendern des Liniendiagramms:", error);
    notifyError("Fehler beim Rendern des Liniendiagramms");
  }
}

// Hilfsfunktionen für UI-Feedback (aus notificationHandler.js)
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
