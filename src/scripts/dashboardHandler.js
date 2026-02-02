// src/scripts/dashboardHandler.js – globales Dashboard-Modul (modulare Firebase SDK)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit as fsLimit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// 🔹 Dashboard-Kennzahlen laden (Produkte, Mitarbeiter, Aufgaben, Zeit)
export async function loadDashboardStats() {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return {};
  }

  try {
    const [productsSnap, employeesSnap, tasksSnap, timeSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "employees")),
      getDocs(collection(db, "tasks")),
      getDocs(collection(db, "timeEntries"))
    ]);

    const stats = {
      products: productsSnap.size,
      employees: employeesSnap.size,
      tasks: tasksSnap.size,
      timeEntries: timeSnap.size
    };

    console.log("📊 Dashboard-Kennzahlen geladen:", stats);
    return stats;

  } catch (error) {
    console.error("❌ Fehler beim Laden der Dashboard-Kennzahlen:", error);
    showFeedback("Fehler beim Laden der Dashboard-Kennzahlen.", "error");
    return {};
  }
}

// 🔹 Letzte Aktivitäten abrufen
export async function loadRecentActivities(limit = 5) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
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

    console.log(`📄 ${activities.length} letzte Aktivität(en) geladen`);
    return activities;

  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
    showFeedback("Fehler beim Laden der Aktivitäten.", "error");
    return [];
  }
}
