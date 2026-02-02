// src/scripts/productSearch.js – Live-Suche & Filter für Produkte (mehrsprachig + optimiert)

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
const searchInput = document.getElementById("productSearchInput");
const tableBody = document.querySelector("#productTable tbody");

// Falls kein Table existiert → abbrechen
if (!tableBody) {
  console.warn("⚠️ productSearch.js: Kein Produkt-Tabelle gefunden.");
}

// -------------------------------------------------------------
// 🔹 Cache für Produkte (Performance Boost)
// -------------------------------------------------------------
let productCache = [];

// -------------------------------------------------------------
// 🔹 Produkte laden (einmalig)
// -------------------------------------------------------------
async function loadProductsForSearch() {
  try {
    const snapshot = await getDocs(collection(db, "products"));

    productCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

  } catch (err) {
    console.error("❌ Fehler beim Laden der Produkte für Suche:", err);
  }
}

// -------------------------------------------------------------
// 🔹 Produkt-Rendering
// -------------------------------------------------------------
function renderProducts(list) {
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
}

// -------------------------------------------------------------
// 🔹 Live-Suche
// -------------------------------------------------------------
function filterProducts(query) {
  query = query.toLowerCase().trim();

  if (!query) {
    renderProducts(productCache);
    return;
  }

  const filtered = productCache.filter(p => {
    return (
      (p.name || "").toLowerCase().includes(query) ||
      (p.description || "").toLowerCase().includes(query) ||
      (p.type || "").toLowerCase().includes(query) ||
      (p.vendor || "").toLowerCase().includes(query) ||
      (p.collections || "").toLowerCase().includes(query) ||
      (p.sku || "").toLowerCase().includes(query) ||
      (p.ean || "").toLowerCase().includes(query)
    );
  });

  renderProducts(filtered);
}

// -------------------------------------------------------------
// 🔹 Debounce (verhindert 1000 Events pro Sekunde)
// -------------------------------------------------------------
let debounceTimer = null;

function debounceSearch(e) {
  clearTimeout(debounceTimer);
  const value = e.target.value;

  debounceTimer = setTimeout(() => {
    filterProducts(value);
  }, 150);
}

// -------------------------------------------------------------
// 🔹 Event Listener
// -------------------------------------------------------------
searchInput?.addEventListener("input", debounceSearch);

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
(async () => {
  await loadProductsForSearch();
  renderProducts(productCache);
})();
