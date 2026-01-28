// tasksHandler.js – globales Modul für Aufgabenverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Aufgabe hinzufügen
export async function addTask(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("tasks").add(data);
    console.log(`✅ Aufgabe hinzugefügt mit ID: ${docRef.id}`);
    notifySuccess("Aufgabe erfolgreich hinzugefügt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen einer Aufgabe:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Alle Aufgaben abrufen
export async function getTasks() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("tasks").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Aufgabe(n) geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Aufgaben:", error);
    notifyError("Fehler beim Laden der Aufgaben – bitte erneut versuchen.");
    return [];
  }
}

// Einzelne Aufgabe abrufen
export async function getTaskById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("tasks").doc(id).get();
    if (doc.exists) {
      console.log(`✅ Aufgabe '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Aufgabe '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Aufgabe:", error);
    notifyError("Fehler beim Laden der Aufgabe – bitte erneut versuchen.");
    return null;
  }
}

// Aufgabe aktualisieren
export async function updateTask(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("tasks").doc(id).update(newData);
    console.log(`✅ Aufgabe '${id}' aktualisiert`);
    notifySuccess("Aufgabe erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren der Aufgabe:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Aufgabe löschen
export async function deleteTask(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("tasks").doc(id).delete();
    console.log(`✅ Aufgabe '${id}' gelöscht`);
    notifySuccess("Aufgabe erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen der Aufgabe:", error);
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
