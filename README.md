# Our Memories 💗

A private little site for the two of us — reunion countdown, photo memories, "Open When" letters, "Reasons I Love You", and a **guestbook** where she can leave notes back.

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | The website itself (open this) |
| `styles.css` | Compiled styles (replaces the old Tailwind CDN) |
| `sw.js` | Service worker — enables offline + "Add to Home Screen" |
| `manifest.webmanifest` | App metadata for installing to a phone home screen |
| `icon-192.png` / `icon-512.png` / `icon-180.png` | App icons (the 💗) |

> **Don't forget your photos!** Copy your image files into this same folder using the *exact* names referenced in `index.html` (e.g. `photo2.jpg`, `photo3.jpeg`, `photo4.jpg`, and the `WhatsApp Image ...` files). Without them you'll see placeholder images.

## Deploying to GitHub Pages

1. Put **all** of these files (plus your photos) in your repo — ideally in the root, or in a `/docs` folder.
2. Repo → **Settings → Pages** → set the source branch/folder.
3. Visit `https://YOURNAME.github.io/REPO/`. GitHub Pages serves over HTTPS, which is required for the install + offline features to work.

## 📱 Add to Home

Once it's live over HTTPS:
- **iPhone (Safari):** tap the Share button → **Add to Home Screen**. It installs with the 💗 icon and opens full-screen.
- **Android (Chrome):** menu ⋮ → **Install app** / **Add to Home screen**.
- It also works offline after the first visit (text + layout cached).

## 📝 Guestbook setup (so notes sync between you both)

Out of the box, the guestbook saves notes **only on the device they were typed on** (using the browser). To make notes she leaves show up for you too, connect a free Firebase project — takes ~5 minutes:

1. Go to <https://console.firebase.google.com> and create a project.
2. Add a **Web app** (the `</>` icon). Firebase shows you a `firebaseConfig` object — copy it.
3. In `index.html`, find the `firebaseConfig` block near the bottom and paste your values over the `PASTE_...` placeholders.
4. In the Firebase console, open **Build → Firestore Database** → **Create database** (start in production mode).
5. Go to the **Rules** tab and paste these rules, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbook/{doc} {
      allow read: if true;
      allow create: if request.resource.data.message is string
        && request.resource.data.message.size() <= 500
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 40;
      allow update, delete: if false;
    }
  }
}
```

That's it — notes now appear live for both of you. 💕

> Note: these rules allow anyone with the page to read/post notes (no login). For a private gift that's usually fine. If you ever want it locked down, add Firebase Anonymous Auth or a shared passphrase check.

## A couple of tips
- Keep the site link private (it's set to `noindex`, so search engines skip it, but anyone with the URL can open it).
- The reunion/start dates and timezones live in a clearly-marked `CONFIG` block at the top of the script in `index.html`.
