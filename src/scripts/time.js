// TIME.JS – Teil 1: Setup, Timer-State & AutoSave

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t, updateTranslations } from "./lang.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase & Zugriff
const { db } = initFirebase();
enforceRole(["admin", "manager", "support", "employee"], "login.html");
updateTranslations();

// DOM-Elemente
const timeForm       = document.getElementById("timeForm");
const startInput     = document.getElementById("startTime");
const endInput       = document.getElementById("endTime");
const hoursInput     = document.getElementById("hoursWorked");
const employeeInput  = document.getElementById("employeeName");
const dateInput      = document.getElementById("workDate");
const descInput      = document.getElementById("workDescription");

const liveTimerEl    = document.getElementById("liveTimer");
const timerStatusEl  = document.querySelector(".timer-status");

const startBtn       = document.getElementById("startTimerBtn");
const stopBtn        = document.getElementById("stopTimerBtn");
const resetBtn       = document.getElementById("resetTimerBtn");

document.querySelector(".logout-btn")?.addEventListener("click", logout);

// Timer-State & Draft
const TIMER_KEY = "gor_time_timer_state";
const DRAFT_KEY = "gor_time_form_draft";

let timerState = { isRunning: false, startTimestamp: null };
let timerInterval = null;

// Timer-Status laden
function loadTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.isRunning && parsed?.startTimestamp) {
      timerState = parsed;
      resumeTimerFromState();
    }
  } catch (e) {
    console.warn("⚠️ Timer-State konnte nicht geladen werden:", e);
  }
}

function saveTimerState() {
  localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
}

// Form-Draft laden/speichern
function loadFormDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (employeeInput) employeeInput.value = draft.employee || "";
    if (dateInput) dateInput.value = draft.date || "";
    if (descInput) descInput.value = draft.description || "";
  } catch (e) {
    console.warn("⚠️ Form-Draft konnte nicht geladen werden:", e);
  }
}

function saveFormDraft() {
  const draft = {
    employee: employeeInput?.value || "",
    date: dateInput?.value || "",
    description: descInput?.value || ""
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
// TIME.JS – Teil 2: Timer-Logik & Anzeige

function updateTimerDisplay() {
  if (!liveTimerEl || !timerState.startTimestamp) return;
  const diffMs = Date.now() - timerState.startTimestamp;
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  liveTimerEl.textContent = `${h}:${m}:${s}`;
}

function setTimerStatus(status) {
  if (!timerStatusEl) return;
  timerStatusEl.classList.remove("timer-running", "timer-paused", "timer-stopped");
  timerStatusEl.classList.add(`timer-${status}`);
  timerStatusEl.textContent = t(`time.${status}`) || status;
}

function startTimer() {
  if (timerState.isRunning) return;
  const now = new Date();
  timerState = { isRunning: true, startTimestamp: now.getTime() };
  saveTimerState();

  if (startInput && !startInput.value) {
    startInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
  if (dateInput && !dateInput.value) {
    dateInput.value = now.toISOString().split("T")[0];
  }

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
  updateTimerDisplay();
  setTimerStatus("running");
  showFeedback(t("time.timerStarted"), "success");
}

function stopTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  saveTimerState();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;

  const now = new Date();
  if (endInput) {
    endInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  calculateHours();
  setTimerStatus("paused");
  showFeedback(t("time.timerStopped"), "warning");
}

function resetTimer() {
  timerState = { isRunning: false, startTimestamp: null };
  saveTimerState();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  if (liveTimerEl) liveTimerEl.textContent = "00:00:00";
  setTimerStatus("stopped");
}

function resumeTimerFromState() {
  if (!timerState.isRunning || !timerState.startTimestamp) return;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
  updateTimerDisplay();
  setTimerStatus("running");
}
// TIME.JS – Teil 3: Stunden berechnen, speichern & laden

// Stunden berechnen
function calculateHours() {
  if (!startInput || !endInput || !hoursInput) return;
  const [sh, sm] = (startInput.value || "").split(":").map(Number);
  const [eh, em] = (endInput.value || "").split(":").map(Number);
  const diff = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  hoursInput.value = diff > 0 ? diff.toFixed(2) : "0.00";
}

// AutoSave bei Eingaben
startInput?.addEventListener("change", () => { calculateHours(); saveFormDraft(); });
endInput?.addEventListener("change", () => { calculateHours(); saveFormDraft(); });
employeeInput?.addEventListener("input", saveFormDraft);
dateInput?.addEventListener("change", saveFormDraft);
descInput?.addEventListener("input", saveFormDraft);

// Datumsformat CH
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}

// Stunden-Badge
function getHoursBadgeClass(hours) {
  const h = Number(hours || 0);
  if (h <= 8) return "hours-ok";
  if (h <= 10) return "hours-warning";
  return "hours-overtime";
}

// Zeiterfassung speichern
timeForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const employee = employeeInput?.value.trim() || "";
  const date = dateInput?.value || "";
  const start = startInput?.value || "";
  const end = endInput?.value || "";
  const hours = parseFloat(hoursInput?.value || "0") || 0;
  const description = descInput?.value.trim() || "";

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

    timeForm.reset();
    resetTimer();
    localStorage.removeItem(DRAFT_KEY);

    await loadTimeEntries();
    showFeedback(t("feedback.ok"), "success");
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    showFeedback(t("errors.fail"), "error");
  }
});
// TIME.JS – Teil 4: Einträge löschen, Timer-Buttons & Initialisierung

// Zeiteinträge laden
async function loadTimeEntries() {
  const tableBody = document.querySelector("#timeTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "timeEntries"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const hours = Number(data.hours || 0);
    const badgeClass = getHoursBadgeClass(hours);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.employee || "-"}</td>
      <td>${formatDate(data.date)}</td>
      <td>${data.start || "-"}</td>
      <td>${data.end || "-"}</td>
      <td>
        <span class="hours-badge ${badgeClass}">
          ${hours.toFixed(2)}
        </span>
      </td>
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

// Löschen mit Modal
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
          await deleteDoc(doc(db, "timeEntries", id));
          showFeedback(t("time.delete"), "success");
          await loadTimeEntries();
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

// Timer-Buttons
startBtn?.addEventListener("click", e => {
  e.preventDefault();
  startTimer();
});

stopBtn?.addEventListener("click", e => {
  e.preventDefault();
  stopTimer();
});

resetBtn?.addEventListener("click", e => {
  e.preventDefault();
  resetTimer();
});

// Initialisierung
loadFormDraft();
loadTimerState();
loadTimeEntries();
setTimerStatus("stopped");

if (liveTimerEl && !liveTimerEl.textContent) {
  liveTimerEl.textContent = "00:00:00";
}
