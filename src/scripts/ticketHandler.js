// ticketHandler.js – globales Modul für Support-Tickets im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Error-Handling

import { initFirebase } from "./firebaseSetup.js";

// Neues Ticket erstellen
export async function createTicket(data) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    const docRef = await db.collection("tickets").add({
      ...data,
      status: "open",
      createdAt: new Date().toISOString()
    });
    console.log(`✅ Ticket erstellt mit ID: ${docRef.id}`);
    notifySuccess("Ticket erfolgreich erstellt");
    return docRef.id;
  } catch (error) {
    console.error("❌ Fehler beim Erstellen eines Tickets:", error);
    notifyError("Fehler beim Erstellen – bitte erneut versuchen.");
  }
}

// Alle Tickets abrufen
export async function getTickets() {
  const { db } = initFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection("tickets").orderBy("createdAt", "desc").get();
    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ ${tickets.length} Ticket(s) geladen`);
    return tickets;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Tickets:", error);
    notifyError("Fehler beim Laden der Tickets – bitte erneut versuchen.");
    return [];
  }
}

// Ticket nach ID abrufen
export async function getTicketById(id) {
  const { db } = initFirebase();
  if (!db) return null;

  try {
    const doc = await db.collection("tickets").doc(id).get();
    if (doc.exists) {
      console.log(`✅ Ticket '${id}' geladen`);
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`⚠️ Ticket '${id}' existiert nicht`);
      return null;
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Tickets:", error);
    notifyError("Fehler beim Laden des Tickets – bitte erneut versuchen.");
    return null;
  }
}

// Ticket aktualisieren (z. B. Status ändern)
export async function updateTicket(id, newData) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("tickets").doc(id).update(newData);
    console.log(`✅ Ticket '${id}' aktualisiert`);
    notifySuccess("Ticket erfolgreich aktualisiert");
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren des Tickets:", error);
    notifyError("Fehler beim Aktualisieren – bitte erneut versuchen.");
  }
}

// Ticket löschen
export async function deleteTicket(id) {
  const { db } = initFirebase();
  if (!db) return;

  try {
    await db.collection("tickets").doc(id).delete();
    console.log(`✅ Ticket '${id}' gelöscht`);
    notifySuccess("Ticket erfolgreich gelöscht");
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Tickets:", error);
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
