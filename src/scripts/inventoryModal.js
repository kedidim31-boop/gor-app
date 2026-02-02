// src/scripts/inventoryModal.js – Modal & Stock-Adjust Logik (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const modal = document.getElementById("adjustModal");
const adjustForm = document.getElementById("adjustStockForm");
const closeBtn = document.getElementById("closeAdjustModal");

// -------------------------------------------------------------
// 🔹 Modal öffnen
// -------------------------------------------------------------
export function openInventoryModal(productId) {
  if (!modal) return;

  document.getElementById("adjustProductId").value = productId;
  modal.classList.add("open");
}

// -------------------------------------------------------------
// 🔹 Modal schließen
// -------------------------------------------------------------
function closeModal() {
  modal?.classList.remove("open");
  adjustForm?.reset();
}

closeBtn?.addEventListener("click", closeModal);

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
    // Produkt abrufen
    const productRef = doc(db, "products", id);
    const snap = await getDoc(productRef);

    if (!snap.exists()) {
      showFeedback(t("errors.load"), "error");
      return;
    }

    const currentStock = snap.data().stock ?? 0;
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

    closeModal();

    // Event für inventory.js → Tabelle neu laden
    document.dispatchEvent(new CustomEvent("inventoryUpdated"));

  } catch (err) {
    console.error("❌ Fehler beim Anpassen des Bestands:", err);
    showFeedback(t("errors.fail"), "error");
  }
});
