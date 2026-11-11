<p align="center">
  <img src="public/og-image.png" alt="សាលាបឋមសិក្សា រះអរុណ — Sunrise Primary School, School Management System" width="100%" />
</p>

# សាលាបឋមសិក្សា រះអរុណ · Sunrise Primary School Admin

A simple admin template for a primary school management system, built with **Vue 3**, **Vite** and **[Kumo Vue](https://kumo-vue.netlify.app/docs/installation)**, Cloudflare's Kumo design system ported to Vue. It is **Khmer-first**, with English as the second language.

All data is mock data, so the template runs with no backend. Connect your API when you're ready (see [Connecting a backend](#connecting-a-backend)).

## Features

- **Login**: route guard, "remember me", show/hide password, redirect back to the page you were heading to.
- **Dashboard**: stat cards, recently enrolled students, upcoming events, attendance by grade, class capacity.
- **Students**: search, grade and status filters, pagination, row selection with bulk delete, add/edit dialog, CSV export (opens correctly in Excel with Khmer text).
- **Teachers**: card or table view, search by name or subject.
- **Classes**: cards per class with room, homeroom teacher and an enrolment meter, filtered by grade.
- **Attendance**: daily register per class with present/absent switches.
- **Fees**: collected/pending/overdue totals, status tabs, "mark paid" and "remind".
- **Settings**: school profile, academic year and term, language, notifications.
- **Khmer and English**: every screen is translated, including Kumo's built-in labels; switch from the top bar or Settings.
- **Google Sans** for both Khmer and Latin script, with Khmer typography tuned (line height, no letter-case effects).
- **Dark mode**, a collapsible sidebar (icon rail on desktop, slide-in sheet on mobile) and a responsive layout.
- **SEO and icons**: meta and Open Graph tags per page, JSON-LD, web app manifest, `robots.txt`, `sitemap.xml`, favicon and PWA icons.

## Getting started

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints and sign in with the demo account:

| Email | Password |
| --- | --- |
| `admin@sunrise.edu.kh` | `sunrise2026` |

The login page also has a **Use demo account** button that fills these in.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build to `dist/`, including `robots.txt` and `sitemap.xml` |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Rebuild every icon and `og-image.png` from `public/favicon.svg` |

## Configuration

Set the public address of the site in `.env` (or `.env.production` / `.env.local`):

```bash
VITE_SITE_URL=https://admin.example.edu.kh
```

It is used for the canonical URL, Open Graph image links, `robots.txt` and `sitemap.xml`. Change it before deploying; the default points to localhost.

## Project structure

```
public/
  favicon.svg              Logo (source for every icon)
  og-image.png             Link preview image (generated)
  site.webmanifest         Web app manifest
scripts/
  generate-icons.mjs       Builds icons and og-image.png (npm run icons)
src/
  components/
    ui/                    Kumo Vue components, copied in by the kumo-vue CLI
    app/                   App components (PageHeader, StatCard)
  composables/
    useAuth.js             Mock sign-in / sign-out
    useLabels.js           Turns data keys into translated text
    useTheme.js            Dark/light mode
  data/mock.js             Mock students, teachers, classes, fees, demo account
  i18n/                    km.js (primary), en.js, setup and date/money formatting
  layouts/AdminLayout.vue  Sidebar, top bar, page outlet
  router/index.js          Routes and the auth guard
  views/                   One file per page
  seo.js                   Per-page title, description and social tags
  style.css                Tokens import, font, layout and LayerCard helpers
```

## Kumo Vue components

Components are **copied into the project** (like shadcn-vue), not installed as a package, so you can edit them freely. They live in `src/components/ui/`.

```bash
npx kumo-vue@latest add            # list available components
npx kumo-vue@latest add tooltip    # add one
```

The styles come from `@kumo-vue/tokens`, imported once in `src/style.css`. Icons come from [Lucide](https://lucide.dev) (`lucide-vue-next`).

Cards use Kumo's layered **LayerCard**: a `LayerCardSecondary` header row and a `LayerCardPrimary` panel. `src/style.css` adds a few helpers for it:

| Class | Use it on | Effect |
| --- | --- | --- |
| `layer-head` | `LayerCardSecondary` | Title on the left, actions on the right |
| `layer-flush` | `LayerCardPrimary` | No padding, so a table runs edge to edge |
| `layer-section` | A block inside a flush panel | Padded strip for toolbars and footers |
| `layer-body` | `LayerCardPrimary` | Roomier padding for forms and lists |
| `dialog-form` | A `<form>` inside a `Dialog` | Stops the dialog clipping field borders |

## Languages

Khmer (`km`) is the default and English (`en`) the fallback. The choice is saved in the browser.

- UI text lives in `src/i18n/km.js` and `src/i18n/en.js`. Use `t("key")` in templates.
- Data stores language-neutral values (`active`, `male`, `math`, grade `3`, class `"1A"`); show them through `useLabels()` so they display in the active language (`"1A"` appears as `1ក` in Khmer).
- `@` has a special meaning in vue-i18n. Write it as `{'@'}` inside translations.
- Khmer dates are formatted by hand, because some browsers ship without Khmer locale data and fall back to English. Money always shows as `$1,980`.

To add a language, create another file next to `km.js` and add it to `LOCALES` in `src/i18n/index.js`.

## Connecting a backend

1. **Sign-in**: replace `login()` in `src/composables/useAuth.js` with a call to your API (for example `POST /auth/login` returning `{ user, token }`).
2. **Data**: replace the imports from `src/data/mock.js` with API calls, ideally in Pinia stores.
3. **Remove the demo**: delete the demo account card in `src/views/LoginView.vue` and `demoAccount` in `src/data/mock.js`.

The route guard only controls what the browser shows. Your API must check the token on every request. For production, prefer an httpOnly cookie set by the server over the browser storage the mock uses.

## Deployment

`npm run build` produces a static site in `dist/`. The app uses HTML5 history routing, so configure your host to serve `index.html` for unknown paths:

- **Netlify**: add `public/_redirects` containing `/* /index.html 200`
- **Vercel**: add a rewrite of `/(.*)` to `/index.html` in `vercel.json`
- **Nginx**: `try_files $uri $uri/ /index.html;`

Search engines can only reach the login page, so the sitemap lists `/login` only. An admin panel usually shouldn't appear in search results at all. To hide it, set the `robots` meta tag in `index.html` to `noindex, nofollow` and change `Allow: /` to `Disallow: /` in the `seo-files` plugin in `vite.config.js`.

## Credits

- [Kumo Vue](https://kumo-vue.netlify.app): a Vue port of Cloudflare's Kumo design system (MIT)
- [Reka UI](https://reka-ui.com), [Lucide](https://lucide.dev), [vue-i18n](https://vue-i18n.intlify.dev), [Google Sans](https://fonts.google.com/specimen/Google+Sans)
