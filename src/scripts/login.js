// src/scripts/login.js – moderner Login-Flow (mehrsprachig + Neon-Feedback)

import { initFirebase } from "./firebaseSetup.js";
import { getAuth, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Login.js geladen – DOM bereit.");

  // -------------------------------------------------------------
  // 🔹 DOM Elemente
  // -------------------------------------------------------------
  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.querySelector(".skip-btn");
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const spinner = document.getElementById("spinner");

  // -------------------------------------------------------------
  // 🔹 Firebase Setup
  // -------------------------------------------------------------
  const { app } = initFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("🔥 Firebase initialisiert:", app);

  // -------------------------------------------------------------
  // 🔹 Splash automatisch ausblenden
  // -------------------------------------------------------------
  setTimeout(() => hideSplash(), 3000);

  function hideSplash() {
    if (!splash) return;

    splash.classList.add("fade-out");

    const logo = splash.querySelector(".splash-logo");
    if (logo) {
      logo.style.animation = "none";
      logo.classList.add("fade-out");
    }

    skipBtn?.classList.add("fade-out");

    setTimeout(() => {
      splash.style.display = "none";
      loginCard?.classList.add("fade-in");
    }, 1000);
  }

  // Skip Button
  skipBtn?.addEventListener("click", hideSplash);

  // -------------------------------------------------------------
  // 🔹 Passwort sichtbar/unsichtbar toggeln
  // -------------------------------------------------------------
  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // -------------------------------------------------------------
  // 🔹 Login Formular
  // -------------------------------------------------------------
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("📨 Login-Formular abgeschickt.");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.textContent = t("errors.fail");
      errorMessage.classList.remove("hidden");

      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);

      showFeedback(t("errors.fail"), "error");
      return;
    }

    spinner.style.display = "block";
    errorMessage.classList.add("hidden");

    try {
      // -------------------------------------------------------------
      // 🔹 Firebase Login
      // -------------------------------------------------------------
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // -------------------------------------------------------------
      // 🔹 Rolle aus Firestore abrufen
      // -------------------------------------------------------------
      const userDocRef = doc(db, "employees", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      spinner.style.display = "none";

      if (!userDocSnap.exists()) {
        showFeedback(t("errors.load"), "error");
        console.error("❌ Firestore: Kein Dokument für diesen User.");
        return;
      }

      const userData = userDocSnap.data();
      const role = userData.role || "guest";

      console.log("🔍 Rolle erkannt:", role);

      // -------------------------------------------------------------
      // 🔹 Login erfolgreich
      // -------------------------------------------------------------
      loginCard.classList.add("success");
      showFeedback(`${t("auth.in")} (${role})`, "success");

      setTimeout(() => {
        loginCard.classList.add("fade-out-success");

        // -------------------------------------------------------------
        // 🔹 Weiterleitung nach Rolle
        // -------------------------------------------------------------
        if (role === "admin") {
          window.location.href = "adminPanel.html";
        } 
        else if (role === "manager") {
          window.location.href = "adminPanel.html";
        }
        else if (role === "support") {
          window.location.href = "support.html";
        }
        else if (role === "employee") {
          window.location.href = "employees.html";
        }
        else {
          window.location.href = "index.html";
        }

      }, 1200);

    } catch (error) {
      spinner.style.display = "none";

      errorMessage.textContent = `${t("errors.fail")}: ${error.message}`;
      errorMessage.classList.remove("hidden");

      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);

      passwordInput.classList.add("error");
      setTimeout(() => passwordInput.classList.remove("error"), 1500);

      showFeedback(t("errors.fail"), "error");
      console.error("❌ Login fehlgeschlagen:", error.message);
    }
  });
});
