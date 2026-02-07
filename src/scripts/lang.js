// ======================================================================
// 🔥 lang.js – FINAL VERSION (Teil 1)
// Vollständig erweitert für AdminPanel, Support, SLA, Dashboard, Disable-System
// ======================================================================

export const LANG = {
  // ============================================================
  // 🇩🇪 Deutsch (Schweiz)
  // ============================================================
  de: {
    languageName: "Deutsch (Schweiz)",

    system: {
      ready: "Alles klar, los geht’s.",
      saved: "Speichern abgeschlossen.",
      error: "Ups… da ging was schief.",
      loading: "Lade Daten…",
      noData: "Keine Daten gefunden."
    },

    auth: {
      login: "Einloggen",
      email: "E‑Mail",
      password: "Passwort eingeben",
      in: "Du bist jetzt drin.",
      out: "Du bist jetzt draussen.",
      disabled: "Dein Konto ist deaktiviert."
    },

    nav: {
      dashboard: "Dashboard",
      employees: "Mitarbeiter",
      products: "Produkte",
      tasks: "Aufgaben",
      time: "Zeit",
      support: "Support",
      admin: "Admin",
      logout: "Logout"
    },

    roles: {
      admin: "Administrator",
      manager: "Manager",
      support: "Support",
      employee: "Mitarbeiter",
      guest: "Gast"
    },

    admin: {
      createUser: "Neuen Benutzer erstellen",
      deleteUser: "Benutzer löschen",
      changeRole: "Rolle ändern",
      saved: "Alles gespeichert.",
      confirm: "Bist du sicher?",
      emailInUse: "Diese E‑Mail wird bereits verwendet.",
      invalidEmail: "Ungültige E‑Mail-Adresse.",
      weakPassword: "Passwort ist zu schwach.",
      auditLog: "Audit Log",
      refresh: "Aktualisieren",
      searchAudit: "Suche im Audit Log…"
    },

    dashboard: {
      overview: "Übersicht",
      totalProducts: "Total Produkte",
      totalEmployees: "Total Mitarbeiter",
      totalTasks: "Total Aufgaben",
      totalHours: "Total Stunden",
      totalTickets: "Total Tickets"
    },

    employees: {
      name: "Name",
      email: "E‑Mail",
      phone: "Telefon",
      address: "Adresse",
      birthday: "Geburtstag",
      id: "Mitarbeiter‑Nr.",
      edit: "Bearbeiten",
      delete: "Löschen",
      disable: "Deaktivieren",
      enable: "Aktivieren",
      disabled: "Deaktiviert",
      enabled: "Aktiv",
      active: "Aktiv",
      role: "Rolle",
      status: "Status"
    },

    products: {
      name: "Produktname",
      stock: "Bestand",
      price: "Preis",
      category: "Kategorie",
      updateStock: "Bestand aktualisieren"
    },

    tasks: {
      title: "Titel",
      description: "Beschreibung",
      status: "Status",
      priority: "Priorität",
      due: "Fällig am",
      updateStatus: "Status ändern",
      open: "Offen",
      inProgress: "In Bearbeitung",
      done: "Erledigt",
      delete: "Löschen"
    },

    time: {
      hours: "Stunden",
      date: "Datum",
      start: "Startzeit",
      end: "Endzeit",
      comment: "Kommentar",
      add: "Zeit erfassen",
      running: "Läuft",
      paused: "Pausiert",
      stopped: "Gestoppt"
    },
    support: {
      newTicket: "Neues Ticket",
      titleLabel: "Titel",
      titlePlaceholder: "Kurzer Titel",
      message: "Nachricht",
      messagePlaceholder: "Beschreibe das Problem…",
      priority: "Priorität",
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      createTicket: "Ticket erstellen",

      ticketOverview: "Tickets",
      searchPlaceholder: "Suche nach Titel / Nachricht …",

      open: "Offen",
      inProgress: "In Bearbeitung",
      closed: "Geschlossen",

      comment: "Kommentar",
      addComment: "Kommentar hinzufügen",
      commentPlaceholder: "Kommentar schreiben…",
      commentAdded: "Kommentar gespeichert.",

      delete: "Löschen",

      dashboard: "Support Dashboard",
      kpiOpen: "Offene Tickets",
      kpiInProgress: "In Bearbeitung",
      kpiClosed24h: "Geschlossen (24h)",
      kpiOverSla: "Über SLA",

      slaLow: "SLA Low: 72h",
      slaMedium: "SLA Medium: 48h",
      slaHigh: "SLA High: 24h"
    },

    errors: {
      fail: "Das hat nicht geklappt.",
      retry: "Bitte nochmals versuchen.",
      load: "Daten konnten nicht geladen werden.",
      permissionDenied: "Keine Berechtigung."
    },

    feedback: {
      ok: "Alles gut.",
      warn: "Achtung…",
      err: "Fehler."
    }
  }
};

// ======================================================================
// 🔥 Sprachsystem 2.0 – stabil, schnell, fehlertolerant
// ======================================================================

export let currentLang = localStorage.getItem("lang") || "de";

export function setLang(langCode) {
  if (!LANG[langCode]) {
    console.warn(`⚠️ Sprache '${langCode}' existiert nicht – fallback auf 'de'`);
    langCode = "de";
  }
  currentLang = langCode;
  localStorage.setItem("lang", langCode);
}

export function getLang() {
  return currentLang;
}

export function t(path) {
  if (!path || typeof path !== "string") return "";

  const parts = path.split(".");
  let value = LANG[currentLang];

  for (const p of parts) {
    if (!value || typeof value !== "object" || !(p in value)) {
      console.warn(`⚠️ Missing translation key: '${path}' in '${currentLang}'`);
      return path;
    }
    value = value[p];
  }

  return typeof value === "string" ? value : path;
}
