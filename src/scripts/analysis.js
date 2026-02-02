// src/scripts/analysis.js – Logik für Übersicht & Dashboard (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// -------------------------------------------------------------
// 🔹 Firebase initialisieren
// -------------------------------------------------------------
const { auth, db } = initFirebase();

// Zugriff für Admin, Manager, Support, Employee
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// Logout Button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 Chart.js Elemente
// -------------------------------------------------------------
const ctxOverview = document.getElementById("overviewChart");
const ctxTimeLine = document.getElementById("timeLineChart");

// Farben aus CSS-Variablen
const chartColors = {
  products: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-yellow").trim(),
  tasks: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-turquoise").trim(),
  employees: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-green").trim(),
  time: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-red").trim(),
  stock: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-purple").trim()
};

// -------------------------------------------------------------
// 🔹 Übersicht-Doughnut-Chart (mehrsprachig)
// -------------------------------------------------------------
const overviewChart = new Chart(ctxOverview, {
  type: "doughnut",
  data: {
    labels: [
      t("products.name"),
      t("products.stock"),
      t("tasks.title"),
      t("employees.name"),
      t("time.hours")
    ],
    datasets: [{
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
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: "#f0f0f0",
          font: { size: 14 }
        }
      }
    },
    animation: { animateScale: true, animateRotate: true }
  }
});

// -------------------------------------------------------------
// 🔹 Zeitverlauf-Chart (mehrsprachig)
// -------------------------------------------------------------
const timeLineChart = new Chart(ctxTimeLine, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: t("time.hours"),
      data: [],
      borderColor: chartColors.time,
      backgroundColor: chartColors.time,
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: "#f0f0f0" }, grid: { color: "#333" } },
      y: { ticks: { color: "#f0f0f0" }, grid: { color: "#333" } }
    }
  }
});

// -------------------------------------------------------------
// 🔹 Realtime Variablen
// -------------------------------------------------------------
let productCount = 0;
let totalStock = 0;
let taskCount = 0;
let employeeCount = 0;
let totalHours = 0;

// -------------------------------------------------------------
// 🔹 Mitarbeiter
// -------------------------------------------------------------
onSnapshot(collection(db, "employees"), snap => {
  employeeCount = snap.size;

  const el = document.getElementById("employeeCount");
  if (el) el.textContent = employeeCount;

  updateOverviewChart();
});

// -------------------------------------------------------------
// 🔹 Produkte + Bestand
// -------------------------------------------------------------
onSnapshot(collection(db, "products"), snap => {
  productCount = snap.size;
  totalStock = 0;

  snap.forEach(docSnap => {
    const p = docSnap.data();
    totalStock += Number(p.stock ?? 0);
  });

  const elProduct = document.getElementById("productCount");
  const elStock = document.getElementById("stockTotal");

  if (elProduct) elProduct.textContent = productCount;
  if (elStock) elStock.textContent = totalStock;

  updateOverviewChart();
});

// -------------------------------------------------------------
// 🔹 Aufgaben
// -------------------------------------------------------------
onSnapshot(collection(db, "tasks"), snap => {
  taskCount = snap.size;

  const el = document.getElementById("taskCount");
  if (el) el.textContent = taskCount;

  updateOverviewChart();
});

// -------------------------------------------------------------
// 🔹 Zeiterfassung
// -------------------------------------------------------------
onSnapshot(collection(db, "timeEntries"), snap => {
  totalHours = 0;
  const hoursByDate = {};

  snap.forEach(docSnap => {
    const entry = docSnap.data();
    const hours = Number(entry.hours || 0);
    totalHours += hours;

    const date = entry.date || "";
    if (date) {
      hoursByDate[date] = (hoursByDate[date] || 0) + hours;
    }
  });

  const el = document.getElementById("timeTotal");
  if (el) el.textContent = totalHours.toFixed(1) + "h";

  const sortedDates = Object.keys(hoursByDate).sort();

  timeLineChart.data.labels = sortedDates;
  timeLineChart.data.datasets[0].data = sortedDates.map(d => hoursByDate[d]);
  timeLineChart.update();

  updateOverviewChart();
});

// -------------------------------------------------------------
// 🔹 Übersicht-Chart aktualisieren
// -------------------------------------------------------------
function updateOverviewChart() {
  overviewChart.data.datasets[0].data = [
    productCount,
    totalStock,
    taskCount,
    employeeCount,
    totalHours
  ];
  overviewChart.update();
}
