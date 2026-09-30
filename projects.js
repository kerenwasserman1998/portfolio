/* Case study data — add a project by appending an entry. */
const projects = [
  {
    id: "opsin",
    href: "opsin.html",
    summary: "Shaped the GenAI security platform that raised $7M in seed funding.",
    company: "Opsin",
    year: "2025",
    gradient: ["#ffb4a2", "#ffe0c7"],
    video: null,
    webm: null,
    poster: null,
    image: null,
  },
  {
    id: "acme",
    href: "acme.html",
    summary: "Helping fraud analysts catch real threats with less noise in credit-risk monitoring.",
    company: "ACME",
    year: "2024",
    gradient: ["#c6e9e6", "#dce7fb"],
    video: null,
    webm: null,
    poster: null,
    image: null,
  },
  {
    id: "soc",
    href: "soc.html",
    summary: "Cutting alert fatigue so security analysts focus on the threats that matter.",
    company: "SOC Signal",
    year: "2024",
    gradient: ["#ffd6c9", "#e8d5f2"],
    video: "assets/soc-signal.mp4",
    webm: null,
    poster: "assets/soc-signal-poster.jpg",
    image: null,
  },
  {
    id: "joymee",
    href: "joymee.html",
    summary: "Widening access to mental health education and support.",
    company: "JoyMee",
    year: "2023",
    gradient: ["#f3e6c7", "#efe4ec", "#dce7fb"],
    video: null,
    webm: null,
    poster: null,
    image: null,
  },
];

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
    const sources = [];
    if (project.webm) {
      sources.push(`<source src="${project.webm}" type="video/webm">`);
    }
    if (project.video) {
      sources.push(`<source src="${project.video}" type="video/mp4">`);
    }
    return `<video class="case-video" muted loop playsinline preload="metadata"${poster}>${sources.join("")}</video>`;
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
      <a class="case" href="${p.href}" data-case-id="${p.id}">
        <div class="case-frame${multi}${full}" style="${gradientStyle(p.gradient)}">
          <div class="case-media">
            ${mediaHTML(p)}
          </div>
        </div>
        <div class="case-caption">
          <p class="case-summary">${p.summary}</p>
          <p class="case-meta">${p.company} • ${p.year}</p>
        </div>
      </a>`;
    })
    .join("");
}

function setupCaseVideos(root) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = root.querySelectorAll(".case-video");

  if (reduceMotion) {
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
      try {
        video.currentTime = 0;
      } catch (_) {
        /* ignore */
      }
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    videos.forEach((video) => {
      video.play().catch(() => {});
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.35 }
  );

  videos.forEach((video) => observer.observe(video));
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("case-grid");
  if (!root) return;
  renderProjects(root);
  setupCaseVideos(root);
});
