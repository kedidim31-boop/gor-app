// src/scripts/roleGuard.js – globales Modul für Rollen-basierten Zugriff
// Ergänzt mit konsistentem Feedback, Logging und Redirect-Handling

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { initFirebase } from "./firebaseSetup.js";

export function enforceRole(requiredRoles = [], redirectPage = "index.html") {
  const { auth, db } = initFirebase();

  onAuthStateChanged(auth, async user => {
    if (!user) {
      // Nicht eingeloggt → zurück zur Login-Seite
      console.warn("⚠️ Kein Benutzer eingeloggt – Redirect zu login.html");
      window.location.href = "login.html";
      return;
    }

    try {
      // Rolle aus Firestore abfragen (employees Collection mit UID als Dokument-ID)
      const userDoc = await getDoc(doc(db, "employees", user.uid));
      let role = "guest";

      if (userDoc.exists()) {
        role = userDoc.data().role || "guest";
      }

      if (!requiredRoles.includes(role)) {
        // Zugriff verweigert
        console.error(`❌ Zugriff verweigert – benötigte Rollen: ${requiredRoles.join(", ")}, aktuelle Rolle: ${role}`);
        alert(`⚠️ Zugriff verweigert – nur für ${requiredRoles.join(" / ")} erlaubt!`);
        window.location.href = redirectPage;
      } else {
        console.log(`✅ Zugriff erlaubt für Rolle: ${role}`);
        document.body.classList.add("role-allowed"); // optionales CSS-Flag für UI-Anpassungen
      }
    } catch (err) {
      console.error("❌ Fehler beim Abrufen der Rolle:", err);
      alert("Fehler bei der Rollenprüfung – bitte erneut einloggen.");
      window.location.href = "login.html";
    }
  });
}
