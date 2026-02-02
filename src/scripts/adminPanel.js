// src/scripts/adminPanel.js – optimierte Admin Panel Logik

import { enforceRole } from "./roleGuard.js";
import { createUser } from "./adminUser.js";
import { logout } from "./auth.js";
import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./auditHandler.js";
import { t } from "./lang.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// -------------------------------------------------------------
// 🔹 Admin Panel initialisieren
// -------------------------------------------------------------
export function initAdminPanel() {
  const { auth, db } = initFirebase();

  // Zugriff nur für Admin & Manager
  enforceRole(["admin", "manager"], "login.html");

  // Benutzer anlegen
  const form = document.getElementById("createUserForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const email = document.getElementById("newEmail").value.trim();
      const password = document.getElementById("newPassword").value.trim();
      const role = document.getElementById("newRole").value;

      if (!email || !password || !role) {
        showFeedback(t("errors.fail"), "error");
        return;
      }

      try {
        const adminEmail = auth.currentUser?.email || "system";

        await createUser(email, password, role);
        await addAuditLog(adminEmail, "create_user", `User: ${email}, Role: ${role}`);

        form.reset();
        showFeedback(t("admin.saved"), "success");

        await loadEmployees(db);

      } catch (err) {
        console.error("❌ Fehler beim Erstellen:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  }

  // Initial laden
  loadEmployees(db);

  // Logout Button
  document.querySelector(".logout-btn")?.addEventListener("click", logout);
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter / Benutzer laden
// -------------------------------------------------------------
async function loadEmployees(db) {
  const tableBody = document.querySelector("#adminEmployeeTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id; // E-Mail als ID

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name || "-"}</td>
      <td>${data.email || id}</td>

      <td>
        <select data-id="${id}" class="roleSelect">
          ${roleOptions(data.role)}
        </select>
      </td>

      <td>
        <button class="deleteBtn actionBtn" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("employees.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachRoleChangeHandler(db);
  attachDeleteHandler(db);
}

// -------------------------------------------------------------
// 🔹 Rollen-Auswahl dynamisch generieren
// -------------------------------------------------------------
function roleOptions(currentRole) {
  const roles = ["employee", "support", "manager", "admin", "guest"];

  return roles
    .map(role => {
      const selected = role === currentRole ? "selected" : "";
      return `<option value="${role}" ${selected}>${t(`roles.${role}`)}</option>`;
    })
    .join("");
}

// -------------------------------------------------------------
// 🔹 Rollenänderung
// -------------------------------------------------------------
function attachRoleChangeHandler(db) {
  document.querySelectorAll(".roleSelect").forEach(select => {
    select.addEventListener("change", async e => {
      const id = e.target.dataset.id;
      const newRole = e.target.value;

      try {
        await updateDoc(doc(db, "employees", id), { role: newRole });

        showFeedback(`${t("admin.changeRole")}: ${newRole}`, "success");

        const { auth } = initFirebase();
        const adminEmail = auth.currentUser?.email || "system";

        await addAuditLog(adminEmail, "change_role", `User: ${id}, new role: ${newRole}`);

      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Löschen mit Bestätigung
// -------------------------------------------------------------
function attachDeleteHandler(db) {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      // Erstes Feedback = Warnung
      showFeedback(t("admin.confirm"), "warning");

      // Zweiter Klick = Löschen
      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "employees", id));

            const { auth } = initFirebase();
            const adminEmail = auth.currentUser?.email || "system";

            await addAuditLog(adminEmail, "delete_user", `User: ${id}`);

            showFeedback(t("employees.delete"), "success");

            await loadEmployees(db);

          } catch (err) {
            console.error("❌ Fehler beim Löschen:", err);
            showFeedback(t("errors.fail"), "error");
          }
        },
        { once: true }
      );
    });
  });
}

// -------------------------------------------------------------
// 🔹 Admin Panel direkt initialisieren
// -------------------------------------------------------------
initAdminPanel();
