(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(query, root) {
    var normalized = normalize(query);
    var list = root.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matched = !normalized || text.indexOf(normalized) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = root.querySelector('[data-empty-result]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      if (input && initial) {
        input.value = initial;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(input ? input.value : '', document);
      });
      if (input) {
        input.addEventListener('input', function () {
          filterCards(input.value, document);
        });
      }
    });
    if (initial) {
      filterCards(initial, document);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
