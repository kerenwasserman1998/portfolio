/* Case study pages: tool-name tooltips, hover lift, slideshow videos, and highlight the
   rail chapter for the section in view. */
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    document.querySelectorAll(".cs-cover video").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  /* Lift: mouse hover or keyboard focus raises [data-lift] elements; values come from :root. */
  if (window.gsap && !reduceMotion) {
    const rootStyle = getComputedStyle(document.documentElement);
    const liftY = -(parseFloat(rootStyle.getPropertyValue("--lift-y")) || 4);
    const restShadow = rootStyle.getPropertyValue("--lift-shadow").trim();
    const raisedShadow = rootStyle.getPropertyValue("--lift-shadow-hover").trim();
    const raise = (el) =>
      gsap.to(el, { y: liftY, boxShadow: raisedShadow, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    const settle = (el) =>
      gsap.to(el, { y: 0, boxShadow: restShadow, duration: 0.6, ease: "power3.out", overwrite: "auto" });

    document.querySelectorAll("[data-lift]").forEach((el) => {
      el.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") raise(el);
      });
      el.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") settle(el);
      });
      el.addEventListener("focusin", () => {
        if (el.matches(":focus-visible, :has(:focus-visible)")) raise(el);
      });
      el.addEventListener("focusout", () => settle(el));
    });
  }

  /* Slideshows play only while on screen; the button's pause sticks until pressed again.
     Reduced motion starts them paused on the poster. */
  const slideshows = Array.from(document.querySelectorAll(".cs-media"))
    .map((frame) => ({
      video: frame.querySelector("video"),
      button: frame.querySelector(".cs-media-toggle"),
      userPaused: reduceMotion,
      visible: false,
    }))
    .filter((show) => show.video && show.button);

  const syncShow = (show) => {
    if (show.visible && !show.userPaused) {
      show.video.preload = "auto";
      show.video.play().catch(() => {});
    } else {
      show.video.pause();
    }
    show.button.classList.toggle("is-paused", show.userPaused);
    show.button.setAttribute("aria-label", show.userPaused ? "Play slideshow" : "Pause slideshow");
  };

  if (slideshows.length) {
    const showObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const show = slideshows.find((s) => s.video.parentElement === entry.target);
          if (!show) return;
          show.visible = entry.isIntersecting;
          syncShow(show);
        });
      },
      { threshold: 0.35 }
    );
    slideshows.forEach((show) => {
      show.button.addEventListener("click", () => {
        show.userPaused = !show.userPaused;
        syncShow(show);
      });
      syncShow(show);
      showObserver.observe(show.video.parentElement);
    });
  }

  /* Mouse hover via pointer events (embedded browsers can misreport (hover:hover));
     touch toggles on tap, since a tap doesn't focus a non-link on iOS. */
  const tools = Array.from(document.querySelectorAll(".tool"));
  const untip = (except) => tools.forEach((tool) => tool !== except && tool.classList.remove("is-tipped"));
  tools.forEach((tool) => {
    tool.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") tool.classList.add("is-tipped");
    });
    tool.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") tool.classList.remove("is-tipped");
    });
    tool.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse") return;
      untip(tool);
      tool.classList.toggle("is-tipped");
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".tool")) untip();
  });

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
