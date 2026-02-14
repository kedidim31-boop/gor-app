// ======================================================================
// 🔥 DASHBOARD – Sprachfähige Finalversion mit Live-KPIs & Listen
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { t, updateTranslations } from "./lang.js";
import { showFeedback } from "./feedback.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔐 Zugriff & Sprache
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");
updateTranslations();
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const elProducts   = document.getElementById("kpiProducts");
const elEmployees  = document.getElementById("kpiEmployees");
const elTasks      = document.getElementById("kpiTasks");
const elHours      = document.getElementById("kpiHours");
const elSupport    = document.getElementById("kpiSupport");

const listAudit     = document.getElementById("listAudit");
const listSupport   = document.getElementById("listSupport");
const listInventory = document.getElementById("listInventory");

// -------------------------------------------------------------
// 📊 KPI: Produkte
// -------------------------------------------------------------
onSnapshot(collection(db, "products"), snap => {
  if (elProducts) elProducts.textContent = snap.size;
});

// 📊 KPI: Mitarbeiter
onSnapshot(collection(db, "employees"), snap => {
  if (elEmployees) elEmployees.textContent = snap.size;
});

// 📊 KPI: Aufgaben
onSnapshot(collection(db, "tasks"), snap => {
  if (elTasks) elTasks.textContent = snap.size;
});

// 📊 KPI: Zeiterfassung
onSnapshot(collection(db, "timeEntries"), snap => {
  let total = 0;
  snap.forEach(doc => total += Number(doc.data().hours || 0));
  if (elHours) elHours.textContent = `${total.toFixed(1)}h`;
});

// 📊 KPI: Offene Support-Tickets
onSnapshot(collection(db, "supportTickets"), snap => {
  let open = 0;
  snap.forEach(doc => {
    const status = doc.data().status;
    if (status !== "closed") open++;
  });
  if (elSupport) elSupport.textContent = open;
});

// -------------------------------------------------------------
// 🧾 Schweizer Datumsformat
// -------------------------------------------------------------
function formatDate(ts) {
  if (!ts?.toDate) return "-";
  return ts.toDate().toLocaleString("de-CH");
}
// -------------------------------------------------------------
// 📋 Letzte Audit Logs
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
// 🆘 Letzte Support Tickets
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
        <div class="item-details">${t(`support.${tData.priority}`) || "-"}</div>
        <div class="item-time">${formatDate(tData.createdAt)}</div>
      `;

      listSupport.appendChild(item);
    });
  });
}

// -------------------------------------------------------------
// 📦 Letzte Lagerbewegungen
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
