// src/scripts/employees.js – Logik für Mitarbeiterverwaltung (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import { 
  collection, setDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin + Manager
// -------------------------------------------------------------
enforceRole(["admin", "manager"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const form = document.getElementById("employeeForm");
const tableBody = document.querySelector("#employeeTable tbody");

// -------------------------------------------------------------
// 🔹 Schweizer Datumsformat (TT.MM.JJJJ)
// -------------------------------------------------------------
function formatSwissDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

// -------------------------------------------------------------
// 🔹 Auto-Mitarbeiternummer generieren
// -------------------------------------------------------------
function generateEmployeeNumber() {
  return "EMP-" + Math.floor(100000 + Math.random() * 900000);
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter hinzufügen
// -------------------------------------------------------------
if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    let number = document.getElementById("employeeNumber").value.trim();
    const name = document.getElementById("employeeName").value.trim();
    const email = document.getElementById("employeeEmail").value.trim();
    const address = document.getElementById("employeeAddress").value.trim();
    const zip = document.getElementById("employeeZip").value.trim();
    const city = document.getElementById("employeeCity").value.trim();
    const birthdayRaw = document.getElementById("employeeBirthday").value;
    const birthday = formatSwissDate(birthdayRaw);
    const phone = document.getElementById("employeePhone").value.trim();
    const role = document.getElementById("employeeRole").value || "guest";

    if (!number) number = generateEmployeeNumber();

    if (!name || !email || !address || !zip || !city || !birthday || !phone) {
      showFeedback(t("errors.fail"), "error");
      return;
    }

    const employee = { 
      number, 
      name, 
      email, 
      address, 
      zip, 
      city, 
      birthday, 
      phone, 
      role,
      disabled: false, // ⭐ NEU
      createdAt: serverTimestamp() 
    };

    try {
      await setDoc(doc(db, "employees", email), employee);

      form.reset();
      loadEmployees();
      showFeedback(t("feedback.ok"), "success");

    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
      showFeedback(t("errors.fail"), "error");
    }
  });
}

// -------------------------------------------------------------
// 🔹 Mitarbeiter laden
// -------------------------------------------------------------
async function loadEmployees() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");

    const statusBadge = data.disabled
      ? `<span class="badge badge-red">Deaktiviert</span>`
      : `<span class="badge badge-green">Aktiv</span>`;

    const disableButton = data.disabled
      ? `<button class="enableBtn btn btn-green" data-id="${id}">
           <i class="fa-solid fa-user-check"></i> Aktivieren
         </button>`
      : `<button class="disableBtn btn btn-yellow" data-id="${id}">
           <i class="fa-solid fa-user-slash"></i> Deaktivieren
         </button>`;

    row.innerHTML = `
      <td>${data.number || "-"}</td>
      <td>${data.name || "-"}</td>
      <td>${data.email || id}</td>
      <td>${data.address || "-"}</td>
      <td>${data.zip || "-"}</td>
      <td>${data.city || "-"}</td>
      <td>${data.birthday || "-"}</td>
      <td>${data.phone || "-"}</td>

      <td>
        <select data-id="${id}" class="roleSelect">
          <option value="employee" ${data.role === "employee" ? "selected" : ""}>${t("roles.employee")}</option>
          <option value="support" ${data.role === "support" ? "selected" : ""}>${t("roles.support")}</option>
          <option value="manager" ${data.role === "manager" ? "selected" : ""}>${t("roles.manager")}</option>
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>${t("roles.admin")}</option>
          <option value="guest" ${data.role === "guest" ? "selected" : ""}>${t("roles.guest")}</option>
        </select>
      </td>

      <td>${statusBadge}</td>

      <td>
        ${disableButton}
        <button class="deleteBtn btn btn-red" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("employees.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachRoleChangeHandler();
  attachDisableHandler(); // ⭐ NEU
  attachEnableHandler();  // ⭐ NEU
  attachDeleteHandler();
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

      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Benutzer deaktivieren ⭐ NEU
// -------------------------------------------------------------
function attachDisableHandler() {
  document.querySelectorAll(".disableBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      try {
        await updateDoc(doc(db, "employees", id), { disabled: true });

        showFeedback("Benutzer deaktiviert", "warning");
        loadEmployees();

      } catch (err) {
        console.error("❌ Fehler beim Deaktivieren:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Benutzer aktivieren ⭐ NEU
// -------------------------------------------------------------
function attachEnableHandler() {
  document.querySelectorAll(".enableBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      try {
        await updateDoc(doc(db, "employees", id), { disabled: false });

        showFeedback("Benutzer aktiviert", "success");
        loadEmployees();

      } catch (err) {
        console.error("❌ Fehler beim Aktivieren:", err);
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
            loadEmployees();

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
// 🔹 Initial laden
// -------------------------------------------------------------
loadEmployees();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);
