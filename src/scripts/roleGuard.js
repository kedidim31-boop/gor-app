// roleGuard.js – globales Modul für Rollen-basierten Zugriff
// Ergänzt mit konsistentem Feedback, Logging und Redirect-Handling

export async function enforceRole(requiredRole, redirectPage = "index.html") {
  const auth = firebase.auth();

  auth.onAuthStateChanged(async user => {
    if (!user) {
      // Nicht eingeloggt → zurück zur Login-Seite
      console.warn("Kein Benutzer eingeloggt – Redirect zu login.html");
      window.location.href = "login.html";
      return;
    }

    try {
      // Token mit Rollen-Claims abrufen
      const token = await user.getIdTokenResult();
      const role = token.claims.role || "guest";

      if (role !== requiredRole) {
        // Konsistentes UI-Feedback im Neon-Look
        console.error(`Zugriff verweigert – benötigte Rolle: ${requiredRole}, aktuelle Rolle: ${role}`);
        alert(`⚠️ Zugriff verweigert – nur für ${requiredRole}s erlaubt!`);
        window.location.href = redirectPage;
      } else {
        console.log(`✅ Zugriff erlaubt für Rolle: ${role}`);
        document.body.classList.add("role-allowed"); // optionales CSS-Flag für UI-Anpassungen
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Rollen-Claims:", err);
      alert("❌ Fehler bei der Rollenprüfung – bitte erneut einloggen.");
      window.location.href = "login.html";
    }
  });
}
