# Palia Win Store publishing setup (no Firebase Storage)

This feature stores app metadata in the separate Firestore collection `paliaWinStoreApps`. Windows installers are distributed as GitHub Release assets. App icons, banners, and screenshots use public HTTPS image URLs (for example, files committed to a public GitHub repository). This avoids Firebase Storage and its Blaze billing requirement.

## Before publishing

1. Confirm `ADMIN_EMAIL` in `pws-config.js` is `shanpalia786@gmail.com` and that this email is enabled and verified in Firebase Authentication.
2. In Firebase Console → Firestore Database → Rules, merge the following rules inside your existing `match /databases/{database}/documents` block. Do not replace the existing rules or remove the `prompts` rules.

```javascript
function isPaliaStoreAdmin() {
  return request.auth != null
    && request.auth.token.email == "shanpalia786@gmail.com"
    && request.auth.token.email_verified == true;
}

match /paliaWinStoreApps/{appId} {
  allow read: if (resource.data.published == true) || isPaliaStoreAdmin();
  allow create, update, delete: if isPaliaStoreAdmin();
}
```

3. Review the whole Firestore rules file, then click Publish. No Firebase Storage rules are needed for this feature. The existing Firebase project may have other apps; keep their rules unchanged.
4. Deploy the updated Palia Win Store repository to the existing Cloudflare Worker after reviewing and merging the pull request.

## Publishing an app

1. Upload the `.exe`, `.msi`, or `.zip` installer as an asset in a GitHub Release.
2. Copy its direct asset URL, such as `https://github.com/OWNER/REPO/releases/download/v1.0.0/app.exe`.
3. Put app icons, banners, and screenshots in a public GitHub repository (or another public HTTPS image host), then copy each direct image URL. A GitHub raw URL usually has this shape: `https://raw.githubusercontent.com/OWNER/REPO/main/path/image.png`.
4. Open Admin → Add App, fill in metadata and paste the image URLs and direct release URL.
5. Check Publish immediately to show the app on the storefront, or leave it unchecked to save a draft.
6. Use Manage Apps to edit, publish/unpublish, or delete the record.

GitHub Release assets are suitable for public installer downloads; GitHub documents per-file release asset limits and release URLs in its official documentation: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases.
