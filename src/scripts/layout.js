// layout.js – globales Modul für Branding, Navigation und Logout

export function injectLayout(activePage) {
  const body = document.body;

  // Branding Header
  const header = document.createElement("div");
  header.className = "branding-header";
  header.innerHTML = `
    <img src="public/logo.png" alt="Gaming of Republic Logo">
    <div class="divider"></div>
    <div class="branding-text">
      <div class="subtitle">${activePage}</div>
    </div>
  `;
  body.prepend(header);

  // Navigation
  const nav = document.createElement("div");
  nav.className = "top-nav";
  nav.innerHTML = `
    <a href="index.html" ${activePage === "Home" ? 'class="active"' : ""}>Home</a>
    <a href="products.html" ${activePage === "Produkte" ? 'class="active"' : ""}>Produkte</a>
    <a href="tasks.html" ${activePage === "Aufgaben" ? 'class="active"' : ""}>Aufgaben</a>
    <a href="time.html" ${activePage === "Zeiterfassung" ? 'class="active"' : ""}>Zeiterfassung</a>
    <a href="employees.html" ${activePage === "Mitarbeiter" ? 'class="active"' : ""}>Mitarbeiter</a>
    <a href="overview.html" ${activePage === "Übersicht" ? 'class="active"' : ""}>Übersicht</a>
    <a href="dashboard.html" ${activePage === "Dashboard" ? 'class="active"' : ""}>Dashboard</a>
  `;
  header.insertAdjacentElement("afterend", nav);

  // Logout Button
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.innerText = "Logout";
  logoutBtn.onclick = () => {
    firebase.auth().signOut().then(() => {
      alert("Logout erfolgreich");
      window.location.href = "login.html";
    });
  };
  body.appendChild(logoutBtn);
}
