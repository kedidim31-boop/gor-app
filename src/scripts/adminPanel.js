// src/scripts/adminPanel.js – zentrale Logik für Admin Panel (modulare Firebase SDK)

import { enforceRole } from "./roleGuard.js";
import { createUser } from "./adminUser.js";
import { logout } from "./auth.js";
import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { logActivity } from "./activityHandler.js";
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
        const currentUserId = auth.currentUser?.uid || "system";

        await createUser(email, password, role);
        await loadEmployees(db);
        form.reset();

        showFeedback(t("admin.saved"), "success");

        await logActivity(currentUserId, "create_user", `User: ${email}, Role: ${role}`);

      } catch (err) {
        console.error("❌ Fehler beim Erstellen:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  }

  // Initial laden
  loadEmployees(db);

  // Logout Button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter / Benutzer laden
// -------------------------------------------------------------
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
          <option value="employee" ${data.role === "employee" ? "selected" : ""}>${t("roles.employee")}</option>
          <option value="support" ${data.role === "support" ? "selected" : ""}>${t("roles.support")}</option>
          <option value="manager" ${data.role === "manager" ? "selected" : ""}>${t("roles.manager")}</option>
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>${t("roles.admin")}</option>
          <option value="guest" ${data.role === "guest" ? "selected" : ""}>${t("roles.guest")}</option>
        </select>
      </td>

      <td>
        <button class="deleteBtn actionBtn" data-id="${docSnap.id}">
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
        const adminId = auth.currentUser?.uid || "system";

        await logActivity(adminId, "change_role", `UserID: ${id}, new role: ${newRole}`);

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
    btn.addEventListener("click", async e => {
      const id = e.currentTarget.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "employees", id));

            showFeedback(t("employees.delete"), "success");

            const { auth } = initFirebase();
            const adminId = auth.currentUser?.uid || "system";

            await logActivity(adminId, "delete_user", `UserID: ${id}`);

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
