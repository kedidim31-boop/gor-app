// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Deine Firebase Konfiguration (echte Werte)
const firebaseConfig = {
  apiKey: "AIzaSyC5PqdD4o5hMXKh4_y3bCLHlXwWgILxsM4",
  authDomain: "gaming-of-republic.firebaseapp.com",
  projectId: "gaming-of-republic",
  storageBucket: "gaming-of-republic.firebasestorage.app",
  messagingSenderId: "610190951435",
  appId: "1:610190951435:web:bbf184d09a894fc307f30e",
  measurementId: "G-G26D7XBZG8"
};

// Initialisierung
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firestore & Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export für andere Module
export { app, db, auth, analytics };
