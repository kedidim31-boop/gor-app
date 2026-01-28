// overviewHandler.js – globales Modul für Dashboard-Übersicht im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Übersichtsdaten laden (z. B. Anzahl Produkte, Mitarbeiter, Aufgaben, Zeitbuchungen)
export async function loadOverviewData() {
  const { db } = initFirebase();
  if (!db) return {};

  try {
    const [productsSnap, employeesSnap, tasksSnap, timeSnap] = await Promise.all([
      db.collection("products").get(),
      db.collection("employees").get(),
      db.collection("tasks").get(),
      db.collection("timeEntries").get()
    ]);

    const overview = {
      products: productsSnap.size,
      employees: employeesSnap.size,
      tasks: tasksSnap.size,
      timeEntries: timeSnap.size
    };

    console.log("✅ Übersichtsdaten erfolgreich geladen:", overview);
    notifySuccess("Übersichtsdaten erfolgreich geladen");
    return overview;
  } catch (error) {
    console.error("❌ Fehler beim Laden der Übersichtsdaten:", error);
    notifyError("Fehler beim Laden der Übersichtsdaten – bitte erneut versuchen.");
    return {};
  }
}

// Übersichtsdaten für ein bestimmtes Collection abrufen
export async function getCollectionCount(collectionName) {
  const { db } = initFirebase();
  if (!db) return 0;

  try {
    const snapshot = await db.collection(collectionName).get();
    console.log(`✅ ${snapshot.size} Einträge in '${collectionName}' gefunden`);
    return snapshot.size;
  } catch (error) {
    console.error(`❌ Fehler beim Abrufen von '${collectionName}':`, error);
    notifyError(`Fehler beim Abrufen von '${collectionName}'`);
    return 0;
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
