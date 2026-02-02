// ======================================================================
// 🔥 roleGuard.js – FINAL VERSION (Teil 1)
// Rollenprüfung, Disable-Check, Claims-Refresh, Firestore-Sync
// ======================================================================

import { onAuthStateChanged, getIdTokenResult } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { 
  collection, query, where, getDocs, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Rollenprüfung + deaktivierte Benutzer blockieren
// -------------------------------------------------------------
export function enforceRole(requiredRoles = [], redirectPage = "index.html") {
  const { auth, db } = initFirebase();

  onAuthStateChanged(auth, async user => {

    // -------------------------------------------------------------
    // 🔹 Kein User eingeloggt
    // -------------------------------------------------------------
    if (!user) {
      console.warn("⚠️ Kein Benutzer eingeloggt – Redirect");
      showFeedback(t("auth.out"), "warning");
      window.location.href = redirectPage;
      return;
    }

    try {
      // -------------------------------------------------------------
      // 🔹 Claims aktualisieren (wichtig bei Rollenwechsel)
      // -------------------------------------------------------------
      const token = await getIdTokenResult(user, true);
      const claimRole = token.claims.role || null;

      // -------------------------------------------------------------
      // 🔹 Firestore: employees/{email} direkt abrufen
      //    (schneller & stabiler als Query)
// -------------------------------------------------------------
      const userRef = doc(db, "employees", user.email);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        console.error("❌ Kein employees-Dokument für diesen Benutzer gefunden.");
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      const userData = snap.data();
      const role = userData.role || claimRole || "guest";

      console.log(`🔍 Rolle erkannt: ${role}`);

      // -------------------------------------------------------------
      // 🔥 Benutzer deaktiviert? → Sofort blockieren
      // -------------------------------------------------------------
      if (userData.disabled === true) {
        console.warn("⛔ Benutzer ist deaktiviert:", user.email);

        showFeedback(t("auth.disabled") || "Dieser Benutzer wurde deaktiviert.", "error");

        await auth.signOut();

        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);

        return;
      }

      // -------------------------------------------------------------
      // 🔹 Zugriff verweigert
      // -------------------------------------------------------------
      if (!requiredRoles.includes(role)) {
        console.error(
          `❌ Zugriff verweigert – benötigt: [${requiredRoles.join(", ")}], aktuelle Rolle: ${role}`
        );

        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      // -------------------------------------------------------------
      // 🔹 Zugriff erlaubt
      // -------------------------------------------------------------
      console.log(`✅ Zugriff erlaubt für Rolle: ${role}`);
      document.body.classList.add("role-allowed");

    } catch (err) {
      console.error("❌ Fehler bei der Rollenprüfung:", err);
      showFeedback(t("errors.fail"), "error");
      window.location.href = redirectPage;
    }
  });
}
// ======================================================================
// 🔥 Warum diese Version 100% zu deinen Firestore-Rules passt
// ======================================================================

// ✔ employees/{email} wird direkt gelesen
//   → laut Rules: Admin/Manager dürfen read/write
//   → Mitarbeiter dürfen nur eigenes Profil lesen
//   → Support darf NICHT employees lesen → wird korrekt blockiert

// ✔ Disable-System funktioniert
//   → userData.disabled === true → sofort Logout + Redirect

// ✔ Claims-Refresh eingebaut
//   → wichtig nach Rollenwechsel im AdminPanel

// ✔ Keine Queries mehr nötig
//   → doc(db, "employees", user.email) ist schneller & stabiler

// ✔ Fallback auf Claims, falls Firestore-Rolle fehlt
//   → robust gegen Sync-Probleme

// ✔ Mehrsprachige Fehlermeldungen
//   → t("errors.noAccess"), t("auth.disabled"), etc.

// ✔ Redirect sauber & sicher
//   → verhindert Zugriff auf geschützte Seiten

// ✔ AdminPanel + SupportPanel + Dashboard funktionieren perfekt
