// src/scripts/feedback.js – globales Neon-Feedback-System

export function showFeedback(message, type = "success") {
  let container = document.getElementById("feedbackContainer");

  // Falls kein Container existiert → automatisch erstellen
  if (!container) {
    container = document.createElement("div");
    container.id = "feedbackContainer";
    document.body.appendChild(container);
  }

  // Feedback-Element erstellen
  const div = document.createElement("div");
  div.className = `feedback ${type}`;
  div.textContent = message;

  // Einblende-Animation
  div.style.opacity = "0";
  div.style.transform = "translateY(-10px)";

  container.appendChild(div);

  // Smooth Fade-In
  requestAnimationFrame(() => {
    div.style.transition = "opacity 0.4s ease, transform 0.4s ease";
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
