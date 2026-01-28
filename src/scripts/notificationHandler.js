// notificationHandler.js – globales Modul für Benachrichtigungen im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, Logging und Feedback-Effekten

// Globale Benachrichtigung anzeigen
export function showNotification(message, type = "info") {
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️";
  console.log(`${icon} ${message}`);

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerText = message;

  document.body.appendChild(notification);

  // Automatisches Entfernen nach 4 Sekunden
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 600);
  }, 4000);
}

// Erfolgsmeldung
export function notifySuccess(message) {
  showNotification(message, "success");
}

// Fehlermeldung
export function notifyError(message) {
  showNotification(message, "error");

  // Shake-Effekt für Cards bei Fehler
  const card = document.querySelector(".card");
  if (card) {
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 600);
  }
}

// Warnung
export function notifyWarning(message) {
  showNotification(message, "warning");
}

// Info
export function notifyInfo(message) {
  showNotification(message, "info");
}

// Initialisiert Notification-System (z. B. CSS-Klassen hinzufügen)
export function initNotifications() {
  const style = document.createElement("style");
  style.innerHTML = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      color: #fff;
      z-index: 9999;
      box-shadow: 0 0 12px #FFD300, 0 0 24px rgba(255, 211, 0, 0.6);
      transition: opacity 0.6s ease, transform 0.3s ease;
    }
    .notification.success { background-color: #00b894; text-shadow: 0 0 6px #00ffcc; }
    .notification.error { background-color: #d63031; text-shadow: 0 0 6px #ff0000; }
    .notification.warning { background-color: #fdcb6e; text-shadow: 0 0 6px #FFD300; color: #000; }
    .notification.info { background-color: #0984e3; text-shadow: 0 0 6px #70ffea; }
    .notification.fade-out { opacity: 0; transform: translateY(-20px); }
    .shake { animation: shake 0.6s; }
    @keyframes shake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(6px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}
