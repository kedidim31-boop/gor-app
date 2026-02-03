// ======================================================================
// 🔥 roleGuard.js – FINAL VERSION
// Rollenprüfung, Disable-Check, Claims-Refresh, Bootstrap-Fix
// ======================================================================

import { onAuthStateChanged, getIdTokenResult } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Rollenprüfung + deaktivierte Benutzer blockieren
// -------------------------------------------------------------
export function enforceRole(requiredRoles = [], redirectPage = "index.html") {
  const { auth, db } = initFirebase();

  onAuthStateChanged(auth, async user => {
    if (!user) {
      showFeedback(t("auth.out"), "warning");
      window.location.href = redirectPage;
      return;
    }

    try {
      // 🔹 Claims aktualisieren
      const token = await getIdTokenResult(user, true);
      const claimRole = token.claims.role || null;

      // 🔹 employees/{email} abrufen
      const userRef = doc(db, "employees", user.email);
      const snap = await getDoc(userRef);

      let userData = snap.exists() ? snap.data() : null;
      let role = userData?.role || claimRole || "guest";

      // ⭐ BOOTSTRAP-FIX:
      if (!snap.exists() && ["admin", "manager"].includes(claimRole)) {
        console.info(`Bootstrap-Zugriff erlaubt für ${claimRole} (${user.email})`);
      } else if (!snap.exists()) {
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      // 🔥 Benutzer deaktiviert?
      if (userData?.disabled === true) {
        showFeedback(t("auth.disabled"), "error");
        await auth.signOut();
        setTimeout(() => window.location.href = "login.html", 800);
        return;
      }

      // ❌ Rolle nicht erlaubt
      if (!requiredRoles.includes(role)) {
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      // ✅ Zugriff erlaubt
      console.info(`Zugriff erlaubt für Rolle: ${role} (${user.email})`);
      document.body.classList.add("role-allowed");

    } catch (err) {
      console.error("❌ Fehler bei der Rollenprüfung:", err);
      showFeedback(t("errors.fail"), "error");
      window.location.href = redirectPage;
    }
  });
}
