// src/scripts/activityHandler.js – globales Modul für Aktivitäten-Logging
// Nutzt modularen Firestore + globales Neon-Feedback-System

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

// 🔹 Neue Aktivität protokollieren
export async function logActivity(userId, action, details = "") {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Aktivität kann nicht protokolliert werden.");
    return null;
  }

  try {
    const entry = {
      userId: userId || "unknown",
      action,
      details,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "activities"), entry);
    console.log(`✅ Aktivität protokolliert: ${action} (ID: ${docRef.id})`);

    // Optional: Nur bei bestimmten Aktionen Feedback anzeigen
    // showFeedback("Aktivität erfolgreich protokolliert.", "success");

    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Protokollieren der Aktivität:", error);
    showFeedback("Fehler beim Protokollieren der Aktivität.", "error");
    return null;
  }
}

// 🔹 Letzte Aktivitäten abrufen
export async function getRecentActivities(limit = 10) {
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
    const activities = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`✅ ${activities.length} Aktivität(en) geladen`);
    return activities;
  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
    showFeedback("Fehler beim Laden der Aktivitäten.", "error");
    return [];
  }
}

// 🔹 Aktivitäten eines bestimmten Benutzers abrufen
export async function getUserActivities(userId, limit = 10) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert – Benutzeraktivitäten können nicht geladen werden.");
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
    const activities = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`✅ ${activities.length} Aktivität(en) für Benutzer '${userId}' geladen`);
    return activities;
  } catch (error) {
    console.error(`❌ Fehler beim Laden der Aktivitäten für Benutzer '${userId}':`, error);
    showFeedback("Fehler beim Laden der Benutzeraktivitäten.", "error");
    return [];
  }
}
