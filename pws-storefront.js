import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./pws-firebase.js";
import { APPS_COLLECTION } from "./pws-config.js";

const style = document.createElement("style");
style.textContent = `
#pws-published-catalog{max-width:1200px;margin:32px auto;padding:0 20px;color:#111827;font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
#pws-published-catalog .pws-catalog-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:18px}
#pws-published-catalog h2{font-size:clamp(22px,3vw,30px);margin:0;font-weight:850}
#pws-published-catalog .pws-catalog-sub{color:#64748b;margin:6px 0 0}
#pws-published-catalog .pws-catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
#pws-published-catalog .pws-app-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px #0f172a0a}
#pws-published-catalog .pws-app-banner{height:130px;background:#eef2f7;overflow:hidden}
#pws-published-catalog .pws-app-banner img{width:100%;height:100%;object-fit:cover}
#pws-published-catalog .pws-app-body{padding:16px}
#pws-published-catalog .pws-app-title-row{display:flex;align-items:center;gap:12px}
#pws-published-catalog .pws-app-icon{width:58px;height:58px;border:1px solid #e5e7eb;border-radius:13px;object-fit:cover;background:#f1f5f9;flex:none}
#pws-published-catalog .pws-app-title{font-weight:850;font-size:17px;overflow-wrap:anywhere}
#pws-published-catalog .pws-app-meta{font-size:12px;color:#64748b;margin-top:4px}
#pws-published-catalog .pws-app-desc{font-size:13px;color:#475569;line-height:1.55;margin:14px 0;white-space:pre-line}
#pws-published-catalog .pws-app-download{display:inline-block;background:#111827;color:#fff;text-decoration:none;font-weight:750;font-size:13px;border-radius:10px;padding:10px 14px}
#pws-published-catalog .pws-empty{padding:22px;border:1px dashed #cbd5e1;border-radius:14px;color:#64748b;background:#f8fafc}
@media(max-width:800px){#pws-published-catalog .pws-catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:540px){#pws-published-catalog{padding:0 14px}#pws-published-catalog .pws-catalog-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function text(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value || "";
  return el;
}
function image(src, className, alt) {
  if (!src) return null;
  const el = document.createElement("img");
  el.src = src; el.className = className; el.alt = alt || ""; el.loading = "lazy";
  return el;
}
function appCard(app) {
  const card = document.createElement("article"); card.className = "pws-app-card";
  const banner = document.createElement("div"); banner.className = "pws-app-banner";
  const bannerImg = image(app.bannerUrl, "", app.name + " banner");
  if (bannerImg) banner.appendChild(bannerImg);
  card.appendChild(banner);
  const body = document.createElement("div"); body.className = "pws-app-body";
  const row = document.createElement("div"); row.className = "pws-app-title-row";
  const icon = image(app.iconUrl, "pws-app-icon", app.name + " icon");
  if (icon) row.appendChild(icon);
  const info = document.createElement("div");
  info.appendChild(text("div", "pws-app-title", app.name || "Windows App"));
  info.appendChild(text("div", "pws-app-meta", "Version " + (app.version || "—") + " · " + (app.category || "Other") + " · Windows"));
  row.appendChild(info); body.appendChild(row);
  const desc = app.description || app.tagline || "Windows application available to download.";
  body.appendChild(text("p", "pws-app-desc", desc.length > 240 ? desc.slice(0, 237) + "…" : desc));
  const link = document.createElement("a"); link.className = "pws-app-download"; link.href = app.releaseUrl;
  link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Download for Windows";
  body.appendChild(link); card.appendChild(body); return card;
}
async function loadCatalog() {
  const section = document.createElement("section"); section.id = "pws-published-catalog";
  const head = document.createElement("div"); head.className = "pws-catalog-head";
  const titleGroup = document.createElement("div");
  titleGroup.appendChild(text("h2", "", "Windows Apps"));
  titleGroup.appendChild(text("p", "pws-catalog-sub", "Apps published by Palia Win Store"));
  head.appendChild(titleGroup); section.appendChild(head);
  const grid = document.createElement("div"); grid.className = "pws-catalog-grid";
  try {
    const q = query(collection(db, APPS_COLLECTION), where("published", "==", true));
    const snapshot = await getDocs(q);
    const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => String(b.updatedAt?.seconds || b.createdAt?.seconds || "").localeCompare(String(a.updatedAt?.seconds || a.createdAt?.seconds || "")));
    if (!apps.length) {
      section.appendChild(text("p", "pws-empty", "No apps have been published yet. Please check back soon."));
    } else {
      apps.forEach(app => grid.appendChild(appCard(app)));
      section.appendChild(grid);
    }
  } catch (error) {
    console.error("Palia Win Store catalog could not load:", error);
    section.appendChild(text("p", "pws-empty", "Apps are temporarily unavailable. Please try again later."));
  }
  document.body.appendChild(section);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadCatalog, { once: true });
else loadCatalog();
