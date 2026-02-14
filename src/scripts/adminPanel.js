// ======================================================================
// 🔥 ADMIN PANEL – Sprachfähige Finalversion mit Modal
// ======================================================================

import { enforceRole } from "./roleGuard.js";
import { createUser } from "./adminUser.js";
import { logout } from "./auth.js";
import { initFirebase } from "./firebaseSetup.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog, getRecentActivities } from "./activityHandler.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Admin Panel initialisieren
// -------------------------------------------------------------
export function initAdminPanel() {
  enforceRole(["admin", "manager"], "login.html");
  updateTranslations();

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
        await loadEmployees();
        await loadAuditLog();
      } catch (err) {
        console.error("❌ Fehler beim Erstellen:", err);
        showFeedback(
          err.code === "auth/email-already-in-use"
            ? t("admin.emailInUse")
            : t("errors.fail"),
          "error"
        );
      }
    });
  }

  loadEmployees();
  loadAuditLog();

  document.querySelector(".logout-btn")?.addEventListener("click", logout);
  document.getElementById("employeeSearch")?.addEventListener("input", filterEmployees);
  document.getElementById("auditSearch")?.addEventListener("input", filterAudit);
  document.getElementById("refreshAudit")?.addEventListener("click", loadAuditLog);
}
// -------------------------------------------------------------
// 🔹 Mitarbeiter laden
// -------------------------------------------------------------
async function loadEmployees() {
  const tableBody = document.querySelector("#adminEmployeeTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const statusBadge = data.disabled
      ? `<span class="role-badge role-guest">${t("employees.disabled")}</span>`
      : `<span class="role-badge role-employee">${t("employees.enabled")}</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name || "-"}</td>
      <td>${data.email || id}</td>
      <td>
        <div class="role-badge role-${data.role}">${t(`roles.${data.role}`)}</div>
        <select data-id="${id}" class="roleSelect">
          ${roleOptions(data.role)}
        </select>
      </td>
      <td>${statusBadge}</td>
      <td>
        <button class="deleteBtn actionBtn" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("employees.delete")}
        </button>
        <button class="disableBtn actionBtn" data-id="${id}">
          <i class="fa-solid fa-user-slash"></i>
          ${data.disabled ? t("employees.enable") : t("employees.disable")}
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachRoleChangeHandler();
  attachDeleteHandler();
  attachDisableHandler();
}

// -------------------------------------------------------------
// 🔹 Rollen-Auswahl generieren
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
// 🔹 Rollen ändern
// -------------------------------------------------------------
function attachRoleChangeHandler() {
  document.querySelectorAll(".roleSelect").forEach(select => {
    select.addEventListener("change", async e => {
      const id = e.target.dataset.id;
      const newRole = e.target.value;

      try {
        await updateDoc(doc(db, "employees", id), { role: newRole });
        const adminEmail = auth.currentUser?.email || "system";
        await addAuditLog(adminEmail, "change_role", `User: ${id}, new role: ${newRole}`);
        showFeedback(`${t("admin.changeRole")}: ${newRole}`, "success");
        await loadEmployees();
        await loadAuditLog();
      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Benutzer deaktivieren / aktivieren
// -------------------------------------------------------------
function attachDisableHandler() {
  document.querySelectorAll(".disableBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const isDisabling = btn.innerText.includes(t("employees.disable"));

      try {
        await updateDoc(doc(db, "employees", id), { disabled: isDisabling });

        try {
          await updateDoc(doc(db, "users", id), { disabled: isDisabling });
        } catch (innerErr) {
          console.warn("⚠️ users-Dokument nicht vorhanden:", innerErr);
        }

        const adminEmail = auth.currentUser?.email || "system";
        await addAuditLog(adminEmail, isDisabling ? "disable_user" : "enable_user", `User: ${id}`);

        showFeedback(
          isDisabling ? t("employees.disabled") : t("employees.enabled"),
          isDisabling ? "warning" : "success"
        );

        await loadEmployees();
      } catch (err) {
        console.error("❌ Fehler beim Deaktivieren:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}
// -------------------------------------------------------------
// 🔹 Benutzer löschen mit Modal
// -------------------------------------------------------------
function attachDeleteHandler() {
  const modal = document.getElementById("confirmModal");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      modal.classList.remove("hidden");

      const onConfirm = async () => {
        try {
          await deleteDoc(doc(db, "employees", id));
          try {
            await deleteDoc(doc(db, "users", id));
          } catch (innerErr) {
            console.warn("⚠️ users-Dokument nicht vorhanden:", innerErr);
          }

          const adminEmail = auth.currentUser?.email || "system";
          await addAuditLog(adminEmail, "delete_user", `User: ${id}`);
          showFeedback(t("employees.delete"), "success");

          await loadEmployees();
          await loadAuditLog();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          showFeedback(t("errors.fail"), "error");
        } finally {
          modal.classList.add("hidden");
          confirmYes.removeEventListener("click", onConfirm);
        }
      };

      confirmYes.addEventListener("click", onConfirm, { once: true });
      confirmNo.addEventListener("click", () => modal.classList.add("hidden"), { once: true });
    });
  });
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter-Suche
// -------------------------------------------------------------
function filterEmployees(e) {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#adminEmployeeTable tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
  });
}

// -------------------------------------------------------------
// 🔹 Audit Log laden
// -------------------------------------------------------------
async function loadAuditLog() {
  const table = document.querySelector("#auditTable tbody");
  if (!table) return;

  table.innerHTML = "";
  const logs = await getRecentActivities(50);

  logs.forEach(log => {
    const row = document.createElement("tr");
    const time = log.timestamp?.toDate().toLocaleString("de-CH") || "-";
    row.innerHTML = `
      <td>${time}</td>
      <td>${log.userId}</td>
      <td>${log.action}</td>
      <td>${log.details}</td>
    `;
    table.appendChild(row);
  });
}

// -------------------------------------------------------------
// 🔹 Audit-Suche
// -------------------------------------------------------------
function filterAudit(e) {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#auditTable tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
  });
}

// -------------------------------------------------------------
// 🔹 Admin Panel starten
// -------------------------------------------------------------
initAdminPanel();
