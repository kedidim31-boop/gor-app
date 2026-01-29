// src/scripts/tasks.js – Logik für Aufgabenverwaltung

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff: Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

// Aufgabe hinzufügen
document.getElementById("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskStatus").value;

  try {
    await addDoc(collection(db, "tasks"), {
      title,
      description,
      status,
      createdAt: serverTimestamp()
    });
    e.target.reset();
    loadTasks();
    alert("✅ Aufgabe erfolgreich gespeichert!");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    alert("Fehler beim Speichern der Aufgabe.");
  }
});

// Aufgaben laden
async function loadTasks() {
  const tableBody = document.querySelector("#taskTable tbody");
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "tasks"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    // Status-Klasse für ganze Zeile setzen
    row.classList.add(`status-${data.status}`);

    // Badge mit Icon je nach Status
    let badgeIcon = "";
    if (data.status === "offen") badgeIcon = "<i class='fa-solid fa-clock'></i>";
    if (data.status === "inBearbeitung") badgeIcon = "<i class='fa-solid fa-screwdriver-wrench'></i>";
    if (data.status === "abgeschlossen") badgeIcon = "<i class='fa-solid fa-check'></i>";

    row.innerHTML = `
      <td>${data.title}</td>
      <td>${data.description || "-"}</td>
      <td>
        <span class="status-badge status-${data.status}">${badgeIcon} ${data.status}</span><br>
        <select data-id="${docSnap.id}" class="statusSelect">
          <option value="offen" ${data.status === "offen" ? "selected" : ""}>Offen</option>
          <option value="inBearbeitung" ${data.status === "inBearbeitung" ? "selected" : ""}>In Bearbeitung</option>
          <option value="abgeschlossen" ${data.status === "abgeschlossen" ? "selected" : ""}>Abgeschlossen</option>
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

  // Status ändern
  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", async e => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "tasks", id), { status: newStatus });
        // Zeilenklasse aktualisieren
        const row = e.target.closest("tr");
        row.className = "";
        row.classList.add(`status-${newStatus}`);
        // Badge aktualisieren
        const badge = row.querySelector(".status-badge");
        let badgeIcon = "";
        if (newStatus === "offen") badgeIcon = "<i class='fa-solid fa-clock'></i>";
        if (newStatus === "inBearbeitung") badgeIcon = "<i class='fa-solid fa-screwdriver-wrench'></i>";
        if (newStatus === "abgeschlossen") badgeIcon = "<i class='fa-solid fa-check'></i>";
        badge.innerHTML = `${badgeIcon} ${newStatus}`;
        badge.className = `status-badge status-${newStatus}`;
      } catch (err) {
        console.error("❌ Fehler beim Statuswechsel:", err);
        alert("Fehler beim Statuswechsel.");
      }
    });
  });

  // Löschen
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      if (confirm("Soll diese Aufgabe wirklich gelöscht werden?")) {
        try {
          await deleteDoc(doc(db, "tasks", id));
          alert("✅ Aufgabe gelöscht");
          loadTasks();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          alert("Fehler beim Löschen der Aufgabe.");
        }
      }
    });
  });
}

// Initial laden
loadTasks();

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
