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
        var show = cat === "all" || card.dataset.cat === cat;
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

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
