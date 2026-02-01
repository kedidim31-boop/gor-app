// src/scripts/employees.js – Logik für Mitarbeiterverwaltung

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js"; // globales Feedback-System
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff: nur Admins
enforceRole(["admin"], "login.html");

const form = document.getElementById("employeeForm");
const tableBody = document.querySelector("#employeeTable tbody");

// Hilfsfunktion für Schweizer Datumsformat (TT.MM.JJJJ)
function formatSwissDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

// Mitarbeiter hinzufügen
if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const number = document.getElementById("employeeNumber").value.trim();
    const name = document.getElementById("employeeName").value.trim();
    const email = document.getElementById("employeeEmail").value.trim();
    const address = document.getElementById("employeeAddress").value.trim();
    const zip = document.getElementById("employeeZip").value.trim();
    const city = document.getElementById("employeeCity").value.trim();
    const birthdayRaw = document.getElementById("employeeBirthday").value;
    const birthday = formatSwissDate(birthdayRaw);
    const phone = document.getElementById("employeePhone").value.trim();

    // 🔥 Option B: Rollen = admin / employee / guest
    const role = document.getElementById("employeeRole").value || "guest";

    if (!name || !email || !address || !zip || !city || !birthday || !phone || !role) {
      showFeedback("⚠️ Bitte alle Pflichtfelder ausfüllen!", "error");
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
      createdAt: serverTimestamp() 
    };

    try {
      await addDoc(collection(db, "employees"), employee);
      form.reset();
      loadEmployees();
      showFeedback("✅ Mitarbeiter erfolgreich gespeichert!", "success");
    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
      showFeedback("Fehler beim Speichern des Mitarbeiters.", "error");
    }
  });
}

// Mitarbeiter laden
async function loadEmployees() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.number || "-"}</td>
      <td>${data.name || "-"}</td>
      <td>${data.email || "-"}</td>
      <td>${data.address || "-"}</td>
      <td>${data.zip || "-"}</td>
      <td>${data.city || "-"}</td>
      <td>${data.birthday || "-"}</td>
      <td>${data.phone || "-"}</td>

      <td>
        <select data-id="${docSnap.id}" class="roleSelect">
          <option value="employee" ${data.role === "employee" ? "selected" : ""}>Employee</option>
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="guest" ${data.role === "guest" ? "selected" : ""}>Guest</option>
        </select>
      </td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> Löschen
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Rollen ändern
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

  // Löschen mit Bestätigungs-Banner
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;

      showFeedback("⚠️ Löschbestätigung erforderlich – erneut klicken zum Bestätigen!", "warning");

      btn.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "employees", id));
          showFeedback("✅ Mitarbeiter gelöscht", "success");
          loadEmployees();
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

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
