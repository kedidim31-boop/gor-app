// adminPanel.js – zentrale Logik für Admin Panel

import { enforceRole } from './roleGuard.js';
import { createUser } from './adminUser.js';
import { logout } from './auth.js';

export function initAdminPanel() {
  const db = firebase.firestore();

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
    loadEmployees(db);
    form.reset();
  });

  // Mitarbeiter laden
  async function loadEmployees(db) {
    const tableBody = document.querySelector("#adminEmployeeTable tbody");
    tableBody.innerHTML = "";

    const snapshot = await db.collection("employees").get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.name || "-"}</td>
        <td>${data.email}</td>
        <td>
          <select data-id="${doc.id}" class="roleSelect">
            <option value="mitarbeiter" ${data.role === "mitarbeiter" ? "selected" : ""}>Mitarbeiter</option>
            <option value="admin" ${data.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </td>
        <td>
          <button class="deleteBtn" data-id="${doc.id}">Löschen</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Rollenänderung
    document.querySelectorAll(".roleSelect").forEach(select => {
      select.addEventListener("change", async e => {
        const id = e.target.dataset.id;
        const newRole = e.target.value;
        await db.collection("employees").doc(id).update({ role: newRole });
        alert("Rolle geändert zu: " + newRole);
      });
    });

    // Löschen
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        await db.collection("employees").doc(id).delete();
        alert("Mitarbeiter gelöscht");
        loadEmployees(db);
      });
    });
  }

  // Initial laden
  loadEmployees(db);

  // Logout Button
  document.querySelector(".logout-btn").addEventListener("click", () => {
    logout();
  });
}
