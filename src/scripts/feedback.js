// src/scripts/feedback.js – globales Feedback-System

export function showFeedback(message, type = "success") {
  const container = document.getElementById("feedbackContainer");

  // Falls kein Container existiert, automatisch erstellen
  if (!container) {
    const newContainer = document.createElement("div");
    newContainer.id = "feedbackContainer";
    document.body.appendChild(newContainer);
    return showFeedback(message, type); // erneut aufrufen
  }

  // Neues Feedback-Element
  const div = document.createElement("div");
  div.className = `feedback ${type}`;
  div.textContent = message;

  container.appendChild(div);

  // Automatisch nach 4 Sekunden entfernen
  setTimeout(() => div.remove(), 4000);
}
