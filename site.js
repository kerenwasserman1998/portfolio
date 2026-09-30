/* Header: frosted background once scrolled, and the mobile "Menu" dropdown. */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  if (!header) return;

  const syncScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", syncScrolled, { passive: true });
  syncScrolled();

  const toggle = header.querySelector(".nav-toggle");
  const nav = header.querySelector("nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
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
