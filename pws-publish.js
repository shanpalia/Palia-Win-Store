import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, db, storage, requireConfiguredAdmin } from "./pws-firebase.js";
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
const imageUrl = async (file, path) => {
  if (!file) return "";
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error(file.name + ": only PNG, JPG, or WEBP images are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error(file.name + ": image must be 5 MB or smaller.");
  const target = ref(storage, "palia-win-store/" + path + "/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_"));
  await uploadBytes(target, file, { contentType: file.type });
  return await getDownloadURL(target);
};

saveBtn.onclick = async () => {
  const name = $("name").value.trim();
  const version = $("version").value.trim();
  const releaseUrl = $("releaseUrl").value.trim();
  const iconFile = $("icon").files[0];
  if (!name || !version || !iconFile || !releaseUrl) {
    showMessage("App Name, Version, App Icon, and GitHub Release URL are required.", "error");
    return;
  }
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/[^/]+\/.+/i.test(releaseUrl)) {
    showMessage("Paste a direct GitHub Release asset URL, ending in the installer file name.", "error");
    return;
  }
  const installerExt = releaseUrl.split("?")[0].toLowerCase();
  if (!/\.(exe|msi|zip)$/.test(installerExt)) {
    showMessage("The release URL must point to an .exe, .msi, or .zip file.", "error");
    return;
  }
  saveBtn.disabled = true;
  saveBtn.textContent = "Uploading images and saving…";
  try {
    const user = await waitForUser();
    requireConfiguredAdmin(user);
    const id = "app-" + Date.now();
    const iconUrl = await imageUrl(iconFile, id + "/icon");
    const bannerUrl = await imageUrl($("banner").files[0], id + "/banner");
    const screenshots = [];
    for (let i = 1; i <= 5; i++) {
      const file = $("screen" + i).files[0];
      if (file) screenshots.push(await imageUrl(file, id + "/screenshots"));
    }
    const data = {
      name, version, category: $("category").value,
      developer: $("developer").value.trim(),
      tagline: $("tagline").value.trim(),
      description: $("description").value.trim(),
      platform: "Windows",
      releaseUrl,
      iconUrl,
      bannerUrl,
      screenshots,
      published: $("publish").checked,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await addDoc(collection(db, APPS_COLLECTION), data);
    showMessage(data.published ? "App published successfully. It will appear on the storefront when the catalog refreshes." : "Draft saved successfully. It is not visible on the public storefront.", "success");
    saveBtn.textContent = "Saved";
    setTimeout(() => { location.href = "dashboard.html"; }, 1400);
  } catch (error) {
    showMessage(error.message || "Could not save this app.", "error");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Windows App";
  }
};
