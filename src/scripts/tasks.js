// TASKS.JS – Teil 1: Setup & Aufgabe erstellen

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./auditHandler.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase initialisieren
const { auth, db } = initFirebase();

// Rollenprüfung & Übersetzungen
enforceRole(["admin", "manager", "support", "employee"], "login.html");
updateTranslations();

// Aufgabe erstellen
const taskForm = document.getElementById("taskForm");

taskForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskStatus").value;

  if (!title || !status) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    const ref = await addDoc(collection(db, "tasks"), {
      title,
      description: description || "",
      status, // open | inProgress | done
      createdAt: serverTimestamp()
    });

    await addAuditLog(auth.currentUser.email, "task_create", `Task: ${ref.id}`);
    e.target.reset();
    await loadTasks();
    showFeedback(t("tasks.saved"), "success");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});
// TASKS.JS – Teil 2: Aufgaben laden & Tabelle rendern

async function loadTasks() {
  const tableBody = document.querySelector("#taskTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "tasks"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.classList.add(`status-${data.status}`);

    const statusIcons = {
      open: "<i class='fa-solid fa-clock'></i>",
      inProgress: "<i class='fa-solid fa-screwdriver-wrench'></i>",
      done: "<i class='fa-solid fa-check'></i>"
    };

    row.innerHTML = `
      <td>${data.title || "-"}</td>
      <td>${data.description || "-"}</td>
      <td>
        <span class="status-badge status-${data.status}">
          ${statusIcons[data.status] || ""} ${t(`tasks.${data.status}`)}
        </span><br>
        <select data-id="${id}" class="statusSelect">
          <option value="open" ${data.status === "open" ? "selected" : ""}>${t("tasks.open")}</option>
          <option value="inProgress" ${data.status === "inProgress" ? "selected" : ""}>${t("tasks.inProgress")}</option>
          <option value="done" ${data.status === "done" ? "selected" : ""}>${t("tasks.done")}</option>
        </select>
      </td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("tasks.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachStatusHandler();
  attachDeleteHandler();
}
// TASKS.JS – Teil 3: Statuswechsel & visuelles Update

function attachStatusHandler() {
  document.querySelectorAll(".statusSelect").forEach(select => {
    select.addEventListener("change", async e => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;

      try {
        await updateDoc(doc(db, "tasks", id), { status: newStatus });
        await addAuditLog(auth.currentUser.email, "task_change_status", `Task: ${id}, Status: ${newStatus}`);

        const row = e.target.closest("tr");
        row.className = "";
        row.classList.add(`status-${newStatus}`);

        const badge = row.querySelector(".status-badge");
        const statusIcons = {
          open: "<i class='fa-solid fa-clock'></i>",
          inProgress: "<i class='fa-solid fa-screwdriver-wrench'></i>",
          done: "<i class='fa-solid fa-check'></i>"
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
// TASKS.JS – Teil 4: Löschen mit Modal & Initialisierung

function attachDeleteHandler() {
  const modal = document.getElementById("confirmModal");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      modal.classList.remove("hidden");

      const onConfirm = async () => {
        try {
          await deleteDoc(doc(db, "tasks", id));
          await addAuditLog(auth.currentUser.email, "task_delete", `Task: ${id}`);
          showFeedback(t("tasks.delete"), "success");
          await loadTasks();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          showFeedback(t("errors.fail"), "error");
        } finally {
          modal.classList.add("hidden");
          confirmYes.removeEventListener("click", onConfirm);
        }
      };

      confirmYes.addEventListener("click", onConfirm, { once: true });
      confirmNo.addEventListener("click", () => modal.classList.add("hidden"), { once: true });
    });
  });
}

// Initialisierung & Logout
loadTasks();
document.querySelector(".logout-btn")?.addEventListener("click", logout);
