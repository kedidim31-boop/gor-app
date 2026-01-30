// src/scripts/index.js – Logik für Startseite

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff für Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

// Logout Button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// Schnellübersicht laden
async function loadOverview() {
  try {
    // Produkte
    const productsSnap = await getDocs(collection(db, "products"));
    const productCount = productsSnap.size;
    const productEl = document.getElementById("overviewProducts");
    if (productEl) productEl.textContent = productCount;

    // Aufgaben
    const tasksSnap = await getDocs(collection(db, "tasks"));
    const taskCount = tasksSnap.size;
    const taskEl = document.getElementById("overviewTasks");
    if (taskEl) taskEl.textContent = taskCount;

    // Mitarbeiter
    const employeesSnap = await getDocs(collection(db, "employees"));
    const employeeCount = employeesSnap.size;
    const employeeEl = document.getElementById("overviewEmployees");
    if (employeeEl) employeeEl.textContent = employeeCount;

    // Zeiterfassung (Summe Stunden)
    const timeSnap = await getDocs(collection(db, "timeEntries"));
    let totalHours = 0;
    timeSnap.forEach(docSnap => {
      const entry = docSnap.data();
      totalHours += parseFloat(entry.hours || 0);
    });
    const timeEl = document.getElementById("overviewTime");
    if (timeEl) timeEl.textContent = totalHours.toFixed(1) + "h";

    // Optional: Charts aktualisieren wie bei analysis.js
    updateCharts(productCount, taskCount, employeeCount, totalHours);

  } catch (err) {
    console.error("❌ Fehler beim Laden der Übersicht:", err);
  }
}

// Charts Setup (optional, identisch zu analysis.js)
function updateCharts(productCount, taskCount, employeeCount, totalHours) {
  const ctxOverview = document.getElementById("overviewChart");
  const ctxTimeLine = document.getElementById("timeLineChart");

  if (!ctxOverview || !ctxTimeLine) return;

  const chartColors = {
    products: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-yellow"),
    tasks: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-turquoise"),
    employees: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-green"),
    time: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-red"),
    stock: getComputedStyle(document.documentElement).getPropertyValue("--color-neon-purple")
  };

  new Chart(ctxOverview, {
    type: "doughnut",
    data: {
      labels: ["Produkte", "Aufgaben", "Mitarbeiter", "Zeit"],
      datasets: [{
        data: [productCount, taskCount, employeeCount, totalHours],
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

  new Chart(ctxTimeLine, {
    type: "line",
    data: {
      labels: ["Heute"], // Platzhalter, später dynamisch erweitern
      datasets: [{
        label: "Arbeitsstunden",
        data: [totalHours],
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
}

// Initial laden
loadOverview();
