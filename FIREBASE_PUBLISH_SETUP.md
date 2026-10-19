# Palia Win Store publishing setup

This feature stores app metadata in the separate Firestore collection paliaWinStoreApps, images in Firebase Storage, and Windows installer files as GitHub Release assets.

## Before publishing

1. In pws-config.js, replace SET_ADMIN_EMAIL_HERE with the exact email used by your Firebase Authentication admin account.
2. Confirm that this email is enabled and verified in Firebase Authentication.
3. In Firebase Console → Firestore Database → Rules, merge rules for paliaWinStoreApps into your existing rules. Do not replace all existing rules because this Firebase project may be used by other apps.

Example Firestore rules to merge inside your existing match /databases/{database}/documents block:

    function isPaliaStoreAdmin() {
      return request.auth != null
        && request.auth.token.email == "REPLACE_WITH_ADMIN_EMAIL"
        && request.auth.token.email_verified == true;
    }

    match /paliaWinStoreApps/{appId} {
      allow read: if resource.data.published == true || isPaliaStoreAdmin();
      allow create, update, delete: if isPaliaStoreAdmin();
    }

4. In Firebase Console → Storage → Rules, merge this rule for the palia-win-store/ path into existing rules. Do not replace rules for other apps.

    function isPaliaStoreAdmin() {
      return request.auth != null
        && request.auth.token.email == "REPLACE_WITH_ADMIN_EMAIL"
        && request.auth.token.email_verified == true;
    }

    match /palia-win-store/{allPaths=**} {
      allow read: if true;
      allow write: if isPaliaStoreAdmin()
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(png|jpeg|webp)');
    }

5. Replace REPLACE_WITH_ADMIN_EMAIL in both rules with the same admin email.

Firebase Storage and Firestore use is subject to the limits and billing rules of your Firebase project. Verify the current plan and quotas before relying on it for public traffic.

## Publishing an app

1. Create a GitHub Release and upload the .exe, .msi, or .zip installer as a release asset.
2. Copy the direct URL, for example https://github.com/OWNER/REPO/releases/download/v1.0.0/app.exe.
3. Open Admin → Add App, choose an icon and optional banner/screenshots, fill in the metadata, and paste the direct release URL.
4. Check Publish immediately to show the app on the storefront, or leave it unchecked to save a draft.
5. Use Manage Apps to edit, publish/unpublish, or delete the record.

The installer itself is not uploaded to Firebase or Cloudflare. It remains a GitHub Release asset, avoiding the need to store large installers in object storage.