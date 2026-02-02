// src/scripts/adminPanel.js – zentrale Logik für Admin Panel (modulare Firebase SDK)

import { enforceRole } from "./roleGuard.js";
import { createUser } from "./adminUser.js"; 
import { logout } from "./auth.js";
import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export function initAdminPanel() {
  const { auth, db } = initFirebase();

  // Zugriff nur für Admins
  enforceRole(["admin"], "login.html");

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
        const currentUser = auth.currentUser;
        const currentUserId = currentUser ? currentUser.uid : "system";

        await createUser(email, password, role);
        await loadEmployees(db);
        form.reset();
        showFeedback("✅ Benutzer erfolgreich erstellt!", "success");

        // Aktivität loggen
        await logActivity(currentUserId, "create_user", `User: ${email}, Rolle: ${role}`);

      } catch (err) {
        console.error("❌ Fehler beim Erstellen:", err);
        showFeedback("Fehler beim Erstellen des Benutzers.", "error");
      }
    });
  }

  // Initial laden
  loadEmployees(db);

  // Logout Button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

// Mitarbeiter / Benutzer im Admin Panel laden
async function loadEmployees(db) {
  const tableBody = document.querySelector("#adminEmployeeTable tbody");
  if (!tableBody || !db) return;

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
          <option value="employee" ${data.role === "employee" ? "selected" : ""}>Employee</option>
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="guest" ${data.role === "guest" ? "selected" : ""}>Guest</option>
        </select>
      </td>
      <td>
        <button class="deleteBtn actionBtn" data-id="${docSnap.id}">
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

        // Aktivität loggen
        const { auth } = initFirebase();
        const adminId = auth.currentUser?.uid || "system";
        await logActivity(adminId, "change_role", `UserID: ${id}, neue Rolle: ${newRole}`);

      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback("Fehler beim Rollenwechsel.", "error");
      }
    });
  });

  // Löschen mit Bestätigungs‑Banner
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.currentTarget.dataset.id;

      showFeedback("⚠️ Löschbestätigung erforderlich – erneut klicken zum Bestätigen!", "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "employees", id));
            showFeedback("✅ Mitarbeiter gelöscht", "success");

            // Aktivität loggen
            const { auth } = initFirebase();
            const adminId = auth.currentUser?.uid || "system";
            await logActivity(adminId, "delete_user", `UserID: ${id}`);

            await loadEmployees(db);

          } catch (err) {
            console.error("❌ Fehler beim Löschen:", err);
            showFeedback("Fehler beim Löschen des Mitarbeiters.", "error");
          }
        },
        { once: true }
      );
    });
  });
}

// Admin Panel direkt initialisieren
initAdminPanel();
