// timeHandler.js – globales Modul für Zeiterfassung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neue Zeitbuchung hinzufügen
export async function addTimeEntry(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("timeEntries").add(data);
    console.log(`✅ Zeitbuchung hinzugefügt mit ID: ${docRef.id}`);
    notifySuccess("Zeitbuchung erfolgreich hinzugefügt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen einer Zeitbuchung:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Alle Zeitbuchungen abrufen
export async function getTimeEntries() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("timeEntries").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Zeitbuchung(en) geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Zeitbuchungen:", error);
    notifyError("Fehler beim Laden der Zeitbuchungen – bitte erneut versuchen.");
    return [];
  }
}

// Einzelne Zeitbuchung abrufen
export async function getTimeEntryById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("timeEntries").doc(id).get();
    if (doc.exists) {
      console.log(`✅ Zeitbuchung '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Zeitbuchung '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Zeitbuchung:", error);
    notifyError("Fehler beim Laden der Zeitbuchung – bitte erneut versuchen.");
    return null;
  }
}

// Zeitbuchung aktualisieren
export async function updateTimeEntry(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("timeEntries").doc(id).update(newData);
    console.log(`✅ Zeitbuchung '${id}' aktualisiert`);
    notifySuccess("Zeitbuchung erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren der Zeitbuchung:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Zeitbuchung löschen
export async function deleteTimeEntry(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("timeEntries").doc(id).delete();
    console.log(`✅ Zeitbuchung '${id}' gelöscht`);
    notifySuccess("Zeitbuchung erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen der Zeitbuchung:", error);
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
