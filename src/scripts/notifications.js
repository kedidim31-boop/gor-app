// src/scripts/notifications.js – globales Benachrichtigungssystem (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

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
// 🔹 Zugriff: Alle eingeloggten Rollen
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support", "employee"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const notifBell = document.getElementById("notifBell");
const notifBadge = document.getElementById("notifBadge");
const notifList = document.getElementById("notifList");

// -------------------------------------------------------------
// 🔹 Notification erstellen (für System-Events)
// -------------------------------------------------------------
export async function createNotification(title, message, role = "all") {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      role, // "admin", "manager", "support", "employee", "all"
      readBy: [],
      createdAt: serverTimestamp()
    });

    console.log("🔔 Notification erstellt:", title);

  } catch (err) {
    console.error("❌ Fehler beim Erstellen der Notification:", err);
  }
}

// -------------------------------------------------------------
// 🔹 Notifications laden
// -------------------------------------------------------------
async function loadNotifications() {
  if (!notifList) return;

  const user = auth.currentUser;
  if (!user) return;

  // Rolle abrufen
  const role = document.body.dataset.role || "guest";

  notifList.innerHTML = "";

  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  let unreadCount = 0;

  snapshot.forEach(docSnap => {
    const n = docSnap.data();

    // Nur Notifications für diese Rolle anzeigen
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
}

// -------------------------------------------------------------
// 🔹 Zeitformat
// -------------------------------------------------------------
function formatTime(ts) {
  if (!ts) return "-";
  const date = ts.toDate();
  return date.toLocaleString("de-CH");
}

// -------------------------------------------------------------
// 🔹 Notification als gelesen markieren
// -------------------------------------------------------------
function attachMarkReadHandler() {
  document.querySelectorAll(".markReadBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const user = auth.currentUser;

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
        }

        await updateDoc(notifRef, { readBy });

        showFeedback(t("notifications.marked"), "success");
        loadNotifications();

      } catch (err) {
        console.error("❌ Fehler beim Markieren:", err);
        showFeedback(t("errors.fail"), "error");
      }
    });
  });
}

// -------------------------------------------------------------
// 🔹 Notification löschen (mit Bestätigung)
// -------------------------------------------------------------
function attachDeleteHandler() {
  document.querySelectorAll(".deleteNotifBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            await deleteDoc(doc(db, "notifications", id));
            showFeedback(t("notifications.delete"), "success");
            loadNotifications();

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
// 🔹 Glocke toggelt Dropdown
// -------------------------------------------------------------
notifBell?.addEventListener("click", () => {
  notifList.classList.toggle("open");
});

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadNotifications();
setInterval(loadNotifications, 15000); // alle 15 Sekunden aktualisieren
