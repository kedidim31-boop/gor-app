// ======================================================================
// 🔥 PRODUCTS – Sprachfähige Finalversion mit Formular, Tabelle & CSV
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./auditHandler.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔐 Zugriff & Sprache
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");
updateTranslations();
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const form = document.getElementById("createProductForm");
const tableBody = document.querySelector("#productTable tbody");
const exportBtn = document.getElementById("exportBtn");

// -------------------------------------------------------------
// 💰 Preisformat (CH)
// -------------------------------------------------------------
function formatPriceCH(value) {
  return Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------
// 🆔 SKU generieren
// -------------------------------------------------------------
function generateSKU() {
  return "SKU-" + Math.floor(100000 + Math.random() * 900000);
}

// -------------------------------------------------------------
// ➕ Produkt hinzufügen
// -------------------------------------------------------------
form?.addEventListener("submit", async e => {
  e.preventDefault();

  const skuInput = document.getElementById("productSKU");
  const sku = skuInput.value.trim() || generateSKU();

  const product = {
    name: document.getElementById("productName").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
    type: document.getElementById("productType").value.trim(),
    vendor: document.getElementById("productVendor").value.trim(),
    collections: document.getElementById("productCollections").value.trim(),
    sku,
    ean: document.getElementById("productEAN").value.trim(),
    stock: parseInt(document.getElementById("productStock").value) || 0,
    price: parseFloat(document.getElementById("productPrice").value) || 0,
    createdAt: serverTimestamp()
  };

  if (!product.name || !product.type || !product.vendor) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    const ref = await addDoc(collection(db, "products"), product);
    await addAuditLog(auth.currentUser?.email, "product_create", `Produkt: ${ref.id}`);
    form.reset();
    await loadProducts();
    showFeedback(t("products.saved"), "success");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 📦 Produkte laden
// -------------------------------------------------------------
async function loadProducts() {
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name || "-"}</td>
      <td>${p.description || "-"}</td>
      <td>${p.type || "-"}</td>
      <td>${p.vendor || "-"}</td>
      <td>${p.collections || "-"}</td>
      <td>${p.sku || "-"}</td>
      <td>${p.ean || "-"}</td>
      <td>${p.stock ?? 0}</td>
      <td><i class="fa-solid fa-money-bill-wave"></i> ${formatPriceCH(p.price || 0)} CHF</td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("products.delete")}
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachDeleteHandler();
}

// -------------------------------------------------------------
// 🗑️ Produkt löschen
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmed = confirm(t("admin.confirm"));
      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "products", id));
        await addAuditLog(auth.currentUser?.email, "product_delete", `Produkt: ${id}`);
        showFeedback(t("products.delete"), "success");
        await loadProducts();
      } catch (err) {
        console.error("❌ Fehler beim Löschen:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 📤 CSV-Export für Shopify
// -------------------------------------------------------------
exportBtn?.addEventListener("click", async () => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    let csv =
      "Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Variant SKU,Variant Barcode,Variant Inventory Qty,Variant Price\n";

    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const handle = (p.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const row = [
        handle,
        `"${p.name || ""}"`,
        `"${p.description || ""}"`,
        `"${p.vendor || ""}"`,
        `"${p.type || ""}"`,
        `"${p.collections || ""}"`,
        "TRUE",
        p.sku || "",
        p.ean || "",
        p.stock ?? 0,
        p.price || 0
      ].join(",");

      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "shopify_products.csv";
    link.click();

    showFeedback(t("feedback.ok"), "success");
  } catch (err) {
    console.error("❌ Fehler beim Export:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🚀 Initial laden
// -------------------------------------------------------------
loadProducts();
