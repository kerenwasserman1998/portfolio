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

/* Contact footer: a few tiny pastel stars that twinkle softly.
   Purely decorative; paused while the footer is off screen. */
document.addEventListener("DOMContentLoaded", () => {
  const foot = document.querySelector("footer#contact");
  if (!foot || foot.querySelector(".foot-stars")) return;

  const colors = ["#c9b8f0", "#a8dccf", "#f6c3cf", "#b5d3f5", "#f5dfa6"];
  // Fixed spots (% of footer) so the sky looks the same on every visit.
  const spots = [
    [6, 22], [14, 78], [27, 12], [36, 64], [44, 30], [52, 86],
    [61, 18], [68, 58], [77, 10], [84, 72], [91, 34], [97, 88]
  ];
  const sky = document.createElement("div");
  sky.className = "foot-stars";
  sky.setAttribute("aria-hidden", "true");
  spots.forEach(([x, y], i) => {
    const s = document.createElement("span");
    s.className = "foot-star" + (i % 3 === 2 ? " foot-star--dot" : "");
    s.style.left = x + "%";
    s.style.top = y + "%";
    s.style.setProperty("--c", colors[i % colors.length]);
    s.style.setProperty("--size", (i % 3 === 2 ? 4 : 7 + (i * 5) % 5) + "px");
    s.style.setProperty("--dur", (3.6 + (i * 7) % 5 * 0.6).toFixed(1) + "s");
    s.style.setProperty("--delay", (-(i * 1.3) % 6).toFixed(1) + "s");
    sky.appendChild(s);
  });
  foot.prepend(sky);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => sky.classList.toggle("is-on", e.isIntersecting))
      .observe(foot);
  } else {
    sky.classList.add("is-on");
  }
});
