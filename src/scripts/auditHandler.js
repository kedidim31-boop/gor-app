// ======================================================================
// 🔥 AUDIT HANDLER – FINAL VERSION
// Gaming of Republic – Audit Logging
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Neues Audit-Log hinzufügen (create oder update)
// -------------------------------------------------------------
export async function addAuditLog(userId, action, details = "") {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Audit-Log kann nicht gespeichert werden.");
    return null;
  }

  try {
    const entry = {
      userId: userId || "unknown",
      action,
      details,
      timestamp: serverTimestamp()
    };

    // Dokument-ID generieren (z. B. Zeit + User)
    const docId = `${Date.now()}_${userId || "sys"}`;

    await setDoc(doc(db, "activities", docId), entry, { merge: true });

    console.log(`📘 Audit gespeichert: ${action} (ID: ${docId})`);
    return docId;

  } catch (error) {
    if (error.code === "permission-denied") {
      console.error("🚫 Keine Berechtigung für Audit-Log:", error);
    } else {
      console.error("❌ Fehler beim Speichern des Audit-Logs:", error);
    }
    showFeedback(t("errors.fail"), "error");
    return null;
  }
}
// -------------------------------------------------------------
// 🔹 Alle Audit-Logs abrufen
// -------------------------------------------------------------
export async function getAuditLogs(limit = 20) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Audit-Logs können nicht geladen werden.");
    return [];
  }

  try {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      fsLimit(limit)
    );

    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`📄 ${logs.length} Audit-Logs geladen`);
    return logs;

  } catch (error) {
    console.error("❌ Fehler beim Laden der Audit-Logs:", error);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}

// -------------------------------------------------------------
// 🔹 Audit-Logs eines bestimmten Benutzers abrufen
// -------------------------------------------------------------
export async function getAuditLogsByUser(userId, limit = 10) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Benutzer-Audit-Logs können nicht geladen werden.");
    return [];
  }

  try {
    const q = query(
      collection(db, "activities"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      fsLimit(limit)
    );

    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`📘 ${logs.length} Audit-Logs für User '${userId}' geladen`);
    return logs;

  } catch (error) {
    console.error(`❌ Fehler beim Laden der Audit-Logs für User '${userId}':`, error);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}
