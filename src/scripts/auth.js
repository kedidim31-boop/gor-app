// src/scripts/auth.js – globales Logout-Modul (Login wird über login.js gesteuert)

import { initFirebase } from "./firebaseSetup.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Logout-Funktion (modernisiert)
// -------------------------------------------------------------
export async function logout() {
  const { auth } = initFirebase();

  try {
    const user = auth.currentUser;

    // 🔥 E-Mail statt UID verwenden (UID ist nicht mehr relevant)
    const userIdentifier = user?.email || "unknown";

    // Firebase Logout
    await signOut(auth);
    console.log("📘 Logout erfolgreich");

    // Aktivität loggen
    await logActivity(
      userIdentifier,
      "logout",
      `User ${userIdentifier} logged out`
    );

    // Neon-Feedback
    showFeedback(t("auth.out"), "success");

    // Kleine Verzögerung für Animation
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);

  } catch (error) {
    console.error("❌ Fehler beim Logout:", error);
    showFeedback(t("errors.fail"), "error");
  }
}

// -------------------------------------------------------------
// 🔧 Globaler Logout-Button (einmalig registrieren)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(".logout-btn");

  if (logoutButton && !logoutButton.dataset.bound) {
    logoutButton.dataset.bound = "true"; // verhindert doppelte Listener
    logoutButton.addEventListener("click", logout);
  }
});
