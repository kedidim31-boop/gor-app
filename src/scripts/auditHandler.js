// src/scripts/auditHandler.js – globales Modul für Audit-Logs (modulare Firebase SDK)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// 🔹 Neues Audit-Log hinzufügen
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

    const docRef = await addDoc(collection(db, "auditLogs"), entry);

    console.log(`✅ Audit-Log gespeichert: ${action} (ID: ${docRef.id})`);
    // Optional: showFeedback("Audit-Log gespeichert", "success");

    return docRef.id;

  } catch (error) {
    console.error("❌ Fehler beim Speichern des Audit-Logs:", error);
    showFeedback("Fehler beim Speichern des Audit-Logs.", "error");
    return null;
  }
}

// 🔹 Alle Audit-Logs abrufen
export async function getAuditLogs(limit = 20) {
  if (!db) return [];

  try {
    const q = query(
      collection(db, "auditLogs"),
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
    showFeedback("Fehler beim Laden der Audit-Logs.", "error");
    return [];
  }
}

// 🔹 Audit-Logs eines bestimmten Benutzers abrufen
export async function getAuditLogsByUser(userId, limit = 10) {
  if (!db) return [];

  try {
    const q = query(
      collection(db, "auditLogs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      fsLimit(limit)
    );

    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`📄 ${logs.length} Audit-Logs für User '${userId}' geladen`);
    return logs;

  } catch (error) {
    console.error(`❌ Fehler beim Laden der Audit-Logs für User '${userId}':`, error);
    showFeedback("Fehler beim Laden der Benutzer-Audit-Logs.", "error");
    return [];
  }
}
