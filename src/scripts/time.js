// src/scripts/time.js – Logik für Zeiterfassung

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// Zugriff: Admins & Mitarbeiter
enforceRole(["admin", "mitarbeiter"], "login.html");

const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const hoursInput = document.getElementById("hoursWorked");

// Stunden automatisch berechnen
function calculateHours() {
  const start = startInput.value;
  const end = endInput.value;
  if (start && end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const diff = (endMinutes - startMinutes) / 60;
    hoursInput.value = diff > 0 ? diff.toFixed(2) : "0.00";
  }
}
startInput.addEventListener("change", calculateHours);
endInput.addEventListener("change", calculateHours);

// Datum formatieren (YYYY-MM-DD → DD.MM.YYYY)
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

// Zeiterfassung speichern
document.getElementById("timeForm").addEventListener("submit", async e => {
  e.preventDefault();
  const employee = document.getElementById("employeeName").value.trim();
  const date = document.getElementById("workDate").value;
  const start = startInput.value;
  const end = endInput.value;
  const hours = parseFloat(hoursInput.value) || 0;
  const description = document.getElementById("workDescription").value.trim();

  try {
    await addDoc(collection(db, "timeEntries"), {
      employee,
      date,
      start,
      end,
      hours,
      description,
      createdAt: serverTimestamp()
    });
    e.target.reset();
    loadTimeEntries();
    alert("✅ Zeiterfassung erfolgreich gespeichert!");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    alert("Fehler beim Speichern der Zeiterfassung.");
  }
});

// Zeiterfassungen laden
async function loadTimeEntries() {
  const tableBody = document.querySelector("#timeTable tbody");
  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "timeEntries"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.employee}</td>
      <td>${formatDate(data.date)}</td>
      <td>${data.start || "-"}</td>
      <td>${data.end || "-"}</td>
      <td>${data.hours}</td>
      <td>${data.description || "-"}</td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> Löschen
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Löschen
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      if (confirm("Soll dieser Eintrag wirklich gelöscht werden?")) {
        try {
          await deleteDoc(doc(db, "timeEntries", id));
          alert("✅ Eintrag gelöscht");
          loadTimeEntries();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          alert("Fehler beim Löschen des Eintrags.");
        }
      }
    });
  });
}

// Initial laden
loadTimeEntries();

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
