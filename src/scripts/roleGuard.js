// src/scripts/roleGuard.js – globales Modul für Rollen-basierten Zugriff (mehrsprachig + optimiert)

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Rollenprüfung
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
      // 🔹 Firestore-Dokument abrufen
      // -------------------------------------------------------------
      const userDocRef = doc(db, "employees", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let role = "guest";

      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || "guest";
      }

      console.log(`🔍 Rolle erkannt: ${role}`);

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
