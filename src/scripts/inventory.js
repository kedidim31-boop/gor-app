// src/scripts/inventory.js – Lagerverwaltung (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const tableBody = document.querySelector("#inventoryTable tbody");
const adjustForm = document.getElementById("adjustStockForm");

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
async function loadInventory() {
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
      openAdjustModal(btn.dataset.id);
    });
  });
}

// -------------------------------------------------------------
// 🔹 Modal öffnen
// -------------------------------------------------------------
function openAdjustModal(productId) {
  const modal = document.getElementById("adjustModal");
  const idField = document.getElementById("adjustProductId");

  idField.value = productId;
  modal.classList.add("open");
}

// -------------------------------------------------------------
// 🔹 Modal schließen
// -------------------------------------------------------------
document.getElementById("closeAdjustModal")?.addEventListener("click", () => {
  document.getElementById("adjustModal").classList.remove("open");
  adjustForm.reset();
});

// -------------------------------------------------------------
// 🔹 Bestand speichern
// -------------------------------------------------------------
adjustForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("adjustProductId").value;
  const amount = parseInt(document.getElementById("adjustAmount").value);
  const reason = document.getElementById("adjustReason").value.trim();

  if (!amount) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    // 🔥 Optimiert: Nur EIN Produkt abrufen statt alle
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      showFeedback(t("errors.fail"), "error");
      return;
    }

    const currentStock = productSnap.data().stock ?? 0;
    const newStock = currentStock + amount;

    // Bestand aktualisieren
    await updateDoc(productRef, { stock: newStock });

    // Bewegungslog speichern
    await addDoc(collection(db, "inventoryLogs"), {
      productId: id,
      change: amount,
      reason,
      newStock,
      createdAt: serverTimestamp()
    });

    // Optional: Audit Log
    // const adminId = auth.currentUser?.uid || "system";
    // await addAuditLog(adminId, "adjust_stock", `ProductID: ${id}, Change: ${amount}`);

    showFeedback(t("inventory.updated"), "success");

    document.getElementById("adjustModal").classList.remove("open");
    adjustForm.reset();
    loadInventory();

  } catch (err) {
    console.error("❌ Fehler beim Anpassen des Bestands:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadInventory();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);
