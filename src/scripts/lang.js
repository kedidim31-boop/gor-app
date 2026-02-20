// ======================================================================
// 🌐 Sprachdaten & Steuerung
// ======================================================================

export const LANG = {
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
      disabled: "Dein Konto ist deaktiviert.",
      skip: "Intro überspringen"
    },
    nav: {
      dashboard: "Dashboard",
      analysis: "Übersicht & Dashboard",
      employees: "Mitarbeiter",
      products: "Produkte",
      tasks: "Aufgaben",
      time: "Zeiterfassung",
      support: "Support",
      admin: "Admin Panel",
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
      analysis: "Übersicht & Dashboard",
      totalProducts: "Total Produkte",
      totalEmployees: "Total Mitarbeiter",
      totalTasks: "Total Aufgaben",
      totalHours: "Total Stunden",
      totalTickets: "Total Tickets",
      quickLinks: "Direktzugriff",
      quickProducts: "Verwalte deine Artikel und Bestände.",
      quickTasks: "Organisiere deine To‑Dos und Teamaufgaben.",
      quickTime: "Behalte deine Arbeitszeit im Blick.",
      quickEmployees: "Pflege und verwalte deine Teamdaten.",
      quickSupport: "Bearbeite Supportfälle und Tickets.",
      quickAdmin: "Verwalte Benutzer und Rollen.",
      openProducts: "Produktverwaltung öffnen",
      openTasks: "Aufgabenmanagement öffnen",
      openTime: "Zeiterfassung öffnen",
      openEmployees: "Mitarbeiterverwaltung öffnen",
      openSupport: "Support öffnen",
      openAdmin: "Admin Panel öffnen"
    },
    employees: {
      title: "Mitarbeiterverwaltung",
      new: "Neuen Mitarbeiter hinzufügen",
      overview: "Mitarbeiterübersicht",
      number: "Nummer",
      name: "Name",
      email: "E‑Mail",
      phone: "Telefon",
      address: "Adresse",
      birthday: "Geburtstag",
      id: "Mitarbeiter‑Nr.",
      role: "Rolle",
      status: "Status",
      save: "Mitarbeiter speichern",
      actions: "Aktionen",
      delete: "Löschen",
      edit: "Bearbeiten",
      disable: "Deaktivieren",
      enable: "Aktivieren",
      disabled: "Deaktiviert",
      enabled: "Aktiv",
      active: "Aktiv"
    },
    products: {
      title: "Produktverwaltung",
      add: "Neues Produkt hinzufügen",
      overview: "Produktübersicht",
      name: "Produktname",
      description: "Beschreibung",
      type: "Typ",
      vendor: "Anbieter",
      collections: "Kollektionen",
      sku: "SKU",
      ean: "EAN",
      stock: "Bestand",
      price: "Preis (CHF)",
      category: "Kategorie",
      updateStock: "Bestand aktualisieren",
      save: "Speichern",
      export: "Exportieren für Shopify",
      delete: "Löschen",
      actions: "Aktionen",
      deleteAll: "Alles löschen",
      confirmDelete: "Möchtest du dieses Produkt wirklich löschen?",
      confirmYes: "Ja, löschen",
      confirmNo: "Abbrechen",
      cancel: "Abbrechen",
      saved: "Produkt gespeichert.",
      edit: "Bearbeiten"
    },
    tasks: {
      title: "Aufgabenverwaltung",
      new: "Neue Aufgabe erstellen",
      overview: "Aufgabenübersicht",
      name: "Aufgabe",
      description: "Beschreibung",
      status: "Status",
      assignedTo: "Zugewiesen an",
      dueDate: "Fälligkeitsdatum",
      priority: "Priorität",
      save: "Aufgabe speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      actions: "Aktionen",
      completed: "Erledigt",
      open: "Offen"
    },
    time: {
      title: "Zeiterfassung",
      overview: "Zeiterfassungsübersicht",
      start: "Start",
      stop: "Stopp",
      duration: "Dauer",
      date: "Datum",
      project: "Projekt",
      note: "Notiz",
      save: "Zeit speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      actions: "Aktionen"
    },
    support: {
      title: "Support",
      new: "Neues Ticket erstellen",
      overview: "Supportübersicht",
      ticketId: "Ticket‑Nr.",
      subject: "Betreff",
      message: "Nachricht",
      status: "Status",
      assignedTo: "Bearbeiter",
      createdAt: "Erstellt am",
      save: "Ticket speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      actions: "Aktionen",
      open: "Offen",
      closed: "Geschlossen"
    },
  en: {
    languageName: "English",
    system: {
      ready: "Alright, let’s go.",
      saved: "Saved.",
      error: "Oops… something went wrong.",
      loading: "Loading…",
      noData: "No data found."
    },
    auth: {
      login: "Sign in",
      email: "Email",
      password: "Enter your password",
      in: "You’re in.",
      out: "You’re out.",
      disabled: "Your account is disabled.",
      skip: "Skip intro"
    },
    nav: {
      dashboard: "Dashboard",
      analysis: "Overview & dashboard",
      employees: "Employees",
      products: "Products",
      tasks: "Tasks",
      time: "Time tracking",
      support: "Support",
      admin: "Admin Panel",
      logout: "Logout"
    },
    roles: {
      admin: "Administrator",
      manager: "Manager",
      support: "Support",
      employee: "Employee",
      guest: "Guest"
    },
    admin: {
      createUser: "Create new user",
      deleteUser: "Delete user",
      changeRole: "Change role",
      saved: "All set.",
      confirm: "Are you sure?",
      emailInUse: "This email is already in use.",
      invalidEmail: "Invalid email address.",
      weakPassword: "Password is too weak.",
      auditLog: "Audit Log",
      refresh: "Refresh",
      searchAudit: "Search audit log…"
    },
    dashboard: {
      overview: "Overview",
      analysis: "Overview & dashboard",
      totalProducts: "Total products",
      totalEmployees: "Total employees",
      totalTasks: "Total tasks",
      totalHours: "Total hours",
      totalTickets: "Total tickets",
      quickLinks: "Quick access",
      quickProducts: "Manage your products and stock.",
      quickTasks: "Organize your tasks and team work.",
      quickTime: "Track your working hours.",
      quickEmployees: "Manage your team data.",
      quickSupport: "Handle support tickets.",
      quickAdmin: "Manage users and roles.",
      openProducts: "Open product management",
      openTasks: "Open task management",
      openTime: "Open time tracking",
      openEmployees: "Open employee management",
      openSupport: "Open support",
      openAdmin: "Open admin panel"
    },
    employees: {
      title: "Employee management",
      new: "Add new employee",
      overview: "Employee overview",
      number: "Number",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      birthday: "Birthday",
      id: "Employee ID",
      role: "Role",
      status: "Status",
      save: "Save employee",
      actions: "Actions",
      delete: "Delete",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      disabled: "Disabled",
      enabled: "Active",
      active: "Active"
    },
    products: {
      title: "Product management",
      add: "Add new product",
      overview: "Product overview",
      name: "Product name",
      description: "Description",
      type: "Type",
      vendor: "Vendor",
      collections: "Collections",
      sku: "SKU",
      ean: "EAN",
      stock: "Stock",
      price: "Price (CHF)",
      category: "Category",
      updateStock: "Update stock",
      save: "Save",
      export: "Export for Shopify",
      delete: "Delete",
      actions: "Actions",
      deleteAll: "Delete all",
      confirmDelete: "Do you really want to delete this product?",
      confirmYes: "Yes, delete",
      confirmNo: "Cancel",
      cancel: "Cancel",
      saved: "Product saved.",
      edit: "Edit"
    },
    tasks: {
      title: "Task management",
      new: "Create new task",
      overview: "Task overview",
      name: "Task",
      description: "Description",
      status: "Status",
      assignedTo: "Assigned to",
      dueDate: "Due date",
      priority: "Priority",
      save: "Save task",
      delete: "Delete",
      edit: "Edit",
      actions: "Actions",
      completed: "Completed",
      open: "Open"
    },
    time: {
      title: "Time tracking",
      overview: "Time overview",
      start: "Start",
      stop: "Stop",
      duration: "Duration",
      date: "Date",
      project: "Project",
      note: "Note",
      save: "Save time",
      delete: "Delete",
      edit: "Edit",
      actions: "Actions"
    },
    support: {
      title: "Support",
      new: "Create new ticket",
      overview: "Support overview",
      ticketId: "Ticket ID",
      subject: "Subject",
      message: "Message",
      status: "Status",
      assignedTo: "Assigned to",
      createdAt: "Created at",
      save: "Save ticket",
      delete: "Delete",
      edit: "Edit",
      actions: "Actions",
      open: "Open",
      closed: "Closed"
    }
  },
  fr: {
    languageName: "Français",
    system: {
      ready: "C’est parti.",
      saved: "Enregistré.",
      error: "Oups… une erreur est survenue.",
      loading: "Chargement…",
      noData: "Aucune donnée trouvée."
    },
    auth: {
      login: "Connexion",
      email: "E‑mail",
      password: "Mot de passe",
      in: "Connexion réussie.",
      out: "Déconnexion réussie.",
      disabled: "Votre compte est désactivé.",
      skip: "Passer l’intro"
    },
    nav: {
      dashboard: "Tableau de bord",
      analysis: "Vue d’ensemble",
      employees: "Employés",
      products: "Produits",
      tasks: "Tâches",
      time: "Temps",
      support: "Support",
      admin: "Panneau d’administration",
      logout: "Déconnexion"
    },
    roles: {
      admin: "Administrateur",
      manager: "Manager",
      support: "Support",
      employee: "Employé",
      guest: "Invité"
    },
    admin: {
      createUser: "Créer un nouvel utilisateur",
      deleteUser: "Supprimer l’utilisateur",
      changeRole: "Changer le rôle",
      saved: "Enregistré.",
      confirm: "Êtes-vous sûr ?",
      emailInUse: "Cet e‑mail est déjà utilisé.",
      invalidEmail: "Adresse e‑mail invalide.",
      weakPassword: "Mot de passe trop faible.",
      auditLog: "Journal d’audit",
      refresh: "Rafraîchir",
      searchAudit: "Rechercher dans le journal…"
    },
    dashboard: {
      overview: "Vue d’ensemble",
      analysis: "Vue d’ensemble",
      totalProducts: "Total produits",
      totalEmployees: "Total employés",
      totalTasks: "Total tâches",
      totalHours: "Total heures",
      totalTickets: "Total tickets",
      quickLinks: "Accès rapide",
      quickProducts: "Gérez vos produits et stocks.",
      quickTasks: "Organisez vos tâches et votre équipe.",
      quickTime: "Suivez vos heures de travail.",
      quickEmployees: "Gérez les données de votre équipe.",
      quickSupport: "Gérez les tickets de support.",
      quickAdmin: "Gérez les utilisateurs et les rôles.",
      openProducts: "Ouvrir la gestion des produits",
      openTasks: "Ouvrir la gestion des tâches",
      openTime: "Ouvrir le suivi du temps",
      openEmployees: "Ouvrir la gestion des employés",
      openSupport: "Ouvrir le support",
      openAdmin: "Ouvrir le panneau d’administration"
    },
    employees: {
      title: "Gestion des employés",
      new: "Ajouter un nouvel employé",
      overview: "Aperçu des employés",
      number: "Numéro",
      name: "Nom",
      email: "E‑mail",
      phone: "Téléphone",
      address: "Adresse",
      birthday: "Date de naissance",
      id: "ID employé",
      role: "Rôle",
      status: "Statut",
      save: "Enregistrer l’employé",
      actions: "Actions",
      delete: "Supprimer",
      edit: "Modifier",
      disable: "Désactiver",
      enable: "Activer",
      disabled: "Désactivé",
      enabled: "Actif",
      active: "Actif"
    },
    products: {
      title: "Gestion des produits",
      add: "Ajouter un nouveau produit",
      overview: "Aperçu des produits",
      name: "Nom du produit",
      description: "Description",
      type: "Type",
      vendor: "Fournisseur",
      collections: "Collections",
      sku: "SKU",
      ean: "EAN",
      stock: "Stock",
      price: "Prix (CHF)",
      category: "Catégorie",
      updateStock: "Mettre à jour le stock",
      save: "Enregistrer",
      export: "Exporter pour Shopify",
      delete: "Supprimer",
      actions: "Actions",
      deleteAll: "Tout supprimer",
      confirmDelete: "Voulez-vous vraiment supprimer ce produit ?",
      confirmYes: "Oui, supprimer",
      confirmNo: "Annuler",
      cancel: "Annuler",
      saved: "Produit enregistré.",
      edit: "Modifier"
    },
    tasks: {
      title: "Gestion des tâches",
      new: "Créer une nouvelle tâche",
      overview: "Aperçu des tâches",
      name: "Tâche",
      description: "Description",
      status: "Statut",
      assignedTo: "Attribuée à",
      dueDate: "Date d’échéance",
      priority: "Priorité",
      save: "Enregistrer la tâche",
      delete: "Supprimer",
      edit: "Modifier",
      actions: "Actions",
      completed: "Terminée",
      open: "Ouverte"
    },
    time: {
      title: "Suivi du temps",
      overview: "Aperçu du temps",
      start: "Démarrer",
      stop: "Arrêter",
      duration: "Durée",
      date: "Date",
      project: "Projet",
      note: "Note",
      save: "Enregistrer le temps",
      delete: "Supprimer",
      edit: "Modifier",
      actions: "Actions"
    },
    support: {
      title: "Support",
      new: "Créer un nouveau ticket",
      overview: "Aperçu du support",
      ticketId: "ID du ticket",
      subject: "Sujet",
      message: "Message",
      status: "Statut",
      assignedTo: "Attribué à",
      createdAt: "Créé le",
      save: "Enregistrer le ticket",
      delete: "Supprimer",
      edit: "Modifier",
      actions: "Actions",
      open: "Ouvert",
      closed: "Fermé"
    }
  },
}; // Ende von LANG

// ======================================================================
// 🔧 Sprachsteuerung
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
      console.warn(`⚠️ Fehlender Übersetzungsschlüssel: '${path}' in '${currentLang}'`);
      return path;
    }
    value = value[p];
  }
  return typeof value === "string" ? value : path;
}

// ======================================================================
// 🔄 UI dynamisch übersetzen
// ======================================================================

export function updateTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);
    if (translation) el.textContent = translation;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const translation = t(key);
    if (translation) el.setAttribute("placeholder", translation);
  });

  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    const translation = t(key);
    if (translation) el.setAttribute("title", translation);
  });

  document.querySelectorAll("[data-i18n-value]").forEach(el => {
    const key = el.getAttribute("data-i18n-value");
    const translation = t(key);
    if (translation) el.setAttribute("value", translation);
  });
}
