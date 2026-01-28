// employeeHandler.js – globales Modul für Mitarbeiterverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Mitarbeiter hinzufügen
export async function addEmployee(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("employees").add(data);
    console.log(`✅ Mitarbeiter hinzugefügt mit ID: ${docRef.id}`);
    notifySuccess(`Mitarbeiter erfolgreich hinzugefügt`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen eines Mitarbeiters:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Alle Mitarbeiter abrufen
export async function getEmployees() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("employees").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Mitarbeiter geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Mitarbeiter:", error);
    notifyError("Fehler beim Laden der Mitarbeiter – bitte erneut versuchen.");
    return [];
  }
}

// Einzelnen Mitarbeiter abrufen
export async function getEmployeeById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("employees").doc(id).get();
    if (doc.exists) {
      console.log(`✅ Mitarbeiter '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Mitarbeiter '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Mitarbeiters:", error);
    notifyError("Fehler beim Laden des Mitarbeiters – bitte erneut versuchen.");
    return null;
  }
}

// Mitarbeiter aktualisieren
export async function updateEmployee(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("employees").doc(id).update(newData);
    console.log(`✅ Mitarbeiter '${id}' aktualisiert`);
    notifySuccess(`Mitarbeiter erfolgreich aktualisiert`);
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren des Mitarbeiters:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Mitarbeiter löschen
export async function deleteEmployee(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("employees").doc(id).delete();
    console.log(`✅ Mitarbeiter '${id}' gelöscht`);
    notifySuccess(`Mitarbeiter erfolgreich gelöscht`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Mitarbeiters:", error);
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
