(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs(".menu-toggle");
    var panel = qs(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
      document.body.classList.toggle("menu-open", !expanded);
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupFilters() {
    qsa("[data-filter-form]").forEach(function (form) {
      var input = qs("[data-filter-input]", form);
      var region = qs("[data-filter-region]", form);
      var year = qs("[data-filter-year]", form);
      var type = qs("[data-filter-type]", form);
      var section = form.closest("section") || document;
      var cards = qsa("[data-card]", section.parentNode || document);
      var empty = qs("[data-filter-empty]", section.parentNode || document);
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, region, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
