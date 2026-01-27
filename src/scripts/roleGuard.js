// roleGuard.js – globales Modul für Rollen-basierten Zugriff

export async function enforceRole(requiredRole, redirectPage = "index.html") {
  const auth = firebase.auth();

  auth.onAuthStateChanged(async user => {
    if (!user) {
      // Nicht eingeloggt → zurück zur Login-Seite
      window.location.href = "login.html";
      return;
    }

    // Token mit Rollen-Claims abrufen
    const token = await user.getIdTokenResult();
    const role = token.claims.role;

    if (role !== requiredRole) {
      alert(`Zugriff verweigert – nur für ${requiredRole}s erlaubt!`);
      window.location.href = redirectPage;
    } else {
      console.log(`Zugriff erlaubt für Rolle: ${role}`);
    }
  });
}
