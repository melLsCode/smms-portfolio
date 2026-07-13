/* =========================================================
   JAMEL DUARTE — PORTFOLIO  ·  script.js
   Pure vanilla JS. No dependencies.
   Sections:
   1. Helpers & feature detection
   2. Skills data + render
   3. Preloader
   4. Custom cursor
   5. Navbar (scroll state + mobile menu)
   6. Smooth anchor scroll
   7. Scroll reveal (IntersectionObserver)
   8. Animated stat counters
   9. Hero parallax (mouse + scroll)
   10. Magnetic buttons
   11. Card tilt
   12. Live timecode
   13. Contact form
   14. Misc (year)
========================================================== */

(function () {
  "use strict";

  /* ---------- 1. HELPERS & FEATURE DETECTION ---------- */
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer  = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  /* ---------- 2. SKILLS DATA + RENDER ---------- */
  /* Only real, claimed skills. Each renders as an animated glass card. */
  const skills = [
    { name: "Video Editing",     note: "Retention-first cuts",   icon: "play" },
    { name: "CapCut",            note: "Primary editor",         icon: "scissors" },
    { name: "Canva",             note: "Graphics & layouts",     icon: "layout" },
    { name: "YouTube Automation",note: "End-to-end pipeline",    icon: "bot" },
    { name: "Content Planning",  note: "Calendars & batching",   icon: "calendar" },
    { name: "Thumbnail Design",  note: "High-CTR visuals",       icon: "image" },
    { name: "YouTube Analytics", note: "Read the numbers",       icon: "chart" },
    { name: "Facebook",          note: "Pages & reach",          icon: "globe" },
    { name: "Instagram",         note: "Reels & grid",           icon: "camera" },
    { name: "TikTok",            note: "Short-form hooks",       icon: "music" },
    { name: "Google Drive",      note: "Clean file systems",     icon: "folder" },
    { name: "Google Sheets",     note: "Trackers & data",        icon: "grid" },
    { name: "AI Workflow",       note: "Faster, not cheaper",    icon: "spark" },
    { name: "Research",          note: "Viral topic hunting",    icon: "search" },
  ];

  /* Minimal inline SVG icon set (stroke-based) */
  const icons = {
    play:     '<path d="M8 5v14l11-7z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 18M8.5 16.5L20 6"/>',
    layout:   '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    bot:      '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M8 13h.01M16 13h.01M9 17h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    image:    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    chart:    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    globe:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    camera:   '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    music:    '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    folder:   '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid:     '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    spark:    '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    search:   '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  };

  const grid = $("#skillsGrid");
  if (grid) {
    grid.innerHTML = skills.map(s => `
      <article class="skill reveal" data-tilt>
        <span class="skill__icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[s.icon] || icons.spark}</svg>
        </span>
        <h3>${s.name}</h3>
        <p>${s.note}</p>
      </article>
    `).join("");
  }

  /* ---------- 3. PRELOADER ---------- */
  const pre = $("#preloader");
  const preCount = $("#preCount");
  const preBar = $("#preBar");

  function runPreloader() {
    if (!pre) return finish();
    let n = 0;
    const dur = reduceMotion ? 1 : 1100;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      n = Math.floor(p * 100);
      if (preCount) preCount.textContent = String(n).padStart(2, "0");
      if (preBar) preBar.style.width = p * 100 + "%";
      if (p < 1) requestAnimationFrame(tick);
      else finish();
    })(start);
  }
  function finish() {
    document.body.classList.add("loaded");
    if (pre) pre.classList.add("done");
    // kick off hero reveal immediately
    revealOnce();
  }
  window.addEventListener("load", runPreloader);

  /* ---------- 4. CUSTOM CURSOR ---------- */
  const cursor = $("#cursor");
  const cursorLabel = $("#cursorLabel");
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2;   // target
    let cx = mx, cy = my;                              // current

    window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

    (function render() {
      cx = lerp(cx, mx, 0.2);
      cy = lerp(cy, my, 0.2);
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(render);
    })();

    // contextual states
    $$("[data-media]").forEach(el => {
      el.addEventListener("mouseenter", () => { cursor.classList.add("is-media"); cursorLabel.textContent = "Play"; });
      el.addEventListener("mouseleave", () => { cursor.classList.remove("is-media"); cursorLabel.textContent = ""; });
    });
    $$("a, button, [data-magnetic]").forEach(el => {
      if (el.hasAttribute("data-media")) return;
      el.addEventListener("mouseenter", () => cursor.classList.add("is-link"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-link"));
    });
  }

  /* ---------- 5. NAVBAR ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const navLinks = $("#navLinks");

  let lastScroll = 0, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 40);
    lastScroll = y;
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- 6. SMOOTH ANCHOR SCROLL (with nav offset) ---------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- 7. SCROLL REVEAL ---------- */
  let revObserver;
  function setupReveal() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(el => el.classList.add("in"));
      return;
    }
    revObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger when several reveal at once
          const delay = Math.min(i * 70, 280);
          setTimeout(() => entry.target.classList.add("in"), delay);
          revObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    $$(".reveal").forEach(el => revObserver.observe(el));
  }
  // also flip timeline nodes when their row enters
  function setupTimeline() {
    if (!("IntersectionObserver" in window)) { $$(".tl").forEach(t => t.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    $$(".tl").forEach(t => io.observe(t));
  }
  function revealOnce() {
    // reveal anything already in view immediately (hero)
    $$(".reveal").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92) el.classList.add("in");
    });
  }
  setupReveal();
  setupTimeline();

  /* ---------- 8. ANIMATED STAT COUNTERS ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const plus = el.hasAttribute("data-plus") ? "+" : "";
    const dur = reduceMotion ? 1 : 1400;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix + plus;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  const stats = $$(".stat");
  if (stats.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.6 });
      stats.forEach(s => io.observe(s));
    } else { stats.forEach(animateCount); }
  }

  /* ---------- 9. HERO PARALLAX (mouse + scroll) ---------- */
  const parallaxEls = $$("[data-parallax]");
  const floatEls = $$("[data-float]");
  if (finePointer && !reduceMotion && (parallaxEls.length || floatEls.length)) {
    let px = 0, py = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", e => {
      tx = (e.clientX / innerWidth - 0.5);
      ty = (e.clientY / innerHeight - 0.5);
    });
    (function loop() {
      px = lerp(px, tx, 0.06); py = lerp(py, ty, 0.06);
      parallaxEls.forEach(el => { el.style.transform = `translate(${px * 18}px, ${py * 18}px)`; });
      floatEls.forEach((el, i) => {
        const d = (i + 1) * 10;
        el.style.setProperty("--mx", `${px * d}px`);
        el.style.setProperty("--my", `${py * d}px`);
        el.style.transform = `translate(${px * d}px, ${py * d}px)`;
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 10. MAGNETIC BUTTONS ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach(el => {
      const strength = 0.35;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- 11. CARD TILT ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(card => {
      const max = 6;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${cx * max}deg) rotateX(${-cy * max}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 12. LIVE TIMECODE (hero film frame) ---------- */
  const tc = $("#timecode");
  if (tc && !reduceMotion) {
    let f = 0;
    const pad = n => String(n).padStart(2, "0");
    setInterval(() => {
      f++;
      const frames = f % 30;
      const secs = Math.floor(f / 30) % 60;
      const mins = Math.floor(f / 1800) % 60;
      const hrs = Math.floor(f / 108000) % 24;
      tc.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
    }, 1000 / 30);
  }

  /* ---------- 13. CONTACT FORM ---------- */
  /* Front-end only. Connect to Formspree, EmailJS, or your own endpoint
     to actually receive submissions. */
  const form = $("#contactForm");
  const status = $("#formStatus");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const msg = $("#message").value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !msg) {
        status.textContent = "Please fill in every field with a valid email.";
        status.className = "contact__status err";
        return;
      }
      status.textContent = "Thanks — your message is ready to send. (Connect a form backend to deliver it.)";
      status.className = "contact__status ok";
      form.reset();
    });
  }

  /* ---------- 14. MISC ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

})();