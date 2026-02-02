// src/scripts/firebaseSetup.js – zentrale Initialisierung für Firebase Dienste (modulare SDK)

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// -------------------------------------------------------------
// 🔹 Interne Singleton-Instanzen
// -------------------------------------------------------------
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDB = null;
let firebaseStorage = null;

// -------------------------------------------------------------
// 🔹 Firebase Konfiguration
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC5PqdD4o5hMXKh4_y3bCLHlXwWgILxsM4",
  authDomain: "gaming-of-republic.firebaseapp.com",
  projectId: "gaming-of-republic",
  storageBucket: "gaming-of-republic.appspot.com",
  messagingSenderId: "610190951435",
  appId: "1:610190951435:web:bbf184d09a894fc307f30e",
  measurementId: "G-G26D7XBZG8"
};

// -------------------------------------------------------------
// 🔹 Firebase Initialisierung (echtes Singleton + robust)
// -------------------------------------------------------------
export function initFirebase() {
  try {
    // Falls Firebase bereits initialisiert wurde → NICHT erneut initialisieren
    if (!firebaseApp) {
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
        console.log("🚀 Firebase initialisiert (modulare SDK)");
      } else {
        firebaseApp = getApps()[0];
        console.log("♻️ Firebase bereits initialisiert – bestehende Instanz verwendet");
      }

      firebaseAuth = getAuth(firebaseApp);
      firebaseDB = getFirestore(firebaseApp);
      firebaseStorage = getStorage(firebaseApp);
    }

  } catch (error) {
    console.error("❌ Fehler bei Firebase-Initialisierung:", error);
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDB,
    storage: firebaseStorage
  };
}
