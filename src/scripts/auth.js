// auth.js – globales Modul für Login & Logout
// Registrierung wird NICHT angeboten, nur Admins können neue Benutzer anlegen.

export function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyC5PqdD4o5hMXKh4_y3bCLHlXwWgILxsM4",
    authDomain: "gaming-of-republic.firebaseapp.com",
    projectId: "gaming-of-republic",
    storageBucket: "gaming-of-republic.appspot.com",
    messagingSenderId: "610190951435",
    appId: "1:610190951435:web:bbf184d09a894fc307f30e"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialisiert");
  }
  return firebase.auth();
}

// Login
export async function login(email, password) {
  const auth = initFirebase();
  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log("✅ Login erfolgreich");
    alert("Login erfolgreich – Willkommen im Admin System!");
    window.location.href = "overview.html"; // oder Dashboard
  } catch (error) {
    console.error("❌ Login fehlgeschlagen:", error);
    alert("Login fehlgeschlagen: " + error.message);
    // Shake-Effekt für Login-Card (falls vorhanden)
    const loginCard = document.querySelector(".login-card");
    if (loginCard) {
      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);
    }
  }
}

// Logout
export async function logout() {
  const auth = initFirebase();
  try {
    await auth.signOut();
    console.log("✅ Logout erfolgreich");
    alert("Logout erfolgreich – bis bald!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("❌ Fehler beim Logout:", error);
    alert("Fehler beim Logout – bitte erneut versuchen.");
  }
}
