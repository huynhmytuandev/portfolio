# portfolio

Personal portfolio of Huynh My Tuan, built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
Live at https://huynhmytuan.dev, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Structure

```text
src/
├── assets/       # Avatar and FeliCash screenshots (optimized by astro:assets)
├── components/   # sections/ (Lock Screen, Home, App Switcher, Version History, Settings),
│                 # ui/ primitives, Island (floating nav), ThemeToggle, Banner
├── data/         # portfolio.ts — all copy and facts; resume.ts — Drive résumé URL
├── layouts/      # Layout.astro — html shell, meta tags, no-flash theme script
├── lib/          # time.ts — HCMC-time tenure helpers (+ unit tests)
├── pages/        # index.astro
├── scripts/      # motion.ts (interactions), theme.ts (theme switcher), smooth.ts (Lenis)
└── styles/       # global.css (tokens, light/dark), motion.css (animations)
public/           # CNAME, favicons, og.png
```

Content changes (copy, jobs, projects, contact rows) go in `src/data/portfolio.ts`.
The résumé link `/resume` redirects to the Google Drive file in `src/data/resume.ts`.
To update the résumé, upload a new version of the same Drive file (Manage versions); no deploy is needed.

## Commands

| Command           | Action                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Dev server at `localhost:4321`                  |
| `npm run build`   | Build to `./dist/`                              |
| `npm run preview` | Preview the production build locally            |
| `npm run check`   | Type-check Astro and TypeScript files           |
| `npm test`        | Unit tests (tenure/time helpers)                |

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main` (or manually from the Actions tab):
type-check and tests → build with `withastro/action` → deploy with `actions/deploy-pages`.
A failing check stops the deploy.

One-time setup:

1. **Repo visibility:** GitHub Pages on a private repo needs a paid plan (Pro/Team). Either make the
   repo public or use a paid plan.
2. **Pages source:** Repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. **DNS (Cloudflare):** for `huynhmytuan.dev`, add these records with the proxy **off** (grey cloud,
   "DNS only") so GitHub can issue the HTTPS certificate:

   | Type  | Name | Value                     |
   | :---- | :--- | :------------------------ |
   | A     | @    | 185.199.108.153           |
   | A     | @    | 185.199.109.153           |
   | A     | @    | 185.199.110.153           |
   | A     | @    | 185.199.111.153           |
   | AAAA  | @    | 2606:50c0:8000::153       |
   | AAAA  | @    | 2606:50c0:8001::153       |
   | AAAA  | @    | 2606:50c0:8002::153       |
   | AAAA  | @    | 2606:50c0:8003::153       |
   | CNAME | www  | huynhmytuandev.github.io  |

4. **Custom domain:** `public/CNAME` already contains `huynhmytuan.dev`. After the first deploy,
   check Settings → Pages shows the domain, wait for the certificate, then tick **Enforce HTTPS**.
5. *(Recommended)* Verify the domain under GitHub → Settings → Pages → Verified domains to stop
   anyone else claiming it.
