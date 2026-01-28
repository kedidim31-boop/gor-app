// dashboardHandler.js – globales Modul für Dashboard-Logik im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Dashboard-Kennzahlen laden
export async function loadDashboardStats() {
  const { db } = initFirebase();
  if (!db) return {};

  try {
    const [productsSnap, employeesSnap, tasksSnap, timeSnap] = await Promise.all([
      db.collection("products").get(),
      db.collection("employees").get(),
      db.collection("tasks").get(),
      db.collection("timeEntries").get()
    ]);

    const stats = {
      products: productsSnap.size,
      employees: employeesSnap.size,
      tasks: tasksSnap.size,
      timeEntries: timeSnap.size
    };

    console.log("✅ Dashboard-Kennzahlen erfolgreich geladen:", stats);
    notifySuccess("Dashboard-Kennzahlen erfolgreich geladen");
    return stats;
  } catch (error) {
    console.error("❌ Fehler beim Laden der Dashboard-Kennzahlen:", error);
    notifyError("Fehler beim Laden der Dashboard-Kennzahlen – bitte erneut versuchen.");
    return {};
  }
}

// Letzte Aktivitäten abrufen
export async function loadRecentActivities(limit = 5) {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("activities")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${activities.length} letzte Aktivität(en) geladen`);
    return activities;
  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
    notifyError("Fehler beim Laden der Aktivitäten – bitte erneut versuchen.");
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
