// ======================================================================
// 🔔 NOTIFICATIONS – Sprachfähige Finalversion mit Rollenfilter & Live-Badge
// ======================================================================

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { showFeedback } from "./feedback.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const { db, auth } = initFirebase();

// -------------------------------------------------------------
// 🔐 Zugriff & Sprache
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");
updateTranslations();

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const notifBell   = document.getElementById("notifBell");
const notifBadge  = document.getElementById("notifBadge");
const notifList   = document.getElementById("notifList");

// -------------------------------------------------------------
// 🔔 Notification erstellen (z. B. bei Systemereignissen)
// -------------------------------------------------------------
export async function createNotification(title, message, role = "all") {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      role,
      readBy: [],
      createdAt: serverTimestamp()
    });
    console.log("🔔 Notification erstellt:", title);
  } catch (err) {
    console.error("❌ Fehler beim Erstellen:", err);
  }
}

// -------------------------------------------------------------
// 📥 Notifications laden & anzeigen
// -------------------------------------------------------------
async function loadNotifications() {
  if (!notifList) return;
  const user = auth.currentUser;
  if (!user) return;

  const role = document.body.dataset.role || "guest";
  notifList.innerHTML = "";

  try {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    let unreadCount = 0;

    snapshot.forEach(docSnap => {
      const n = docSnap.data();
      if (n.role !== "all" && n.role !== role) return;

      const isRead = n.readBy?.includes(user.uid);
      if (!isRead) unreadCount++;

      const item = document.createElement("div");
      item.className = `notif-item ${isRead ? "read" : "unread"}`;
      item.innerHTML = `
        <div class="notif-title">${n.title}</div>
        <div class="notif-message">${n.message}</div>
        <div class="notif-time">${formatTime(n.createdAt)}</div>
        <button class="markReadBtn" data-id="${docSnap.id}">
          <i class="fa-solid fa-check"></i> ${t("notifications.markRead")}
        </button>
        <button class="deleteNotifBtn btn btn-red" data-id="${docSnap.id}">
          <i class="fa-solid fa-trash"></i> ${t("notifications.delete")}
        </button>
      `;
      notifList.appendChild(item);
    });

    notifBadge.textContent = unreadCount > 0 ? unreadCount : "";
    attachMarkReadHandler();
    attachDeleteHandler();

  } catch (err) {
    console.error("❌ Fehler beim Laden der Notifications:", err);
    showFeedback(t("errors.fail"), "error");
  }
}

// -------------------------------------------------------------
// 🕒 Zeitformat (CH)
// -------------------------------------------------------------
function formatTime(ts) {
  if (!ts?.toDate) return "-";
  return ts.toDate().toLocaleString("de-CH");
}
// -------------------------------------------------------------
// ✅ Notification als gelesen markieren
// -------------------------------------------------------------
function attachMarkReadHandler() {
  document.querySelectorAll(".markReadBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const user = auth.currentUser;
      if (!user) return;

      try {
        const notifRef = doc(db, "notifications", id);
        const notifSnap = await getDocs(collection(db, "notifications"));

        let readBy = [];
        notifSnap.forEach(docSnap => {
          if (docSnap.id === id) {
            readBy = docSnap.data().readBy || [];
          }
        });

        if (!readBy.includes(user.uid)) {
          readBy.push(user.uid);
          await updateDoc(notifRef, { readBy });
        }

        showFeedback(t("notifications.marked"), "success");
        loadNotifications();

      } catch (err) {
        console.error("❌ Fehler beim Markieren als gelesen:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🗑️ Notification löschen (mit Bestätigung)
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteNotifBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmed = confirm(t("admin.confirm"));

      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "notifications", id));
        showFeedback(t("notifications.delete"), "success");
        loadNotifications();
      } catch (err) {
        console.error("❌ Fehler beim Löschen der Notification:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔔 Glocke toggelt Dropdown
// -------------------------------------------------------------
notifBell?.addEventListener("click", () => {
  notifList?.classList.toggle("open");
});

// -------------------------------------------------------------
// 🚀 Initial laden & Auto-Refresh
// -------------------------------------------------------------
loadNotifications();
setInterval(loadNotifications, 15000); // alle 15 Sekunden aktualisieren
