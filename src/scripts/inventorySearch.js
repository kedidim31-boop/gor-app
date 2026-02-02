// src/scripts/inventorySearch.js – Live-Suche & Filter für Lagerbestand (mehrsprachig + optimiert)

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
const searchInput = document.getElementById("inventorySearchInput");
const tableBody = document.querySelector("#inventoryTable tbody");

// Falls kein Table existiert → abbrechen
if (!tableBody) {
  console.warn("⚠️ inventorySearch.js: Kein Inventory-Tabelle gefunden.");
}

// -------------------------------------------------------------
// 🔹 Cache für Produkte (Performance Boost)
// -------------------------------------------------------------
let inventoryCache = [];

// -------------------------------------------------------------
// 🔹 Produkte laden (einmalig)
// -------------------------------------------------------------
async function loadInventoryForSearch() {
  try {
    const snapshot = await getDocs(collection(db, "products"));

    inventoryCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

  } catch (err) {
    console.error("❌ Fehler beim Laden der Produkte für Suche:", err);
  }
}

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
// 🔹 Inventory-Rendering
// -------------------------------------------------------------
function renderInventory(list) {
  tableBody.innerHTML = "";

  list.forEach(p => {
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
        <button class="adjustBtn btn btn-blue" data-id="${p.id}">
          <i class="fa-solid fa-plus-minus"></i> ${t("inventory.adjust")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // 🔥 Wichtig: Buttons neu aktivieren
  document.dispatchEvent(new CustomEvent("inventorySearchRendered"));
}

// -------------------------------------------------------------
// 🔹 Live-Suche
// -------------------------------------------------------------
function filterInventory(query) {
  query = query.toLowerCase().trim();

  if (!query) {
    renderInventory(inventoryCache);
    return;
  }

  const filtered = inventoryCache.filter(p => {
    return (
      (p.name || "").toLowerCase().includes(query) ||
      (p.sku || "").toLowerCase().includes(query) ||
      (p.ean || "").toLowerCase().includes(query) ||
      (p.vendor || "").toLowerCase().includes(query) ||
      (p.type || "").toLowerCase().includes(query) ||
      (p.collections || "").toLowerCase().includes(query)
    );
  });

  renderInventory(filtered);
}

// -------------------------------------------------------------
// 🔹 Debounce (verhindert 1000 Events pro Sekunde)
// -------------------------------------------------------------
let debounceTimer = null;

function debounceSearch(e) {
  clearTimeout(debounceTimer);
  const value = e.target.value;

  debounceTimer = setTimeout(() => {
    filterInventory(value);
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
  await loadInventoryForSearch();
  renderInventory(inventoryCache);
})();
