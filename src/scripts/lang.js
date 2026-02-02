// lang.js – Mehrsprachigkeit für DE-CH, EN, FR-CH (modernisiert + stabilisiert)

export const LANG = {
  de: {
    languageName: "Deutsch (Schweiz)",
    system: { ready: "Alles klar, los geht’s.", saved: "Speichern abgeschlossen.", error: "Ups… da ging was schief." },
    auth: { login: "Einloggen", email: "E‑Mail", password: "Passwort eingeben", in: "Du bist jetzt drin.", out: "Du bist jetzt draussen." },
    nav: { dashboard: "Dashboard", employees: "Mitarbeiter", products: "Produkte", tasks: "Aufgaben", time: "Zeit", support: "Support", admin: "Admin" },
    roles: { admin: "Administrator", manager: "Manager", support: "Support", employee: "Mitarbeiter", guest: "Gast" },
    admin: { createUser: "Neuen Benutzer erstellen", deleteUser: "Benutzer löschen", changeRole: "Rolle ändern", saved: "Alles gespeichert.", confirm: "Bist du sicher?" },
    dashboard: { overview: "Übersicht", totalProducts: "Total Produkte", totalEmployees: "Total Mitarbeiter", totalTasks: "Total Aufgaben", totalHours: "Total Stunden" },
    employees: { name: "Name", email: "E‑Mail", phone: "Telefon", address: "Adresse", birthday: "Geburtstag", id: "Mitarbeiter‑Nr.", edit: "Bearbeiten", delete: "Löschen" },
    products: { name: "Produktname", stock: "Bestand", price: "Preis", category: "Kategorie" },
    tasks: { title: "Titel", description: "Beschreibung", status: "Status", priority: "Priorität", due: "Fällig am" },
    time: { hours: "Stunden", date: "Datum", comment: "Kommentar" },
    support: { create: "Ticket erstellen", reply: "Antwort hinzufügen", open: "Offen", progress: "In Bearbeitung", done: "Erledigt" },
    errors: { fail: "Das hat nicht geklappt.", retry: "Bitte nochmals versuchen.", load: "Daten konnten nicht geladen werden." },
    feedback: { ok: "Alles gut.", warn: "Achtung…", err: "Fehler." }
  },

  en: {
    languageName: "English",
    system: { ready: "Alright, let’s go.", saved: "Saved.", error: "Oops… something went wrong." },
    auth: { login: "Sign in", email: "Email", password: "Enter your password", in: "You’re in.", out: "You’re out." },
    nav: { dashboard: "Dashboard", employees: "Employees", products: "Products", tasks: "Tasks", time: "Time", support: "Support", admin: "Admin" },
    roles: { admin: "Administrator", manager: "Manager", support: "Support", employee: "Employee", guest: "Guest" },
    admin: { createUser: "Create new user", deleteUser: "Delete user", changeRole: "Change role", saved: "All set.", confirm: "Are you sure?" },
    dashboard: { overview: "Overview", totalProducts: "Total products", totalEmployees: "Total employees", totalTasks: "Total tasks", totalHours: "Total hours" },
    employees: { name: "Name", email: "Email", phone: "Phone", address: "Address", birthday: "Birthday", id: "Employee ID", edit: "Edit", delete: "Delete" },
    products: { name: "Product name", stock: "Stock", price: "Price", category: "Category" },
    tasks: { title: "Title", description: "Description", status: "Status", priority: "Priority", due: "Due date" },
    time: { hours: "Hours", date: "Date", comment: "Comment" },
    support: { create: "Create ticket", reply: "Add reply", open: "Open", progress: "In progress", done: "Done" },
    errors: { fail: "That didn’t work.", retry: "Try again.", load: "Couldn’t load data." },
    feedback: { ok: "All good.", warn: "Heads up…", err: "Error." }
  },

  fr: {
    languageName: "Français (Suisse)",
    system: { ready: "C’est parti.", saved: "Enregistré.", error: "Oups… un problème est survenu." },
    auth: { login: "Connexion", email: "E-mail", password: "Entre ton mot de passe", in: "Tu es connecté.", out: "Tu es déconnecté." },
    nav: { dashboard: "Tableau de bord", employees: "Employés", products: "Produits", tasks: "Tâches", time: "Temps", support: "Support", admin: "Admin" },
    roles: { admin: "Administrateur", manager: "Manager", support: "Support", employee: "Employé", guest: "Invité" },
    admin: { createUser: "Créer un nouvel utilisateur", deleteUser: "Supprimer l’utilisateur", changeRole: "Changer le rôle", saved: "C’est bon.", confirm: "Tu es sûr ?" },
    dashboard: { overview: "Vue d’ensemble", totalProducts: "Total produits", totalEmployees: "Total employés", totalTasks: "Total tâches", totalHours: "Total heures" },
    employees: { name: "Nom", email: "E-mail", phone: "Téléphone", address: "Adresse", birthday: "Anniversaire", id: "No d’employé", edit: "Modifier", delete: "Supprimer" },
    products: { name: "Nom du produit", stock: "Stock", price: "Prix", category: "Catégorie" },
    tasks: { title: "Titre", description: "Description", status: "Statut", priority: "Priorité", due: "Échéance" },
    time: { hours: "Heures", date: "Date", comment: "Commentaire" },
    support: { create: "Créer un ticket", reply: "Ajouter une réponse", open: "Ouvert", progress: "En cours", done: "Terminé" },
    errors: { fail: "Ça n’a pas fonctionné.", retry: "Réessaie.", load: "Impossible de charger les données." },
    feedback: { ok: "Tout bon.", warn: "Attention…", err: "Erreur." }
  }
};

// -------------------------------------------------------------
// 🔥 Sprachsystem 2.0 – stabil, schnell, fehlertolerant
// -------------------------------------------------------------

export let currentLang = localStorage.getItem("lang") || "de";

// 🔹 Sprache setzen
export function setLang(langCode) {
  if (!LANG[langCode]) {
    console.warn(`⚠️ Sprache '${langCode}' existiert nicht – fallback auf 'de'`);
    langCode = "de";
  }
  currentLang = langCode;
  localStorage.setItem("lang", langCode);
}

// 🔹 Sprache abrufen
export function getLang() {
  return currentLang;
}

// 🔹 Deep‑Lookup + Fallback + Debug
export function t(path) {
  if (!path || typeof path !== "string") return "";

  const parts = path.split(".");
  let value = LANG[currentLang];

  for (const p of parts) {
    if (!value || typeof value !== "object" || !(p in value)) {
      console.warn(`⚠️ Missing translation key: '${path}' in '${currentLang}'`);
      return path; // Fallback: Key anzeigen
    }
    value = value[p];
  }

  return typeof value === "string" ? value : path;
}
