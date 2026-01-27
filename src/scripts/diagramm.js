// diagramm.js – zentrales Modul für Chart.js Diagramme

// Initialisiert ein Donut-Diagramm
export function renderDonutChart(ctxId, label, value, color) {
  const ctx = document.getElementById(ctxId).getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [label],
      datasets: [{
        data: [value],
        backgroundColor: [color]
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });
}

// Initialisiert ein Balkendiagramm
export function renderBarChart(ctxId, labels, values, colors) {
  const ctx = document.getElementById(ctxId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Initialisiert ein Liniendiagramm
export function renderLineChart(ctxId, labels, values, color) {
  const ctx = document.getElementById(ctxId).getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Verlauf",
        data: values,
        borderColor: color,
        backgroundColor: color,
        fill: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
