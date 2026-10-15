# Srija Roy: academic website

Personal academic portfolio of Dr. Srija Roy, published with GitHub Pages at <https://roysrija.github.io>.

It is a plain static site (HTML, CSS and a little JavaScript). There is no build step and no dependencies.

## Structure

```
index.html            all content, one section per nav item
404.html              not-found page
assets/css/style.css  design tokens (colours, spacing) at the top, then components
assets/js/main.js     theme toggle, mobile menu, scroll-spy, publication filter, image viewer
assets/img/           optimised WebP images (portrait, research figures, gallery)
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
- **Change colours:** edit the variables in `:root` (light) and `:root[data-theme="dark"]` at the top of `style.css`.
- **Update "Last updated":** edit the footer in `index.html` and `lastmod` in `sitemap.xml`.

## Deploy

GitHub Pages serves the `main` branch from the repository root (Settings → Pages → Deploy from a branch → `main` / root). Changes go live a minute or two after each push.
