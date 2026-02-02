// src/scripts/inventory.js – Lagerverwaltung (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { t } from "./lang.js";
import { openInventoryModal } from "./inventoryModal.js"; // Modal-Logik ausgelagert

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const tableBody = document.querySelector("#inventoryTable tbody");

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
// 🔹 Lagerbestand laden
// -------------------------------------------------------------
export async function loadInventory() {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name || "-"}</td>
      <td>${p.sku || "-"}</td>
      <td>${p.ean || "-"}</td>
      <td>${p.vendor || "-"}</td>
      <td>${p.type || "-"}</td>
      <td>${p.collections || "-"}</td>
      <td class="stock-value">${p.stock ?? 0}</td>
      <td><i class="fa-solid fa-money-bill-wave"></i> ${formatCH(p.price || 0)} CHF</td>

      <td>
        <button class="adjustBtn btn btn-blue" data-id="${docSnap.id}">
          <i class="fa-solid fa-plus-minus"></i> ${t("inventory.adjust")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachAdjustHandler();
}

// -------------------------------------------------------------
// 🔹 Bestand anpassen (Button → Modal öffnen)
// -------------------------------------------------------------
function attachAdjustHandler() {
  document.querySelectorAll(".adjustBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      openInventoryModal(btn.dataset.id);
    });
  });
}

// -------------------------------------------------------------
// 🔹 Realtime Reload nach Modal-Speicherung
// -------------------------------------------------------------
document.addEventListener("inventoryUpdated", () => {
  loadInventory();
});

// -------------------------------------------------------------
// 🔹 Wenn inventorySearch.js neu rendert → Buttons neu aktivieren
// -------------------------------------------------------------
document.addEventListener("inventorySearchRendered", () => {
  attachAdjustHandler();
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadInventory();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);
