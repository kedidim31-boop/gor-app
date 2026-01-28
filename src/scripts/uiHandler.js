// layout.js – globales Modul für Layout- und Navigationslogik im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Feedback-Effekten und Error-Handling

// Sidebar Navigation initialisieren
export function initSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    console.warn("⚠️ Sidebar nicht gefunden – Layout kann nicht initialisiert werden");
    return;
  }

  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      setActiveLink(link);
      loadPage(link.getAttribute("href"));
    });
  });

  console.log("✅ Sidebar Navigation initialisiert");
}

// Aktiven Link hervorheben
function setActiveLink(link) {
  document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
  link.classList.add("active");
}

// Seite laden (per Fetch)
async function loadPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    document.querySelector(".main-content").innerHTML = html;
    notifySuccess(`Seite '${url}' erfolgreich geladen`);
  } catch (error) {
    console.error("❌ Fehler beim Laden der Seite:", error);
    notifyError("Fehler beim Laden der Seite – bitte erneut versuchen.");
  }
}

// Layout Loader anzeigen/verbergen
export function toggleLayoutLoader(show = true) {
  let loader = document.getElementById("layoutLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "layoutLoader";
    loader.innerHTML = `<div class="loader neon-glow">⚡ Layout wird geladen...</div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = show ? "flex" : "none";
}

// Erfolgsmeldung
export function notifySuccess(message) {
  console.log("✅ " + message);
  const box = createMessageBox(message, "success");
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

// Fehlermeldung
export function notifyError(message) {
  console.error("❌ " + message);
  const box = createMessageBox(message, "error");
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);

  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}

// Warnung
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
