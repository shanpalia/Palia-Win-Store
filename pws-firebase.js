import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { FIREBASE_CONFIG, ADMIN_EMAIL } from "./pws-config.js";

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { ADMIN_EMAIL };

export function isConfiguredAdmin(user) {
  return Boolean(user && ADMIN_EMAIL && ADMIN_EMAIL !== "SET_ADMIN_EMAIL_HERE" && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}
export function requireConfiguredAdmin(user) {
  if (!ADMIN_EMAIL || ADMIN_EMAIL === "SET_ADMIN_EMAIL_HERE") throw new Error("Admin setup required: set ADMIN_EMAIL in pws-config.js before publishing.");
  if (!isConfiguredAdmin(user)) throw new Error("This Firebase account is not authorized to publish Palia Win Store apps.");
}
