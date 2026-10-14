// Writes the work cards (projects.js) and the Playground grid (playground.js) straight
// into the HTML pages, so they are there on first paint instead of being injected by
// JavaScript afterwards (which pushed the rest of the page down = layout shift).
//
// Run after changing projects.js or playground.js:   npm run build:html
//
// It also keeps a <link rel="preload" ... data-lcp> in index.html and playground.html
// pointing at the first card's image, so phones start downloading it right away.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (file) => {
  const ctx = vm.createContext({});
  vm.runInContext(readFileSync(join(root, file), "utf8"), ctx);
  return ctx;
};
const cards = load("projects.js");
const playground = load("playground.js");

const END = "<!-- /prerendered -->";

/* Fill <div ... id="ID" ...> with html. Works on a fresh empty div or one filled before. */
function fill(page, id, html) {
  const open = new RegExp(`<div([^>]*\\bid="${id}"[^>]*)>`);
  const m = page.match(open);
  if (!m) return page;
  let attrs = m[1];
  if (!/\bdata-prerendered\b/.test(attrs)) attrs += " data-prerendered";
  const start = m.index;
  const afterOpen = start + m[0].length;
  let close = page.indexOf(END, afterOpen);
  if (close === -1) {
    if (!page.startsWith("</div>", afterOpen)) throw new Error(`#${id} is not empty and has no ${END} marker`);
    close = afterOpen;
  } else close += END.length;
  return page.slice(0, start) + `<div${attrs}>${html}\n      ${END}` + page.slice(close);
}

function setLcpPreload(page, href) {
  const tag = `<link rel="preload" as="image" href="${href}" fetchpriority="high" data-lcp>`;
  if (/<link[^>]*\bdata-lcp\b[^>]*>/.test(page)) return page.replace(/<link[^>]*\bdata-lcp\b[^>]*>/, tag);
  return page.replace(/(<link rel="stylesheet" href="styles\.css)/, `${tag}\n$1`);
}

for (const file of readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const path = join(root, file);
  let page = readFileSync(path, "utf8");
  const before = page;

  const grid = page.match(/<div[^>]*\bid="case-grid"([^>]*)>/);
  if (grid) {
    const opts = {
      exclude: (grid[0].match(/data-exclude="([^"]*)"/) || [])[1],
      limit: (grid[0].match(/data-limit="([^"]*)"/) || [])[1],
    };
    page = fill(page, "case-grid", cards.projectsHTML(opts));
    if (file === "index.html") {
      const first = vm.runInContext("projects", cards)[0];
      page = setLcpPreload(page, first.poster || first.image);
    }
  }

  if (/\bid="pg-grid"/.test(page)) {
    page = fill(page, "pg-grid", playground.gridHTML());
    const first = vm.runInContext("experiments", playground)[0];
    const still = /\.(mp4|webm|mov)$/i.test(first.thumb || "") ? first.thumbPoster || first.poster : first.thumb;
    if (still) page = setLcpPreload(page, still);
  }

  if (page !== before) {
    writeFileSync(path, page);
    console.log(`updated ${file}`);
  }
}
