// src/scripts/auth.js – Modul für Login & Logout (modulare Firebase SDK)
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

    // Erfolg: Feedback über Login-Card
    const loginCard = document.querySelector(".login-card");
    if (loginCard) {
      loginCard.classList.add("success");
      setTimeout(() => {
        loginCard.classList.add("fade-out-success");
        window.location.href = "overview.html"; // Dashboard-Seite
      }, 1200);
    } else {
      window.location.href = "overview.html";
    }
  } catch (error) {
    console.error("❌ Login fehlgeschlagen:", error);

    // Fehlernachricht anzeigen
    const errorMessage = document.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.textContent = "Login fehlgeschlagen: " + error.message;
      errorMessage.classList.remove("hidden");
    }

    // Shake-Effekt für Login-Card
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
