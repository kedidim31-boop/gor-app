// src/scripts/productBulkEdit.js – Massenbearbeitung für Produkte (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const bulkBtn = document.getElementById("bulkEditBtn");
const bulkModal = document.getElementById("bulkEditModal");
const bulkForm = document.getElementById("bulkEditForm");
const closeBulkModal = document.getElementById("closeBulkModal");

// -------------------------------------------------------------
// 🔹 Produkt-Cache
// -------------------------------------------------------------
let productCache = [];

// -------------------------------------------------------------
// 🔹 Produkte laden (für Checkbox-Auswahl)
// -------------------------------------------------------------
async function loadProductsForBulk() {
  const snapshot = await getDocs(collection(db, "products"));

  productCache = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

// -------------------------------------------------------------
// 🔹 Modal öffnen
// -------------------------------------------------------------
export function openBulkEditModal() {
  bulkModal.classList.add("open");
}

// -------------------------------------------------------------
// 🔹 Modal schließen
// -------------------------------------------------------------
closeBulkModal?.addEventListener("click", () => {
  bulkModal.classList.remove("open");
  bulkForm.reset();
});

// -------------------------------------------------------------
// 🔹 Bulk-Update durchführen
// -------------------------------------------------------------
bulkForm?.addEventListener("submit", async e => {
  e.preventDefault();

  // Welche Produkte wurden ausgewählt?
  const selected = [...document.querySelectorAll(".productCheckbox:checked")].map(cb => cb.dataset.id);

  if (selected.length === 0) {
    showFeedback(t("products.noSelection"), "error");
    return;
  }

  // Welche Felder sollen geändert werden?
  const newPrice = document.getElementById("bulkPrice").value.trim();
  const newStock = document.getElementById("bulkStock").value.trim();
  const newVendor = document.getElementById("bulkVendor").value.trim();
  const newType = document.getElementById("bulkType").value.trim();
  const newCollections = document.getElementById("bulkCollections").value.trim();

  // Wenn nichts ausgefüllt → Fehler
  if (!newPrice && !newStock && !newVendor && !newType && !newCollections) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    const batch = writeBatch(db);

    selected.forEach(id => {
      const ref = doc(db, "products", id);

      const updateData = {
        updatedAt: serverTimestamp()
      };

      if (newPrice) updateData.price = parseFloat(newPrice);
      if (newStock) updateData.stock = parseInt(newStock);
      if (newVendor) updateData.vendor = newVendor;
      if (newType) updateData.type = newType;
      if (newCollections) updateData.collections = newCollections;

      batch.update(ref, updateData);
    });

    await batch.commit();

    showFeedback(t("products.bulkUpdated"), "success");

    bulkModal.classList.remove("open");
    bulkForm.reset();

    // Event für products.js → Tabelle neu laden
    document.dispatchEvent(new CustomEvent("productsUpdated"));

  } catch (err) {
    console.error("❌ Fehler beim Bulk-Update:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadProductsForBulk();
