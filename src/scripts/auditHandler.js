// ======================================================================
// 🔍 AUDIT HANDLER – Sprachfähige Finalversion für Audit-Logging
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
// 📝 Neues Audit-Log hinzufügen
// -------------------------------------------------------------
export async function addAuditLog(userId, action, details = "") {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Audit-Log nicht möglich.");
    return null;
  }

  try {
    const entry = {
      userId: userId || "unknown",
      action,
      details,
      timestamp: serverTimestamp()
    };

    const docId = `${Date.now()}_${userId || "sys"}`;
    await setDoc(doc(db, "activities", docId), entry, { merge: true });

    console.log(`📘 Audit gespeichert: ${action} (${docId})`);
    return docId;

  } catch (err) {
    console.error("❌ Fehler beim Audit-Log:", err);
    if (err.code === "permission-denied") {
      console.warn("🚫 Keine Berechtigung für Audit-Log.");
    }
    showFeedback(t("errors.fail"), "error");
    return null;
  }
}

// -------------------------------------------------------------
// 📄 Alle Audit-Logs abrufen
// -------------------------------------------------------------
export async function getAuditLogs(limit = 20) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Audit-Logs nicht verfügbar.");
    return [];
  }

  try {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      fsLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

  } catch (err) {
    console.error("❌ Fehler beim Laden der Audit-Logs:", err);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}

// -------------------------------------------------------------
// 👤 Audit-Logs eines bestimmten Benutzers abrufen
// -------------------------------------------------------------
export async function getAuditLogsByUser(userId, limit = 10) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Benutzer-Logs nicht verfügbar.");
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
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

  } catch (err) {
    console.error(`❌ Fehler beim Laden der Logs für ${userId}:`, err);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}
