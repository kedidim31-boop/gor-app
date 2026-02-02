// src/scripts/adminUser.js – Admin-Modul zum Erstellen neuer Benutzer (Auth + Firestore)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// 🔥 Option-B Rollen: "admin" | "employee" | "guest"
export async function createUser(email, password, role = "employee") {
  const { auth, db } = initFirebase();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    showFeedback("Bitte zuerst einloggen!", "error");
    return null;
  }

  // 🔐 Admin-Berechtigung prüfen
  const token = await currentUser.getIdTokenResult();
  const currentRole = token.claims.role || "guest";

  if (currentRole !== "admin") {
    showFeedback("❌ Nur Admins dürfen neue Benutzer erstellen!", "error");
    return null;
  }

  try {
    // 1️⃣ Benutzer in Firebase Auth anlegen
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // 2️⃣ Benutzer in Firestore speichern (employees Collection)
    //    Wichtig: UID als Dokument-ID → perfekte Zuordnung
    await setDoc(doc(db, "employees", newUser.uid), {
      uid: newUser.uid,
      email,
      role,
      name: "",          // Platzhalter, Admin kann später Namen setzen
      address: "",
      zip: "",
      city: "",
      phone: "",
      birthday: "",
      createdBy: currentUser.uid,
      createdAt: serverTimestamp()
    });

    // 3️⃣ Erfolgsmeldung
    showFeedback(`Neuer Benutzer angelegt: ${email} (${role})`, "success");

    // 4️⃣ Aktivität loggen
    await logActivity(currentUser.uid, "create_user", `User: ${email}, Rolle: ${role}`);

    return newUser.uid;

  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);
    showFeedback("Fehler beim Erstellen des Benutzers: " + error.message, "error");
    return null;
  }
}
