// dataHandler.js – globales Modul für Datenverwaltung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

// Firebase Firestore Referenz
function getDB() {
  if (!firebase.apps.length) {
    console.error("❌ Firebase nicht initialisiert – bitte initFirebase() aufrufen");
    return null;
  }
  return firebase.firestore();
}

// Daten hinzufügen
export async function addData(collection, data) {
  const db = getDB();
  if (!db) return;

  try {
    const docRef = await db.collection(collection).add(data);
    console.log(`✅ Dokument hinzugefügt in '${collection}' mit ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen von Daten:", error);
    alert("Fehler beim Speichern – bitte erneut versuchen.");
  }
}

// Daten abrufen (alle Dokumente)
export async function getData(collection) {
  const db = getDB();
  if (!db) return [];

  try {
    const snapshot = await db.collection(collection).get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${results.length} Dokument(e) aus '${collection}' geladen`);
    return results;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen von Daten:", error);
    alert("Fehler beim Laden der Daten – bitte erneut versuchen.");
    return [];
  }
}

// Einzelnes Dokument abrufen
export async function getDataById(collection, id) {
  const db = getDB();
  if (!db) return null;

  try {
    const doc = await db.collection(collection).doc(id).get();
    if (doc.exists) {
      console.log(`✅ Dokument '${id}' aus '${collection}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Dokument '${id}' existiert nicht in '${collection}'`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Dokuments:", error);
    alert("Fehler beim Laden des Dokuments – bitte erneut versuchen.");
    return null;
  }
}

// Daten aktualisieren
export async function updateData(collection, id, newData) {
  const db = getDB();
  if (!db) return;

  try {
    await db.collection(collection).doc(id).update(newData);
    console.log(`✅ Dokument '${id}' in '${collection}' aktualisiert`);
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren von Daten:", error);
    alert("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Daten löschen
export async function deleteData(collection, id) {
  const db = getDB();
  if (!db) return;

  try {
    await db.collection(collection).doc(id).delete();
    console.log(`✅ Dokument '${id}' aus '${collection}' gelöscht`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen von Daten:", error);
    alert("Fehler beim Löschen – bitte erneut versuchen.");
  }
}
