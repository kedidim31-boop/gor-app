// src/scripts/auth.js – globales Logout- und Sicherheitsmodul

import { initFirebase } from "./firebaseSetup.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
import { t } from "./lang.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// -------------------------------------------------------------
// 🔹 Sicherheits-Check: Benutzer deaktiviert?
// -------------------------------------------------------------
export async function checkUserDisabled(email) {
  const { db } = initFirebase();

  try {
    const userDoc = await getDoc(doc(db, "employees", email));

    if (userDoc.exists() && userDoc.data().disabled === true) {
      console.warn("⛔ Benutzer ist deaktiviert:", email);
      return true;
    }

    return false;

  } catch (err) {
    console.error("❌ Fehler beim Prüfen des Benutzerstatus:", err);
    return false;
  }
}

// -------------------------------------------------------------
// 🔹 Logout-Funktion (modernisiert)
// -------------------------------------------------------------
export async function logout() {
  const { auth } = initFirebase();

  try {
    const user = auth.currentUser;
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
