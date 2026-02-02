// src/scripts/productEdit.js – Produkt bearbeiten (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const form = document.getElementById("editProductForm");

// -------------------------------------------------------------
// 🔹 Schweizer Preisformat
// -------------------------------------------------------------
function formatPriceCH(num) {
  return Number(num).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------
// 🔹 Produkt-ID aus URL holen
// -------------------------------------------------------------
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

const productId = getProductIdFromURL();

if (!productId) {
  showFeedback(t("errors.fail"), "error");
  console.error("❌ Keine Produkt-ID in URL gefunden.");
}

// -------------------------------------------------------------
// 🔹 Produkt laden
// -------------------------------------------------------------
async function loadProduct() {
  try {
    const ref = doc(db, "products", productId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      showFeedback(t("errors.load"), "error");
      return;
    }

    const p = snap.data();

    document.getElementById("editName").value = p.name || "";
    document.getElementById("editDescription").value = p.description || "";
    document.getElementById("editType").value = p.type || "";
    document.getElementById("editVendor").value = p.vendor || "";
    document.getElementById("editCollections").value = p.collections || "";
    document.getElementById("editSKU").value = p.sku || "";
    document.getElementById("editEAN").value = p.ean || "";
    document.getElementById("editStock").value = p.stock ?? 0;
    document.getElementById("editPrice").value = p.price ?? 0;

  } catch (err) {
    console.error("❌ Fehler beim Laden des Produkts:", err);
    showFeedback(t("errors.load"), "error");
  }
}

// -------------------------------------------------------------
// 🔹 Produkt speichern
// -------------------------------------------------------------
form?.addEventListener("submit", async e => {
  e.preventDefault();

  const updated = {
    name: document.getElementById("editName").value.trim(),
    description: document.getElementById("editDescription").value.trim(),
    type: document.getElementById("editType").value.trim(),
    vendor: document.getElementById("editVendor").value.trim(),
    collections: document.getElementById("editCollections").value.trim(),
    sku: document.getElementById("editSKU").value.trim(),
    ean: document.getElementById("editEAN").value.trim(),
    stock: parseInt(document.getElementById("editStock").value) || 0,
    price: parseFloat(document.getElementById("editPrice").value) || 0,
    updatedAt: serverTimestamp()
  };

  if (!updated.name || !updated.type || !updated.vendor) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    await updateDoc(doc(db, "products", productId), updated);

    showFeedback(t("products.updated"), "success");

    // Optional: Redirect zurück zur Produktliste
    setTimeout(() => {
      window.location.href = "products.html";
    }, 800);

  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadProduct();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);
