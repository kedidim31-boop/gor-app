import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db } = initFirebase();

// -------------------------------------------------------------
// 🔐 Zugriff & Sprache
// -------------------------------------------------------------
enforceRole(["admin", "manager"], "login.html");
updateTranslations();
document.querySelector(".logout-btn")?.addEventListener("click", logout);

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const tableBody = document.querySelector("#userTable tbody");
const modal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// -------------------------------------------------------------
// 👥 Benutzer laden
// -------------------------------------------------------------
async function loadUsers() {
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "employees"));

  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.name || "-"}</td>
      <td>${u.email || "-"}</td>
      <td>${u.phone || "-"}</td>
      <td>
        <select class="roleSelect" data-id="${id}">
          ${["admin", "manager", "support", "employee"].map(role => `
            <option value="${role}" ${u.role === role ? "selected" : ""}>
              ${t("roles." + role)}
            </option>`).join("")}
        </select>
      </td>
      <td>
        <button class="deleteBtn btn btn-red" data-id="${id}">
          <i class="fa-solid fa-trash"></i> ${t("users.delete")}
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachRoleHandler();
  attachDeleteHandler();
}

// -------------------------------------------------------------
// 🛠️ Rolle ändern
// -------------------------------------------------------------
function attachRoleHandler() {
  document.querySelectorAll(".roleSelect").forEach(select => {
    select.addEventListener("change", async () => {
      const id = select.dataset.id;
      const newRole = select.value;

      try {
        await updateDoc(doc(db, "employees", id), { role: newRole });
        showFeedback(t("users.roleUpdated"), "success");
      } catch (err) {
        console.error("❌ Fehler beim Rollenwechsel:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🗑️ Benutzer löschen mit Modal
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      modal.classList.remove("hidden");

      const onConfirm = async () => {
        try {
          await deleteDoc(doc(db, "employees", id));
          showFeedback(t("users.deleted"), "success");
          await loadUsers();
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

// -------------------------------------------------------------
// 🚀 Initial laden
// -------------------------------------------------------------
loadUsers();
