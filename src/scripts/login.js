// src/scripts/login.js – moderner Login-Flow (mehrsprachig + Neon-Feedback)

import { initFirebase } from "./firebaseSetup.js";
import { getAuth, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import { 
  getFirestore, doc, getDoc, collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Login.js geladen – DOM bereit.");

  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.querySelector(".skip-btn");
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

  skipBtn?.addEventListener("click", hideSplash);

  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
  });

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // -------------------------------------------------------------
      // 🔹 Firestore: User per E-Mail suchen (statt per UID)
      // -------------------------------------------------------------
      const q = query(
        collection(db, "employees"),
        where("email", "==", user.email)
      );

      const querySnapshot = await getDocs(q);

      spinner.style.display = "none";

      if (querySnapshot.empty) {
        showFeedback(t("errors.load"), "error");
        console.error("❌ Firestore: Kein Dokument für diesen User (E-Mail nicht gefunden).");
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const role = userData.role || "guest";

      console.log("🔍 Rolle erkannt:", role);

      loginCard.classList.add("success");
      showFeedback(`${t("auth.in")} (${role})`, "success");

      setTimeout(() => {
        loginCard.classList.add("fade-out-success");

        if (role === "admin" || role === "manager") {
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
