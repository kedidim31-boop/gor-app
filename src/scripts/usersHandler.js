// usersHandler.js – globales Modul für Benutzerverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neuen Benutzer anlegen (nur Admins)
export async function addUser(email, password, role = "user") {
  const { auth, db } = initFirebase();
  if (!auth || !db) return;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Rolle im Firestore speichern
    await db.collection("users").doc(user.uid).set({
      email,
      role,
      createdAt: new Date().toISOString()
    });

    console.log(`✅ Benutzer '${email}' erfolgreich angelegt mit Rolle '${role}'`);
    notifySuccess(`Benutzer '${email}' erfolgreich angelegt`);
    return user.uid;
  } catch (error) {
    console.error("❌ Fehler beim Anlegen eines Benutzers:", error);
    notifyError("Fehler beim Anlegen – bitte erneut versuchen.");
  }
}

// Alle Benutzer abrufen
export async function getUsers() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("users").get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Benutzer geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Benutzer:", error);
    notifyError("Fehler beim Laden der Benutzer – bitte erneut versuchen.");
    return [];
  }
}

// Einzelnen Benutzer abrufen
export async function getUserById(uid) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
      console.log(`✅ Benutzer '${uid}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Benutzer '${uid}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Benutzers:", error);
    notifyError("Fehler beim Laden des Benutzers – bitte erneut versuchen.");
    return null;
  }
}

// Benutzer aktualisieren
export async function updateUser(uid, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("users").doc(uid).update(newData);
    console.log(`✅ Benutzer '${uid}' aktualisiert`);
    notifySuccess("Benutzer erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren des Benutzers:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Benutzer löschen
export async function deleteUser(uid) {
  const { auth, db } = initFirebase();
  if (!auth || !db) return;

  try {
    // Benutzer aus Auth löschen
    const user = await auth.currentUser;
    if (user && user.uid === uid) {
      await user.delete();
    }

    // Benutzer aus Firestore löschen
    await db.collection("users").doc(uid).delete();

    console.log(`✅ Benutzer '${uid}' gelöscht`);
    notifySuccess("Benutzer erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Benutzers:", error);
    notifyError("Fehler beim Löschen – bitte erneut versuchen.");
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
