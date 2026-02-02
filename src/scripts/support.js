// ======================================================================
// 🔥 SUPPORT.JS – FINAL VERSION (Teil 1)
// Gaming of Republic – Support Center
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole, getUserRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { addAuditLog } from "./auditHandler.js";   // ⭐ NEU
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

const ticketMessages = document.getElementById("ticketMessages"); // ⭐ NEU (Detail‑Ansicht)

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
    const ref = await addDoc(collection(db, "supportTickets"), {
      title,
      message,
      priority,
      status: "open",
      createdBy: currentUser.email,
      createdByUid: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // ⭐ AUDIT LOG
    await addAuditLog(currentUser.email, "support_create_ticket", `Ticket: ${ref.id}`);

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
      <td class="ticketTitle clickable" data-id="${id}">${data.title}</td>
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
  attachDetailHandler(); // ⭐ NEU
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

        // ⭐ AUDIT LOG
        await addAuditLog(currentUser.email, "support_change_status", `Ticket: ${id}, Status: ${newStatus}`);

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
// 🔹 Kommentar Modal öffnen + Kommentare laden
// ======================================================================
function attachCommentHandler() {
  document.querySelectorAll(".commentBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      commentTicketId.value = id;

      await loadComments(id); // ⭐ NEU
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
// 🔹 Kommentare laden (Chat‑Bubbles)
// ======================================================================
async function loadComments(ticketId) {
  if (!ticketMessages) return;

  ticketMessages.innerHTML = "";

  const q = query(
    collection(db, "supportTickets", ticketId, "comments"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const c = docSnap.data();

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");
    if (c.author === currentUser.email) bubble.classList.add("self");

    bubble.innerHTML = `
      <div class="message-author">${c.author}</div>
      <div class="message-text">${c.text}</div>
      <div class="message-time">${c.createdAt?.toDate().toLocaleString("de-CH")}</div>
    `;

    ticketMessages.appendChild(bubble);
  });
}

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

    // ⭐ AUDIT LOG
    await addAuditLog(currentUser.email, "support_add_comment", `Ticket: ${id}`);

    showFeedback(t("support.commentAdded"), "success");

    commentText.value = "";
    await loadComments(id); // ⭐ Live‑Reload

  } catch (err) {
    console.error("❌ Fehler beim Kommentar:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// ======================================================================
// 🔹 Ticket Detail Ansicht (Titel anklicken)
// ======================================================================
function attachDetailHandler() {
  document.querySelectorAll(".ticketTitle").forEach(title => {
    title.addEventListener("click", async () => {
      const id = title.dataset.id;

      const snap = await getDoc(doc(db, "supportTickets", id));
      const data = snap.data();

      showFeedback(`📄 Ticket geöffnet: ${data.title}`, "success");

      commentTicketId.value = id;
      await loadComments(id);

      commentModal.classList.add("open");
    });
  });
}

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

          // ⭐ AUDIT LOG
          await addAuditLog(currentUser.email, "support_delete_ticket", `Ticket: ${id}`);

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
