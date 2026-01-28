// uiHandler.js – globales Modul für UI-Interaktionen im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Feedback-Effekten und Error-Handling

// Loader anzeigen/verbergen
export function toggleLoader(show = true) {
  let loader = document.getElementById("globalLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "globalLoader";
    loader.innerHTML = `<div class="loader neon-glow">⚡ Loading...</div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = show ? "flex" : "none";
}

// Erfolgsmeldung anzeigen
export function notifySuccess(message) {
  console.log("✅ " + message);
  const box = createMessageBox(message, "success");
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

// Fehlermeldung anzeigen
export function notifyError(message) {
  console.error("❌ " + message);
  const box = createMessageBox(message, "error");
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);

  // Shake-Effekt für Cards
  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}

// Warnung anzeigen
export function notifyWarning(message) {
  console.warn("⚠️ " + message);
  const box = createMessageBox(message, "warning");
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

// Generische MessageBox erstellen
function createMessageBox(message, type) {
  const box = document.createElement("div");
  box.className = `message-box ${type}`;
  box.innerText = message;
  return box;
}

// Neon-Glow für Buttons beim Klick
export function addButtonEffects() {
  document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.add("active-glow");
      setTimeout(() => btn.classList.remove("active-glow"), 500);
    });
  });
}

// Tabellenzeilen Hover-Effekt verstärken
export function enhanceTableHover() {
  document.querySelectorAll("table tr").forEach(row => {
    row.addEventListener("mouseenter", () => {
      row.style.boxShadow = "inset 0 0 20px rgba(112, 255, 234, 0.6)";
    });
    row.addEventListener("mouseleave", () => {
      row.style.boxShadow = "";
    });
  });
}
