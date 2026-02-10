// ======================================================================
// 🔥 LOGIN HANDLER – FINAL VERSION
// Gaming of Republic – moderner Login-Flow
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { getAuth, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { 
  getFirestore, collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Login.js geladen – DOM bereit.");

  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.getElementById("skipBtn");
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const spinner = document.getElementById("spinner");

  const { app } = initFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("🔥 Firebase initialisiert:", app);

  // -------------------------------------------------------------
  // 🔹 Splash Screen
  // -------------------------------------------------------------
  setTimeout(() => hideSplash(), 3000);

  function hideSplash() {
    if (!splash) return;

    splash.classList.add("fade-out");
    splash.querySelector(".splash-logo")?.classList.add("fade-out");
    skipBtn?.classList.add("fade-out");

    setTimeout(() => {
      splash.style.display = "none";
      loginCard?.classList.add("fade-in");
    }, 1000);
  }

  skipBtn?.addEventListener("click", hideSplash);

  // -------------------------------------------------------------
  // 🔹 Passwort anzeigen/ausblenden
  // -------------------------------------------------------------
  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
  });
  // -------------------------------------------------------------
  // 🔹 Login-Formular
  // -------------------------------------------------------------
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📨 Login-Formular abgeschickt.");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.textContent = t("errors.fail");
      errorMessage.classList.add("show");

      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);

      showFeedback(t("errors.fail"), "error");
      return;
    }

    spinner.style.display = "block";
    errorMessage.classList.remove("show");

    try {
      // 🔹 Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔹 Firestore: User per E-Mail suchen
      const q = query(collection(db, "employees"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      spinner.style.display = "none";

      if (querySnapshot.empty) {
        showFeedback(t("errors.load"), "error");
        console.error("❌ Firestore: Kein Dokument für diesen User.");
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // 🔹 Benutzer deaktiviert?
      if (userData.disabled === true) {
        console.warn("⛔ Benutzer ist deaktiviert:", email);
        showFeedback("Dieser Benutzer wurde deaktiviert.", "error");
        await signOut(auth);
        return;
      }

      // 🔹 Rolle auslesen
      const role = userData.role || "guest";
      console.log("🔍 Rolle erkannt:", role);

      // 🔹 Erfolgsanimation + Redirect
      loginCard.classList.add("success");
      showFeedback(`${t("auth.in")} (${role})`, "success");

      setTimeout(() => {
        loginCard.classList.add("fade-out-success");

        if (role === "admin" || role === "manager") {
          window.location.href = "adminPanel.html";
        } else if (role === "support") {
          window.location.href = "support.html";
        } else if (role === "employee") {
          window.location.href = "employees.html";
        } else {
          window.location.href = "index.html";
        }
      }, 1200);

    } catch (error) {
      spinner.style.display = "none";

      errorMessage.textContent = `${t("errors.fail")}: ${error.message}`;
      errorMessage.classList.add("show");

      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);

      passwordInput.classList.add("error");
      setTimeout(() => passwordInput.classList.remove("error"), 1500);

      showFeedback(t("errors.fail"), "error");
      console.error("❌ Login fehlgeschlagen:", error.message);
    }
  });
});
