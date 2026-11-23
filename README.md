# Aventra website

Corporate site (8 pages) with an admin panel. Next.js 16, Tailwind CSS 4, MySQL (Drizzle ORM).

## Run it on your PC

1. Create a MySQL database (for example `aventra`) and import `database/install.sql` into it.
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `SITE_URL`. `ADMIN_EMAIL` / `ADMIN_PASSWORD` set the default admin.
3. Install and start:

   ```
   npm install
   npm run dev
   ```

4. Run `npm run db:seed`. It creates the default admin plus the placeholder leaders, one testimonial
   and a draft sample job. (Without the seed, the default admin is still created automatically the first
   time the login page is opened on an empty users table.)
5. Log in at http://localhost:3000/admin/login and change the password under **My account**.

## Admin panel (`/admin`)

| Section | What it controls |
|---|---|
| Job posts | Positions on the Careers page. Only status **Open** is listed. Each job has its own SEO fields. |
| Applications | Submissions from the Apply form, with CV download and a status (new / reviewed / shortlisted / rejected). |
| Members | People on the Leadership page (photo, title, order, visible or hidden). |
| Testimonials | Quotes on the Life at Aventra page. |
| Contact inbox | Messages from the Contact form. |
| SEO | The only place for SEO: meta title, meta description and index / noindex for every page. The Home entry also holds the share image and the switch that hides the whole site from search engines (admins only). Page text itself is edited in `src/lib/content.ts`. |
| Contact info & settings | Phone, email, address, social links, notification email, site name and footer tagline. Admins only. |
| Admin users | Add or remove admins and editors. Admins only. |

Editors can manage content; only admins can change settings and users.

## Email notifications (optional)

Messages and applications are always saved in the admin. To also receive them by email, create a
[Resend](https://resend.com) account, set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` in `.env`, then enter
the address to notify under **Contact info & settings**. A real "from" address needs a verified domain in Resend.

## Logo and artwork

- `brand-source/aventra-logo.jpg` is the supplied logo. `node scripts/build-logo.cjs` writes the vector logo traced from it (SVG files in
  `public/brand/`, plus the favicon in `src/app/`).
- `brand-source/design-mockup.png` is the original design. `node scripts/build-art.cjs` cuts the real artwork for
  each page out of it into `public/art/`. The source is small, so the artwork is soft by nature.
  `scripts/build-art-vector.cjs` writes a sharp hand-drawn alternative set into `public/art-vector/` (not used by the site).

## Deploying to cPanel (Node.js app + MySQL)

The host must offer **Setup Node.js App** with Node 20.9 or newer.

1. **Database:** in cPanel create a MySQL database and user, then import `database/install.sql` with phpMyAdmin.
2. **Build on your PC:** `npm run build`. This creates `.next/standalone`.
3. **Upload** these into the application folder on the server (outside `public_html`):
   - everything inside `.next/standalone/` (includes `server.js` and the needed `node_modules`)
   - `.next/static/` → to `.next/static/` inside that folder
   - `public/` → to `public/` inside that folder
4. **Setup Node.js App:** application root = that folder, startup file = `server.js`.
   Add the environment variables from `.env.example` (`DATABASE_URL`, `SITE_URL` with `https://`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `STORAGE_DIR`, and the Resend ones if used). Set `STORAGE_DIR` to a folder **outside** the app folder,
   for example `/home/USER/aventra-storage`, so uploads survive the next deployment.
5. Restart the app and log in at `https://your-domain/admin/login` with the default admin. Use a strong
   `ADMIN_PASSWORD` on the live server, or change it under **My account** straight after the first login.

Because the site is built on Windows and runs on Linux, if the app fails to start with a missing-module
error, upload the project source instead and use cPanel's **Run NPM Install**, then run the `build` script there.

**Back up regularly:** the MySQL database and the `STORAGE_DIR` folder (member photos and applicants' CVs).

## Changing the database later

Edit `src/db/schema.ts`, then:

```
npm run db:generate   # writes a new migration into drizzle/
npm run db:export     # rebuilds database/install.sql for a fresh install
```

On an existing database, apply only the new file from `drizzle/` (remove the `--> statement-breakpoint` lines
before pasting it into phpMyAdmin), or run `npm run db:push` where a shell is available.
