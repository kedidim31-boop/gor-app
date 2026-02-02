// ======================================================================
// 🔥 SUPPORT.JS – Gaming of Republic (komplett neu & optimiert)
// Mehrsprachig, Neon‑UI, Rollen‑Logik, Kommentare, Badges
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

// ======================================================================
// 🔹 Zugriff: Admin, Manager, Support
// ======================================================================
enforceRole(["admin", "manager", "support"], "login.html");

// ======================================================================
// 🔹 DOM Elemente
// ======================================================================
const ticketForm = document.getElementById("ticketForm");
const tableBody = document.querySelector("#supportTable tbody");

const commentModal = document.getElementById("commentModal");
const commentForm = document.getElementById("commentForm");
const commentTicketId = document.getElementById("commentTicketId");
const commentText = document.getElementById("commentText");

// ======================================================================
// 🔹 User + Rolle laden
// ======================================================================
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
    row.classList.add(`status-${data.status}`);

    row.innerHTML = `
      <td>${data.title}</td>
      <td>${data.message}</td>
      <td>${renderPriorityBadge(data.priority)}</td>

      <td>
        ${renderStatusBadge(data.status)}
        <br>
        <select data-id="${id}" class="statusSelect">
          <option value="open" ${data.status === "open" ? "selected" : ""}>${t("support.open")}</option>
          <option value="inProgress" ${data.status === "inProgress" ? "selected" : ""}>${t("support.inProgress")}</option>
          <option value="closed" ${data.status === "closed" ? "selected" : ""}>${t("support.closed")}</option>
        </select>
      </td>

      <td>
        <button class="commentBtn btn btn-turquoise" data-id="${id}">
          <i class="fa-solid fa-comment"></i> ${t("support.comment")}
        </button>
      </td>

      <td>
        <button class="deleteBtn btn btn-red" data-id="${id}">
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

// ======================================================================
// 🔹 Status-Badge Renderer
// ======================================================================
function renderStatusBadge(status) {
  const icons = {
    open: "fa-envelope-open-text",
    inProgress: "fa-spinner",
    closed: "fa-check"
  };

  return `
    <span class="status-badge ${status}">
      <i class="fa-solid ${icons[status]}"></i>
      ${t(`support.${status}`)}
    </span>
  `;
}

// ======================================================================
// 🔹 Priorität-Badge Renderer
// ======================================================================
function renderPriorityBadge(priority) {
  const colors = {
    low: "badge-green",
    medium: "badge-yellow",
    high: "badge-red"
  };

  return `<span class="badge ${colors[priority]}">${t(`support.${priority}`)}</span>`;
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

// ======================================================================
// 🔹 Kommentar speichern (Sub‑Collection)
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

// ======================================================================
// 🔹 Initial Load
// ======================================================================
loadTickets();

// ======================================================================
// 🔹 Logout
// ======================================================================
document.querySelector(".logout-btn")?.addEventListener("click", logout);
