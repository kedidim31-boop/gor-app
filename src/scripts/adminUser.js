// src/scripts/adminUser.js – Professionelle Version (Admin bleibt eingeloggt)

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
  getAuth,
  createUserWithEmailAndPassword,
  signOut
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
    // 1️⃣ Zweiten Auth-Client erzeugen (damit Admin eingeloggt bleibt)
    // -------------------------------------------------------------
    const tempAuth = getAuth();
    tempAuth.persistence = "none"; // kein Login speichern

    // -------------------------------------------------------------
    // 2️⃣ Benutzer in Firebase Auth anlegen (Admin bleibt eingeloggt)
    // -------------------------------------------------------------
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const newUser = userCredential.user;

    // Sofort wieder ausloggen, damit Admin eingeloggt bleibt
    await signOut(tempAuth);

    // -------------------------------------------------------------
    // 3️⃣ Benutzer in Firestore speichern
    // -------------------------------------------------------------
    await setDoc(doc(db, "employees", email), {
      email,
      role,
      uid: newUser.uid,
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
    // 4️⃣ Erfolgsmeldung
    // -------------------------------------------------------------
    showFeedback(`${t("admin.createUser")}: ${email}`, "success");

    // -------------------------------------------------------------
    // 5️⃣ Aktivität loggen
    // -------------------------------------------------------------
    await logActivity(
      currentUser.email,
      "create_user",
      `User: ${email}, Role: ${role}`
    );

    return email;

  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);

    showFeedback(
      `${t("errors.fail")} (${error.message})`,
      "error"
    );

    return null;
  }
}
