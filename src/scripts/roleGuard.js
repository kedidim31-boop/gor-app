// src/scripts/roleGuard.js – globales Modul für Rollen-basierten Zugriff (mehrsprachig + optimiert)

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  collection, query, where, getDocs 
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
      // 🔹 Firestore: User per E-Mail suchen
      // -------------------------------------------------------------
      const q = query(
        collection(db, "employees"),
        where("email", "==", user.email)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.error("❌ Kein Firestore-Dokument für diesen Benutzer gefunden.");
        showFeedback(t("errors.noAccess"), "error");
        window.location.href = redirectPage;
        return;
      }

      const userData = snapshot.docs[0].data();
      const role = userData.role || "guest";

      console.log(`🔍 Rolle erkannt: ${role}`);

      // -------------------------------------------------------------
      // 🔥 Benutzer deaktiviert? → Sofort blockieren
      // -------------------------------------------------------------
      if (userData.disabled === true) {
        console.warn("⛔ Benutzer ist deaktiviert:", user.email);

        showFeedback("Dieser Benutzer wurde deaktiviert.", "error");

        // Wichtig: Benutzer ausloggen
        auth.signOut();

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
