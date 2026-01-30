// src/scripts/adminUser.js – Modul für Admins zum Erstellen neuer Benutzer mit Rollen (modulare Firebase SDK)

import { initFirebase } from "./firebaseSetup.js";
import { addDoc, collection, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

export async function createUser(email, password, role = "mitarbeiter") {
  const { auth, db } = initFirebase();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Bitte zuerst einloggen!");
    return;
  }

  // Prüfen ob aktueller User Admin ist
  const token = await currentUser.getIdTokenResult();
  if (token.claims.role !== "admin") {
    alert("❌ Nur Admins dürfen neue Benutzer erstellen!");
    return;
  }

  try {
    // Schritt 1: Benutzer in Firebase Auth anlegen
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Schritt 2: Benutzer in Firestore speichern (employees Collection)
    await addDoc(collection(db, "employees"), {
      uid: newUser.uid,
      email,
      role,
      createdBy: currentUser.uid,
      timestamp: serverTimestamp()
    });

    alert(`✅ Neuer Benutzer angelegt: ${email} mit Rolle ${role}`);
    return newUser.uid;
  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);
    alert("Fehler beim Erstellen des Benutzers: " + error.message);
  }
}
