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

  } catch (err) {
    console.error("❌ Fehler beim Laden der Übersicht:", err);
  }
}

// Initial laden
loadOverview();
