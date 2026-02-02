// src/scripts/adminUser.js – Admin-Modul zum Erstellen neuer Benutzer (Auth + Firestore)

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
import { t } from "./lang.js";

import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// -------------------------------------------------------------
// 🔹 Benutzer erstellen (Admin + Manager erlaubt)
// -------------------------------------------------------------
export async function createUser(email, password, role = "employee") {
  const { auth, db } = initFirebase();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    showFeedback(t("auth.out"), "error");
    return null;
  }

  // 🔐 Rollen prüfen (Admin + Manager dürfen Benutzer erstellen)
  const token = await currentUser.getIdTokenResult();
  const currentRole = token.claims.role || "guest";

  if (!["admin", "manager"].includes(currentRole)) {
    showFeedback(t("errors.fail"), "error");
    return null;
  }

  try {
    // -------------------------------------------------------------
    // 1️⃣ Benutzer in Firebase Auth anlegen
    // -------------------------------------------------------------
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // -------------------------------------------------------------
    // 2️⃣ Benutzer in Firestore speichern
    //    🔥 Dokument-ID = E-Mail (statt UID)
    // -------------------------------------------------------------
    await setDoc(doc(db, "employees", email), {
      email,
      role,
      uid: newUser.uid,        // optional: UID trotzdem speichern
      name: "",
      address: "",
      zip: "",
      city: "",
      phone: "",
      birthday: "",
      createdBy: currentUser.email,
      createdAt: serverTimestamp()
    });

    // -------------------------------------------------------------
    // 3️⃣ Erfolgsmeldung
    // -------------------------------------------------------------
    showFeedback(`${t("admin.createUser")}: ${email}`, "success");

    // -------------------------------------------------------------
    // 4️⃣ Aktivität loggen
    // -------------------------------------------------------------
    await logActivity(
      currentUser.email,
      "create_user",
      `User: ${email}, Role: ${role}`
    );

    return email; // 🔥 Dokument-ID zurückgeben

  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);

    showFeedback(
      `${t("errors.fail")} (${error.message})`,
      "error"
    );

    return null;
  }
}
