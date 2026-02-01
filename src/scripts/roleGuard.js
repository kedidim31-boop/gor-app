// src/scripts/roleGuard.js – globales Modul für Rollen-basierten Zugriff
// Weiterleitung zur Startseite statt Login-Seite

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { initFirebase } from "./firebaseSetup.js";

export function enforceRole(requiredRoles = [], redirectPage = "index.html") {
  const { auth, db } = initFirebase();

  onAuthStateChanged(auth, async user => {
    if (!user) {
      console.warn("⚠️ Kein Benutzer eingeloggt – Redirect zur Startseite");
      alert("Du bist nicht eingeloggt – Weiterleitung zur Startseite.");
      window.location.href = redirectPage;
      return;
    }

    try {
      const userDocRef = doc(db, "employees", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let role = "guest";
      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || "guest";
      }

      if (!requiredRoles.includes(role)) {
        console.error(`❌ Zugriff verweigert – benötigte Rollen: ${requiredRoles.join(", ")}, aktuelle Rolle: ${role}`);
        alert(`⚠️ Keine Berechtigung – Weiterleitung zur Startseite.`);
        window.location.href = redirectPage;
      } else {
        console.log(`✅ Zugriff erlaubt für Rolle: ${role}`);
        document.body.classList.add("role-allowed");
      }
    } catch (err) {
      console.error("❌ Fehler beim Abrufen der Rolle:", err);
      alert("Fehler bei der Rollenprüfung – Weiterleitung zur Startseite.");
      window.location.href = redirectPage;
    }
  });
}
