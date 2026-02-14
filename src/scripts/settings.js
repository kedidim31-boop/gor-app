import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { showFeedback } from "./feedback.js";
import { logout } from "./auth.js";
import { t, setLanguage, updateTranslations } from "./lang.js";

import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔐 Zugriff & Sprache
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");
updateTranslations();
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const languageSelect = document.getElementById("languageSelect");
const themeSelect = document.getElementById("themeSelect");

// -------------------------------------------------------------
// 👤 Benutzerprofil laden
// -------------------------------------------------------------
async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDoc = await getDoc(doc(db, "employees", user.uid));
    if (!userDoc.exists()) throw new Error("Profil nicht gefunden");

    const data = userDoc.data();
    document.getElementById("profileName").value = data.name || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("profilePhone").value = data.phone || "";
    document.getElementById("profileRole").value = data.role || "guest";

  } catch (err) {
    console.error("❌ Profil konnte nicht geladen werden:", err);
    showFeedback(t("errors.load"), "error");
  }
}

// -------------------------------------------------------------
// 💾 Profil speichern
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
    if (email !== user.email) {
      const currentPassword = prompt(t("settings.reauth"));
      if (!currentPassword) return;

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, email);
    }

    await updateDoc(doc(db, "employees", user.uid), { name, phone });
    showFeedback(t("settings.saved"), "success");

  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔐 Passwort ändern
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
// 🌐 Sprache ändern
// -------------------------------------------------------------
languageSelect?.addEventListener("change", () => {
  const lang = languageSelect.value;
  setLanguage(lang);
  localStorage.setItem("gor-language", lang);
  showFeedback(t("settings.langChanged"), "success");
});

// -------------------------------------------------------------
// 🎨 Theme ändern
// -------------------------------------------------------------
themeSelect?.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.body.dataset.theme = theme;
  localStorage.setItem("gor-theme", theme);
  showFeedback(t("settings.themeChanged"), "success");
});

// -------------------------------------------------------------
// 🚀 Gespeicherte Einstellungen anwenden
// -------------------------------------------------------------
(function applySavedSettings() {
  const savedLang = localStorage.getItem("gor-language");
  const savedTheme = localStorage.getItem("gor-theme");

  if (savedLang) {
    languageSelect.value = savedLang;
    setLanguage(savedLang);
  }

  if (savedTheme) {
    themeSelect.value = savedTheme;
    document.body.dataset.theme = savedTheme;
  }
})();

// -------------------------------------------------------------
// 🚀 Initial laden
// -------------------------------------------------------------
loadProfile();
