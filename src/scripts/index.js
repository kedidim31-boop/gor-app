// src/scripts/index.js – Logik für Startseite

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, getDocs, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// Zugriff für Admins & Employees
enforceRole(["admin", "employee"], "login.html");

// Logout Button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// 🔥 Rolle des Users laden und Navigation anpassen
async function applyRoleNavigation() {
  const user = auth.currentUser;
  if (!user) return;

  const userDoc = await getDoc(doc(db, "employees", user.uid));
  let role = "guest";

  if (userDoc.exists()) {
    role = userDoc.data().role || "guest";
  }

  console.log("🔍 Rolle erkannt:", role);

  // Navigationselemente selektieren
  const adminLinks = document.querySelectorAll(".role-admin");
  const employeeLinks = document.querySelectorAll(".role-employee");

  // Standard: alles ausblenden
  adminLinks.forEach(el => el.style.display = "none");
  employeeLinks.forEach(el => el.style.display = "none");

  // Rolle anwenden
  if (role === "admin") {
    adminLinks.forEach(el => el.style.display = "flex");
    employeeLinks.forEach(el => el.style.display = "flex");
  }

  if (role === "employee") {
    employeeLinks.forEach(el => el.style.display = "flex");
  }

  // Gäste sehen nur Home + Dashboard
}

// Schnellübersicht laden
async function loadOverview() {
  try {
    // Produkte
    const productsSnap = await getDocs(collection(db, "products"));
    const productEl = document.getElementById("overviewProducts");
    if (productEl) productEl.textContent = productsSnap.size;

    // Aufgaben
    const tasksSnap = await getDocs(collection(db, "tasks"));
    const taskEl = document.getElementById("overviewTasks");
    if (taskEl) taskEl.textContent = tasksSnap.size;

    // Mitarbeiter
    const employeesSnap = await getDocs(collection(db, "employees"));
    const employeeEl = document.getElementById("overviewEmployees");
    if (employeeEl) employeeEl.textContent = employeesSnap.size;

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
applyRoleNavigation();
