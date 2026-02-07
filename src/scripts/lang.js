export const LANG = {
  // ============================================================
  // 🇩🇪 Deutsch (Schweiz)
  // ============================================================
  de: {
    languageName: "Deutsch (Schweiz)",
    system: { ready: "Alles klar, los geht’s.", saved: "Speichern abgeschlossen.", error: "Ups… da ging was schief.", loading: "Lade Daten…", noData: "Keine Daten gefunden." },
    auth: { login: "Einloggen", email: "E‑Mail", password: "Passwort eingeben", in: "Du bist jetzt drin.", out: "Du bist jetzt draussen.", disabled: "Dein Konto ist deaktiviert." },
    nav: { dashboard: "Dashboard", employees: "Mitarbeiter", products: "Produkte", tasks: "Aufgaben", time: "Zeit", support: "Support", admin: "Admin", logout: "Logout" },
    roles: { admin: "Administrator", manager: "Manager", support: "Support", employee: "Mitarbeiter", guest: "Gast" },
    admin: { createUser: "Neuen Benutzer erstellen", deleteUser: "Benutzer löschen", changeRole: "Rolle ändern", saved: "Alles gespeichert.", confirm: "Bist du sicher?", emailInUse: "Diese E‑Mail wird bereits verwendet.", invalidEmail: "Ungültige E‑Mail-Adresse.", weakPassword: "Passwort ist zu schwach.", auditLog: "Audit Log", refresh: "Aktualisieren", searchAudit: "Suche im Audit Log…" },
    dashboard: { overview: "Übersicht", totalProducts: "Total Produkte", totalEmployees: "Total Mitarbeiter", totalTasks: "Total Aufgaben", totalHours: "Total Stunden", totalTickets: "Total Tickets" },
    employees: { name: "Name", email: "E‑Mail", phone: "Telefon", address: "Adresse", birthday: "Geburtstag", id: "Mitarbeiter‑Nr.", edit: "Bearbeiten", delete: "Löschen", disable: "Deaktivieren", enable: "Aktivieren", disabled: "Deaktiviert", enabled: "Aktiv", active: "Aktiv", role: "Rolle", status: "Status" },
    products: { name: "Produktname", stock: "Bestand", price: "Preis", category: "Kategorie", updateStock: "Bestand aktualisieren" },
    tasks: { title: "Titel", description: "Beschreibung", status: "Status", priority: "Priorität", due: "Fällig am", updateStatus: "Status ändern", open: "Offen", inProgress: "In Bearbeitung", done: "Erledigt", delete: "Löschen" },
    time: { hours: "Stunden", date: "Datum", start: "Startzeit", end: "Endzeit", comment: "Kommentar", add: "Zeit erfassen", running: "Läuft", paused: "Pausiert", stopped: "Gestoppt" },
    support: { newTicket: "Neues Ticket", titleLabel: "Titel", titlePlaceholder: "Kurzer Titel", message: "Nachricht", messagePlaceholder: "Beschreibe das Problem…", priority: "Priorität", low: "Niedrig", medium: "Mittel", high: "Hoch", createTicket: "Ticket erstellen", ticketOverview: "Tickets", searchPlaceholder: "Suche nach Titel / Nachricht …", open: "Offen", inProgress: "In Bearbeitung", closed: "Geschlossen", comment: "Kommentar", addComment: "Kommentar hinzufügen", commentPlaceholder: "Kommentar schreiben…", commentAdded: "Kommentar gespeichert.", delete: "Löschen", dashboard: "Support Dashboard", kpiOpen: "Offene Tickets", kpiInProgress: "In Bearbeitung", kpiClosed24h: "Geschlossen (24h)", kpiOverSla: "Über SLA", slaLow: "SLA Low: 72h", slaMedium: "SLA Medium: 48h", slaHigh: "SLA High: 24h" },
    errors: { fail: "Das hat nicht geklappt.", retry: "Bitte nochmals versuchen.", load: "Daten konnten nicht geladen werden.", permissionDenied: "Keine Berechtigung." },
    feedback: { ok: "Alles gut.", warn: "Achtung…", err: "Fehler." }
  },

  // ============================================================
  // 🇬🇧 English
  // ============================================================
  en: {
    languageName: "English",
    system: { ready: "Alright, let’s go.", saved: "Saved.", error: "Oops… something went wrong.", loading: "Loading…", noData: "No data found." },
    auth: { login: "Sign in", email: "Email", password: "Enter your password", in: "You’re in.", out: "You’re out.", disabled: "Your account is disabled." },
    nav: { dashboard: "Dashboard", employees: "Employees", products: "Products", tasks: "Tasks", time: "Time", support: "Support", admin: "Admin", logout: "Logout" },
    roles: { admin: "Administrator", manager: "Manager", support: "Support", employee: "Employee", guest: "Guest" },
    admin: { createUser: "Create new user", deleteUser: "Delete user", changeRole: "Change role", saved: "All set.", confirm: "Are you sure?", emailInUse: "This email is already in use.", invalidEmail: "Invalid email address.", weakPassword: "Password is too weak.", auditLog: "Audit Log", refresh: "Refresh", searchAudit: "Search audit log…" },
    dashboard: { overview: "Overview", totalProducts: "Total products", totalEmployees: "Total employees", totalTasks: "Total tasks", totalHours: "Total hours", totalTickets: "Total tickets" },
    employees: { name: "Name", email: "Email", phone: "Phone", address: "Address", birthday: "Birthday", id: "Employee ID", edit: "Edit", delete: "Delete", disable: "Disable", enable: "Enable", disabled: "Disabled", enabled: "Active", active: "Active", role: "Role", status: "Status" },
    products: { name: "Product name", stock: "Stock", price: "Price", category: "Category", updateStock: "Update stock" },
    tasks: { title: "Title", description: "Description", status: "Status", priority: "Priority", due: "Due date", updateStatus: "Update status", open: "Open", inProgress: "In progress", done: "Done", delete: "Delete" },
    time: { hours: "Hours", date: "Date", start: "Start time", end: "End time", comment: "Comment", add: "Add time", running: "Running", paused: "Paused", stopped: "Stopped" }
  },
  fr: {
    languageName: "Français (Suisse)",
    system: { ready: "C’est parti.", saved: "Enregistré.", error: "Oups… un problème est survenu.", loading: "Chargement…", noData: "Aucune donnée trouvée." },
    auth: { login: "Connexion", email: "E-mail", password: "Entre ton mot de passe", in: "Tu es connecté.", out: "Tu es déconnecté.", disabled: "Ton compte est désactivé." },
    nav: { dashboard: "Tableau de bord", employees: "Employés", products: "Produits", tasks: "Tâches", time: "Temps", support: "Support", admin: "Admin", logout: "Déconnexion" },
    roles: { admin: "Administrateur", manager: "Manager", support: "Support", employee: "Employé", guest: "Invité" },
    admin: { createUser: "Créer un nouvel utilisateur", deleteUser: "Supprimer l’utilisateur", changeRole: "Changer le rôle", saved: "C’est bon.", confirm: "Tu es sûr ?", emailInUse: "Cet e-mail est déjà utilisé.", invalidEmail: "Adresse e-mail invalide.", weakPassword: "Mot de passe trop faible.", auditLog: "Journal d’audit", refresh: "Actualiser", searchAudit: "Rechercher dans le journal…" },
    dashboard: { overview: "Vue d’ensemble", totalProducts: "Total produits", totalEmployees: "Total employés", totalTasks: "Total tâches", totalHours: "Total heures", totalTickets: "Total tickets" },
    employees: { name: "Nom", email: "E-mail", phone: "Téléphone", address: "Adresse", birthday: "Anniversaire", id: "No d’employé", edit: "Modifier", delete: "Supprimer", disable: "Désactiver", enable: "Activer", disabled: "Désactivé", enabled: "Actif", active: "Actif", role: "Rôle", status: "Statut" },
    products: { name: "Nom du produit", stock: "Stock", price: "Prix", category: "Catégorie", updateStock: "Mettre à jour le stock" },
    tasks: { title: "Titre", description: "Description", status: "Statut", priority: "Priorité", due: "Échéance", updateStatus: "Modifier le statut", open: "Ouvert", inProgress: "En cours", done: "Terminé", delete: "Supprimer" },
    time: { hours: "Heures", date: "Date", start: "Heure de début", end: "Heure de fin", comment: "Commentaire", add: "Ajouter du temps", running: "En cours", paused: "En pause", stopped: "Arrêté" },
    support: { newTicket: "Nouveau ticket", titleLabel: "Titre", titlePlaceholder: "Titre court", message: "Message", messagePlaceholder: "Décris le problème…", priority: "Priorité", low: "Faible", medium: "Moyenne", high: "Haute", createTicket: "Créer un ticket", ticketOverview: "Tickets", searchPlaceholder: "Rechercher par titre / message…", open: "Ouvert", inProgress: "En cours", closed: "Fermé", comment: "Commentaire", addComment: "Ajouter un commentaire", commentPlaceholder: "Écrire un commentaire…", commentAdded: "Commentaire enregistré.", delete: "Supprimer", dashboard: "Tableau Support", kpiOpen: "Tickets ouverts", kpiInProgress: "En cours", kpiClosed24h: "Fermés (24h)", kpiOverSla: "Hors SLA", slaLow: "SLA Faible: 72h", slaMedium: "SLA Moyen: 48h", slaHigh: "SLA Élevé: 24h" },
    errors: { fail: "Ça n’a pas fonctionné.", retry: "Réessaie.", load: "Impossible de charger les données.", permissionDenied: "Permission refusée." },
    feedback: { ok: "Tout bon.", warn: "Attention…", err: "Erreur." }
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
