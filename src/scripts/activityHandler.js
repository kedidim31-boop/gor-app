// activityHandler.js – globales Modul für Aktivitäten-Logging im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neue Aktivität protokollieren
export async function logActivity(userId, action, details = "") {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const entry = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection("activities").add(entry);
    console.log(`✅ Aktivität protokolliert: ${action} (ID: ${docRef.id})`);
    notifySuccess("Aktivität erfolgreich protokolliert");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Protokollieren der Aktivität:", error);
    notifyError("Fehler beim Protokollieren – bitte erneut versuchen.");
  }
}

// Letzte Aktivitäten abrufen
export async function getRecentActivities(limit = 10) {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("activities")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${activities.length} Aktivität(en) geladen`);
    return activities;
  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
    notifyError("Fehler beim Laden der Aktivitäten – bitte erneut versuchen.");
    return [];
  }
}

// Aktivitäten eines bestimmten Benutzers abrufen
export async function getUserActivities(userId, limit = 10) {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("activities")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${activities.length} Aktivität(en) für Benutzer '${userId}' geladen`);
    return activities;
  } catch (error) {
    console.error(`❌ Fehler beim Laden der Aktivitäten für Benutzer '${userId}':`, error);
    notifyError("Fehler beim Laden der Benutzeraktivitäten – bitte erneut versuchen.");
    return [];
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
