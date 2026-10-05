/* Header: frosted nav pill once scrolled, and the mobile hamburger dropdown.
   KerenAI widget: grow/shrink its iframe when the widget reports open/closed. */
document.addEventListener("DOMContentLoaded", () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const agent = document.querySelector(".agent-frame");
  if (agent) {
    const agentOrigin = new URL(agent.src).origin;
    window.addEventListener("message", (event) => {
      if (event.origin !== agentOrigin || event.data?.source !== "kerenai") return;
      agent.classList.toggle("is-open", event.data.state === "open");
    });
  }

  /* Scroll reveal for simple pages: [data-rise] children rise in one after another,
     [data-rise-self] rises as one block, the first time each scrolls into view. */
  if (window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-rise], [data-rise-self]").forEach((el) => {
      const targets = el.hasAttribute("data-rise") ? el.children : el;
      gsap.from(targets, {
        autoAlpha: 0, y: 26, duration: 0.7, ease: "power3.out", stagger: 0.12,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
  }

  /* Logo pop-cards: hover / focus open them in CSS; a tap toggles, Escape or a tap outside closes. */
  document.querySelectorAll(".logo-pop").forEach((pop) => {
    const trigger = pop.querySelector(".logo-pop-trigger");
    const set = (open) => {
      pop.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    trigger.addEventListener("click", () => set(!pop.classList.contains("is-open")));
    document.addEventListener("click", (event) => { if (!pop.contains(event.target)) set(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") set(false); });
  });

  const header = document.querySelector("header");
  if (!header) return;

  const syncScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", syncScrolled, { passive: true });
  syncScrolled();

  /* Driven by real mouse pointer events rather than the (hover:hover) media query,
     which some embedded browsers report as false even with a mouse. Touch never triggers it. */
  const nav = header.querySelector("nav");
  if (nav) {
    const glide = document.createElement("span");
    glide.className = "nav-glide";
    glide.setAttribute("aria-hidden", "true");
    nav.prepend(glide);
    nav.classList.add("has-glide");
    let hovered = null;

    const clearHover = () => {
      nav.classList.remove("is-gliding");
      hovered?.classList.remove("is-hovered");
      hovered = null;
    };

    nav.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "mouse") return;
      const link = event.target.closest("a");
      if (!link || link === hovered) return;
      const appearing = !nav.classList.contains("is-gliding");
      glide.classList.toggle("nav-glide--instant", appearing);
      const navBox = nav.getBoundingClientRect();
      const linkBox = link.getBoundingClientRect();
      glide.style.setProperty("--glide-x", `${linkBox.left - navBox.left - nav.clientLeft}px`);
      glide.style.setProperty("--glide-w", `${linkBox.width}px`);
      if (appearing) void glide.offsetWidth;
      hovered?.classList.remove("is-hovered");
      hovered = link;
      link.classList.add("is-hovered");
      nav.classList.add("is-gliding");
      if (appearing) requestAnimationFrame(() => glide.classList.remove("nav-glide--instant"));
    });
    nav.addEventListener("pointerleave", clearHover);
  }

  const toggle = header.querySelector(".nav-toggle");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!header.classList.contains("menu-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 768px)").addEventListener("change", (mq) => {
    if (mq.matches) setOpen(false);
  });
});

/* Tiny pastel stars that twinkle softly behind the hero and the contact footer,
   plus a shooting star every 10–15s that lands on the hero highlight and recolors it.
   Purely decorative; everything pauses while off screen. */
document.addEventListener("DOMContentLoaded", () => {
  const COLORS = ["#c9b8f0", "#a8dccf", "#f6c3cf", "#b5d3f5", "#f5dfa6"];
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fixed spots (% of the area) so the sky looks the same on every visit.
  const makeSky = (host, spots) => {
    if (!host || host.querySelector(":scope > .stars")) return;
    const sky = document.createElement("div");
    sky.className = "stars";
    sky.setAttribute("aria-hidden", "true");
    spots.forEach(([x, y], i) => {
      const dot = i % 4 === 3;
      const s = document.createElement("span");
      s.className = "star" + (dot ? " star--dot" : "");
      s.style.left = x + "%";
      s.style.top = y + "%";
      s.style.setProperty("--c", COLORS[i % COLORS.length]);
      s.style.setProperty("--size", (dot ? 4 + (i % 2) : 8 + (i * 5) % 6) + "px");
      s.style.setProperty("--dur", (3.4 + ((i * 7) % 6) * 0.55).toFixed(1) + "s");
      s.style.setProperty("--delay", (-((i * 1.7) % 6)).toFixed(1) + "s");
      sky.appendChild(s);
    });
    host.prepend(sky);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => sky.classList.toggle("is-on", e.isIntersecting)).observe(host);
    } else sky.classList.add("is-on");
  };

  makeSky(document.querySelector("footer#contact"), [
    [4, 18], [9, 70], [16, 40], [22, 88], [28, 14], [33, 58], [39, 30], [45, 80],
    [50, 12], [55, 50], [60, 90], [64, 26], [70, 66], [75, 10], [80, 44], [85, 84],
    [89, 22], [93, 60], [97, 36], [98, 90]
  ]);

  const hero = document.querySelector(".hero");
  makeSky(hero, [
    [2, 14], [8, 62], [14, 30], [21, 92], [30, 8], [38, 78], [47, 4], [55, 94],
    [63, 12], [70, 70], [76, 30], [82, 88], [87, 8], [91, 48], [96, 20], [99, 74]
  ]);

  /* Shooting star -> highlight color */
  const hl = hero && hero.querySelector(".hl");
  if (!hl || calm) return;
  const HL = ["#dce7fb", "#e6dcfb", "#d4f1e8", "#fbdde4", "#faedc4"];
  const TRAIL = ["#9fbdf0", "#b9a2ee", "#8fd3bd", "#f0a3b6", "#ebc970"]; // deeper twin of each, so the streak shows on white
  let idx = 0, timer = null, visible = true;

  const shoot = () => {
    const box = hero.getBoundingClientRect();
    const r = hl.getBoundingClientRect();
    // Land on the top-right corner of the highlight, coming in from up and to the right.
    const endX = r.right - box.left - 6, endY = r.top - box.top + 4;
    const dx = Math.min(260, box.right - r.right + 120), dy = -150;
    const ang = Math.atan2(dy, dx) * 180 / Math.PI; // tail points back where it came from
    const next = HL[(idx + 1) % HL.length], trail = TRAIL[(idx + 1) % HL.length];

    const star = document.createElement("span");
    star.className = "shooting-star";
    star.setAttribute("aria-hidden", "true");
    star.style.setProperty("--c", trail);
    star.style.left = endX + "px";
    star.style.top = endY + "px";
    hero.appendChild(star);

    const anim = star.animate([
      { transform: `translate(${dx}px, ${dy}px) rotate(${ang}deg) scaleX(.3)`, opacity: 0 },
      { opacity: 1, offset: .25 },
      { transform: `translate(0, 0) rotate(${ang}deg) scaleX(1)`, opacity: 1, offset: .9 },
      { transform: `translate(0, 0) rotate(${ang}deg) scaleX(0)`, opacity: 0 }
    ], { duration: 1100, easing: "cubic-bezier(.3,.1,.3,1)" });

    anim.onfinish = () => {
      star.remove();
      idx = (idx + 1) % HL.length;
      hl.style.setProperty("--hl-c", next);
      hl.classList.remove("is-hit"); void hl.offsetWidth; hl.classList.add("is-hit");
      const spark = document.createElement("span");
      spark.className = "hl-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.style.setProperty("--c", trail);
      spark.style.left = endX + "px";
      spark.style.top = endY + "px";
      hero.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove());
    };
  };

  const schedule = (ms) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (visible && !document.hidden) shoot();
      schedule(10000 + Math.random() * 5000);
    }, ms);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  }
  schedule(5000);
});
