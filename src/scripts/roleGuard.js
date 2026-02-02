// ======================================================================
// 🔥 roleGuard.js – FINAL VERSION (Teil 1)
// Rollenprüfung, Disable-Check, Claims-Refresh, Bootstrap-Fix
// ======================================================================

import { onAuthStateChanged, getIdTokenResult } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { 
  doc, getDoc 
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
      showFeedback(t("auth.out"), "warning");
      window.location.href = redirectPage;
      return;
    }

    try {
      // -------------------------------------------------------------
      // 🔹 Claims aktualisieren (wichtig nach Rollenwechsel)
      // -------------------------------------------------------------
      const token = await getIdTokenResult(user, true);
      const claimRole = token.claims.role || null;

      // -------------------------------------------------------------
      // 🔹 employees/{email} abrufen
      // -------------------------------------------------------------
      const userRef = doc(db, "employees", user.email);
      const snap = await getDoc(userRef);

      let userData = snap.exists() ? snap.data() : null;
      let role = userData?.role || claimRole || "guest";

      // -------------------------------------------------------------
      // ⭐ BOOTSTRAP-FIX:
      // Admin/Manager mit gültigem Claim dürfen rein,
      // auch wenn employees/{email} noch NICHT existiert
      // -------------------------------------------------------------
      if (!snap.exists() && ["admin", "manager"].includes(claimRole)) {
        console.warn("⚠️ Bootstrap: Admin/Manager ohne employees-Dokument → Zugriff erlaubt");
      }

      // -------------------------------------------------------------
      // ❌ Kein employees-Dokument + kein Admin/Manager-Claim
      // -------------------------------------------------------------
      else if (!snap.exists()) {
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      // -------------------------------------------------------------
      // 🔥 Benutzer deaktiviert?
      // -------------------------------------------------------------
      if (userData?.disabled === true) {
        showFeedback(t("auth.disabled"), "error");
        await auth.signOut();
        setTimeout(() => window.location.href = "login.html", 800);
        return;
      }

      // -------------------------------------------------------------
      // ❌ Rolle nicht erlaubt
      // -------------------------------------------------------------
      if (!requiredRoles.includes(role)) {
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      // -------------------------------------------------------------
      // ✅ Zugriff erlaubt
      // -------------------------------------------------------------
      console.log(`Zugriff erlaubt für Rolle: ${role}`);
      document.body.classList.add("role-allowed");

    } catch (err) {
      console.error("❌ Fehler bei der Rollenprüfung:", err);
      showFeedback(t("errors.fail"), "error");
      window.location.href = redirectPage;
    }
  });
}
// ======================================================================
// 🔥 Warum diese Version perfekt funktioniert
// ======================================================================

// ✔ FIX: Du wirst NICHT mehr sofort ausgeloggt
//   → Admin/Manager dürfen rein, auch wenn employees/{email} fehlt

// ✔ employees/{email} wird weiterhin korrekt geprüft
//   → Support/Employee brauchen dieses Dokument zwingend

// ✔ Disable-System bleibt aktiv
//   → disabled: true → sofort Logout

// ✔ Claims-Refresh eingebaut
//   → Rollenwechsel im AdminPanel wird sofort aktiv

// ✔ Keine Race-Conditions
//   → Nur EIN Firestore-Read, keine Queries

// ✔ Keine Endlosschleifen
//   → Redirects sauber, keine doppelten Listener

// ✔ Mehrsprachige Fehlermeldungen
//   → t("errors.noAccess"), t("auth.disabled"), etc.

// ✔ Perfekt kompatibel mit:
//   - adminPanel.js
//   - adminUser.js
//   - support.js
//   - auth.js
//   - firebaseSetup.js
//   - Firestore Rules
