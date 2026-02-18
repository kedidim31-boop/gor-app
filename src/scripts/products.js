// ======================================================================
// 🔥 PRODUCTS – Finalversion mit Bearbeiten, Modal & Shopify-Export
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
  setDoc,
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
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");

const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productType = document.getElementById("productType");
const productVendor = document.getElementById("productVendor");
const productCollections = document.getElementById("productCollections");
const productTags = document.getElementById("productTags");
const productSKU = document.getElementById("productSKU");
const productEAN = document.getElementById("productEAN");
const productStock = document.getElementById("productStock");
const productPrice = document.getElementById("productPrice");

let editMode = false;
let editProductId = null;

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
// ➕ Produkt hinzufügen oder bearbeiten
// -------------------------------------------------------------
form?.addEventListener("submit", async e => {
  e.preventDefault();

  const sku = productSKU.value.trim() || generateSKU();

  const product = {
    name: productName.value.trim(),
    description: productDescription.value.trim(),
    type: productType.value.trim(),
    vendor: productVendor.value.trim(),
    collections: productCollections.value.trim(),
    tags: productTags.value.trim(),
    sku,
    ean: productEAN.value.trim(),
    stock: parseInt(productStock.value) || 0,
    price: parseFloat(productPrice.value) || 0,
    updatedAt: serverTimestamp()
  };

  if (!product.name || !product.type || !product.vendor) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    if (editMode && editProductId) {
      await setDoc(doc(db, "products", editProductId), product, { merge: true });
      await addAuditLog(auth.currentUser?.email, "product_update", `Produkt: ${editProductId}`);
      showFeedback(t("products.updated"), "success");
    } else {
      product.createdAt = serverTimestamp();
      const ref = await addDoc(collection(db, "products"), product);
      await addAuditLog(auth.currentUser?.email, "product_create", `Produkt: ${ref.id}`);
      showFeedback(t("products.saved"), "success");
    }

    form.reset();
    editMode = false;
    editProductId = null;
    formTitle.textContent = t("products.add");
    cancelEditBtn.classList.add("hidden");
    await loadProducts();
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});
// -------------------------------------------------------------
// ❌ Bearbeiten abbrechen
// -------------------------------------------------------------
cancelEditBtn?.addEventListener("click", () => {
  form.reset();
  editMode = false;
  editProductId = null;
  formTitle.textContent = t("products.add");
  cancelEditBtn.classList.add("hidden");
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
        <button class="editBtn btn btn-blue" data-id="${id}" data-json='${JSON.stringify(p)}'>
          <i class="fa-solid fa-pen"></i> ${t("products.edit")}
        </button>
        <button class="deleteBtn btn btn-red" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("products.delete")}
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachEditHandler();
  attachDeleteHandler();
}
// -------------------------------------------------------------
// ✏️ Produkt bearbeiten
// -------------------------------------------------------------
function attachEditHandler() {
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = JSON.parse(btn.dataset.json);
      editProductId = btn.dataset.id;
      editMode = true;

      productName.value = data.name || "";
      productDescription.value = data.description || "";
      productType.value = data.type || "";
      productVendor.value = data.vendor || "";
      productCollections.value = data.collections || "";
      productTags.value = data.tags || "";
      productSKU.value = data.sku || "";
      productEAN.value = data.ean || "";
      productStock.value = data.stock ?? 0;
      productPrice.value = data.price ?? 0;

      formTitle.textContent = t("products.edit");
      cancelEditBtn.classList.remove("hidden");
    });
  });
}

// -------------------------------------------------------------
// 🗑️ Produkt löschen mit Modal
// -------------------------------------------------------------
function attachDeleteHandler() {
  const modal = document.getElementById("confirmModal");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      modal.showModal();

      confirmYes.onclick = async () => {
        try {
          await deleteDoc(doc(db, "products", id));
          await addAuditLog(auth.currentUser?.email, "product_delete", `Produkt: ${id}`);
          showFeedback(t("products.delete"), "success");
          await loadProducts();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          showFeedback(t("errors.fail"), "error");
        } finally {
          modal.close();
        }
      };

      confirmNo.onclick = () => modal.close();
    });
  });
}
