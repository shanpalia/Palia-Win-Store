# Free publishing setup: Cloudflare Pages + GitHub Releases

This repository is a static website build. The website files can be hosted on Cloudflare Pages, and Windows installer files can be attached to GitHub Releases instead of paying for object storage.

## 1. Create the Cloudflare Pages site

1. Sign in at https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Choose **Create application → Pages → Connect to Git**.
3. Select the GitHub repository `shanpalia/Palia-Win-Store`.
4. Use these settings:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: leave empty
   - Build output directory: `/` or `.` (choose the repository root if the UI accepts it)
5. Save and deploy.

The `_redirects` file keeps the current GitHub Pages base path `/Palia-Win-Store/` working on a root-domain Pages deployment by internally rewriting those requests to the matching root files.

## 2. Publish a Windows installer for free

1. Open https://github.com/shanpalia/Palia-Win-Store/releases/new
2. Create a tag such as `v1.0.0`.
3. Upload the `.exe` (or supported Windows installer) as a release asset.
4. Publish the release.
5. Copy the asset's **direct download URL**. It should look like:
   `https://github.com/OWNER/REPO/releases/download/TAG/filename.exe`

GitHub Releases supports release assets up to 2 GiB per file. This avoids a separate paid object-storage service for ordinary-sized installers.

## Important current limitation

The existing `add-app.html` form currently saves a draft to browser `localStorage` and explicitly says its real upload/publishing backend is not connected. Selecting a local installer in that form does **not** upload the file, and a draft saved in one browser is not shared with visitors. The existing admin also contains the placeholder `YOUR_ADMIN_EMAIL`.

Therefore, this change prepares the static-site hosting path and documents the free release workflow, but it does not pretend the current admin form is already a working public publishing CMS. Before using the store as a live catalog, connect the form to the same public app data source used by the storefront and configure a real admin email. Never put a GitHub personal access token in browser JavaScript.
