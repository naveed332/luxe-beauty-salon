/* =========================================================
   LUXE BEAUTY SALON — MAIN JAVASCRIPT
   1.  Helpers & config
   2.  Header (scroll state)
   3.  Mobile navigation
   4.  Active navigation link
   5.  Back to top
   6.  Scroll reveal
   7.  Animated counters
   8.  Gallery filter
   9.  Gallery lightbox
   10. Booking form
   11. Newsletter form
   12. Opening hours / "open now"
   13. Footer year
   ========================================================= */
(() => {
  "use strict";

  /* ---------------------------------------------------------
     1. HELPERS & CONFIG
  --------------------------------------------------------- */
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) =>
    Array.from(ctx.querySelectorAll(selector));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* Salon opening hours (24h). 0 = Sunday … 6 = Saturday. null = closed.
     Change these (and the time zone) to match the real salon. */
  const SALON_TIMEZONE = "America/Los_Angeles";
  const OPENING_HOURS = {
    0: null,
    1: [9, 19],
    2: [9, 19],
    3: [9, 19],
    4: [9, 19],
    5: [9, 19],
    6: [10, 18],
  };
  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const toastEl = $("#toast");
  const toastText = $("#toast-text");
  let toastTimer;

  function showToast(message) {
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3800);
  }

  /* ---------------------------------------------------------
     2. HEADER — SCROLL STATE
  --------------------------------------------------------- */
  const header = $("#header");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 40);
      const toTop = $(".back-to-top");
      if (toTop) toTop.classList.toggle("show", y > 700);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     3. MOBILE NAVIGATION
  --------------------------------------------------------- */
  const menuToggle = $("#menu-toggle");
  const navMenu = $("#nav-menu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    document.body.classList.toggle("no-scroll", open);
    if (!menuToggle) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const icon = $("i", menuToggle);
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () =>
      setMenu(!document.body.classList.contains("menu-open")),
    );

    $$("a", navMenu).forEach((link) =>
      link.addEventListener("click", () => setMenu(false)),
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open"))
        setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) setMenu(false);
    });
  }
  document.addEventListener("click", (e) => {
    if (e.target === document.body || e.target === document.documentElement)
      setMenu(false);
  });

  /* ---------------------------------------------------------
     4. ACTIVE NAVIGATION LINK (single-page anchors only)
  --------------------------------------------------------- */
  const hashLinks = $$('.nav-link[href^="#"]');

  if (hashLinks.length && "IntersectionObserver" in window) {
    const sections = $$("main section[id]");

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          hashLinks.forEach((link) =>
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`,
            ),
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------------------------------------------------
     5. BACK TO TOP — handled in the scroll listener above
  --------------------------------------------------------- */

  /* ---------------------------------------------------------
     6. SCROLL REVEAL
  --------------------------------------------------------- */
  $$("[data-stagger]").forEach((group) => {
    $$(".reveal", group).forEach((el, i) => el.style.setProperty("--i", i));
  });

  const revealEls = $$(".reveal, .reveal-left, .reveal-right");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------------------------------------------------
     7. ANIMATED COUNTERS  (data-count, data-decimals, data-suffix)
  --------------------------------------------------------- */
  const counters = $$("[data-count]");

  function formatCount(value, el) {
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    let text = value.toFixed(decimals);
    if (el.dataset.format === "comma") {
      text = Math.round(value).toLocaleString("en-US");
    }
    return text + suffix;
  }

  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = formatCount(target, el);
      return;
    }

    const duration = 1800;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(target * eased, el);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------------------------------------------------------
     8 & 9. GALLERY — FILTER + LIGHTBOX
  --------------------------------------------------------- */
  const galleryGrid = $("#gallery-grid");

  if (galleryGrid) {
    const items = $$(".g-item[data-title]", galleryGrid);
    const ctaTile = $(".g-cta", galleryGrid);
    const filterButtons = $$(".filter-btn");
    let visibleItems = items.slice();

    /* --- Filter counts --- */
    filterButtons.forEach((btn) => {
      const filter = btn.dataset.filter;
      const count =
        filter === "all"
          ? items.length
          : items.filter((i) => i.dataset.category === filter).length;
      const badge = $("sup", btn);
      if (badge) badge.textContent = count;
    });

    function restartReveal(els) {
      els.forEach((el, n) => {
        el.style.setProperty("--i", n);
        el.classList.remove("is-in");
        void el.offsetWidth; /* force reflow so the animation restarts */
        el.classList.add("is-in");
      });
    }

    function applyFilter(filter) {
      const matches = items.filter(
        (i) => filter === "all" || i.dataset.category === filter,
      );
      const showCta = filter === "all";
      const currentlyShown = [
        ...visibleItems,
        ...(ctaTile && !ctaTile.hidden ? [ctaTile] : []),
      ];

      currentlyShown.forEach((el) => el.classList.add("is-leaving"));

      setTimeout(
        () => {
          items.forEach((el) => {
            el.hidden = !matches.includes(el);
            el.classList.remove("is-leaving");
          });
          if (ctaTile) {
            ctaTile.hidden = !showCta;
            ctaTile.classList.remove("is-leaving");
          }
          galleryGrid.classList.toggle("is-filtered", filter !== "all");
          visibleItems = matches;
          restartReveal([...matches, ...(showCta && ctaTile ? [ctaTile] : [])]);
        },
        reduceMotion ? 0 : 230,
      );
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
      });
    });

    /* --- Lightbox (built dynamically so it works on every page) --- */
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.innerHTML = `
      <span class="lightbox-count" aria-live="polite"></span>
      <button class="lightbox-btn lightbox-close" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
      <figure class="lightbox-figure">
        <img class="lightbox-img" src="" alt="" />
        <figcaption class="lightbox-caption"><span></span><h3></h3></figcaption>
      </figure>
      <button class="lightbox-btn lightbox-next" type="button" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
    `;
    document.body.appendChild(lightbox);

    const lbImg = $(".lightbox-img", lightbox);
    const lbLabel = $(".lightbox-caption span", lightbox);
    const lbTitle = $(".lightbox-caption h3", lightbox);
    const lbCount = $(".lightbox-count", lightbox);
    const lbClose = $(".lightbox-close", lightbox);
    const lbPrev = $(".lightbox-prev", lightbox);
    const lbNext = $(".lightbox-next", lightbox);

    let index = 0;
    let lastFocus = null;

    function preload(i) {
      const item =
        visibleItems[(i + visibleItems.length) % visibleItems.length];
      if (item) new Image().src = item.getAttribute("href");
    }

    function render(animate) {
      const item = visibleItems[index];
      if (!item) return;

      const swap = () => {
        lbImg.src = item.getAttribute("href");
        lbImg.alt = $("img", item)?.alt || item.dataset.title;
        lbLabel.textContent = item.dataset.label || "";
        lbTitle.textContent = item.dataset.title || "";
        lbCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(visibleItems.length).padStart(2, "0")}`;
      };

      if (animate && !reduceMotion) {
        lbImg.classList.add("is-swapping");
        setTimeout(swap, 180);
        lbImg.onload = () => lbImg.classList.remove("is-swapping");
      } else {
        swap();
        lbImg.classList.remove("is-swapping");
      }

      const single = visibleItems.length < 2;
      lbPrev.style.display = single ? "none" : "";
      lbNext.style.display = single ? "none" : "";

      preload(index + 1);
      preload(index - 1);
    }

    function openLightbox(i) {
      index = i;
      lastFocus = document.activeElement;
      render(false);
      lightbox.classList.add("open");
      document.body.classList.add("no-scroll");
      lbClose.focus({ preventScroll: true });
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      if (!document.body.classList.contains("menu-open")) {
        document.body.classList.remove("no-scroll");
      }
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    function step(dir) {
      if (visibleItems.length < 2) return;
      index = (index + dir + visibleItems.length) % visibleItems.length;
      render(true);
    }

    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault(); /* stop the link from navigating to the raw image */
        const i = visibleItems.indexOf(item);
        if (i > -1) openLightbox(i);
      });
    });

    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", () => step(-1));
    lbNext.addEventListener("click", () => step(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);

      if (e.key === "Tab") {
        /* keep keyboard focus inside the dialog */
        const focusable = [lbClose, lbPrev, lbNext].filter(
          (b) => b.style.display !== "none",
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* Swipe on touch screens */
    let touchX = 0;
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
      },
      { passive: true },
    );
  }

  /* ---------------------------------------------------------
     10. BOOKING FORM
  --------------------------------------------------------- */
  const bookingForm = $("#booking-form");

  if (bookingForm) {
    const card = $("#booking-card");
    const fields = {
      name: $("#booking-name"),
      email: $("#booking-email"),
      phone: $("#booking-phone"),
      service: $("#booking-service"),
      date: $("#booking-date"),
      time: $("#booking-time"),
    };
    const dateError = $("#date-error");

    /* Earliest bookable date = today (local) */
    const pad = (n) => String(n).padStart(2, "0");
    const today = new Date();
    fields.date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const parseDate = (value) => {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    /* Saturday hours are shorter — disable slots outside 10 AM – 5 PM */
    function syncTimeSlots() {
      const day = fields.date.value
        ? parseDate(fields.date.value).getDay()
        : -1;
      $$("option", fields.time).forEach((opt) => {
        if (!opt.value) return;
        const hour = parseInt(opt.value, 10);
        opt.disabled = day === 6 && (hour < 10 || hour > 17);
      });
      if (fields.time.selectedOptions[0]?.disabled) fields.time.value = "";
    }

    const validators = {
      name: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      phone: (v) => v.replace(/\D/g, "").length >= 7,
      service: (v) => v !== "",
      time: (v) => v !== "",
      date: (v) => {
        if (!v) {
          dateError.textContent = "Please choose a date.";
          return false;
        }
        const picked = parseDate(v);
        const midnight = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        if (picked < midnight) {
          dateError.textContent = "Please choose a date in the future.";
          return false;
        }
        if (picked.getDay() === 0) {
          dateError.textContent =
            "We're closed on Sundays — please pick another day.";
          return false;
        }
        return true;
      },
    };

    function validateField(key) {
      const input = fields[key];
      const ok = validators[key](input.value);
      input.closest(".form-group").classList.toggle("invalid", !ok);
      return ok;
    }

    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      input.addEventListener("blur", () => {
        if (input.value) validateField(key);
      });
      input.addEventListener("input", () => {
        if (input.closest(".form-group").classList.contains("invalid"))
          validateField(key);
      });
      input.addEventListener("change", () => {
        if (key === "date") syncTimeSlots();
        if (input.value) validateField(key);
      });
    });

    /* "Book this service" links pre-select the service */
    $$("[data-service]").forEach((link) => {
      link.addEventListener("click", () => {
        fields.service.value = link.dataset.service;
        fields.service.closest(".form-group").classList.remove("invalid");
      });
    });

    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const results = Object.keys(fields).map((key) => [
        key,
        validateField(key),
      ]);
      const firstInvalid = results.find(([, ok]) => !ok);
      if (firstInvalid) {
        fields[firstInvalid[0]].focus();
        return;
      }

      const submit = $(".booking-submit", bookingForm);
      const label = submit.firstChild;
      const original = label.textContent;
      submit.disabled = true;
      label.textContent = "Sending… ";

      /* ------------------------------------------------------------------
         TODO: send the request to your server / email service here, e.g.

         fetch("/api/booking", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(Object.fromEntries(new FormData(bookingForm))),
         });

         For now we simulate a short network delay and show the confirmation.
      ------------------------------------------------------------------ */
      setTimeout(() => {
        const serviceText = fields.service.selectedOptions[0].textContent
          .split("—")[0]
          .trim();
        const dateText = parseDate(fields.date.value).toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
          },
        );
        const timeText = fields.time.selectedOptions[0].textContent;

        $("#success-name").textContent = fields.name.value.trim().split(" ")[0];
        $("#success-summary").innerHTML = `
          <li><i class="fa-solid fa-spa"></i> ${serviceText}</li>
          <li><i class="fa-regular fa-calendar"></i> ${dateText}</li>
          <li><i class="fa-regular fa-clock"></i> ${timeText}</li>`;

        card.classList.add("is-sent");
        submit.disabled = false;
        label.textContent = original;
        card.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
      }, 900);
    });

    $("#book-another")?.addEventListener("click", () => {
      bookingForm.reset();
      $$(".form-group.invalid", bookingForm).forEach((g) =>
        g.classList.remove("invalid"),
      );
      syncTimeSlots();
      card.classList.remove("is-sent");
    });
  }

  /* ---------------------------------------------------------
     11. NEWSLETTER FORM
  --------------------------------------------------------- */
  const newsletterForm = $("#newsletter-form");

  if (newsletterForm) {
    const input = $("input", newsletterForm);
    const msg = $("#newsletter-msg");

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      if (!valid) {
        msg.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }

      /* TODO: connect to your email provider (Mailchimp, Brevo, etc.) */
      msg.textContent = "Thank you for subscribing!";
      showToast("You're on the list — welcome to Luxe!");
      newsletterForm.reset();
      setTimeout(() => (msg.textContent = ""), 5000);
    });
  }

  /* ---------------------------------------------------------
     12. OPENING HOURS — "OPEN NOW" BADGE
  --------------------------------------------------------- */
  const statusEl = $("#open-status");
  const hoursList = $("#hours-list");

  function salonNow() {
    /* Current day + time in the salon's own time zone */
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: SALON_TIMEZONE,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const get = (type) => parts.find((p) => p.type === type)?.value;
    const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      get("weekday"),
    );
    return {
      day: dayIndex,
      minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10),
    };
  }

  const fmtHour = (h) => `${h % 12 || 12}:00 ${h >= 12 ? "PM" : "AM"}`;

  function updateOpenStatus() {
    if (!statusEl) return;
    let now;
    try {
      now = salonNow();
    } catch {
      return; /* very old browsers: leave the default label */
    }

    const todayHours = OPENING_HOURS[now.day];
    const isOpen =
      todayHours &&
      now.minutes >= todayHours[0] * 60 &&
      now.minutes < todayHours[1] * 60;

    statusEl.classList.remove("is-open", "is-closed");

    if (isOpen) {
      statusEl.classList.add("is-open");
      statusEl.textContent = `Open now · until ${fmtHour(todayHours[1])}`;
    } else {
      statusEl.classList.add("is-closed");
      /* find the next opening time */
      let label = "";
      for (let add = 0; add <= 7; add++) {
        const d = (now.day + add) % 7;
        const h = OPENING_HOURS[d];
        if (!h) continue;
        if (add === 0 && now.minutes >= h[0] * 60)
          continue; /* already past today's opening */
        label = `${add === 0 ? "today" : add === 1 ? "tomorrow" : DAY_NAMES[d]} ${fmtHour(h[0])}`;
        break;
      }
      statusEl.textContent = label ? `Closed · opens ${label}` : "Closed";
    }

    if (hoursList) {
      $$("li", hoursList).forEach((li) => {
        const days = li.dataset.days.split(",").map(Number);
        li.classList.toggle("today", days.includes(now.day));
      });
    }
  }

  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

  /* ---------------------------------------------------------
     13. FOOTER YEAR
  --------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
