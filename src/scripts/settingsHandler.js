// settingsHandler.js – globales Modul für Systemeinstellungen im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Einstellungen speichern
export async function saveSettings(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("settings").doc("global").set(data, { merge: true });
    console.log("✅ Einstellungen erfolgreich gespeichert");
    notifySuccess("Einstellungen erfolgreich gespeichert");
  } catch (error) {
    console.error("❌ Fehler beim Speichern der Einstellungen:", error);
    notifyError("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Einstellungen abrufen
export async function getSettings() {
  const { db } = initFirebase();
  if (!db) return {};

  try {
    const doc = await db.collection("settings").doc("global").get();
    if (doc.exists) {
      console.log("✅ Einstellungen erfolgreich geladen");
      return doc.data();
    } else {
      console.warn("⚠️ Keine Einstellungen gefunden – Standardwerte werden verwendet");
      return {};
    }
  } catch (error) {
    console.error("❌ Fehler beim Laden der Einstellungen:", error);
    notifyError("Fehler beim Laden der Einstellungen – bitte erneut versuchen.");
    return {};
  }
}

// Einzelne Einstellung aktualisieren
export async function updateSetting(key, value) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("settings").doc("global").update({ [key]: value });
    console.log(`✅ Einstellung '${key}' aktualisiert`);
    notifySuccess(`Einstellung '${key}' erfolgreich aktualisiert`);
  } catch (error) {
    console.error(`❌ Fehler beim Aktualisieren der Einstellung '${key}':`, error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
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
