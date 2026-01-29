<script>
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector(".splash-screen");
  const loginCard = document.querySelector(".login-card");
  const skipBtn = document.querySelector(".skip-btn");
  const form = document.getElementById("loginForm");
  const errorMessage = document.querySelector(".error-message");
  const passwordInput = document.getElementById("loginPassword");
  const togglePassword = document.querySelector(".toggle-password");

  // Splash automatisch ausblenden nach 3 Sekunden
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      loginCard.classList.add("fade-in");
    }, 1000);
  }, 3000);

  // Skip Button sofort Splash überspringen
  skipBtn?.addEventListener("click", () => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      loginCard.classList.add("fade-in");
    }, 1000);
  });

  // Passwort sichtbar/unsichtbar toggeln
  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // Login Formular
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      // Firebase Login
      const { initFirebase } = await import("./src/scripts/firebaseSetup.js");
      const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js");
      const { app } = initFirebase();
      const auth = getAuth(app);

      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      // Fehlerfeedback
      errorMessage.textContent = "Login fehlgeschlagen: " + error.message;
      errorMessage.classList.remove("hidden");
      loginCard.classList.add("shake");
      setTimeout(() => loginCard.classList.remove("shake"), 600);
      passwordInput.classList.add("error");
      setTimeout(() => passwordInput.classList.remove("error"), 1500);
    }
  });
});
</script>
