import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, db, requireConfiguredAdmin } from "./pws-firebase.js";
import { APPS_COLLECTION } from "./pws-config.js";

const $ = id => document.getElementById(id);
const msg = $("msg");
const saveBtn = $("saveBtn");
const showMessage = (text, type = "") => {
  msg.style.display = "block";
  msg.className = "notice " + type;
  msg.textContent = text;
};
const waitForUser = () => new Promise((resolve, reject) => {
  const stop = onAuthStateChanged(auth, user => { stop(); resolve(user); }, error => { stop(); reject(error); });
});
const validImageUrl = value => {
  if (!value) return true;
  try { const u = new URL(value); return u.protocol === "https:"; } catch { return false; }
};
const validReleaseUrl = value =>
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/[^/]+\/.+\.(exe|msi|zip)(\?.*)?$/i.test(value);

saveBtn.onclick = async event => {
  event.preventDefault();
  const name = $("name").value.trim();
  const version = $("version").value.trim();
  const releaseUrl = $("releaseUrl").value.trim();
  const iconUrl = $("icon").value.trim();
  const bannerUrl = $("banner").value.trim();
  if (!name || !version || !iconUrl || !releaseUrl) {
    showMessage("App Name, Version, Icon URL, and GitHub Release URL are required.", "error");
    return;
  }
  if (!validReleaseUrl(releaseUrl)) {
    showMessage("Use a direct GitHub Release asset URL ending in .exe, .msi, or .zip.", "error");
    return;
  }
  const imageUrls = [iconUrl, bannerUrl, ...Array.from({length:5}, (_,i)=>$("screen"+(i+1)).value.trim())].filter(Boolean);
  if (imageUrls.some(url => !validImageUrl(url))) {
    showMessage("Image links must be valid HTTPS URLs.", "error");
    return;
  }
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving app…";
  try {
    const user = await waitForUser();
    requireConfiguredAdmin(user);
    const screenshots = Array.from({length:5}, (_,i)=>$("screen"+(i+1)).value.trim()).filter(Boolean);
    const data = {
      name, version, category: $("category").value,
      developer: $("developer").value.trim(),
      tagline: $("tagline").value.trim(),
      description: $("description").value.trim(),
      platform: "Windows", releaseUrl, iconUrl, bannerUrl, screenshots,
      published: $("publish").checked,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await addDoc(collection(db, APPS_COLLECTION), data);
    showMessage(data.published ? "App published successfully." : "Draft saved successfully. It is not visible on the public storefront.", "success");
    saveBtn.textContent = "Saved";
    setTimeout(() => { location.href = "dashboard.html"; }, 1400);
  } catch (error) {
    showMessage(error.message || "Could not save this app.", "error");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Windows App";
  }
};
