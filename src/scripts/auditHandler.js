// auditHandler.js – globales Modul für Audit-Logs im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neue Audit-Log-Eintragung hinzufügen
export async function addAuditLog(userId, action, details = "") {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const entry = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection("auditLogs").add(entry);
    console.log(`✅ Audit-Log hinzugefügt: ${action} (ID: ${docRef.id})`);
    notifySuccess("Audit-Log erfolgreich hinzugefügt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen eines Audit-Logs:", error);
    notifyError("Fehler beim Hinzufügen – bitte erneut versuchen.");
  }
}

// Alle Audit-Logs abrufen
export async function getAuditLogs(limit = 20) {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${logs.length} Audit-Log(s) geladen`);
    return logs;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Audit-Logs:", error);
    notifyError("Fehler beim Laden der Audit-Logs – bitte erneut versuchen.");
    return [];
  }
}

// Audit-Logs nach Benutzer abrufen
export async function getAuditLogsByUser(userId, limit = 10) {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("auditLogs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${logs.length} Audit-Log(s) für Benutzer '${userId}' geladen`);
    return logs;
  } catch (error) {
    console.error(`❌ Fehler beim Abrufen der Audit-Logs für Benutzer '${userId}':`, error);
    notifyError("Fehler beim Laden der Benutzer-Audit-Logs – bitte erneut versuchen.");
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
