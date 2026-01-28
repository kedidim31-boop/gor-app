// rolesHandler.js – globales Modul für Rollenverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Rolle für Benutzer setzen
export async function setUserRole(uid, role) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("users").doc(uid).update({ role });
    console.log(`✅ Rolle für Benutzer '${uid}' gesetzt: ${role}`);
    notifySuccess(`Rolle erfolgreich gesetzt: ${role}`);
  } catch (error) {
    console.error("❌ Fehler beim Setzen der Rolle:", error);
    notifyError("Fehler beim Setzen der Rolle – bitte erneut versuchen.");
  }
}

// Rolle eines Benutzers abrufen
export async function getUserRole(uid) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
      const role = doc.data().role || "guest";
      console.log(`✅ Rolle für Benutzer '${uid}' abgerufen: ${role}`);
      return role;
    } else {
      console.warn(`⚠️ Benutzer '${uid}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Rolle:", error);
    notifyError("Fehler beim Abrufen der Rolle – bitte erneut versuchen.");
    return null;
  }
}

// Alle Rollen abrufen (z. B. für Dropdowns oder Admin-Übersicht)
export async function getAllRoles() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("users").get();
    const roles = snapshot.docs.map(doc => ({ id: doc.id, role: doc.data().role || "guest" }));
    console.log(`✅ ${roles.length} Rollen geladen`);
    return roles;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen aller Rollen:", error);
    notifyError("Fehler beim Laden der Rollen – bitte erneut versuchen.");
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
