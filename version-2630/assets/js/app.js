(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');
  if (filterGrid) {
    var keywordInput = document.querySelector('.js-page-filter');
    var regionSelect = document.querySelector('.js-region-filter');
    var typeSelect = document.querySelector('.js-type-filter');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && keywordInput) {
      keywordInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();

function activateMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('player-cover');
  var hls = null;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    loadSource();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (cover) {
      cover.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
