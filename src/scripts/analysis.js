// src/scripts/analysis.js – Logik für Übersicht & Dashboard

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff für Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

// Logout Button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// Chart.js Setup
const ctxOverview = document.getElementById("overviewChart");
const ctxTimeLine = document.getElementById("timeLineChart");

const chartColors = {
  products: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-yellow"),
  tasks: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-turquoise"),
  employees: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-green"),
  time: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-red")
};

const overviewChart = new Chart(ctxOverview, {
  type: "doughnut",
  data: {
    labels: ["Produkte", "Aufgaben", "Mitarbeiter", "Zeit"],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        chartColors.products,
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
      legend: { labels: { color: "#f0f0f0" } }
    },
    animation: { animateScale: true, animateRotate: true }
  }
});

const timeLineChart = new Chart(ctxTimeLine, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Arbeitsstunden pro Tag",
      data: [],
      borderColor: chartColors.time,
      backgroundColor: chartColors.time,
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: "#f0f0f0" } },
      y: { ticks: { color: "#f0f0f0" } }
    }
  }
});

// Realtime Updates
let productCount = 0;
let taskCount = 0;
let employeeCount = 0;
let totalHours = 0;

// Mitarbeiter
onSnapshot(collection(db, "employees"), snap => {
  employeeCount = snap.size;
  document.getElementById("employeeCount").textContent = employeeCount;
  updateOverviewChart();
});

// Produkte
onSnapshot(collection(db, "products"), snap => {
  productCount = snap.size;
  document.getElementById("productCount").textContent = productCount;
  updateOverviewChart();
});

// Aufgaben
onSnapshot(collection(db, "tasks"), snap => {
  taskCount = snap.size;
  document.getElementById("taskCount").textContent = taskCount;
  updateOverviewChart();
});

// Zeiterfassung
onSnapshot(collection(db, "timeEntries"), snap => {
  totalHours = 0;
  const hoursByDate = {};

  snap.forEach(docSnap => {
    const entry = docSnap.data();
    const h = parseFloat(entry.hours || 0);
    totalHours += h;

    const date = entry.date || "";
    if (date) {
      if (!hoursByDate[date]) hoursByDate[date] = 0;
      hoursByDate[date] += h;
    }
  });

  document.getElementById("timeTotal").textContent = totalHours.toFixed(1) + "h";

  const sortedDates = Object.keys(hoursByDate).sort();
  timeLineChart.data.labels = sortedDates;
  timeLineChart.data.datasets[0].data = sortedDates.map(d => hoursByDate[d]);
  timeLineChart.update();

  updateOverviewChart();
});

// Chart aktualisieren
function updateOverviewChart() {
  overviewChart.data.datasets[0].data = [
    productCount,
    taskCount,
    employeeCount,
    totalHours
  ];
  overviewChart.update();
}
