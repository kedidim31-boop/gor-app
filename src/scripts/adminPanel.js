// adminPanel.js – zentrale Logik für Admin Panel (modulare Firebase SDK)

import { enforceRole } from './roleGuard.js';
import { createUser } from './adminUser.js';
import { logout } from './auth.js';
import { initFirebase } from './firebaseSetup.js';
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
  enforceRole("admin", "index.html");

  // Benutzer anlegen
  const form = document.getElementById("createUserForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const role = document.getElementById("newRole").value;

    await createUser(email, password, role);
    await loadEmployees();
    form.reset();
  });

  // Mitarbeiter laden
  async function loadEmployees() {
    const tableBody = document.querySelector("#adminEmployeeTable tbody");
    tableBody.innerHTML = "";

    const snapshot = await getDocs(collection(db, "employees"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.name || "-"}</td>
        <td>${data.email}</td>
        <td>
          <select data-id="${docSnap.id}" class="roleSelect">
            <option value="mitarbeiter" ${data.role === "mitarbeiter" ? "selected" : ""}>Mitarbeiter</option>
            <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </td>
        <td>
          <button class="deleteBtn" data-id="${docSnap.id}">Löschen</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Rollenänderung
    document.querySelectorAll(".roleSelect").forEach(select => {
      select.addEventListener("change", async e => {
        const id = e.target.dataset.id;
        const newRole = e.target.value;
        await updateDoc(doc(db, "employees", id), { role: newRole });
        alert("Rolle geändert zu: " + newRole);
      });
    });

    // Löschen
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        await deleteDoc(doc(db, "employees", id));
        alert("Mitarbeiter gelöscht");
        await loadEmployees();
      });
    });
  }

  // Initial laden
  loadEmployees();

  // Logout Button
  document.querySelector(".logout-btn").addEventListener("click", () => {
    logout();
  });
}
