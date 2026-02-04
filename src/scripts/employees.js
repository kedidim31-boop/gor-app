// ======================================================================
// 🔥 EMPLOYEES.JS – FINAL VERSION (Teil 1)
// Setup, Form, Save, Formatierung
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
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff
enforceRole(["admin", "manager", "support"], "login.html");

// DOM Elemente
const employeeForm = document.getElementById("employeeForm");
const tableBody    = document.querySelector("#employeeTable tbody");

// Logout
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// Schweizer Datumsformat
function formatDateCH(dateStr) {
  if (!dateStr) return "-";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

// Auto-Mitarbeiternummer
function generateEmployeeNumber() {
  return "EMP-" + Math.floor(100000 + Math.random() * 900000);
}

// Mitarbeiter speichern
employeeForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const employee = {
    name: document.getElementById("empName").value.trim(),
    address: document.getElementById("empAddress").value.trim(),
    plz: document.getElementById("empPLZ").value.trim(),
    ort: document.getElementById("empOrt").value.trim(),
    birthday: document.getElementById("empBirthday").value,
    phone: document.getElementById("empPhone").value.trim(),
    role: document.getElementById("empRole").value.trim(),
    empNumber: generateEmployeeNumber(),
    createdAt: serverTimestamp()
  };

  if (!employee.name || !employee.role) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    await addDoc(collection(db, "employees"), employee);
    employeeForm.reset();
    await loadEmployees();
    showFeedback(t("feedback.ok"), "success");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});
// ======================================================================
// 🔥 EMPLOYEES.JS – FINAL VERSION (Teil 2)
// Load, Delete, Init
// ======================================================================

// Mitarbeiter laden
async function loadEmployees() {
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.empNumber || "-"}</td>
      <td>${data.name || "-"}</td>
      <td>${data.address || "-"}</td>
      <td>${data.plz || "-"}</td>
      <td>${data.ort || "-"}</td>
      <td>${formatDateCH(data.birthday)}</td>
      <td>${data.phone || "-"}</td>
      <td>${data.role || "-"}</td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("employees.delete")}
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachDeleteHandler();
}

// Löschen mit Bestätigungs-Banner
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

// Init
loadEmployees();
