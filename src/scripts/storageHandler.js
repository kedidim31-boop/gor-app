// storageHandler.js – globales Modul für Datei- und Bildspeicherung im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Datei hochladen
export async function uploadFile(file, path = "uploads/") {
  const { storage } = initFirebase();
  if (!storage) return null;

  try {
    const storageRef = storage.ref(`${path}${file.name}`);
    const snapshot = await storageRef.put(file);
    const url = await snapshot.ref.getDownloadURL();

    console.log(`✅ Datei '${file.name}' erfolgreich hochgeladen: ${url}`);
    notifySuccess(`Datei '${file.name}' erfolgreich hochgeladen`);
    return url;
  } catch (error) {
    console.error("❌ Fehler beim Hochladen der Datei:", error);
    notifyError("Fehler beim Hochladen – bitte erneut versuchen.");
    return null;
  }
}

// Bild hochladen (mit optionaler Komprimierung)
export async function uploadImage(file, path = "images/") {
  const { storage } = initFirebase();
  if (!storage) return null;

  try {
    const storageRef = storage.ref(`${path}${file.name}`);
    const snapshot = await storageRef.put(file);
    const url = await snapshot.ref.getDownloadURL();

    console.log(`✅ Bild '${file.name}' erfolgreich hochgeladen: ${url}`);
    notifySuccess(`Bild '${file.name}' erfolgreich hochgeladen`);
    return url;
  } catch (error) {
    console.error("❌ Fehler beim Hochladen des Bildes:", error);
    notifyError("Fehler beim Hochladen – bitte erneut versuchen.");
    return null;
  }
}

// Datei löschen
export async function deleteFile(path) {
  const { storage } = initFirebase();
  if (!storage) return;

  try {
    const storageRef = storage.ref(path);
    await storageRef.delete();

    console.log(`✅ Datei '${path}' erfolgreich gelöscht`);
    notifySuccess(`Datei '${path}' erfolgreich gelöscht`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen der Datei:", error);
    notifyError("Fehler beim Löschen – bitte erneut versuchen.");
  }
}

// Datei-URL abrufen
export async function getFileURL(path) {
  const { storage } = initFirebase();
  if (!storage) return null;

  try {
    const storageRef = storage.ref(path);
    const url = await storageRef.getDownloadURL();

    console.log(`✅ URL für '${path}' abgerufen: ${url}`);
    return url;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Datei-URL:", error);
    notifyError("Fehler beim Abrufen der Datei-URL – bitte erneut versuchen.");
    return null;
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
