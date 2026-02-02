// src/scripts/feedback.js – Neon-Feedback-System 2.0 (mehrsprachig + modernisiert)

import { t } from "./lang.js";

// -------------------------------------------------------------
// 🔹 Icons pro Typ
// -------------------------------------------------------------
const FEEDBACK_ICONS = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  warning: "fa-triangle-exclamation",
  info: "fa-circle-info"
};

// -------------------------------------------------------------
// 🔹 Farben pro Typ (Neon)
// -------------------------------------------------------------
const FEEDBACK_COLORS = {
  success: "var(--color-neon-green)",
  error: "var(--color-neon-red)",
  warning: "var(--color-neon-yellow)",
  info: "var(--color-neon-turquoise)"
};

// -------------------------------------------------------------
// 🔹 Neon Feedback Banner 2.0
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
    container.style.gap = "12px";
    container.style.pointerEvents = "none"; // Banner blockieren UI nicht
    document.body.appendChild(container);
  }

  // Mehrsprachige Nachricht
  const message = typeof messageKey === "string" ? messageKey : t(messageKey);

  // Banner erstellen
  const div = document.createElement("div");
  div.className = `feedback-banner ${type}`;
  div.style.pointerEvents = "auto";

  // Neon Style
  const neonColor = FEEDBACK_COLORS[type] || FEEDBACK_COLORS.info;

  div.style.background = "rgba(10, 10, 30, 0.9)";
  div.style.border = `1px solid ${neonColor}`;
  div.style.color = neonColor;
  div.style.padding = "14px 20px";
  div.style.borderRadius = "8px";
  div.style.fontSize = "0.95rem";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.gap = "10px";
  div.style.boxShadow = `0 0 14px ${neonColor}88`;
  div.style.backdropFilter = "blur(6px)";
  div.style.opacity = "0";
  div.style.transform = "translateY(-12px)";
  div.style.transition = "opacity 0.35s ease, transform 0.35s ease";

  // Icon
  const icon = document.createElement("i");
  icon.className = `fa-solid ${FEEDBACK_ICONS[type] || FEEDBACK_ICONS.info}`;
  icon.style.fontSize = "1.1rem";
  icon.style.color = neonColor;

  // Text
  const text = document.createElement("span");
  text.textContent = message;

  div.appendChild(icon);
  div.appendChild(text);
  container.appendChild(div);

  // Fade-In
  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });

  // -------------------------------------------------------------
  // 🔹 Auto-Dismiss (mit Hover-Pause)
  // -------------------------------------------------------------
  let hideTimeout = setTimeout(() => hideBanner(div), 4000);

  div.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });

  div.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => hideBanner(div), 1500);
  });
}

// -------------------------------------------------------------
// 🔹 Banner ausblenden
// -------------------------------------------------------------
function hideBanner(div) {
  div.style.opacity = "0";
  div.style.transform = "translateY(-12px)";

  setTimeout(() => {
    div.remove();
  }, 350);
}
