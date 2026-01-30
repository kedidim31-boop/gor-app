// src/scripts/employees.js – Logik für Mitarbeiterverwaltung

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff nur für Admins
enforceRole(["admin"], "login.html");

// Formular & Tabelle
const form = document.getElementById("employeeForm");
const tableBody = document.querySelector("#employeeTable tbody");

// Mitarbeiter hinzufügen
form.addEventListener("submit", async e => {
  e.preventDefault();
  const employee = {
    name: document.getElementById("employeeName").value.trim(),
    email: document.getElementById("employeeEmail").value.trim(),
    role: document.getElementById("employeeRole").value,
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, "employees"), employee);
    form.reset();
    loadEmployees();
    alert("✅ Mitarbeiter erfolgreich gespeichert!");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    alert("Fehler beim Speichern des Mitarbeiters.");
  }
});

// Mitarbeiter laden
async function loadEmployees() {
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
          <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="mitarbeiter" ${data.role === "mitarbeiter" ? "selected" : ""}>Mitarbeiter</option>
          <option value="gast" ${data.role === "gast" ? "selected" : ""}>Gast</option>
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
        alert(`✅ Rolle geändert zu: ${newRole}`);
      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        alert("Fehler beim Rollenwechsel.");
      }
    });
  });

  // Löschen
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      if (confirm("Soll dieser Mitarbeiter wirklich gelöscht werden?")) {
        try {
          await deleteDoc(doc(db, "employees", id));
          alert("✅ Mitarbeiter gelöscht");
          loadEmployees();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          alert("Fehler beim Löschen des Mitarbeiters.");
        }
      }
    });
  });
}

// Initial laden
loadEmployees();

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
