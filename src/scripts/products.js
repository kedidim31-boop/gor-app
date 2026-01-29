// src/scripts/products.js – Logik für Produktverwaltung

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff für Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

const form = document.getElementById("createProductForm");
const tableBody = document.querySelector("#productTable tbody");

// Produkt hinzufügen
form.addEventListener("submit", async e => {
  e.preventDefault();
  const product = {
    name: document.getElementById("productName").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
    type: document.getElementById("productType").value.trim(),
    vendor: document.getElementById("productVendor").value.trim(),
    collections: document.getElementById("productCollections").value.trim(),
    sku: document.getElementById("productSKU").value.trim(),
    ean: document.getElementById("productEAN").value.trim(),
    price: parseFloat(document.getElementById("productPrice").value)
  };
  try {
    await addDoc(collection(db, "products"), product);
    form.reset();
    loadProducts();
    alert("✅ Produkt erfolgreich gespeichert!");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    alert("Fehler beim Speichern des Produkts.");
  }
});

// Produkte laden
async function loadProducts() {
  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "products"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.description}</td>
      <td>${data.type}</td>
      <td>${data.vendor}</td>
      <td>${data.collections || "-"}</td>
      <td>${data.sku}</td>
      <td>${data.ean || "-"}</td>
      <td><i class="fa-solid fa-money-bill-wave"></i> ${data.price.toFixed(2)} CHF</td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> Löschen
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Löschen
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.closest("button").dataset.id;
      if (confirm("Soll dieses Produkt wirklich gelöscht werden?")) {
        try {
          await deleteDoc(doc(db, "products", id));
          alert("✅ Produkt gelöscht");
          loadProducts();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          alert("Fehler beim Löschen des Produkts.");
        }
      }
    });
  });
}

// Initial laden
loadProducts();

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// Shopify-kompatibler CSV-Export
document.getElementById("exportBtn").addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "products"));
  let csvContent = "data:text/csv;charset=utf-8,";

  // Shopify Kopfzeile
  csvContent += "Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Variant SKU,Variant Barcode,Variant Price\n";

  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const handle = p.name.toLowerCase().replace(/\s+/g, "-");
    const title = p.name;
    const body = p.description || "";
    const vendor = p.vendor || "";
