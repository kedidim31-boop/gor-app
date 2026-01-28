// firebaseSetup.js – zentrale Initialisierung für Firebase Dienste

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
      storageBucket: "gaming-of-republic.appspot.com",
      messagingSenderId: "610190951435",
      appId: "1:610190951435:web:bbf184d09a894fc307f30e"
    };

    // Initialisierung nur einmal
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDB = firebase.firestore();
    firebaseStorage = firebase.storage();

    console.log("✅ Firebase vollständig initialisiert");
  }

  // Rückgabe aller Dienste
  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDB,
    storage: firebaseStorage
  };
}
