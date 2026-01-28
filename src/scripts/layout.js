// layout.js – sorgt für Branding, Navigation und Logout-Button im Gaming of Republic Admin System
// Ergänzt mit konsistentem Neon-Theme, aktiver Seitenmarkierung und Logout-Handling

export function injectLayout(activePage) {
  // Branding Header
  const brandingHeader = `
    <div class="branding-header">
      <img src="public/logo.png" alt="Gaming of Republic Logo">
      <div class="divider"></div>
      <div class="branding-text">
        <div class="subtitle">Gaming of Republic<br>Admin System</div>
      </div>
    </div>
  `;

  // Navigation Items
  const navItems = [
    { href: "index.html", label: "Home" },
    { href: "products.html", label: "Produkte" },
    { href: "tasks.html", label: "Aufgaben" },
    { href: "time.html", label: "Zeiterfassung" },
    { href: "employees.html", label: "Mitarbeiter" },
    { href: "overview.html", label: "Übersicht" },
    { href: "dashboard.html", label: "Dashboard" },
    { href: "adminPanel.html", label: "Admin Panel" }
  ];

  // Navigation Links mit aktiver Seite
  const navLinks = navItems.map(item => {
    const isActive = item.label === activePage ? "active" : "";
    return `<a href="${item.href}" class="${isActive}">${item.label}</a>`;
  }).join("");

  const navigation = `
    <div class="top-nav">
      ${navLinks}
      <button class="logout-btn" id="logoutBtn">Logout</button>
    </div>
  `;

  // Layout einfügen
  const layoutHTML = brandingHeader + navigation;
  document.body.insertAdjacentHTML("afterbegin", layoutHTML);

  // Logout-Handling
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await firebase.auth().signOut();
        console.log("✅ Erfolgreich ausgeloggt");
        window.location.href = "login.html";
      } catch (err) {
        console.error("❌ Fehler beim Logout:", err);
        alert("Fehler beim Logout – bitte erneut versuchen.");
      }
    });
  }
}
