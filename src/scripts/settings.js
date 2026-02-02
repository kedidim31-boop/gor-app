// src/scripts/settings.js – Benutzer- & System-Einstellungen (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { showFeedback } from "./feedback.js";
import { logout } from "./auth.js";
import { t, setLanguage } from "./lang.js";

import {
  getAuth,
  updatePassword,
  updateEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Alle eingeloggten Rollen
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const languageSelect = document.getElementById("languageSelect");
const themeSelect = document.getElementById("themeSelect");

// -------------------------------------------------------------
// 🔹 Benutzerprofil laden
// -------------------------------------------------------------
async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const userDoc = await getDoc(doc(db, "employees", user.uid));

  if (!userDoc.exists()) {
    showFeedback(t("errors.load"), "error");
    return;
  }

  const data = userDoc.data();

  document.getElementById("profileName").value = data.name || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePhone").value = data.phone || "";
  document.getElementById("profileRole").value = data.role || "guest";
}

// -------------------------------------------------------------
// 🔹 Profil speichern
// -------------------------------------------------------------
profileForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const phone = document.getElementById("profilePhone").value.trim();

  if (!name || !email) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    // Firebase Auth E-Mail aktualisieren
    await updateEmail(user, email);

    // Firestore Profil aktualisieren
    await updateDoc(doc(db, "employees", user.uid), {
      name,
      phone
    });

    showFeedback(t("settings.saved"), "success");

  } catch (err) {
    console.error("❌ Fehler beim Speichern des Profils:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Passwort ändern
// -------------------------------------------------------------
passwordForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const newPass = document.getElementById("newPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  if (!newPass || newPass !== confirmPass) {
    showFeedback(t("settings.passMismatch"), "error");
    return;
  }

  try {
    await updatePassword(user, newPass);
    showFeedback(t("settings.passUpdated"), "success");
    passwordForm.reset();

  } catch (err) {
    console.error("❌ Fehler beim Passwort ändern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Sprache ändern
// -------------------------------------------------------------
languageSelect?.addEventListener("change", () => {
  const lang = languageSelect.value;
  setLanguage(lang);
  showFeedback(t("settings.langChanged"), "success");
});

// -------------------------------------------------------------
// 🔹 Theme ändern (Dark / Light / Neon)
// -------------------------------------------------------------
themeSelect?.addEventListener("change", () => {
  const theme = themeSelect.value;

  document.body.dataset.theme = theme;

  showFeedback(t("settings.themeChanged"), "success");
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadProfile();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
