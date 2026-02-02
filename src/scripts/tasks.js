// src/scripts/tasks.js – Logik für Aufgabenverwaltung (mehrsprachig + optimiert)

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

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support, Employee
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// -------------------------------------------------------------
// 🔹 Aufgabe hinzufügen
// -------------------------------------------------------------
const taskForm = document.getElementById("taskForm");

if (taskForm) {
  taskForm.addEventListener("submit", async e => {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const status = document.getElementById("taskStatus").value;

    if (!title || !status) {
      showFeedback(t("errors.fail"), "error");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        title,
        description: description || "",
        status,
        createdAt: serverTimestamp()
      });

      e.target.reset();
      loadTasks();
      showFeedback(t("feedback.ok"), "success");

    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
      showFeedback(t("errors.fail"), "error");
    }
  });
}

// -------------------------------------------------------------
// 🔹 Aufgaben laden
// -------------------------------------------------------------
async function loadTasks() {
  const tableBody = document.querySelector("#taskTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "tasks"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.classList.add(`status-${data.status}`);

    const statusIcons = {
      offen: "<i class='fa-solid fa-clock'></i>",
      inBearbeitung: "<i class='fa-solid fa-screwdriver-wrench'></i>",
      abgeschlossen: "<i class='fa-solid fa-check'></i>"
    };

    row.innerHTML = `
      <td>${data.title || "-"}</td>
      <td>${data.description || "-"}</td>

      <td>
        <span class="status-badge status-${data.status}">
          ${statusIcons[data.status] || ""} ${t(`tasks.${data.status}`)}
        </span><br>

        <select data-id="${docSnap.id}" class="statusSelect">
          <option value="offen" ${data.status === "offen" ? "selected" : ""}>${t("tasks.offen")}</option>
          <option value="inBearbeitung" ${data.status === "inBearbeitung" ? "selected" : ""}>${t("tasks.inProgress")}</option>
          <option value="abgeschlossen" ${data.status === "abgeschlossen" ? "selected" : ""}>${t("tasks.done")}</option>
        </select>
      </td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("tasks.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachStatusHandler();
  attachDeleteHandler();
}

// -------------------------------------------------------------
// 🔹 Status ändern
// -------------------------------------------------------------
function attachStatusHandler() {
  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", async e => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;

      try {
        await updateDoc(doc(db, "tasks", id), { status: newStatus });

        const row = e.target.closest("tr");
        row.className = "";
        row.classList.add(`status-${newStatus}`);

        const badge = row.querySelector(".status-badge");

        const statusIcons = {
          offen: "<i class='fa-solid fa-clock'></i>",
          inBearbeitung: "<i class='fa-solid fa-screwdriver-wrench'></i>",
          abgeschlossen: "<i class='fa-solid fa-check'></i>"
        };

        badge.innerHTML = `${statusIcons[newStatus] || ""} ${t(`tasks.${newStatus}`)}`;
        badge.className = `status-badge status-${newStatus}`;

        showFeedback(t("feedback.ok"), "success");

      } catch (err) {
        console.error("❌ Fehler beim Statuswechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
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
            await deleteDoc(doc(db, "tasks", id));
            showFeedback(t("tasks.delete"), "success");
            loadTasks();

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
loadTasks();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
