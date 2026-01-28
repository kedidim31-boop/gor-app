// auth.js – Modul für Login & Logout (modulare Firebase SDK)
// Registrierung wird NICHT angeboten, nur Admins können neue Benutzer anlegen.

import { initFirebase } from "./firebaseSetup.js";
import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Login
export async function login(email, password) {
  const { auth } = initFirebase();
  try {
    await signInWithEmailAndPassword(auth, email, password);
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
  const { auth } = initFirebase();
  try {
    await signOut(auth);
    console.log("✅ Logout erfolgreich");
    alert("Logout erfolgreich – bis bald!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("❌ Fehler beim Logout:", error);
    alert("Fehler beim Logout – bitte erneut versuchen.");
  }
}

// 🔧 Globaler Logout-Button für jede Seite
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(".logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logout();
    });
  }
});
