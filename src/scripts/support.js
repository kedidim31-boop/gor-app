// ======================================================================
// 🔥 SUPPORT.JS – Gaming of Republic (optimiert & angepasst)
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole, getUserRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { auth, db } = initFirebase();

// Zugriff
enforceRole(["admin", "manager", "support"], "login.html");

// DOM
const ticketForm = document.getElementById("ticketForm");
const tableBody = document.querySelector("#supportTable tbody");

const commentModal = document.getElementById("commentModal");
const commentForm = document.getElementById("commentForm");
const commentTicketId = document.getElementById("commentTicketId");
const commentText = document.getElementById("commentText");

// User + Rolle
let currentUser = null;
let currentRole = null;

auth.onAuthStateChanged(async user => {
  if (!user) return;
  currentUser = user;
  currentRole = await getUserRole(user.uid);
});

// ======================================================================
// 🔹 Ticket erstellen
// ======================================================================
ticketForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const title = ticketTitle.value.trim();
  const message = ticketMessage.value.trim();
  const priority = ticketPriority.value;

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
      createdBy: currentUser.email,
      createdByUid: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    ticketForm.reset();
    showFeedback(t("feedback.ok"), "success");
    loadTickets();

  } catch (err) {
    console.error("❌ Fehler beim Erstellen:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// ======================================================================
// 🔹 Tickets laden
// ======================================================================
async function loadTickets() {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const q = query(
    collection(db, "supportTickets"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.dataset.status = data.status;

    row.innerHTML = `
      <td>${data.title}</td>
      <td>${data.message}</td>
      <td>${renderPriorityBadge(data.priority)}</td>

      <td>
        ${renderStatusBadge(data.status)}
        <br>
        ${renderStatusSelect(id, data.status)}
      </td>

      <td>
        <button class="commentBtn btn-blue" data-id="${id}">
          <i class="fa-solid fa-comment"></i>
        </button>
      </td>

      <td>
        ${renderDeleteButton(id)}
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachStatusHandler();
  attachCommentHandler();
  attachDeleteHandler();
}

// ======================================================================
// 🔹 Renderer: Status Badge
// ======================================================================
function renderStatusBadge(status) {
  return `
    <span class="status-badge ${status}">
      ${t(`support.${status}`)}
    </span>
  `;
}

// ======================================================================
// 🔹 Renderer: Priority Badge
// ======================================================================
function renderPriorityBadge(priority) {
  return `
    <span class="priority-badge priority-${priority}">
      ${t(`support.${priority}`)}
    </span>
  `;
}

// ======================================================================
// 🔹 Renderer: Status Select (Rollen‑abhängig)
// ======================================================================
function renderStatusSelect(id, status) {
  if (currentRole === "guest") return "";

  return `
    <select data-id="${id}" class="statusSelect">
      <option value="open" ${status === "open" ? "selected" : ""}>${t("support.open")}</option>
      <option value="inProgress" ${status === "inProgress" ? "selected" : ""}>${t("support.inProgress")}</option>
      <option value="closed" ${status === "closed" ? "selected" : ""}>${t("support.closed")}</option>
    </select>
  `;
}

// ======================================================================
// 🔹 Renderer: Delete Button (nur Admin/Manager)
// ======================================================================
function renderDeleteButton(id) {
  if (currentRole === "support") {
    return `<span style="opacity:0.4;">—</span>`;
  }

  return `
    <button class="deleteBtn btn btn-red" data-id="${id}">
      <i class="fa-solid fa-trash"></i>
    </button>
  `;
}
// ======================================================================
// 🔹 Status ändern
// ======================================================================
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

// ======================================================================
// 🔹 Kommentar Modal öffnen
// ======================================================================
function attachCommentHandler() {
  document.querySelectorAll(".commentBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      commentTicketId.value = btn.dataset.id;
      commentModal.classList.add("open");
    });
  });
}

document.getElementById("closeCommentModal")?.addEventListener("click", () => {
  commentModal.classList.remove("open");
});

// ESC schließen
document.addEventListener("keydown", e => {
  if (e.key === "Escape") commentModal.classList.remove("open");
});

// ======================================================================
// 🔹 Kommentar speichern
// ======================================================================
commentForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const id = commentTicketId.value;
  const text = commentText.value.trim();

  if (!text) {
    showFeedback(t("errors.fail"), "error");
    return;
  }

  try {
    await addDoc(collection(db, "supportTickets", id, "comments"), {
      text,
      author: currentUser.email,
      createdAt: serverTimestamp()
    });

    showFeedback(t("support.commentAdded"), "success");

    commentModal.classList.remove("open");
    commentForm.reset();
    loadTickets();

  } catch (err) {
    console.error("❌ Fehler beim Kommentar:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// ======================================================================
// 🔹 Ticket löschen
// ======================================================================
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      const confirmHandler = async () => {
        try {
          await deleteDoc(doc(db, "supportTickets", id));
          showFeedback(t("support.delete"), "success");
          loadTickets();
        } catch (err) {
          console.error("❌ Fehler beim Löschen:", err);
          showFeedback(t("errors.fail"), "error");
        }
      };

      btn.addEventListener("click", confirmHandler, { once: true });
    });
  });
}

// ======================================================================
// 🔹 Initial Load
// ======================================================================
loadTickets();

// ======================================================================
// 🔹 Logout
// ======================================================================
document.querySelector(".logout-btn")?.addEventListener("click", logout);
