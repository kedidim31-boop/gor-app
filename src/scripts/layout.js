// layout.js – sorgt für Branding, Navigation und Logout-Button im Gaming of Republic Admin System

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

  // Navigation
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

  const navLinks = navItems.map(item => {
    const isActive = item.label === activePage ? "active" : "";
    return `<a href="${item.href}" class="${isActive}">${item.label}</a>`;
  }).join("");

  const navigation = `
    <div class="top-nav">
      ${navLinks}
    </div>
  `;

  // Logout Button
  const logoutButton = `<button class="logout-btn">Logout</button>`;

  // Layout einfügen
  const layoutHTML = brandingHeader + navigation + logoutButton;

  // Ganz oben im Body einfügen
  document.body.insertAdjacentHTML("afterbegin", layoutHTML);
}
