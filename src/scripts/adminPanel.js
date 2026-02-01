// src/scripts/adminPanel.js – zentrale Logik für Admin Panel (modulare Firebase SDK)

import { enforceRole } from "./roleGuard.js";
import { createUser } from "./adminUser.js"; // nutzt Firebase Auth + Firestore
import { logout } from "./auth.js";
import { initFirebase } from "./firebaseSetup.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export function initAdminPanel() {
  const { db } = initFirebase();

  // Zugriff nur für Admins
  enforceRole(["admin"], "login.html");

  // Feedback Funktion
  function showFeedback(message, type = "success") {
    const container = document.getElementById("feedbackContainer");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `feedback ${type}`;
    div.textContent = message;

    container.appendChild(div);

    setTimeout(() => div.remove(), 4000);
  }

  // Benutzer anlegen
  const form = document.getElementById("createUserForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("newEmail").value.trim();
      const password = document.getElementById("newPassword").value.trim();
      const role = document.getElementById("newRole").value;

      if (!email || !password || !role) {
        showFeedback("⚠️ Bitte alle Felder ausfüllen!", "error");
        return;
      }

      try {
        await createUser(email, password, role); // legt User in Auth + Firestore an
        await loadEmployees();
        form.reset();
        showFeedback("✅ Benutzer erfolgreich erstellt!", "success");
      } catch (err) {
        console.error("❌ Fehler beim Erstellen:", err);
        showFeedback("Fehler beim Erstellen des Benutzers.", "error");
      }
    });
  }

  // Mitarbeiter laden
  async function loadEmployees() {
    const tableBody = document.querySelector("#adminEmployeeTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const snapshot = await getDocs(collection(db, "employees"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.name || "-"}</td>
        <td>${data.email || "-"}</td>
        <td>
          <select data-id="${docSnap.id}" class="roleSelect">
            <option value="mitarbeiter" ${data.role === "mitarbeiter" ? "selected" : ""}>Mitarbeiter</option>
            <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="gast" ${data.role === "gast" ? "selected" : ""}>Gast</option>
          </select>
        </td>
        <td>
          <button class="deleteBtn" data-id="${docSnap.id}">
            <i class="fa-solid fa-trash"></i> Löschen
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Rollenänderung
    document.querySelectorAll(".roleSelect").forEach(select => {
      select.addEventListener("change", async e => {
        const id = e.target.dataset.id;
        const newRole = e.target.value;
        try {
          await updateDoc(doc(db, "employees", id), { role: newRole });
          showFeedback(`✅ Rolle geändert zu: ${newRole}`, "success");
        } catch (err) {
          console.error("❌ Fehler beim Rollenwechsel:", err);
          showFeedback("Fehler beim Rollenwechsel.", "error");
        }
      });
    });

    // Löschen mit Bestätigungs‑Banner
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;

        // Gelbes Bestätigungs‑Banner statt confirm()
        showFeedback("⚠️ Löschbestätigung erforderlich – erneut klicken zum Bestätigen!", "warning");

        btn.addEventListener("click", async () => {
          try {
            await deleteDoc(doc(db, "employees", id));
            showFeedback("✅ Mitarbeiter gelöscht", "success");
            await loadEmployees();
          } catch (err) {
            console.error("❌ Fehler beim Löschen:", err);
            showFeedback("Fehler beim Löschen des Mitarbeiters.", "error");
          }
        }, { once: true });
      });
    });
  }

  // Initial laden
  loadEmployees();

  // Logout Button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// Admin Panel direkt initialisieren
initAdminPanel();
