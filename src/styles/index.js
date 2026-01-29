// src/scripts/index.js – Logik für Startseite

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";

const { db } = initFirebase();

// Zugriff für Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

// Logout Button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// Optional: hier könntest du später noch dynamische Inhalte für die Startseite laden,
// z.B. Begrüßung mit Benutzername oder Schnellstatistiken.
