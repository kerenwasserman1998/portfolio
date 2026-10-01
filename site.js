/* Header: frosted nav pill once scrolled, and the mobile hamburger dropdown.
   KerenAI widget: grow/shrink its iframe when the widget reports open/closed. */
document.addEventListener("DOMContentLoaded", () => {
  const agent = document.querySelector(".agent-frame");
  if (agent) {
    const agentOrigin = new URL(agent.src).origin;
    window.addEventListener("message", (event) => {
      if (event.origin !== agentOrigin || event.data?.source !== "kerenai") return;
      agent.classList.toggle("is-open", event.data.state === "open");
    });
  }

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
