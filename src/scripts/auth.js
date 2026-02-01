// src/scripts/auth.js – Modul für Logout (Login wird über login.js gesteuert)

import { initFirebase } from "./firebaseSetup.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { showFeedback } from "./feedback.js";

// Logout
export async function logout() {
  const { auth } = initFirebase();

  try {
    await signOut(auth);
    console.log("✅ Logout erfolgreich");

    // Neon-Feedback statt alert()
    showFeedback("Du wurdest erfolgreich ausgeloggt.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);

  } catch (error) {
    console.error("❌ Fehler beim Logout:", error);
    showFeedback("Fehler beim Logout – bitte erneut versuchen.", "error");
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
