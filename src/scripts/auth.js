// ======================================================================
// 🔥 auth.js – FINAL VERSION (Teil 1)
// Login-Check, Disable-System, Claims-Refresh, Logout
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./activityHandler.js";
import { t } from "./lang.js";

import {
  signOut,
  getIdTokenResult,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// -------------------------------------------------------------
// 🔹 Benutzer deaktiviert? (employees/{email})
// -------------------------------------------------------------
export async function checkUserDisabled(email) {
  const { db } = initFirebase();

  try {
    const snap = await getDoc(doc(db, "employees", email));

    if (snap.exists() && snap.data().disabled === true) {
      console.warn("⛔ Benutzer ist deaktiviert:", email);
      return true;
    }

    return false;

  } catch (err) {
    console.error("❌ Fehler beim Prüfen des Benutzerstatus:", err);
    return false;
  }
}

// -------------------------------------------------------------
// 🔹 Login‑Überwachung (Disable + Claims Refresh)
// -------------------------------------------------------------
export function initAuthWatcher() {
  const { auth, db } = initFirebase();

  onAuthStateChanged(auth, async user => {
    if (!user) return;

    try {
      // 🔥 Claims aktualisieren (wichtig nach Rollenwechsel)
      await user.getIdToken(true);
      const token = await getIdTokenResult(user);
      const claimRole = token.claims.role || null;

      // 🔥 Firestore employees/{email} abrufen
      const snap = await getDoc(doc(db, "employees", user.email));

      if (!snap.exists()) {
        console.error("❌ Kein employees-Dokument gefunden:", user.email);
        return;
      }

      const data = snap.data();

      // 🔥 Benutzer deaktiviert?
      if (data.disabled === true) {
        console.warn("⛔ Benutzer ist deaktiviert:", user.email);

        showFeedback(t("auth.disabled"), "error");

        await signOut(auth);

        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);

        return;
      }

      console.log(`🔐 Login OK – Rolle: ${data.role || claimRole}`);

    } catch (err) {
      console.error("❌ Fehler im AuthWatcher:", err);
    }
  });
}
// ======================================================================
// 🔹 Logout-Funktion (modernisiert + Audit + UI)
// ======================================================================
export async function logout() {
  const { auth } = initFirebase();

  try {
    const user = auth.currentUser;
    const userIdentifier = user?.email || "unknown";

    // 🔥 Audit Log
    await addAuditLog(
      userIdentifier,
      "logout",
      `User ${userIdentifier} logged out`
    );

    // 🔥 Firebase Logout
    await signOut(auth);
    console.log("📘 Logout erfolgreich");

    // 🔥 Neon Feedback
    showFeedback(t("auth.out"), "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);

  } catch (error) {
    console.error("❌ Fehler beim Logout:", error);
    showFeedback(t("errors.fail"), "error");
  }
}

// ======================================================================
// 🔧 Globaler Logout-Button (einmalig registrieren)
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(".logout-btn");

  if (logoutButton && !logoutButton.dataset.bound) {
    logoutButton.dataset.bound = "true"; // verhindert doppelte Listener
    logoutButton.addEventListener("click", logout);
  }
});
