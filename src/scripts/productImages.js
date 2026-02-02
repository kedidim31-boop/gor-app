// src/scripts/productImages.js – Produktbilder verwalten (mehrsprachig + optimiert)

import { initFirebase } from "./firebaseSetup.js";
import { enforceRole } from "./roleGuard.js";
import { logout } from "./auth.js";
import { showFeedback } from "./feedback.js";
import { t } from "./lang.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const { db } = initFirebase();
const storage = getStorage();

// -------------------------------------------------------------
// 🔹 Zugriff: Admin, Manager, Support
// -------------------------------------------------------------
enforceRole(["admin", "manager", "support"], "login.html");

// -------------------------------------------------------------
// 🔹 DOM Elemente
// -------------------------------------------------------------
const uploadInput = document.getElementById("productImageUpload");
const imageList = document.getElementById("productImageList");

// -------------------------------------------------------------
// 🔹 Produkt-ID aus URL holen
// -------------------------------------------------------------
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

const productId = getProductIdFromURL();

if (!productId) {
  showFeedback(t("errors.fail"), "error");
  console.error("❌ Keine Produkt-ID in URL gefunden.");
}

// -------------------------------------------------------------
// 🔹 Produktbilder laden
// -------------------------------------------------------------
async function loadImages() {
  if (!imageList) return;

  imageList.innerHTML = "";

  try {
    const snap = await getDoc(doc(db, "products", productId));

    if (!snap.exists()) return;

    const data = snap.data();
    const images = data.images || [];

    if (images.length === 0) {
      imageList.innerHTML = `<p class="empty">${t("products.noImages")}</p>`;
      return;
    }

    images.forEach(url => {
      const container = document.createElement("div");
      container.className = "image-item";

      container.innerHTML = `
        <img src="${url}" alt="Product Image">

        <button class="deleteImageBtn btn btn-red" data-url="${url}">
          <i class="fa-solid fa-trash"></i> ${t("products.deleteImage")}
        </button>
      `;

      imageList.appendChild(container);
    });

    attachDeleteHandlers();

  } catch (err) {
    console.error("❌ Fehler beim Laden der Bilder:", err);
    showFeedback(t("errors.load"), "error");
  }
}

// -------------------------------------------------------------
// 🔹 Bild hochladen
// -------------------------------------------------------------
uploadInput?.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const filePath = `products/${productId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    // Datei hochladen
    await uploadBytes(storageRef, file);

    // URL abrufen
    const url = await getDownloadURL(storageRef);

    // Produkt aktualisieren
    const productRef = doc(db, "products", productId);
    const snap = await getDoc(productRef);

    const oldImages = snap.data().images || [];
    const newImages = [...oldImages, url];

    await updateDoc(productRef, { images: newImages });

    showFeedback(t("products.imageUploaded"), "success");

    loadImages();

  } catch (err) {
    console.error("❌ Fehler beim Hochladen:", err);
    showFeedback(t("errors.fail"), "error");
  }
});

// -------------------------------------------------------------
// 🔹 Bild löschen
// -------------------------------------------------------------
function attachDeleteHandlers() {
  document.querySelectorAll(".deleteImageBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const url = btn.dataset.url;

      showFeedback(t("admin.confirm"), "warning");

      btn.addEventListener(
        "click",
        async () => {
          try {
            // Storage löschen
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);

            // Firestore aktualisieren
            const productRef = doc(db, "products", productId);
            const snap = await getDoc(productRef);

            const updatedImages = (snap.data().images || []).filter(img => img !== url);

            await updateDoc(productRef, { images: updatedImages });

            showFeedback(t("products.deleteImage"), "success");

            loadImages();

          } catch (err) {
            console.error("❌ Fehler beim Löschen des Bildes:", err);
            showFeedback(t("errors.fail"), "error");
          }
        },
        { once: true }
      );
    });
  });
}

// -------------------------------------------------------------
// 🔹 Initial laden
// -------------------------------------------------------------
loadImages();

// -------------------------------------------------------------
// 🔹 Logout
// -------------------------------------------------------------
document.querySelector(".logout-btn")?.addEventListener("click", logout);
