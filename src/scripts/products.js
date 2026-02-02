// src/scripts/products.js – Logik für Produktverwaltung (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

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
// 🔹 Zugriff für Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const form = document.getElementById("createProductForm");
const tableBody = document.querySelector("#productTable tbody");

// -------------------------------------------------------------
// 🔹 Schweizer Preisformat
// -------------------------------------------------------------
function formatPriceCH(value) {
  return Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// -------------------------------------------------------------
// 🔹 Auto-SKU generieren (falls leer)
// -------------------------------------------------------------
function generateSKU() {
  return "SKU-" + Math.floor(100000 + Math.random() * 900000);
}

// -------------------------------------------------------------
// 🔹 Produkt hinzufügen
// -------------------------------------------------------------
form?.addEventListener("submit", async e => {
  e.preventDefault();

  let sku = document.getElementById("productSKU").value.trim();
  if (!sku) sku = generateSKU();

  const product = {
    name: document.getElementById("productName").value.trim(),
    description: document.getElementById("productDescription").value.trim() || "",
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
    await addDoc(collection(db, "products"), product);
    form.reset();
    loadProducts();
    showFeedback(t("feedback.ok"), "success");

  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Produkte laden
// -------------------------------------------------------------
async function loadProducts() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name || "-"}</td>
      <td>${data.description || "-"}</td>
      <td>${data.type || "-"}</td>
      <td>${data.vendor || "-"}</td>
      <td>${data.collections || "-"}</td>
      <td>${data.sku || "-"}</td>
      <td>${data.ean || "-"}</td>
      <td>${data.stock ?? 0}</td>
      <td><i class="fa-solid fa-money-bill-wave"></i> ${formatPriceCH(data.price || 0)} CHF</td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("products.delete")}
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
            await deleteDoc(doc(db, "products", id));
            showFeedback(t("products.delete"), "success");
            loadProducts();

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
// 🔹 Initial laden
// -------------------------------------------------------------
loadProducts();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 Shopify-kompatibler CSV-Export
// -------------------------------------------------------------
const exportBtn = document.getElementById("exportBtn");

if (exportBtn) {
  exportBtn.addEventListener("click", async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));

      let csv =
        "Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Variant SKU,Variant Barcode,Variant Inventory Qty,Variant Price\n";

      snapshot.forEach(docSnap => {
        const p = docSnap.data();

        const handle = (p.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

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
      console.error("❌ Fehler beim CSV-Export:", err);
      showFeedback(t("errors.fail"), "error");
    }
  });
}
