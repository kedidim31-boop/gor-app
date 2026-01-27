// adminUser.js – Modul für Admins zum Erstellen neuer Benutzer mit Rollen

export async function createUser(email, password, role = "mitarbeiter") {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Bitte zuerst einloggen!");
    return;
  }

  // Prüfen ob aktueller User Admin ist
  const token = await currentUser.getIdTokenResult();
  if (token.claims.role !== "admin") {
    alert("Nur Admins dürfen neue Benutzer erstellen!");
    return;
  }

  try {
    // Schritt 1: Benutzer in Firestore anlegen (nicht direkt in Auth, da nur Admins dürfen)
    const userDoc = await db.collection("employees").add({
      email,
      role,
      createdBy: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert(`Neuer Benutzer angelegt: ${email} mit Rolle ${role}`);
    return userDoc.id;
  } catch (error) {
    alert("Fehler beim Erstellen des Benutzers: " + error.message);
  }
}
