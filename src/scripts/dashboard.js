// src/scripts/dashboard.js – Haupt-Dashboard (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { t } from "./lang.js";
import { showFeedback } from "./feedback.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// -------------------------------------------------------------
// 🔹 Firebase initialisieren
// -------------------------------------------------------------
const { auth, db } = initFirebase();

// Zugriff für Admin, Manager, Support, Employee
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// Logout
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 DOM Elemente (KPI Cards)
// -------------------------------------------------------------
const elProducts = document.getElementById("kpiProducts");
const elEmployees = document.getElementById("kpiEmployees");
const elTasks = document.getElementById("kpiTasks");
const elHours = document.getElementById("kpiHours");
const elSupport = document.getElementById("kpiSupport");

// -------------------------------------------------------------
// 🔹 DOM Elemente (Listen)
// -------------------------------------------------------------
const listAudit = document.getElementById("listAudit");
const listSupport = document.getElementById("listSupport");
const listInventory = document.getElementById("listInventory");

// -------------------------------------------------------------
// 🔹 KPI Variablen
// -------------------------------------------------------------
let productCount = 0;
let employeeCount = 0;
let taskCount = 0;
let totalHours = 0;
let openTickets = 0;

// -------------------------------------------------------------
// 🔹 Produkte
// -------------------------------------------------------------
onSnapshot(collection(db, "products"), snap => {
  productCount = snap.size;
  if (elProducts) elProducts.textContent = productCount;
});

// -------------------------------------------------------------
// 🔹 Mitarbeiter
// -------------------------------------------------------------
onSnapshot(collection(db, "employees"), snap => {
  employeeCount = snap.size;
  if (elEmployees) elEmployees.textContent = employeeCount;
});

// -------------------------------------------------------------
// 🔹 Aufgaben
// -------------------------------------------------------------
onSnapshot(collection(db, "tasks"), snap => {
  taskCount = snap.size;
  if (elTasks) elTasks.textContent = taskCount;
});

// -------------------------------------------------------------
// 🔹 Zeiterfassung
// -------------------------------------------------------------
onSnapshot(collection(db, "timeEntries"), snap => {
  totalHours = 0;

  snap.forEach(docSnap => {
    const entry = docSnap.data();
    totalHours += Number(entry.hours || 0);
  });

  if (elHours) elHours.textContent = totalHours.toFixed(1) + "h";
});

// -------------------------------------------------------------
// 🔹 Support Tickets
// -------------------------------------------------------------
onSnapshot(collection(db, "supportTickets"), snap => {
  openTickets = 0;

  snap.forEach(docSnap => {
    const t = docSnap.data();
    if (t.status !== "closed") openTickets++;
  });

  if (elSupport) elSupport.textContent = openTickets;
});

// -------------------------------------------------------------
// 🔹 Letzte Audit Logs
// -------------------------------------------------------------
if (listAudit) {
  const qAudit = query(
    collection(db, "auditLogs"),
    orderBy("timestamp", "desc"),
    limit(5)
  );

  onSnapshot(qAudit, snap => {
    listAudit.innerHTML = "";

    snap.forEach(docSnap => {
      const log = docSnap.data();

      const item = document.createElement("div");
      item.className = "dashboard-item";

      item.innerHTML = `
        <div class="item-title">${log.action}</div>
        <div class="item-details">${log.details || "-"}</div>
        <div class="item-time">${formatDate(log.timestamp)}</div>
      `;

      listAudit.appendChild(item);
    });
  });
}

// -------------------------------------------------------------
// 🔹 Letzte Support Tickets
// -------------------------------------------------------------
if (listSupport) {
  const qSupport = query(
    collection(db, "supportTickets"),
    orderBy("createdAt", "desc"),
    limit(5)
  );

  onSnapshot(qSupport, snap => {
    listSupport.innerHTML = "";

    snap.forEach(docSnap => {
      const tData = docSnap.data();

      const item = document.createElement("div");
      item.className = "dashboard-item";

      item.innerHTML = `
        <div class="item-title">${tData.title}</div>
        <div class="item-details">${tData.priority || "-"}</div>
        <div class="item-time">${formatDate(tData.createdAt)}</div>
      `;

      listSupport.appendChild(item);
    });
  });
}

// -------------------------------------------------------------
// 🔹 Letzte Lagerbewegungen
// -------------------------------------------------------------
if (listInventory) {
  const qInv = query(
    collection(db, "inventoryLogs"),
    orderBy("createdAt", "desc"),
    limit(5)
  );

  onSnapshot(qInv, snap => {
    listInventory.innerHTML = "";

    snap.forEach(docSnap => {
      const log = docSnap.data();

      const change = log.change > 0
        ? `<span class="log-plus">+${log.change}</span>`
        : `<span class="log-minus">${log.change}</span>`;

      const item = document.createElement("div");
      item.className = "dashboard-item";

      item.innerHTML = `
        <div class="item-title">${change} ${log.reason || "-"}</div>
        <div class="item-details">${log.productId}</div>
        <div class="item-time">${formatDate(log.createdAt)}</div>
      `;

      listInventory.appendChild(item);
    });
  });
}

// -------------------------------------------------------------
// 🔹 Schweizer Datumsformat
// -------------------------------------------------------------
function formatDate(ts) {
  if (!ts) return "-";
  const date = ts.toDate();
  return date.toLocaleString("de-CH");
}
