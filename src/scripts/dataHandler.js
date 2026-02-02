// src/scripts/dataHandler.js – globales Datenverwaltungs-Modul (modulare Firebase SDK)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Dokument hinzufügen
// -------------------------------------------------------------
export async function addData(collectionName, data) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), data);

    console.log(`📘 Dokument hinzugefügt in '${collectionName}' (ID: ${docRef.id})`);
    return docRef.id;

  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen von Daten:", error);
    showFeedback(t("errors.fail"), "error");
    return null;
  }
}

// -------------------------------------------------------------
// 🔹 Alle Dokumente abrufen
// -------------------------------------------------------------
export async function getData(collectionName) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, collectionName));

    const results = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log(`📄 ${results.length} Dokument(e) aus '${collectionName}' geladen`);
    return results;

  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Daten:", error);
    showFeedback(t("errors.load"), "error");
    return [];
  }
}

// -------------------------------------------------------------
// 🔹 Einzelnes Dokument abrufen
// -------------------------------------------------------------
export async function getDataById(collectionName, id) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return null;
  }

  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      console.warn(`⚠️ Dokument '${id}' existiert nicht in '${collectionName}'`);
      return null;
    }

    console.log(`📘 Dokument '${id}' aus '${collectionName}' geladen`);
    return { id: snapshot.id, ...snapshot.data() };

  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Dokuments:", error);
    showFeedback(t("errors.load"), "error");
    return null;
  }
}

// -------------------------------------------------------------
// 🔹 Dokument aktualisieren
// -------------------------------------------------------------
export async function updateData(collectionName, id, newData) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return false;
  }

  try {
    await updateDoc(doc(db, collectionName, id), newData);

    console.log(`📘 Dokument '${id}' in '${collectionName}' aktualisiert`);
    return true;

  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren:", error);
    showFeedback(t("errors.fail"), "error");
    return false;
  }
}

// -------------------------------------------------------------
// 🔹 Dokument löschen
// -------------------------------------------------------------
export async function deleteData(collectionName, id) {
  if (!db) {
    console.error("❌ Firestore nicht initialisiert.");
    return false;
  }

  try {
    await deleteDoc(doc(db, collectionName, id));

    console.log(`🗑️ Dokument '${id}' aus '${collectionName}' gelöscht`);
    return true;

  } catch (error) {
    console.error("❌ Fehler beim Löschen:", error);
    showFeedback(t("errors.fail"), "error");
    return false;
  }
}
