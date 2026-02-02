// src/scripts/time.js – Logik für Zeiterfassung (mehrsprachig + optimiert)

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

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support, Employee
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const hoursInput = document.getElementById("hoursWorked");

// -------------------------------------------------------------
// 🔹 Stunden automatisch berechnen
// -------------------------------------------------------------
function calculateHours() {
  const start = startInput.value;
  const end = endInput.value;

  if (!start || !end) return;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  const diff = (endMinutes - startMinutes) / 60;

  hoursInput.value = diff > 0 ? diff.toFixed(2) : "0.00";
}

startInput?.addEventListener("change", calculateHours);
endInput?.addEventListener("change", calculateHours);

// -------------------------------------------------------------
// 🔹 Schweizer Datumsformat
// -------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

// -------------------------------------------------------------
// 🔹 Zeiterfassung speichern
// -------------------------------------------------------------
document.getElementById("timeForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const employee = document.getElementById("employeeName").value.trim();
  const date = document.getElementById("workDate").value;
  const start = startInput.value;
  const end = endInput.value;
  const hours = parseFloat(hoursInput.value) || 0;
  const description = document.getElementById("workDescription").value.trim();

  if (!employee || !date || hours <= 0) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

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
    showFeedback(t("feedback.ok"), "success");

  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Zeiterfassungen laden
// -------------------------------------------------------------
async function loadTimeEntries() {
  const tableBody = document.querySelector("#timeTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "timeEntries"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.employee || "-"}</td>
      <td>${formatDate(data.date)}</td>
      <td>${data.start || "-"}</td>
      <td>${data.end || "-"}</td>
      <td>${data.hours?.toFixed(2) || "0.00"}</td>
      <td>${data.description || "-"}</td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("time.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachDeleteHandler();
}

// -------------------------------------------------------------
// 🔹 Löschen mit Bestätigungs-Banner
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.currentTarget.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "timeEntries", id));
            showFeedback(t("time.delete"), "success");
            loadTimeEntries();

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
loadTimeEntries();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
