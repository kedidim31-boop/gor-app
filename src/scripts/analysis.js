// ======================================================================
// 🔥 ANALYSIS.JS – FINAL VERSION (Teil 1)
// Setup, Rollen, KPIs, Chart-Farben, Chart-Initialisierung
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// Dashboard nur für Admin + Manager
enforceRole(["admin", "manager"], "login.html");

// Logout
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// 🔹 KPI DOM Elemente
const elEmployeeCount = document.getElementById("employeeCount");
const elProductCount  = document.getElementById("productCount");
const elStockTotal    = document.getElementById("stockTotal");
const elTaskCount     = document.getElementById("taskCount");
const elTimeTotal     = document.getElementById("timeTotal");

// 🔹 Helper: CSS Variablen & Formatierung
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function formatInt(value) {
  return Number(value || 0).toLocaleString("de-CH");
}
function formatHours(value) {
  return `${Number(value || 0).toFixed(1)}h`;
}

// 🔹 Chart.js Canvas Referenzen
const ctxOverview = document.getElementById("overviewChart");
const ctxTimeLine = document.getElementById("timeLineChart");

if (!ctxOverview || !ctxTimeLine) {
  console.warn("⚠️ Charts nicht gefunden – analysis.js teilweise deaktiviert.");
}

// 🔹 Farben aus theme.css
const chartColors = {
  products:  cssVar("--color-neon-yellow"),
  stock:     cssVar("--color-neon-purple"),
  tasks:     cssVar("--color-neon-turquoise"),
  employees: cssVar("--color-neon-green"),
  time:      cssVar("--color-neon-red")
};

// 🔹 Overview Doughnut Chart
const overviewChart = ctxOverview
  ? new Chart(ctxOverview, {
      type: "doughnut",
      data: {
        labels: [
          t("products.name"),
          t("products.stock"),
          t("tasks.title"),
          t("employees.name"),
          t("time.hours")
        ],
        datasets: [
          {
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              chartColors.products,
              chartColors.stock,
              chartColors.tasks,
              chartColors.employees,
              chartColors.time
            ],
            borderColor: "#0d0d1a",
            borderWidth: 2
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#f0f0f0", font: { size: 13 } }
          },
          tooltip: {
            callbacks: { label: ctx => `${ctx.label}: ${formatInt(ctx.parsed)}` }
          }
        },
        cutout: "60%",
        animation: { animateScale: true, animateRotate: true }
      }
    })
  : null;

// 🔹 Time Line Chart
const timeLineChart = ctxTimeLine
  ? new Chart(ctxTimeLine, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: t("time.hours"),
            data: [],
            borderColor: chartColors.time,
            backgroundColor: chartColors.time,
            tension: 0.3,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        plugins: {
          legend: { labels: { color: "#f0f0f0", font: { size: 13 } } },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toFixed(1)}h` } }
        },
        scales: {
          x: { ticks: { color: "#f0f0f0" }, grid: { color: "#333" } },
          y: { ticks: { color: "#f0f0f0" }, grid: { color: "#333" } }
        }
      }
    })
  : null;

// 🔹 Realtime Variablen
let productCount = 0;
let totalStock   = 0;
let taskCount    = 0;
let employeeCount = 0;
let totalHours   = 0;
// ======================================================================
// 🔥 ANALYSIS.JS – FINAL VERSION (Teil 2)
// Firestore Realtime Listener, KPI Updates, Chart Updates
// ======================================================================

// 🔹 Mitarbeiter – Realtime
onSnapshot(collection(db, "employees"), snap => {
  employeeCount = snap.size;
  if (elEmployeeCount) elEmployeeCount.textContent = formatInt(employeeCount);
  updateOverviewChart();
}, err => {
  console.error("❌ Fehler beim Laden der Mitarbeiter:", err);
  showFeedback(t("errors.fail"), "error");
});

// 🔹 Produkte & Bestand – Realtime
onSnapshot(collection(db, "products"), snap => {
  productCount = snap.size;
  totalStock = 0;
  snap.forEach(docSnap => {
    const p = docSnap.data();
    totalStock += Number(p.stock ?? 0);
  });
  if (elProductCount) elProductCount.textContent = formatInt(productCount);
  if (elStockTotal)   elStockTotal.textContent   = formatInt(totalStock);
  updateOverviewChart();
}, err => {
  console.error("❌ Fehler beim Laden der Produkte:", err);
  showFeedback(t("errors.fail"), "error");
});

// 🔹 Aufgaben – Realtime
onSnapshot(collection(db, "tasks"), snap => {
  taskCount = snap.size;
  if (elTaskCount) elTaskCount.textContent = formatInt(taskCount);
  updateOverviewChart();
}, err => {
  console.error("❌ Fehler beim Laden der Aufgaben:", err);
  showFeedback(t("errors.fail"), "error");
});

// 🔹 Zeiterfassung – Realtime
onSnapshot(collection(db, "timeEntries"), snap => {
  totalHours = 0;
  const hoursByDate = {};
  snap.forEach(docSnap => {
    const entry = docSnap.data();
    const hours = Number(entry.hours || 0);
    totalHours += hours;
    const date = entry.date || "";
    if (date) hoursByDate[date] = (hoursByDate[date] || 0) + hours;
  });
  if (elTimeTotal) elTimeTotal.textContent = formatHours(totalHours);
  const sortedDates = Object.keys(hoursByDate).sort();
  if (timeLineChart) {
    timeLineChart.data.labels = sortedDates;
    timeLineChart.data.datasets[0].data = sortedDates.map(d => hoursByDate[d]);
    timeLineChart.update();
  }
  updateOverviewChart();
}, err => {
  console.error("❌ Fehler beim Laden der Zeiterfassung:", err);
  showFeedback(t("errors.fail"), "error");
});

// 🔹 Übersicht-Chart aktualisieren (debounced)
let updateTimeout = null;
function updateOverviewChart() {
  if (!overviewChart) return;
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    overviewChart.data.datasets[0].data = [
      productCount,
      totalStock,
      taskCount,
      employeeCount,
      totalHours
    ];
    overviewChart.update();
  }, 150);
}
