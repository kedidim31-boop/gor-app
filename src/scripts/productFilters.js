// src/scripts/productFilters.js – Dropdown-Filter für Produkte (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { t } from "./lang.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const filterType = document.getElementById("filterType");
const filterVendor = document.getElementById("filterVendor");
const filterCollections = document.getElementById("filterCollections");
const tableBody = document.querySelector("#productTable tbody");

// -------------------------------------------------------------
// 🔹 Produkt-Cache (Performance Boost)
// -------------------------------------------------------------
let productCache = [];

// -------------------------------------------------------------
// 🔹 Produkte laden (einmalig)
// -------------------------------------------------------------
async function loadProductsForFilters() {
  const snapshot = await getDocs(collection(db, "products"));

  productCache = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  buildFilterOptions();
  renderProducts(productCache);
}

// -------------------------------------------------------------
// 🔹 Filteroptionen automatisch generieren
// -------------------------------------------------------------
function buildFilterOptions() {
  const types = new Set();
  const vendors = new Set();
  const collections = new Set();

  productCache.forEach(p => {
    if (p.type) types.add(p.type);
    if (p.vendor) vendors.add(p.vendor);
    if (p.collections) collections.add(p.collections);
  });

  fillSelect(filterType, types, t("products.allTypes"));
  fillSelect(filterVendor, vendors, t("products.allVendors"));
  fillSelect(filterCollections, collections, t("products.allCollections"));
}

function fillSelect(select, values, defaultLabel) {
  if (!select) return;

  select.innerHTML = `<option value="">${defaultLabel}</option>`;

  [...values].sort().forEach(v => {
    select.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

// -------------------------------------------------------------
// 🔹 Produkte rendern
// -------------------------------------------------------------
function renderProducts(list) {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  list.forEach(p => {
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
      <td><i class="fa-solid fa-money-bill-wave"></i> ${Number(p.price || 0).toFixed(2)} CHF</td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${p.id}">
          <i class="fa-solid fa-trash"></i> ${t("products.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // 🔥 Wichtig: Buttons neu aktivieren (products.js / productSearch.js)
  document.dispatchEvent(new CustomEvent("productsRendered"));
}

// -------------------------------------------------------------
// 🔹 Filter anwenden
// -------------------------------------------------------------
function applyFilters() {
  const type = filterType?.value || "";
  const vendor = filterVendor?.value || "";
  const coll = filterCollections?.value || "";

  const filtered = productCache.filter(p => {
    return (
      (type === "" || p.type === type) &&
      (vendor === "" || p.vendor === vendor) &&
      (coll === "" || p.collections === coll)
    );
  });

  renderProducts(filtered);
}

// -------------------------------------------------------------
// 🔹 Event Listener
// -------------------------------------------------------------
filterType?.addEventListener("change", applyFilters);
filterVendor?.addEventListener("change", applyFilters);
filterCollections?.addEventListener("change", applyFilters);

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadProductsForFilters();
