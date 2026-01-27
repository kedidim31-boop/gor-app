// auth.js – globales Modul für Login & Logout
// Registrierung wird NICHT angeboten, nur Admins können neue Benutzer anlegen.

export function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyC5PqdD4o5hMXKh4_y3bCLHlXwWgILxsM4",
    authDomain: "gaming-of-republic.firebaseapp.com",
    projectId: "gaming-of-republic",
    storageBucket: "gaming-of-republic.appspot.com",
    messagingSenderId: "610190951435",
    appId: "1:610190951435:web:bbf184d09a894fc307f30e"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase.auth();
}

// Login
export async function login(email, password) {
  const auth = initFirebase();
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Login erfolgreich");
    window.location.href = "overview.html"; // oder Dashboard
  } catch (error) {
    alert("Login fehlgeschlagen: " + error.message);
  }
}

// Logout
export function logout() {
  const auth = initFirebase();
  auth.signOut().then(() => {
    alert("Logout erfolgreich");
    window.location.href = "login.html";
  });
}
