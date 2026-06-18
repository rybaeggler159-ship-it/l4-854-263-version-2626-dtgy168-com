(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "×" : "☰";
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    setHero(0);
    window.setInterval(function () {
      setHero(current + 1);
    }, 5000);
  }

  function filterCards(root) {
    const input = root.querySelector("[data-search]");
    const buttons = Array.from(root.querySelectorAll("[data-filter]"));
    const cards = Array.from(root.querySelectorAll(".movie-card, .compact-card, .rank-row"));
    let filter = "all";

    function apply() {
      const query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const year = card.getAttribute("data-year") || "";
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchFilter = filter === "all" || type === filter || year === filter || haystack.indexOf(filter.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden-card", !(matchQuery && matchFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        filter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  }

  document.querySelectorAll("[data-filter-root]").forEach(filterCards);
})();
