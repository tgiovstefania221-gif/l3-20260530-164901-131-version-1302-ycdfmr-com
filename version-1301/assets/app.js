(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-target') || 'search.html';
      if (value) {
        window.location.href = target + '?q=' + encodeURIComponent(value);
      } else {
        window.location.href = target;
      }
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeCategory = '';
  var activeText = '';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var matchesQuery = !query || search.indexOf(query) !== -1;
      var matchesCategory = !activeCategory || category === activeCategory;
      var matchesText = !activeText || search.indexOf(normalize(activeText)) !== -1;
      var show = matchesQuery && matchesCategory && matchesText;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', filterCards);
  }

  document.querySelectorAll('[data-filter-category]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || '';
      document.querySelectorAll('[data-filter-category]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      filterCards();
    });
  });

  document.querySelectorAll('[data-filter-text]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeText = button.getAttribute('data-filter-text') || '';
      document.querySelectorAll('[data-filter-text]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      filterCards();
    });
  });

  filterCards();
})();
