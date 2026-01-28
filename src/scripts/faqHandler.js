// faqHandler.js – globales Modul für FAQ-Verwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neue FAQ hinzufügen
export async function addFAQ(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("faqs").add(data);
    console.log(`✅ FAQ hinzugefügt mit ID: ${docRef.id}`);
    notifySuccess("FAQ erfolgreich hinzugefügt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen einer FAQ:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Alle FAQs abrufen
export async function getFAQs() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("faqs").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} FAQ(s) geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der FAQs:", error);
    notifyError("Fehler beim Laden der FAQs – bitte erneut versuchen.");
    return [];
  }
}

// Einzelne FAQ abrufen
export async function getFAQById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("faqs").doc(id).get();
    if (doc.exists) {
      console.log(`✅ FAQ '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ FAQ '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der FAQ:", error);
    notifyError("Fehler beim Laden der FAQ – bitte erneut versuchen.");
    return null;
  }
}

// FAQ aktualisieren
export async function updateFAQ(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("faqs").doc(id).update(newData);
    console.log(`✅ FAQ '${id}' aktualisiert`);
    notifySuccess("FAQ erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren der FAQ:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// FAQ löschen
export async function deleteFAQ(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("faqs").doc(id).delete();
    console.log(`✅ FAQ '${id}' gelöscht`);
    notifySuccess("FAQ erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen der FAQ:", error);
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
