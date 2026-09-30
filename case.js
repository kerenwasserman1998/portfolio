/* Case study pages: highlight the rail chapter for the section in view. */
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".cs-cover video").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  const links = Array.from(document.querySelectorAll(".cs-index a"));
  if (!links.length) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  /* Active = last section whose top has crossed 40% of the viewport; the final
     chapter wins at the page bottom since it may be too short to reach that line. */
  const update = () => {
    const line = window.innerHeight * 0.4;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    if (atBottom) current = sections[sections.length - 1];
    setActive(current.id);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
});
