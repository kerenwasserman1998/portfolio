/* Case study data — add a project by appending an entry. */
const projects = [
  {
    id: "opsin",
    href: "opsin.html",
    summary: "Shaped the GenAI security platform that raised $7M in seed funding.",
    company: "Opsin",
    year: "2024",
    gradient: ["#ffb4a2", "#ffe0c7"],
    video: "assets/videos/opsin.mp4",
    webm: null,
    poster: "assets/videos/posters/opsin.jpg",
    posterTime: 0,
    image: null,
  },
  {
    id: "acme",
    href: "acme.html",
    summary: "Helping fraud analysts catch real threats with less noise in credit-risk monitoring.",
    company: "ACME",
    year: "2025",
    gradient: ["#c6e9e6", "#dce7fb"],
    video: "assets/videos/acme.mp4",
    webm: null,
    poster: "assets/videos/posters/acme.jpg",
    posterTime: 0,
    image: null,
  },
  {
    id: "soc",
    href: "soc.html",
    summary: "Cutting alert fatigue so security analysts focus on the threats that matter.",
    company: "SOC Signal",
    year: "2026",
    gradient: ["#ffd6c9", "#e8d5f2"],
    video: "assets/videos/soc.mp4",
    webm: null,
    poster: "assets/videos/posters/soc.jpg",
    posterTime: 0,
    image: null,
  },
  {
    id: "joymee",
    href: "joymee.html",
    summary: "Widening access to mental health education and support.",
    company: "JoyMee",
    year: "2024",
    gradient: ["#f3e6c7", "#efe4ec", "#dce7fb"],
    video: "assets/joymee/cover.mp4",
    webm: null,
    poster: "assets/joymee/cover-poster.jpg",
    posterTime: 1.2,
    image: null,
  },
];

/* Arrow badge in the card's corner, shown while the card is hovered (.is-hovered, set below
   from real mouse events) or keyboard-focused. Same badge as the playground cards. */
const badgeHTML = `<span class="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-page text-ink shadow-md opacity-0 translate-y-1.5 scale-90 transition duration-300 ease-out group-[.is-hovered]/case:opacity-100 group-[.is-hovered]/case:translate-y-0 group-[.is-hovered]/case:scale-100 group-focus-visible/case:opacity-100 group-focus-visible/case:translate-y-0 group-focus-visible/case:scale-100 motion-reduce:transition-none" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 12.5l7-7M7 5.5h5.5V11"/></svg></span>`;

function gradientStyle(colors) {
  if (!colors || !colors.length) return "";
  if (colors.length === 1) {
    return `--case-g1:${colors[0]};--case-g2:${colors[0]}`;
  }
  if (colors.length === 2) {
    return `--case-g1:${colors[0]};--case-g2:${colors[1]}`;
  }
  return `--case-g1:${colors[0]};--case-g2:${colors[1]};--case-g3:${colors[2]}`;
}

function mediaHTML(project) {
  if (project.video || project.webm) {
    const poster = project.poster ? ` poster="${project.poster}"` : "";
    const start = project.posterTime ? ` data-start="${project.posterTime}"` : "";
    const sources = [];
    if (project.webm) {
      sources.push(`<source src="${project.webm}" type="video/webm">`);
    }
    if (project.video) {
      sources.push(`<source src="${project.video}" type="video/mp4">`);
    }
    return `<video class="case-video" muted loop playsinline preload="metadata"${poster}${start}>${sources.join("")}</video>`;
  }

  if (project.image || project.poster) {
    const src = project.image || project.poster;
    return `<img class="case-image" src="${src}" alt="">`;
  }

  return `<div class="case-ph" aria-hidden="true"></div>`;
}

/* Optional data attributes on the grid: data-exclude="<id>" and data-limit="<n>". */
function renderProjects(root) {
  const { exclude, limit } = root.dataset;
  let list = exclude ? projects.filter((p) => p.id !== exclude) : projects;
  if (limit) list = list.slice(0, Number(limit));

  root.innerHTML = list
    .map((p) => {
      const multi =
        p.gradient && p.gradient.length > 2 ? " case-frame--multi" : "";
      const full = p.video || p.webm ? " case-frame--full" : "";
      return `
      <a class="case group/case" href="${p.href}" data-case-id="${p.id}">
        <div class="relative case-frame${multi}${full}" style="${gradientStyle(p.gradient)}">
          <div class="case-media">
            ${mediaHTML(p)}
          </div>
          ${badgeHTML}
        </div>
        <div class="case-caption">
          <p class="case-summary">${p.summary}</p>
          <p class="case-meta">${p.company} • ${p.year}<span class="case-arrow" aria-hidden="true">→</span></p>
        </div>
      </a>`;
    })
    .join("");
}

/* Mouse devices: a card's video plays only while the card is hovered or keyboard-focused.
   Touch devices: only the card nearest the middle of the screen plays.
   A device counts as mouse-driven if it reports so, or as soon as a real mouse pointer
   appears, since some embedded browsers misreport (hover:hover). */
function setupCaseMedia(root) {
  const cards = Array.from(root.querySelectorAll(".case"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mouseMode = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const videoOf = (card) => card.querySelector(".case-video");

  /* The resting frame is the poster's frame (data-start): playback begins there,
     and stopping rewinds to it, so the still and the video always line up. */
  const startOf = (video) => Number(video.dataset.start) || 0;
  const rewind = (video) => {
    const start = startOf(video);
    if (Math.abs(video.currentTime - start) > 0.05) video.currentTime = start;
  };
  const play = (video) => {
    if (!video || reduceMotion || !video.paused) return;
    if (video.readyState >= 1) rewind(video);
    else video.addEventListener("loadedmetadata", () => rewind(video), { once: true });
    video.play().catch(() => {});
  };
  const pause = (video) => {
    if (!video || (video.paused && video.readyState < 1)) return;
    video.pause();
    if (video.readyState >= 1) rewind(video);
  };

  let ticking = false;
  const playCentred = () => {
    ticking = false;
    if (mouseMode) return;
    const mid = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;
    cards.forEach((card) => {
      const box = card.querySelector(".case-frame").getBoundingClientRect();
      const visible = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
      if (visible < box.height * 0.6) return;
      const dist = Math.abs(box.top + box.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    cards.forEach((card) => (card === best ? play(videoOf(card)) : pause(videoOf(card))));
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(playCentred);
  };

  const enterMouseMode = () => {
    mouseMode = true;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cards.forEach((card) => {
      if (!card.classList.contains("is-hovered")) pause(videoOf(card));
    });
  };

  cards.forEach((card) => {
    const video = videoOf(card);
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      if (!mouseMode) enterMouseMode();
      card.classList.add("is-hovered");
      play(video);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-hovered");
      if (mouseMode) pause(video);
    });
    card.addEventListener("focus", () => {
      if (card.matches(":focus-visible")) play(video);
    });
    card.addEventListener("blur", () => {
      if (mouseMode && !card.classList.contains("is-hovered")) pause(video);
    });
  });

  /* Buffer videos shortly before they scroll into view so hover starts without a wait. */
  if ("IntersectionObserver" in window) {
    const warm = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.preload = "auto";
          warm.unobserve(entry.target);
        });
      },
      { rootMargin: "200px 0px" }
    );
    cards.forEach((card) => videoOf(card) && warm.observe(videoOf(card)));
  }

  if (!mouseMode && !reduceMotion) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const detectMouse = (event) => {
      if (event.pointerType !== "mouse") return;
      document.removeEventListener("pointermove", detectMouse);
      if (!mouseMode) enterMouseMode();
    };
    document.addEventListener("pointermove", detectMouse, { passive: true });
    playCentred();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("case-grid");
  if (!root) return;
  renderProjects(root);
  setupCaseMedia(root);
});
