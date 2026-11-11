/* Al Saaeid — shared behaviours */
(function () {
  "use strict";

  /* Sticky header shadow */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Product filters */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".prod-card[data-cat]");
  if (filterBtns.length && cards.length) {
    var applyFilter = function (cat) {
      cards.forEach(function (card) {
        var show = cat === "all" || card.dataset.cat === cat || (cat === "new" && card.hasAttribute("data-new"));
        card.classList.toggle("is-hidden", !show);
      });
      filterBtns.forEach(function (b) {
        var active = b.dataset.filter === cat;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () { applyFilter(btn.dataset.filter); });
    });
    /* Deep link: products.html#juices etc. */
    var hash = location.hash.replace("#", "");
    var valid = Array.prototype.some.call(filterBtns, function (b) { return b.dataset.filter === hash; });
    if (valid) {
      applyFilter(hash);
      var grid = document.querySelector(".prod-grid");
      if (grid) setTimeout(function () { grid.scrollIntoView({ block: "start" }); }, 60);
    }
  }

  /* Auto slider (homepage new arrivals): endless loop, arrows, autoplay */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector(".slider__track");
    if (!track || !track.children.length) return;
    var originals = Array.prototype.slice.call(track.children);
    var n = originals.length;
    /* Clone the set once so the loop can run on seamlessly */
    originals.forEach(function (card) {
      var c = card.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.setAttribute("data-clone", "");
      c.querySelectorAll("a, button").forEach(function (el) { el.setAttribute("tabindex", "-1"); });
      track.appendChild(c);
    });
    var rtl = getComputedStyle(track).direction === "rtl";
    var sign = rtl ? -1 : 1;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timer = null, paused = false, visible = true;
    function step() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return originals[0].getBoundingClientRect().width + gap;
    }
    function pos() { return Math.abs(track.scrollLeft); }
    function jump(p) { track.scrollTo({ left: sign * p, behavior: "instant" }); }
    function go(dir) {
      var s = step(), setW = n * s, jumped = false;
      if (dir > 0 && pos() >= setW - 2) { jump(pos() - setW); jumped = true; }
      if (dir < 0 && pos() <= 2) { jump(pos() + setW); jumped = true; }
      var target = Math.round(pos() / s + dir) * s;
      var run = function () { track.scrollTo({ left: sign * target, behavior: reduce ? "instant" : "smooth" }); };
      /* A smooth scroll in the same frame as the jump gets dropped, so wait a frame */
      if (jumped) requestAnimationFrame(function () { requestAnimationFrame(run); }); else run();
    }
    /* Keep a swiped position inside the first set */
    var settle;
    track.addEventListener("scroll", function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var setW = n * step();
        if (pos() >= setW - 2) jump(pos() - setW);
      }, 400);
    }, { passive: true });
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (reduce || paused || !visible || document.hidden) return;
      timer = setInterval(function () { go(1); }, 3500);
    }
    slider.querySelector(".slider__btn--next").addEventListener("click", function () { go(1); });
    slider.querySelector(".slider__btn--prev").addEventListener("click", function () { go(-1); });
    slider.addEventListener("mouseenter", function () { paused = true; stop(); });
    slider.addEventListener("mouseleave", function () { paused = false; start(); });
    slider.addEventListener("focusin", function () { paused = true; stop(); });
    slider.addEventListener("focusout", function () { paused = false; start(); });
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", function () { setTimeout(start, 3000); }, { passive: true });
    document.addEventListener("visibilitychange", start);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; start(); }, { threshold: 0.3 }).observe(slider);
    } else { start(); }
  });

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
