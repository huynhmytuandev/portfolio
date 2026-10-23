# portfolio

Personal portfolio of Tuan Huynh, built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
Live at https://huynhmytuan.dev, hosted on Cloudflare Pages (build command `npm run build`, output directory `dist`).

## Structure

```text
src/
├── components/   # Page sections (Hero, FeaturedWork, AppShowcase, Experience, Contact)
├── data/         # Projects, experience, links — content lives here, not in markup
├── layouts/      # Layout.astro — html shell, imports global.css
├── pages/        # index.astro
└── styles/       # global.css (Tailwind entry + design tokens)
```

## Commands

| Command           | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Dev server at `localhost:4321`           |
| `npm run build`   | Build to `./dist/`                       |
| `npm run preview` | Preview the production build locally     |
