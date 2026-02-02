// src/scripts/feedback.js – globales Neon-Feedback-System (mehrsprachig + optimiert)

import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Neon-Farben pro Typ
// -------------------------------------------------------------
const FEEDBACK_COLORS = {
  success: "var(--color-neon-green)",
  error: "var(--color-neon-red)",
  warning: "var(--color-neon-yellow)",
  info: "var(--color-neon-turquoise)"
};

// -------------------------------------------------------------
// 🔹 Globales Feedback-System
// -------------------------------------------------------------
export function showFeedback(messageKey, type = "success") {
  let container = document.getElementById("feedbackContainer");

  // Container automatisch erstellen
  if (!container) {
    container = document.createElement("div");
    container.id = "feedbackContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);
  }

  // Mehrsprachige Nachricht
  const message = typeof messageKey === "string" ? messageKey : t(messageKey);

  // Feedback-Element
  const div = document.createElement("div");
  div.className = `feedback ${type}`;
  div.textContent = message;

  // Neon-Style
  div.style.padding = "12px 18px";
  div.style.borderRadius = "6px";
  div.style.background = "#141432";
  div.style.border = `1px solid ${FEEDBACK_COLORS[type] || FEEDBACK_COLORS.info}`;
  div.style.color = FEEDBACK_COLORS[type] || FEEDBACK_COLORS.info;
  div.style.fontSize = "0.95rem";
  div.style.boxShadow = `0 0 12px ${FEEDBACK_COLORS[type]}55`;
  div.style.opacity = "0";
  div.style.transform = "translateY(-10px)";
  div.style.transition = "opacity 0.4s ease, transform 0.4s ease";

  container.appendChild(div);

  // Smooth Fade-In
  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });

  // Automatisch nach 4 Sekunden ausblenden
  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transform = "translateY(-10px)";

    // Nach Animation entfernen
    setTimeout(() => div.remove(), 400);
  }, 4000);
}
