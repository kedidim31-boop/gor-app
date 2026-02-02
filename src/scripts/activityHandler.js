// ======================================================================
// 🔥 activityHandler.js – FINAL VERSION (Teil 1)
// Globales Audit-Log Modul für Gaming of Republic
// Kompatibel mit Firestore Rules + E-Mail-basiertem User-System
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

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

// Firebase initialisieren
const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Audit-Log schreiben (Admin, Manager, Support, Employee)
//    → Firestore Rules erlauben: allow create: if request.auth != null;
// -------------------------------------------------------------
export async function addAuditLog(userIdentifier, action, details = "") {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Audit-Log kann nicht gespeichert werden.");
    return null;
  }

  const userId = userIdentifier || "unknown";

  if (!action || typeof action !== "string") {
    console.warn("⚠️ Ungültige Aktion – Audit-Log übersprungen.");
    return null;
  }

  try {
    const entry = {
      userId,
      action,
      details: details || "",
      timestamp: serverTimestamp()
    };

    const ref = await addDoc(collection(db, "activities"), entry);

    console.log(`📘 Audit-Log gespeichert: ${action} (ID: ${ref.id})`);
    return ref.id;

  } catch (error) {
    console.error("❌ Fehler beim Speichern des Audit-Logs:", error);

    // Firestore Rules Fehler sauber anzeigen
    if (error.code === "permission-denied") {
      showFeedback(t("errors.permissionDenied") || "Keine Berechtigung für Audit-Log.", "error");
    } else {
      showFeedback(t("errors.fail"), "error");
    }

    return null;
  }
}
// ======================================================================
// 🔹 Letzte Aktivitäten abrufen (Admin + Manager laut Rules)
// ======================================================================
export async function getRecentActivities(limit = 20) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Aktivitäten können nicht geladen werden.");
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

  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}

// ======================================================================
// 🔹 Aktivitäten eines bestimmten Benutzers abrufen (E-Mail basiert)
// ======================================================================
export async function getUserActivities(userIdentifier, limit = 20) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Benutzeraktivitäten können nicht geladen werden.");
    return [];
  }

  const userId = userIdentifier || "unknown";

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

  } catch (error) {
    console.error(`❌ Fehler beim Laden der Aktivitäten für Benutzer '${userId}':`, error);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}
