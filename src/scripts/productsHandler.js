// productsHandler.js – globales Modul für Produktverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Produkt hinzufügen
export async function addProduct(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("products").add(data);
    console.log(`✅ Produkt hinzugefügt mit ID: ${docRef.id}`);
    notifySuccess("Produkt erfolgreich hinzugefügt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen eines Produkts:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Alle Produkte abrufen
export async function getProducts() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("products").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Produkt(e) geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Produkte:", error);
    notifyError("Fehler beim Laden der Produkte – bitte erneut versuchen.");
    return [];
  }
}

// Einzelnes Produkt abrufen
export async function getProductById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("products").doc(id).get();
    if (doc.exists) {
      console.log(`✅ Produkt '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Produkt '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Produkts:", error);
    notifyError("Fehler beim Laden des Produkts – bitte erneut versuchen.");
    return null;
  }
}

// Produkt aktualisieren
export async function updateProduct(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("products").doc(id).update(newData);
    console.log(`✅ Produkt '${id}' aktualisiert`);
    notifySuccess("Produkt erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren des Produkts:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Produkt löschen
export async function deleteProduct(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("products").doc(id).delete();
    console.log(`✅ Produkt '${id}' gelöscht`);
    notifySuccess("Produkt erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Produkts:", error);
    notifyError("Fehler beim Löschen – bitte erneut versuchen.");
  }
}

// Hilfsfunktionen für UI-Feedback (aus notificationHandler.js)
function notifySuccess(message) {
  const box = document.createElement("div");
  box.className = "notification success";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

function notifyError(message) {
  const box = document.createElement("div");
  box.className = "notification error";
  box.innerText = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);

  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}
