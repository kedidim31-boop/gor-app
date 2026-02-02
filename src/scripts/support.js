// src/scripts/support.js – Support-Ticket-System (mehrsprachig + optimiert)

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
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const ticketForm = document.getElementById("ticketForm");
const tableBody = document.querySelector("#supportTable tbody");

// -------------------------------------------------------------
// 🔹 Ticket erstellen
// -------------------------------------------------------------
ticketForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("ticketTitle").value.trim();
  const message = document.getElementById("ticketMessage").value.trim();
  const priority = document.getElementById("ticketPriority").value;

  if (!title || !message) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    await addDoc(collection(db, "supportTickets"), {
      title,
      message,
      priority,
      status: "open",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      comments: []
    });

    e.target.reset();
    loadTickets();
    showFeedback(t("feedback.ok"), "success");

  } catch (err) {
    console.error("❌ Fehler beim Erstellen des Tickets:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Tickets laden
// -------------------------------------------------------------
async function loadTickets() {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "supportTickets"));

  snapshot.forEach(docSnap => {
    const tData = docSnap.data();

    const statusIcons = {
      open: "<i class='fa-solid fa-envelope-open-text'></i>",
      inProgress: "<i class='fa-solid fa-spinner'></i>",
      closed: "<i class='fa-solid fa-check'></i>"
    };

    const row = document.createElement("tr");
    row.classList.add(`status-${tData.status}`);

    row.innerHTML = `
      <td>${tData.title || "-"}</td>
      <td>${tData.message || "-"}</td>
      <td>${tData.priority || "-"}</td>

      <td>
        <span class="status-badge status-${tData.status}">
          ${statusIcons[tData.status]} ${t(`support.${tData.status}`)}
        </span><br>

        <select data-id="${docSnap.id}" class="statusSelect">
          <option value="open" ${tData.status === "open" ? "selected" : ""}>${t("support.open")}</option>
          <option value="inProgress" ${tData.status === "inProgress" ? "selected" : ""}>${t("support.inProgress")}</option>
          <option value="closed" ${tData.status === "closed" ? "selected" : ""}>${t("support.closed")}</option>
        </select>
      </td>

      <td>
        <button class="commentBtn btn btn-blue" data-id="${docSnap.id}">
          <i class="fa-solid fa-comment"></i> ${t("support.comment")}
        </button>
      </td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("support.delete")}
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachStatusHandler();
  attachCommentHandler();
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
        await updateDoc(doc(db, "supportTickets", id), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        showFeedback(t("feedback.ok"), "success");
        loadTickets();

      } catch (err) {
        console.error("❌ Fehler beim Statuswechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Kommentar hinzufügen (Modal)
// -------------------------------------------------------------
function attachCommentHandler() {
  document.querySelectorAll(".commentBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      openCommentModal(id);
    });
  });
}

function openCommentModal(ticketId) {
  const modal = document.getElementById("commentModal");
  const idField = document.getElementById("commentTicketId");

  idField.value = ticketId;
  modal.classList.add("open");
}

document.getElementById("closeCommentModal")?.addEventListener("click", () => {
  document.getElementById("commentModal").classList.remove("open");
});

// -------------------------------------------------------------
// 🔹 Kommentar speichern
// -------------------------------------------------------------
document.getElementById("commentForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("commentTicketId").value;
  const text = document.getElementById("commentText").value.trim();

  if (!text) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    const ticketRef = doc(db, "supportTickets", id);
    const ticketSnap = await getDoc(ticketRef);

    const oldComments = ticketSnap.data().comments || [];

    await updateDoc(ticketRef, {
      comments: [...oldComments, { text, createdAt: serverTimestamp() }],
      updatedAt: serverTimestamp()
    });

    showFeedback(t("support.commentAdded"), "success");

    document.getElementById("commentModal").classList.remove("open");
    e.target.reset();
    loadTickets();

  } catch (err) {
    console.error("❌ Fehler beim Speichern des Kommentars:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

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
            await deleteDoc(doc(db, "supportTickets", id));
            showFeedback(t("support.delete"), "success");
            loadTickets();

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
loadTickets();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
