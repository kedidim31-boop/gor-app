import { de } from "./lang.de.js";
import { en } from "./lang.en.js";
import { fr } from "./lang.fr.js";

export const LANG = { de, en, fr };

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
