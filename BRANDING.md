# Palia Win Store Branding

Use `assets/palia-win-store-logo.svg` on every page.

Header:
```html
<header class="top">
  <button id="menu" class="menu">☰</button>
  <a class="pws-brand" href="index.html">
    <img src="assets/palia-win-store-logo.svg" alt="Palia Win Store">
    <span class="pws-brand-text">
      <span class="pws-brand-name">Palia Win Store</span>
      <span class="pws-brand-by">BY SHANPALIA</span>
    </span>
  </a>
</header>
```

CSS:
```css
.pws-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#111827}
.pws-brand img{width:38px;height:38px;border-radius:10px;object-fit:cover}
.pws-brand-text{display:flex;flex-direction:column;line-height:1.05}
.pws-brand-name{font-size:17px;font-weight:850;letter-spacing:-.2px}
.pws-brand-by{font-size:8px;font-weight:700;color:#64748b;letter-spacing:.3px;margin-top:3px}
```

Put the same branding in the sidebar header too.
