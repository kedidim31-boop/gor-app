// src/scripts/login.js
import { initFirebase } from "./firebaseSetup.js";
import { getAuth, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Login.js geladen – DOM bereit.");

  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.querySelector(".skip-btn");
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const spinner = document.getElementById("spinner");
  const feedbackContainer = document.getElementById("feedbackContainer");

  // Firebase Setup
  const { app } = initFirebase();
  const auth = getAuth(app);
  console.log("Firebase initialisiert:", app);

  // Hilfsfunktion für Feedback-Banner
  function showFeedback(message, type = "success") {
    console.log(`Feedback angezeigt: ${message} [${type}]`);
    const banner = document.createElement("div");
    banner.className = `feedback-banner ${type}`;
    banner.textContent = message;
    feedbackContainer.appendChild(banner);

    // Banner nach 3 Sekunden automatisch entfernen
    setTimeout(() => {
      banner.style.opacity = "0";
      banner.style.transform = "translateX(100%)";
      setTimeout(() => banner.remove(), 500);
    }, 3000);
  }

  // Splash automatisch ausblenden nach 3 Sekunden
  setTimeout(() => {
    if (splash) {
      console.log("Splash wird automatisch ausgeblendet...");
      splash.classList.add("fade-out");

      // Logo Fade-Out
      const logo = splash.querySelector(".splash-logo");
      if (logo) {
        logo.style.animation = "none"; // Pulse stoppen
        logo.classList.add("fade-out");
        console.log("Logo ausgeblendet.");
      }

      // Skip Button Fade-Out
      const skipButton = splash.querySelector(".skip-btn");
      if (skipButton) {
        skipButton.classList.add("fade-out");
        console.log("Skip-Button ausgeblendet.");
      }

      setTimeout(() => {
        splash.style.display = "none";
        loginCard?.classList.add("fade-in");
        console.log("Login-Card eingeblendet.");
      }, 1000);
    }
  }, 3000);

  // Skip Button sofort Splash überspringen
  skipBtn?.addEventListener("click", () => {
    console.log("Skip-Button geklickt – Splash wird übersprungen.");
    splash.classList.add("fade-out");

    const logo = splash.querySelector(".splash-logo");
    if (logo) {
      logo.style.animation = "none";
      logo.classList.add("fade-out");
      console.log("Logo ausgeblendet (Skip).");
    }

    skipBtn.classList.add("fade-out");

    setTimeout(() => {
      splash.style.display = "none";
      loginCard?.classList.add("fade-in");
      console.log("Login-Card eingeblendet (Skip).");
    }, 1000);
  });

  // Passwort sichtbar/unsichtbar toggeln
  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
    console.log(`Passwortfeld umgeschaltet: ${type}`);
  });

  // Login Formular
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    console.log("Login-Formular abgeschickt.");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      console.warn("Fehler: Felder nicht ausgefüllt.");
      errorMessage.textContent = "Bitte fülle alle Felder aus.";
      errorMessage.classList.remove("hidden");
      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);
      showFeedback("Bitte fülle alle Felder aus.", "error");
      return;
    }

    // Spinner anzeigen
    spinner.style.display = "block";
    errorMessage.classList.add("hidden");
    console.log("Login-Versuch gestartet...");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Erfolg: Success-Feedback
      spinner.style.display = "none";
      loginCard.classList.add("success");
      showFeedback("Login erfolgreich!", "success");
      console.log("Login erfolgreich – Weiterleitung...");

      setTimeout(() => {
        loginCard.classList.add("fade-out-success");
        window.location.href = "index.html";
      }, 1200);

    } catch (error) {
      spinner.style.display = "none";
      errorMessage.textContent = "Login fehlgeschlagen: " + error.message;
      errorMessage.classList.remove("hidden");

      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);

      passwordInput.classList.add("error");
      setTimeout(() => passwordInput.classList.remove("error"), 1500);

      showFeedback("Login fehlgeschlagen!", "error");
      console.error("Login fehlgeschlagen:", error.message);
    }
  });
});
