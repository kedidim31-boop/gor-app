// src/scripts/inventoryLogs.js – Lagerbewegungs-Log (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const tableBody = document.querySelector("#inventoryLogsTable tbody");
const filterProduct = document.getElementById("filterProduct");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");

// -------------------------------------------------------------
// 🔹 Schweizer Zahlenformat
// -------------------------------------------------------------
function formatCH(num) {
  return Number(num).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------
// 🔹 Datum formatieren
// -------------------------------------------------------------
function formatDate(ts) {
  if (!ts) return "-";
  const date = ts.toDate();
  return date.toLocaleString("de-CH");
}

// -------------------------------------------------------------
// 🔹 Logs laden
// -------------------------------------------------------------
async function loadInventoryLogs() {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const q = query(
    collection(db, "inventoryLogs"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const log = docSnap.data();

    // Filter anwenden
    if (filterProduct.value && filterProduct.value !== log.productId) return;
    if (filterType.value && filterType.value !== "all") {
      if (filterType.value === "increase" && log.change < 0) return;
      if (filterType.value === "decrease" && log.change > 0) return;
    }
    if (filterDate.value) {
      const logDate = log.createdAt?.toDate().toISOString().split("T")[0];
      if (logDate !== filterDate.value) return;
    }

    const row = document.createElement("tr");

    const typeLabel =
      log.change > 0
        ? `<span class="log-plus">+${log.change}</span>`
        : `<span class="log-minus">${log.change}</span>`;

    row.innerHTML = `
      <td>${log.productId || "-"}</td>
      <td>${typeLabel}</td>
      <td>${log.reason || "-"}</td>
      <td>${log.newStock ?? 0}</td>
      <td>${formatDate(log.createdAt)}</td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("inventoryLogs.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachDeleteHandler();
}

// -------------------------------------------------------------
// 🔹 Löschen mit Bestätigungs-Banner
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "inventoryLogs", id));
            showFeedback(t("inventoryLogs.delete"), "success");
            loadInventoryLogs();

          } catch (err) {
            console.error("❌ Fehler beim Löschen:", err);
            showFeedback(t("errors.fail"), "error");
          }
        },
        { once: true }
      );
    });
  });
}

// -------------------------------------------------------------
// 🔹 Filter Listener
// -------------------------------------------------------------
filterProduct?.addEventListener("change", loadInventoryLogs);
filterType?.addEventListener("change", loadInventoryLogs);
filterDate?.addEventListener("change", loadInventoryLogs);

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadInventoryLogs();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
