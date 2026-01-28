// firebaseSetup.js – zentrale Initialisierung für Firebase Dienste (modulare SDK)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDB = null;
let firebaseStorage = null;

export function initFirebase() {
  if (!firebaseApp) {
    const firebaseConfig = {
      apiKey: "AIzaSyC5PqdD4o5hMXKh4_y3bCLHlXwWgILxsM4",
      authDomain: "gaming-of-republic.firebaseapp.com",
      projectId: "gaming-of-republic",
      storageBucket: "gaming-of-republic.appspot.com", // ✅ korrigiert
      messagingSenderId: "610190951435",
      appId: "1:610190951435:web:bbf184d09a894fc307f30e",
      measurementId: "G-G26D7XBZG8" // optional, nur wenn Analytics genutzt wird
    };

    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDB = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    console.log("✅ Firebase vollständig initialisiert (modulare SDK)");
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDB,
    storage: firebaseStorage
  };
}
