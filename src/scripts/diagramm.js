// src/scripts/diagramm.js – zentrales Modul für Chart.js Diagramme (Neon-Theme + Error-Handling)

import { showFeedback } from "./feedback.js";

// 🔹 Chart.js Global Defaults (Neon Theme)
Chart.defaults.color = "#e0e0e0";
Chart.defaults.font.family = "Segoe UI, sans-serif";
Chart.defaults.plugins.legend.labels.color = "#FFD300";
Chart.defaults.plugins.tooltip.backgroundColor = "#141432";
Chart.defaults.plugins.tooltip.titleColor = "#FFD300";
Chart.defaults.plugins.tooltip.bodyColor = "#70ffea";

// 🔹 Chart-Instanzen speichern, um Memory-Leaks zu verhindern
const chartInstances = {};

// 🔹 Canvas prüfen + Context holen
function getCanvasContext(ctxId) {
  const canvas = document.getElementById(ctxId);

  if (!canvas) {
    console.error(`❌ Canvas '${ctxId}' nicht gefunden`);
    showFeedback(`Canvas '${ctxId}' nicht gefunden`, "error");
    return null;
  }

  return canvas.getContext("2d");
}

// 🔹 Existierende Charts zerstören (wichtig!)
function destroyExistingChart(ctxId) {
  if (chartInstances[ctxId]) {
    chartInstances[ctxId].destroy();
    delete chartInstances[ctxId];
  }
}

// 🔹 Donut-Diagramm
export function renderDonutChart(ctxId, label, value, color) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  destroyExistingChart(ctxId);

  try {
    chartInstances[ctxId] = new Chart(ctx, {
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

    console.log(`🍩 Donut-Diagramm '${ctxId}' gerendert`);

  } catch (error) {
    console.error("❌ Fehler beim Donut-Diagramm:", error);
    showFeedback("Fehler beim Rendern des Donut-Diagramms", "error");
  }
}

// 🔹 Balkendiagramm
export function renderBarChart(ctxId, labels, values, colors) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  destroyExistingChart(ctxId);

  try {
    chartInstances[ctxId] = new Chart(ctx, {
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

    console.log(`📊 Balkendiagramm '${ctxId}' gerendert`);

  } catch (error) {
    console.error("❌ Fehler beim Balkendiagramm:", error);
    showFeedback("Fehler beim Rendern des Balkendiagramms", "error");
  }
}

// 🔹 Liniendiagramm
export function renderLineChart(ctxId, labels, values, color) {
  const ctx = getCanvasContext(ctxId);
  if (!ctx) return;

  destroyExistingChart(ctxId);

  try {
    chartInstances[ctxId] = new Chart(ctx, {
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

    console.log(`📈 Liniendiagramm '${ctxId}' gerendert`);

  } catch (error) {
    console.error("❌ Fehler beim Liniendiagramm:", error);
    showFeedback("Fehler beim Rendern des Liniendiagramms", "error");
  }
}
