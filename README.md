# Keren Wasserman — Portfolio

Portfolio site. Vanilla HTML + CSS + JS, with Tailwind utilities and GSAP.

## Run it
Open `index.html` in a browser (double-click), or in Cursor use a live-server
extension for hot reload.

## Tailwind (utilities only)
`styles.css` holds the base design. Tailwind adds utility classes on top, with no
Preflight reset, so existing pages are unaffected. After adding or changing
Tailwind classes in any `.html`/`.js` file, rebuild `tailwind.css`:

```
npm install          # first time only
npm run watch:css    # rebuilds on save while editing
npm run build:css    # one-off minified build (run before committing)
```

- Input: `src/tailwind.css` · output: `tailwind.css` (committed, linked after `styles.css`)
- Breakpoints match the site, desktop-first: `max-xl:` ≤1279 · `max-lg:` ≤1023 ·
  `max-md:` ≤767 · `max-sm:` ≤479
- Site tokens are available as utilities: `text-ink`, `text-body`, `text-muted`,
  `bg-chip`, `bg-page`, `border-line`, `bg-blue-tag`, `font-sans`, …
- `rounded-sm` / `rounded-md` / `rounded-lg` use the site's own radius tokens

## GSAP
GSAP 3.15 + ScrollTrigger load from jsDelivr on every page (before `site.js`);
the plugin is registered in `site.js`.

## Files
- `index.html` — page structure (nav, hero, work grid, playground, footer)
- `about.html` — about page (bio, experience/education, photo strip)
- `opsin.html`, `acme.html`, `soc.html`, `joymee.html` — case study pages
- `styles.css` — base styling. **Design tokens live at the top in `:root`.**
- `src/tailwind.css` → `tailwind.css` — Tailwind utilities (built, see above)
- `site.js` — shared header behavior (frosted bar on scroll, mobile menu)
- `projects.js` — work cards (homepage grid + "More case studies" rows)
- `case.js` — case study pages: active chapter in the side index, tool icon tooltips, GSAP hover lift on `[data-lift]` elements, `.cs-media` slideshow videos (play while on screen, with a pause button), `[data-tabs]` tab sets (`tabs--underline`, `tabs--segment`, `tabs--pill`), `[data-hold]` before/after frames (press and hold, or the switch, to reveal the other state; `data-start="before"` opens on the before, `[data-when]` note sets swap with the state, and hovering or tapping a `data-mark` note spotlights its matching box on the screen), `[data-reveal]` groups whose children stagger in on first scroll (GSAP ScrollTrigger), `[data-carousel]` phone carousels (center screen with faded neighbors, or `.carousel--fade` for a full-width crossfade; image slides advance every `data-interval` ms, a video slide advances when it ends; arrows, dots, swipe, keyboard and a pause button), `.tip` tooltips (hover, keyboard focus or tap; Escape or tapping outside closes), and the `[data-sus]` score meter (bar fills and the number counts up to `data-score` on first scroll)

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
