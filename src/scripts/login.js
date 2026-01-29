// src/scripts/login.js
import { initFirebase } from "./firebaseSetup.js";
import { getAuth, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.querySelector(".skip-btn");
  const loginBtn = document.getElementById("loginBtn");
  const errorMessage = document.querySelector(".error-message");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const spinner = document.getElementById("spinner");

  // Firebase Setup
  const { app } = initFirebase();
  const auth = getAuth(app);

  // Splash automatisch ausblenden nach 3 Sekunden
  setTimeout(() => {
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.style.display = "none";
        loginCard?.classList.add("fade-in");
      }, 1000);
    }
  }, 3000);

  // Skip Button sofort Splash überspringen
  skipBtn?.addEventListener("click", () => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      loginCard?.classList.add("fade-in");
    }, 1000);
  });

  // Passwort sichtbar/unsichtbar toggeln
  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // Login Button
  loginBtn?.addEventListener("click", async e => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.textContent = "Bitte fülle alle Felder aus.";
      errorMessage.classList.remove("hidden");
      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);
      return;
    }

    // Spinner anzeigen
    spinner.style.display = "block";
    errorMessage.classList.add("hidden");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Erfolg: Success-Feedback
      loginCard.classList.add("success");
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
    }
  });
});
