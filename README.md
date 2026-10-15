# Srija Roy: academic website

Personal academic portfolio of Dr. Srija Roy, published with GitHub Pages at <https://roysrija.github.io>.

It is a plain static site (HTML, CSS and a little JavaScript). There is no build step and no dependencies.

## Structure

```
index.html            all content, one section per nav item
404.html              not-found page
assets/css/style.css  colour palettes and design tokens at the top, then components
assets/js/main.js     theme toggle, top-bar menu, scroll-spy, publication filter, image viewer
assets/img/           optimised WebP images (portrait, research figures, gallery)
assets/fonts/         self-hosted web fonts (Latin subset) and their licences
robots.txt, sitemap.xml
```

The page is fully readable without JavaScript. The script only adds interactivity.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Common edits

- **Add a publication:** copy an `<article class="pub" ...>` block in `index.html`. Set `data-type` to `journal`, `conference` or `review`, and set `data-year`. The filter and the item count update automatically.
- **Add a tool or app link:** in the `#tools` section, add `<a class="btn btn-small" href="...">Open app</a>` inside the tool's `<article>` (see the existing GitHub buttons). A `TODO` comment marks the spot.
- **Add a gallery photo:** save a WebP (about 1000 px wide) in `assets/img/gallery/`, then copy a `<figure>` block in `#engagement`. Always write a descriptive `alt` text and set `width` and `height`.
- **Change fonts:** headings use Newsreader and body text uses Source Sans 3, both self-hosted from `assets/fonts/` (SIL Open Font License; see `assets/fonts/LICENSES.md`). To swap them, add new `.woff2` files, declare them in the "Fonts" block at the top of `style.css`, and change `--serif` and `--sans`.
- **Change colours:** the site ships with five ready-made palettes (`teal`, `forest`, `indigo`, `terracotta`, `burgundy`) at the top of `style.css`. Midnight Indigo (`indigo`) is the default and needs no attribute. To switch, set `data-palette="forest"` (or another name) on the `<html>` tag in `index.html`. To try them first, open the site with `?preview` added to the address (for example `https://roysrija.github.io/?preview`), which shows a small panel for switching palettes. Each palette defines light values (`--p*`), dark values (`--d-*`) and hero gradient stops (`--h1`–`--h3`).
- **Add or reorder a navigation item:** edit the `<nav class="nav">` block in `index.html` (the `More` dropdown holds the last-priority items) and give the matching `<section>` the same `id`.
- **Update "Last updated":** edit the footer in `index.html` and `lastmod` in `sitemap.xml`.

## Deploy

GitHub Pages serves the `main` branch from the repository root (Settings → Pages → Deploy from a branch → `main` / root). Changes go live a minute or two after each push.
