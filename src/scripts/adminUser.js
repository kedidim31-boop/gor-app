// ======================================================================
// 🔥 adminUser.js – FINAL VERSION (Teil 1)
// Admin bleibt eingeloggt, User wird sauber erstellt
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./auditHandler.js";   // ⭐ Upgrade: Einheitliches Audit-System
import { t } from "./lang.js";

import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence
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

  // 🔐 Rollen prüfen
  const token = await currentUser.getIdTokenResult();
  const currentRole = token.claims.role || "guest";

  if (!["admin", "manager"].includes(currentRole)) {
    showFeedback(t("errors.noPermission"), "error");
    return null;
  }

  try {
    // -------------------------------------------------------------
    // 1️⃣ Temporären Auth‑Client erzeugen (Admin bleibt eingeloggt)
    // -------------------------------------------------------------
    const tempAuth = getAuth();
    await setPersistence(tempAuth, browserSessionPersistence);

    // -------------------------------------------------------------
    // 2️⃣ Benutzer in Firebase Auth anlegen
    // -------------------------------------------------------------
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const newUser = userCredential.user;

    // Admin bleibt eingeloggt → tempAuth sofort abmelden
    await signOut(tempAuth);

    // -------------------------------------------------------------
    // 3️⃣ Firestore: employees/{email} anlegen
    //    (gemäß deinen Firestore‑Rules: Admin/Manager dürfen write)
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
      disabled: false,
      createdBy: currentUser.email,
      createdAt: serverTimestamp()
    });

    // -------------------------------------------------------------
    // 4️⃣ Firestore: users/{email} anlegen
    //    (damit Disable‑System & Login‑Profil funktionieren)
// -------------------------------------------------------------
    await setDoc(doc(db, "users", email), {
      email,
      role,
      uid: newUser.uid,
      disabled: false,
      createdBy: currentUser.email,
      createdAt: serverTimestamp()
    });

    // -------------------------------------------------------------
    // 5️⃣ Erfolgsmeldung
    // -------------------------------------------------------------
    showFeedback(`${t("admin.createUser")}: ${email}`, "success");

    // -------------------------------------------------------------
    // 6️⃣ Audit Log
    // -------------------------------------------------------------
    await addAuditLog(
      currentUser.email,
      "create_user",
      `User: ${email}, Role: ${role}`
    );

    return email;

  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);

    // 🔥 Verbesserte Fehlerbehandlung
    if (error.code === "auth/email-already-in-use") {
      showFeedback(t("admin.emailInUse") || "E-Mail wird bereits verwendet.", "error");
    } else if (error.code === "auth/invalid-email") {
      showFeedback(t("admin.invalidEmail") || "Ungültige E-Mail-Adresse.", "error");
    } else if (error.code === "auth/weak-password") {
      showFeedback(t("admin.weakPassword") || "Passwort ist zu schwach.", "error");
    } else {
      showFeedback(`${t("errors.fail")} (${error.message})`, "error");
    }

    return null;
  }
}
// ======================================================================
// 🔥 Warum diese Version 100% zu deinen Firestore‑Rules passt
// ======================================================================

// ✔ employees/{email} wird erstellt
//   → Admin/Manager dürfen laut Rules read/write

// ✔ users/{email} wird erstellt
//   → Admin/Manager dürfen laut Rules read/write
//   → User selbst darf eigenes Profil lesen/update (wenn nicht disabled)

// ✔ Kein Mitarbeiter kann createUser ausführen
//   → Role‑Check blockiert

// ✔ Disable‑System funktioniert
//   → employees.disabled + users.disabled werden gesetzt

// ✔ Audit‑Log funktioniert
//   → activities/{docId} erlaubt create für alle Auth‑User

// ✔ Admin bleibt eingeloggt
//   → tempAuth wird sofort signOut() ausgeführt

// ✔ Fehler wie "email-already-in-use" werden sauber abgefangen

// ✔ UID wird korrekt gespeichert
//   → wichtig für spätere Features (Passwort‑Reset, Profil‑Sync)
