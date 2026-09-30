# Keren Wasserman — Portfolio

Framework-free portfolio site. Vanilla HTML + CSS, no build step.

## Run it
Open `index.html` in a browser (double-click), or in Cursor use a live-server
extension for hot reload.

## Files
- `index.html` — page structure (nav, hero, work grid, playground, footer)
- `opsin.html`, `acme.html`, `soc.html`, `joymee.html` — case study pages
- `styles.css` — all styling. **Design tokens live at the top in `:root`.**
- `site.js` — shared header behavior (frosted bar on scroll, mobile menu)
- `projects.js` — work cards (homepage grid + "More case studies" rows)
- `case.js` — case study pages: active chapter in the side index

## Design tokens (edit once, applies everywhere) — top of `styles.css`
- **Type:** `--fs-hero`, `--fs-h2`, `--fs-title`, `--fs-lede`, `--fs-body`,
  `--fs-small`, `--fs-eyebrow`, `--fs-stat`; weights `--fw-regular`…`--fw-black`
- **Color:** `--ink`, `--body`, `--muted`, `--line`, `--bg`, plus the pastel
  project palette (`--blue`, `--mauve`, `--sage`, `--mint`, `--cream`, `--olive`)
  and badge colors (`--badge-ship`, `--badge-nav`)
- **Radius:** `--radius-lg`, `--radius-md`, `--radius-pill`
- **Layout width:** `--maxw`

## Adding video to a work card
Each card's media panel is `<div class="media t-COLOR">`. Replace the
placeholder `<span class="media-ph">…</span>` inside it with:

```html
<video autoplay muted loop playsinline poster="poster.jpg">
  <source src="project.mp4" type="video/mp4">
</video>
```

The pastel color stays as the frame behind the video.

## To do
- Swap placeholder media for real project videos/images
- Replace real LinkedIn / email / resume links (currently placeholders)
- Add real outcome metrics to the hero and card headlines
- Replace case study figure placeholders with real screenshots
