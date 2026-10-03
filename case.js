/* Case study pages: tool-name tooltips, hover lift, slideshow videos, tabs, before/after,
   scroll reveals, phone carousels, and highlight the rail chapter for the section in view. */
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
    .map((frame) => {
      const button = frame.querySelector(".cs-media-toggle");
      return {
        video: frame.querySelector("video"),
        button,
        noun: (button?.getAttribute("aria-label") || "").replace(/^(Pause|Play)\s+/, "") || "video",
        userPaused: reduceMotion,
        visible: false,
      };
    })
    .filter((show) => show.video && show.button);

  const syncShow = (show) => {
    if (show.visible && !show.userPaused) {
      show.video.preload = "auto";
      show.video.play().catch(() => {});
    } else {
      show.video.pause();
    }
    show.button.classList.toggle("is-paused", show.userPaused);
    show.button.setAttribute("aria-label", `${show.userPaused ? "Play" : "Pause"} ${show.noun}`);
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

  /* Tabs (WAI-ARIA tabs pattern): GSAP slides the indicator, crossfades panels and eases
     the height change between panels of different sizes. */
  const animate = Boolean(window.gsap) && !reduceMotion;

  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const list = root.querySelector(".tabs-list");
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const indicator = list.querySelector(".tabs-indicator");
    const wrap = root.querySelector(".tabs-panels");
    let current = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));

    const placeIndicator = (smooth) => {
      if (!indicator) return;
      const tab = tabs[current];
      const props = { x: tab.offsetLeft, width: tab.offsetWidth };
      if (window.gsap) {
        gsap.killTweensOf(indicator);
        if (smooth && animate) gsap.to(indicator, { ...props, duration: 0.45, ease: "power3.out" });
        else gsap.set(indicator, props);
      } else {
        indicator.style.transform = `translateX(${props.x}px)`;
        indicator.style.width = `${props.width}px`;
      }
    };

    const showOnly = (index) => {
      panels.forEach((panel, i) => {
        if (window.gsap) gsap.set(panel, { clearProps: "opacity,visibility,transform" });
        panel.hidden = i !== index;
      });
    };

    const select = (index, focus) => {
      if (index === current) return;
      const prev = current;
      current = index;
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      if (focus) tabs[index].focus();
      tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      placeIndicator(true);

      panels[prev].querySelectorAll("video").forEach((video) => {
        video.pause();
        if (video.readyState >= 1) video.currentTime = 0;
      });

      if (!animate) {
        showOnly(index);
        return;
      }
      gsap.killTweensOf([wrap, ...panels]);
      gsap.set(wrap, { clearProps: "height,overflow" });
      showOnly(prev);
      const startHeight = wrap.offsetHeight;
      gsap.to(panels[prev], {
        autoAlpha: 0, y: -6, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          showOnly(index);
          const endHeight = wrap.offsetHeight;
          gsap.fromTo(wrap, { height: startHeight, overflow: "hidden" },
            { height: endHeight, duration: 0.35, ease: "power2.out", clearProps: "height,overflow" });
          gsap.fromTo(panels[index], { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "opacity,visibility,transform" });
        },
      });
    };

    tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i, false)));
    list.addEventListener("keydown", (event) => {
      const keys = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      select((keys[event.key] + tabs.length) % tabs.length, true);
    });

    placeIndicator(false);
    window.addEventListener("resize", () => placeIndicator(false));
    document.fonts?.ready.then(() => placeIndicator(false));

    /* Hidden panels never enter the viewport, so lazy images there would load only on click. */
    const preload = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      root.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = "eager"; });
      observer.disconnect();
    }, { rootMargin: "400px 0px" });
    preload.observe(root);
  });

  /* Before/after: the switch pins the before; pressing and holding the frame shows the other
     state until release. data-start="before" opens pinned. Touch waits briefly and cancels on
     movement so scrolling past doesn't flash it. [data-when] note sets follow the state, and
     hovering or tapping a note spotlights the outlines with the same data-mark. */
  document.querySelectorAll("[data-hold]").forEach((root) => {
    const frame = root.querySelector(".ba-frame");
    const before = root.querySelector(".ba-before");
    const badge = root.querySelector(".ba-badge");
    const toggle = root.querySelector(".ba-switch");
    const noteSets = Array.from(root.querySelectorAll("[data-when]"));
    let held = false;
    let pinned = root.dataset.start === "before";
    let timer = null;
    let origin = null;

    const render = (instant) => {
      const showBefore = held !== pinned;
      const state = showBefore ? "before" : "after";
      root.dataset.showing = state;
      if (badge) badge.textContent = showBefore ? "Before" : "After";
      if (animate && !instant) gsap.to(before, { autoAlpha: showBefore ? 1 : 0, duration: 0.25, ease: "power2.out", overwrite: true });
      else if (window.gsap) gsap.set(before, { autoAlpha: showBefore ? 1 : 0 });
      else before.style.opacity = showBefore ? "1" : "0";
      noteSets.forEach((set) => {
        const show = set.dataset.when === state;
        if (set.hidden !== show) return;
        set.hidden = !show;
        if (show && animate && !instant) {
          gsap.fromTo(set, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "opacity,visibility,transform" });
        }
      });
    };

    root.querySelectorAll(".ba-points li[data-mark]").forEach((note) => {
      const spotlight = (on) => {
        if (on) root.dataset.focusMark = note.dataset.mark;
        else delete root.dataset.focusMark;
      };
      note.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") spotlight(true); });
      note.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") spotlight(false); });
      note.addEventListener("click", (event) => {
        if (event.pointerType === "mouse") return;
        spotlight(root.dataset.focusMark !== note.dataset.mark);
      });
    });
    const release = () => {
      clearTimeout(timer);
      origin = null;
      if (held) {
        held = false;
        render();
      }
    };

    frame.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      origin = { x: event.clientX, y: event.clientY };
      timer = setTimeout(() => {
        held = true;
        render();
      }, event.pointerType === "mouse" ? 0 : 120);
    });
    frame.addEventListener("pointermove", (event) => {
      if (!origin || held) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) {
        clearTimeout(timer);
        origin = null;
      }
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => frame.addEventListener(type, release));
    frame.addEventListener("contextmenu", (event) => event.preventDefault());

    toggle?.addEventListener("click", () => {
      pinned = !pinned;
      toggle.setAttribute("aria-pressed", String(pinned));
      delete root.dataset.focusMark;
      render();
    });
    if (toggle) toggle.setAttribute("aria-pressed", String(pinned));
    render(true);
  });

  /* Tooltips (.tip > .tip-btn + .tip-bubble): mouse hover, keyboard focus, or tap to toggle. */
  const tips = Array.from(document.querySelectorAll(".tip"));
  const closeTips = (except) => tips.forEach((tip) => tip !== except && tip.classList.remove("is-tipped"));
  tips.forEach((tip) => {
    const button = tip.querySelector(".tip-btn");
    const open = () => {
      closeTips(tip);
      tip.classList.add("is-tipped");
    };
    tip.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") open(); });
    tip.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") tip.classList.remove("is-tipped"); });
    button.addEventListener("focus", () => { if (button.matches(":focus-visible")) open(); });
    button.addEventListener("blur", () => tip.classList.remove("is-tipped"));
    button.addEventListener("click", (event) => {
      if (event.pointerType === "mouse") return;
      if (tip.classList.contains("is-tipped")) tip.classList.remove("is-tipped");
      else open();
    });
  });
  if (tips.length) {
    document.addEventListener("pointerdown", (event) => { if (!event.target.closest(".tip")) closeTips(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeTips(); });
  }

  /* SUS meter: the bar fills and the score counts up the first time it scrolls into view. */
  document.querySelectorAll("[data-sus]").forEach((root) => {
    const raw = root.dataset.score || "0";
    const score = parseFloat(raw);
    const decimals = (raw.split(".")[1] || "").length;
    const fill = root.querySelector(".sus-fill");
    const num = root.querySelector(".sus-num");
    const badge = root.querySelector(".sus-badge");
    root.style.setProperty("--sus-score", `${score}%`);
    if (!animate || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const counter = { value: 0 };
    const show = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .fromTo(fill, { width: "0%" }, { width: `${score}%`, duration: 1.4 }, 0)
      .fromTo(counter, { value: 0 }, {
        value: score, duration: 1.4,
        onUpdate: () => { num.textContent = counter.value.toFixed(decimals); },
      }, 0)
      .from(badge, { autoAlpha: 0, scale: 0.85, duration: 0.35 }, 1.1);
    num.textContent = (0).toFixed(decimals);
    ScrollTrigger.create({ trigger: root, start: "top 80%", once: true, onEnter: () => show.play() });
  });

  /* Reveal: children of [data-reveal] rise in one after another the first time the group scrolls in. */
  if (animate && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-reveal]").forEach((group) => {
      gsap.from(group.children, {
        autoAlpha: 0, y: 24, duration: 0.7, ease: "power3.out", stagger: 0.15,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
      });
    });
  }

  /* Carousel: the current screen sits in the middle with faded neighbors either side
     (.carousel--fade shows one wide screen at a time and crossfades instead).
     Image slides advance every data-interval ms, a video slide advances when it ends.
     Autoplay stops while hovered, keyboard-focused, off screen, or paused by the user;
     reduced motion starts paused. */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const stage = root.querySelector(".carousel-stage");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const caption = root.querySelector(".carousel-caption");
    const pauseBtn = root.querySelector(".carousel-pause");
    const interval = (Number(root.dataset.interval) || 8000) / 1000;
    const count = slides.length;
    const fade = root.classList.contains("carousel--fade");
    let current = -1;
    let userPaused = reduceMotion || !window.gsap;
    let hovering = false;
    let keyboardFocus = false;
    let visible = false;
    let progress = null;

    const dots = slides.map((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Show ${slide.dataset.caption.split(":")[0]}`);
      dot.innerHTML = '<span class="carousel-dot-bar"><span class="carousel-dot-fill"></span></span>';
      dot.addEventListener("click", () => go(i));
      root.querySelector(".carousel-dots").append(dot);
      return dot;
    });
    const fillOf = (i) => dots[i].querySelector(".carousel-dot-fill");
    const videoOf = (i) => slides[i].querySelector("video");

    /* Signed distance from the current slide, wrapping so both sides always have a neighbor. */
    const offset = (i) => {
      let d = (i - current + count) % count;
      if (d > count / 2) d -= count;
      return d;
    };

    const layout = (smooth) => {
      const spacing = slides[current].offsetWidth * parseFloat(getComputedStyle(root).getPropertyValue("--carousel-gap") || 0.86);
      slides.forEach((slide, i) => {
        const d = offset(i);
        const far = Math.abs(d);
        const props = fade
          ? { x: 0, scale: 1, autoAlpha: far === 0 ? 1 : 0, zIndex: count - far }
          : {
            x: d * spacing,
            scale: far === 0 ? 1 : 0.8,
            autoAlpha: far === 0 ? 1 : far === 1 ? 0.45 : 0,
            zIndex: count - far,
          };
        if (!window.gsap) {
          Object.assign(slide.style, {
            transform: `translateX(${props.x}px) scale(${props.scale})`,
            opacity: props.autoAlpha, visibility: props.autoAlpha ? "visible" : "hidden", zIndex: props.zIndex,
          });
        } else if (smooth && animate) {
          gsap.to(slide, { ...props, duration: 0.6, ease: "power3.out", overwrite: true });
        } else {
          gsap.set(slide, props);
        }
        slide.classList.toggle("is-neighbor", !fade && far === 1);
        slide.setAttribute("aria-hidden", String(far !== 0));
      });
    };

    const sync = () => {
      const running = !userPaused && visible;
      const video = videoOf(current);
      if (video) {
        if (running) {
          video.preload = "auto";
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      } else if (progress) {
        if (running && !hovering && !keyboardFocus) progress.resume();
        else progress.pause();
      }
      pauseBtn.classList.toggle("is-paused", userPaused);
      pauseBtn.setAttribute("aria-label", `${userPaused ? "Play" : "Pause"} slideshow`);
      caption.setAttribute("aria-live", running ? "off" : "polite");
    };

    const go = (index, smooth = true) => {
      index = (index + count) % count;
      if (index === current) return;
      if (current >= 0) {
        const old = videoOf(current);
        if (old) {
          old.pause();
          if (old.readyState >= 1) old.currentTime = 0;
        }
        dots[current].removeAttribute("aria-current");
        if (window.gsap) gsap.set(fillOf(current), { scaleX: 0 });
      }
      progress?.kill();
      progress = null;
      current = index;
      dots[current].setAttribute("aria-current", "true");
      caption.textContent = slides[current].dataset.caption;
      layout(smooth);
      const video = videoOf(current);
      if (video?.readyState >= 1) video.currentTime = 0;
      if (window.gsap && !video) {
        progress = gsap.fromTo(fillOf(current), { scaleX: 0 },
          { scaleX: 1, duration: interval, ease: "none", paused: true, onComplete: () => go(current + 1) });
      }
      sync();
    };

    slides.forEach((slide, i) => {
      const video = videoOf(i);
      if (!video) return;
      video.addEventListener("timeupdate", () => {
        if (i === current && video.duration && window.gsap) gsap.set(fillOf(i), { scaleX: video.currentTime / video.duration });
      });
      video.addEventListener("ended", () => {
        if (i === current) go(i + 1);
      });
    });

    root.querySelector(".carousel-prev").addEventListener("click", () => go(current - 1));
    root.querySelector(".carousel-next").addEventListener("click", () => go(current + 1));
    pauseBtn.addEventListener("click", () => {
      userPaused = !userPaused;
      if (!userPaused) keyboardFocus = false;
      sync();
    });

    root.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      go(current + (event.key === "ArrowRight" ? 1 : -1));
    });

    root.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      hovering = true;
      sync();
    });
    root.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      hovering = false;
      sync();
    });
    root.addEventListener("focusin", (event) => {
      if (!event.target.matches(":focus-visible")) return;
      keyboardFocus = true;
      sync();
    });
    root.addEventListener("focusout", (event) => {
      if (root.contains(event.relatedTarget)) return;
      keyboardFocus = false;
      sync();
    });

    /* Swipe on the stage; a click on a faded neighbor brings it to the middle. */
    let start = null;
    let swiped = false;
    stage.addEventListener("pointerdown", (event) => {
      start = { x: event.clientX, y: event.clientY };
      swiped = false;
    });
    stage.addEventListener("pointerup", (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        go(current + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener("pointercancel", () => { start = null; });
    stage.addEventListener("click", (event) => {
      if (swiped) return;
      const slide = event.target.closest(".carousel-slide.is-neighbor");
      if (slide) go(slides.indexOf(slide));
    });

    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.35 }).observe(stage);

    /* Off-center slides are hidden, so lazy images there would wait until they rotate in. */
    const preload = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      root.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = "eager"; });
      observer.disconnect();
    }, { rootMargin: "400px 0px" });
    preload.observe(root);

    go(0, false);
    window.addEventListener("resize", () => layout(false));
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
