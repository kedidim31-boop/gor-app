// ======================================================================
// 🔥 EMPLOYEES – Teil 1
// Setup, Helpers, Init, Create, Load
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// Zugriff: Admin, Manager, Support
enforceRole(["admin", "manager", "support"], "login.html");

// DOM
const employeeForm   = document.getElementById("employeeForm");
const employeeTable  = document.querySelector("#employeeTable tbody");
const employeeSearch = document.getElementById("employeeSearch");
const roleFilter     = document.getElementById("employeeRoleFilter");

// Logout
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 Helper: Mitarbeitermummer generieren (Swiss Style)
// -------------------------------------------------------------
function generateEmployeeNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `EMP-${year}-${rand}`;
}

// -------------------------------------------------------------
// 🔹 Helper: Schweizer Datumsformat (Geburtstag)
// -------------------------------------------------------------
function formatSwissDate(dateStr) {
  if (!dateStr) return "-";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

// -------------------------------------------------------------
// 🔹 Helper: Rollen-Badge
// -------------------------------------------------------------
function roleBadge(role) {
  return `<span class="role-badge role-${role}">${t(`roles.${role}`) || role}</span>`;
}

// -------------------------------------------------------------
// 🔹 Helper: Status-Badge
// -------------------------------------------------------------
function statusBadge(disabled) {
  if (disabled) {
    return `<span class="status-badge status-disabled">${t("employees.disabled") || "Deaktiviert"}</span>`;
  }
  return `<span class="status-badge status-active">${t("employees.active") || "Aktiv"}</span>`;
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter anlegen / speichern
// -------------------------------------------------------------
employeeForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const name       = document.getElementById("empName").value.trim();
  const email      = document.getElementById("empEmail").value.trim();
  const role       = document.getElementById("empRole").value;
  const street     = document.getElementById("empStreet")?.value.trim() || "";
  const plz        = document.getElementById("empPlz")?.value.trim() || "";
  const city       = document.getElementById("empCity")?.value.trim() || "";
  const birthday   = document.getElementById("empBirthday")?.value || "";
  const phone      = document.getElementById("empPhone")?.value.trim() || "";

  if (!name || !email || !role) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  const employeeNumber = generateEmployeeNumber();

  try {
    const adminEmail = auth.currentUser?.email || "system";

    await addDoc(collection(db, "employees"), {
      name,
      email,
      role,
      street,
      plz,
      city,
      birthday,
      phone,
      employeeNumber,
      disabled: false,
      createdAt: serverTimestamp(),
      createdBy: adminEmail
    });

    employeeForm.reset();
    showFeedback(t("employees.saved") || "Mitarbeiter gespeichert", "success");

    await loadEmployees();

  } catch (err) {
    console.error("❌ Fehler beim Speichern Mitarbeiter:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Mitarbeiter laden
// -------------------------------------------------------------
async function loadEmployees() {
  if (!employeeTable) return;

  employeeTable.innerHTML = "";

  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id   = docSnap.id;

    const row = document.createElement("tr");
    row.dataset.role = data.role || "";
    row.dataset.disabled = data.disabled ? "1" : "0";

    row.innerHTML = renderEmployeeRow(id, data);
    employeeTable.appendChild(row);
  });

  attachRoleChangeHandler();
  attachDisableHandler();
  attachDeleteHandler();
}
// ======================================================================
// 🔥 EMPLOYEES – Teil 2
// Render, Role Change, Disable, Delete, Filter, Init
// ======================================================================

// -------------------------------------------------------------
// 🔹 Row‑Renderer
// -------------------------------------------------------------
function renderEmployeeRow(id, data) {
  const birthdayDisplay = data.birthday ? formatSwissDate(data.birthday) : "-";

  return `
    <td>${data.employeeNumber || "-"}</td>
    <td>${data.name || "-"}</td>
    <td>${data.email || "-"}</td>

    <td>
      ${roleBadge(data.role || "employee")}
      <select data-id="${id}" class="roleSelect">
        ${roleOptions(data.role || "employee")}
      </select>
    </td>

    <td>
      ${statusBadge(data.disabled)}
      <button class="disableBtn actionBtn" data-id="${id}">
        <i class="fa-solid fa-user-slash"></i>
        ${data.disabled ? (t("employees.enable") || "Aktivieren") : (t("employees.disable") || "Deaktivieren")}
      </button>
    </td>

    <td>
      ${data.street || "-"}<br>
      ${data.plz || ""} ${data.city || ""}
    </td>

    <td>${birthdayDisplay}</td>
    <td>${data.phone || "-"}</td>

    <td>
      <button class="deleteBtn actionBtn" data-id="${id}">
        <i class="fa-solid fa-trash"></i> ${t("employees.delete")}
      </button>
    </td>
  `;
}

// -------------------------------------------------------------
// 🔹 Rollen-Auswahl (für Row-Renderer)
// -------------------------------------------------------------
function roleOptions(currentRole) {
  const roles = ["employee", "support", "manager", "admin", "guest"];

  return roles
    .map(role => {
      const selected = role === currentRole ? "selected" : "";
      return `<option value="${role}" ${selected}>${t(`roles.${role}`) || role}</option>`;
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

        showFeedback(`${t("admin.changeRole")}: ${newRole}`, "success");
        await loadEmployees();

      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Deaktivieren / Aktivieren
// -------------------------------------------------------------
function attachDisableHandler() {
  document.querySelectorAll(".disableBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      try {
        const row = btn.closest("tr");
        const currentlyDisabled = row?.dataset.disabled === "1";
        const newStatus = !currentlyDisabled;

        await updateDoc(doc(db, "employees", id), { disabled: newStatus });

        showFeedback(
          newStatus ? (t("employees.disabled") || "Deaktiviert") : (t("employees.enabled") || "Aktiviert"),
          newStatus ? "warning" : "success"
        );

        await loadEmployees();

      } catch (err) {
        console.error("❌ Fehler beim Deaktivieren/Aktivieren:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Löschen
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "employees", id));
            showFeedback(t("employees.delete"), "success");
            await loadEmployees();
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
// 🔹 Suche & Rollenfilter
// -------------------------------------------------------------
employeeSearch?.addEventListener("input", () => {
  applyEmployeeFilters();
});

roleFilter?.addEventListener("change", () => {
  applyEmployeeFilters();
});

function applyEmployeeFilters() {
  const term = (employeeSearch?.value || "").toLowerCase();
  const role = roleFilter?.value || "all";

  document.querySelectorAll("#employeeTable tbody tr").forEach(row => {
    const text = row.innerText.toLowerCase();
    const rowRole = row.dataset.role || "";

    const matchText = text.includes(term);
    const matchRole = role === "all" || rowRole === role;

    row.style.display = matchText && matchRole ? "" : "none";
  });
}

// -------------------------------------------------------------
// 🔹 Initial
// -------------------------------------------------------------
loadEmployees();
