/* Playground experiments — add one by appending an entry.
   Media: set `thumb` (image or .mp4 for the grid card) and `video` + `poster`
   (the big video in the pop-up / phone page). Leave them null to show the
   pastel placeholder. `shape` picks the card proportion: "wide" or "tall". */
const experiments = [
  {
    id: "thrive",
    title: "Thrive",
    subtitle: "AI-powered personal wellness app",
    color: "#4b5a3a",
    ink: "light",
    shape: "wide",
    thumb: null,
    video: null,
    poster: null,
    link: { label: "Try it", href: "https://claude.ai/public/artifacts/6cf858af-d296-441d-8ac1-ee0f7f0cbb11" },
    idea:
      "How far could I get building a real iOS wellness app with Claude as my only collaborator? No Figma, no handoff — just conversation and iteration. It's built around a to-do list, because that's how I actually live: every checkbox hides a moment of input without ever feeling like a form.",
    learned: [
      ["Prompting is a design skill.", "Specific intent beat open-ended requests every time — output quality mirrored the thinking behind the prompt."],
      ["Knowing when to simplify.", "When things got too complex for Claude to handle cleanly, stripping back to fundamentals beat pushing through."],
      ["Context management is the job.", "In long sessions Claude lost the thread — re-anchoring with summaries mattered as much as the prompts."],
    ],
    builtWith: "Claude · iOS prototype · 2026",
  },
  {
    id: "fraud-alert",
    title: "Fraud Alert",
    subtitle: "A credit card alert that scales with certainty",
    color: "#f5f5f6",
    ink: "dark",
    shape: "tall",
    thumb: null,
    video: null,
    poster: null,
    link: { label: "Try it", href: "https://fraud-alert-prototype.vercel.app/" },
    idea:
      "Most fraud alerts sound the alarm the same way whether the system is sure or just checking. I wanted one that matches its tone to its confidence. When it's certain, it pauses the charge and says so. When it's unsure, it just asks. The whole piece protects the cardholder's calm, not only their money.",
    learned: [
      ["The model defaults to alarm.", "Its first pass went red at every level. Real apps like Monzo and Revolut reserve red for declined charges, so I moved the high tier to a protective amber."],
      ["A percentage needs an object.", "“94% confident” means nothing alone. I made it read “94% confident this wasn't you,” and capped it at 99, because no system is ever fully sure."],
      ["I overrode the AI more than I accepted it.", "It proposed inverting the confidence number, which would have broken the meter. I turned it down. Directing the model mattered more than prompting it."],
    ],
    builtWith: "v0 · Cursor · Mobbin · Vercel · 2026",
  },
  {
    id: "job-tracker",
    title: "Job Tracker",
    subtitle: "From job post to table",
    color: "#f3e6c7",
    ink: "dark",
    shape: "tall",
    thumb: null,
    video: null,
    poster: null,
    link: { label: "Try it", href: "https://claude.ai/public/artifacts/90b52cd4-6a10-4045-9d8c-8812c041b468" },
    idea:
      "I built this because I was living the problem. Job hunting meant copying the same fields into a spreadsheet by hand, one posting at a time. So I made what I wished existed: paste a job description and it fills the row. The one rule is restraint. If a posting doesn't list a salary, the cell stays blank instead of guessing.",
    learned: [
      ["A blank beats a hallucination.", "A made-up salary looks as confident as a real one, so I had it return nothing when the data isn't there. Knowing when not to generate is a design decision."],
      ["Structure the output.", "Reliable extraction came from defining exactly which fields to return, not from a cleverer prompt."],
      ["The table is the product.", "The AI is a shortcut. I designed the table first and let it serve the table, not the other way around."],
    ],
    builtWith: "Claude · prototype · 2026",
  },
  {
    id: "brightpath",
    title: "BrightPath",
    subtitle: "AI companion for mindful drinking awareness",
    color: "#f7dc8c",
    ink: "dark",
    shape: "wide",
    thumb: null,
    video: null,
    poster: null,
    link: { label: "View on Devpost", href: "https://devpost.com/software/brightpath-4byjaf" },
    idea:
      "Alcohol levels are invisible until it's already too late. BrightPath makes that hidden signal something you can <em>feel</em>. A biosensor bracelet reads BAC through your skin, and an AI companion named Luna turns the number into a mood. Calm when you're safe, concerned as levels rise, critical when it's time to call someone. No graphs, no manual logging. Just a face that reflects your body back to you in real time.",
    learned: [
      ["Data alone doesn't change behavior.", "People don't act on a number, they act on a feeling. Translating BAC into Luna's emotional states did more than any chart could."],
      ["Supportive beats surveillant.", "The hardest design problem was tone: making Luna feel like a companion, not a monitor. Every message got rewritten to guide rather than judge."],
      ["The interface should hide the complexity.", "Passive sensing plus one clear signal at a time. The depth is there if you want it, but the default is a glance."],
    ],
    builtWith: "Figma · Figma Make · AI concept tools · Team of 4 · FigBuild 2026",
  },
];

const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src || "");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const arrowSvg =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 12.5l7-7M7 5.5h5.5V11"/></svg>';

/* Desktop gets the pop-up; phones follow the link to experiment.html. Matches max-md. */
const popupQuery = window.matchMedia("(min-width: 768px)");

function placeholder(exp, label) {
  return `<div class="pg-ph transition-transform duration-500 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none" data-ink="${exp.ink}"><span>${label}</span></div>`;
}

function thumbHTML(exp) {
  if (!exp.thumb) return placeholder(exp, `${exp.title} · thumbnail`);
  if (isVideo(exp.thumb)) {
    const poster = exp.poster ? ` poster="${exp.poster}"` : "";
    return `<video class="pg-thumb-media" src="${exp.thumb}" muted loop playsinline preload="metadata"${poster}></video>`;
  }
  return `<img class="pg-thumb-media" src="${exp.thumb}" alt="" loading="lazy">`;
}

function heroHTML(exp) {
  if (!exp.video) return placeholder(exp, `${exp.title} · video`);
  const poster = exp.poster ? ` poster="${exp.poster}"` : "";
  return `<video class="pg-hero-media" src="${exp.video}" muted loop playsinline controls${reduceMotion ? "" : " autoplay"}${poster}></video>`;
}

/* The detail content shared by the pop-up and the phone page.
   Uses the case-study building blocks (cs-label, cs-lede, cs-rows, btn) so it reads the same. */
function detailHTML(exp, titleId) {
  const learned = exp.learned
    .map(([lead, rest], i) => `
          <li>
            <span class="cs-row-key">${String(i + 1).padStart(2, "0")}</span>
            <div class="cs-row-body">
              <h3 class="cs-h3">${lead.replace(/\.$/, "")}</h3>
              <p>${rest}</p>
            </div>
          </li>`)
    .join("");
  return `
    <div class="pg-detail-head">
      <div>
        <h1 class="pg-detail-title" id="${titleId}">${exp.title}</h1>
        <p class="cs-lede pg-detail-sub">${exp.subtitle}</p>
      </div>
      <a class="btn btn-blue pg-try group/btn" href="${exp.link.href}" target="_blank" rel="noopener">${exp.link.label} <span class="inline-block transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true">↗</span></a>
    </div>
    <section class="cs-section">
      <p class="cs-label">The idea</p>
      <p>${exp.idea}</p>
    </section>
    <section class="cs-section">
      <p class="cs-label">What I learned</p>
      <ol class="cs-rows">${learned}
      </ol>
    </section>
    <section class="cs-section">
      <p class="cs-label">Built with</p>
      <p>${exp.builtWith}</p>
    </section>`;
}

/* ---------- Grid (playground.html) ---------- */
function renderGrid(root) {
  const card = (exp) => `
    <a class="pg-card group/card" href="experiment.html?id=${exp.id}" data-id="${exp.id}">
      <div class="pg-thumb pg-thumb--${exp.shape}" style="--pg-color:${exp.color}">
        ${thumbHTML(exp)}
        <span class="pg-badge absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-page text-ink shadow-md opacity-0 translate-y-1.5 scale-90 transition duration-300 ease-out group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:scale-100 group-focus-visible/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:scale-100 motion-reduce:transition-none" aria-hidden="true">${arrowSvg}</span>
      </div>
      <p class="pg-cap"><span class="pg-cap-title">${exp.title}:</span> <span class="pg-cap-sub">${exp.subtitle}</span><span class="case-arrow" aria-hidden="true">→</span></p>
    </a>`;
  /* Two staggered columns on desktop: odd entries left, even entries right.
     On phones the columns collapse and cards fall back to list order. */
  const left = experiments.filter((_, i) => i % 2 === 0).map(card).join("");
  const right = experiments.filter((_, i) => i % 2 === 1).map(card).join("");
  root.innerHTML = `<div class="pg-col">${left}</div><div class="pg-col">${right}</div>`;

  /* Phone order follows the data, not the columns. */
  root.querySelectorAll(".pg-card").forEach((el) => {
    el.style.setProperty("--pg-order", experiments.findIndex((e) => e.id === el.dataset.id));
  });

  /* Thumbnail videos play only while on screen. */
  const vids = root.querySelectorAll("video.pg-thumb-media");
  if (vids.length && !reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
    }, { threshold: 0.25 });
    vids.forEach((v) => io.observe(v));
  }
}

/* ---------- Pop-up (desktop) ---------- */
function setupPopup(root) {
  const dialog = document.getElementById("pg-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const media = dialog.querySelector(".pg-modal-media");
  const body = dialog.querySelector(".pg-modal-body");
  let opener = null;

  const open = (id, fromHash) => {
    const exp = experiments.find((e) => e.id === id);
    if (!exp) return;
    media.style.setProperty("--pg-color", exp.color);
    media.innerHTML = heroHTML(exp);
    body.innerHTML = detailHTML(exp, "pg-dialog-title");
    body.scrollTop = 0;
    dialog.showModal();
    dialog.querySelector(".pg-close").focus();
    if (!fromHash) history.replaceState(null, "", `#${id}`);
  };

  const close = () => dialog.close();

  dialog.addEventListener("close", () => {
    dialog.querySelector("video")?.pause();
    media.innerHTML = "";
    history.replaceState(null, "", location.pathname + location.search);
    opener?.focus();
    opener = null;
  });
  dialog.querySelector(".pg-close").addEventListener("click", close);
  /* A click on the backdrop lands on the dialog element itself. */
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  root.addEventListener("click", (event) => {
    const card = event.target.closest(".pg-card");
    if (!card || !popupQuery.matches) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    opener = card;
    open(card.dataset.id);
  });

  /* Deep link: playground.html#thrive opens that pop-up (or the page on phones). */
  const fromHash = location.hash.slice(1);
  if (fromHash && experiments.some((e) => e.id === fromHash)) {
    if (popupQuery.matches) {
      opener = root.querySelector(`[data-id="${fromHash}"]`);
      open(fromHash, true);
    } else {
      location.replace(`experiment.html?id=${fromHash}`);
    }
  }

  /* Rotating a tablet or resizing below the breakpoint swaps the pop-up for the page. */
  popupQuery.addEventListener("change", (mq) => {
    if (!mq.matches && dialog.open) {
      const id = location.hash.slice(1);
      close();
      if (id) location.href = `experiment.html?id=${id}`;
    }
  });
}

/* ---------- Phone page (experiment.html) ---------- */
function renderPage(root) {
  const id = new URLSearchParams(location.search).get("id");
  const exp = experiments.find((e) => e.id === id);
  if (!exp) {
    location.replace("playground.html");
    return;
  }
  document.title = `${exp.title} · Playground · Keren Wasserman`;
  root.querySelector(".pg-page-media").style.setProperty("--pg-color", exp.color);
  root.querySelector(".pg-page-media").innerHTML = heroHTML(exp);
  root.querySelector(".pg-page-body").innerHTML = detailHTML(exp, "pg-page-title");
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("pg-grid");
  if (grid) {
    renderGrid(grid);
    setupPopup(grid);
  }
  const page = document.getElementById("pg-page");
  if (page) renderPage(page);
});
