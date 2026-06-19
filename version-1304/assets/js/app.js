(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      document.body.classList.toggle('locked', navLinks.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var track = hero.querySelector('[data-hero-track]');
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var count = document.querySelector('[data-result-count]');
  var empty = document.querySelector('[data-empty-message]');
  var activeFilter = 'all';

  function updateSearch() {
    if (!searchInput || !cards.length) {
      return;
    }
    var keyword = searchInput.value.trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var filterMatch = activeFilter === 'all' || type.indexOf(activeFilter) !== -1 || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var show = filterMatch && keywordMatch;
      card.style.display = show ? '' : 'none';
      if (show) {
        visibleCount += 1;
      }
    });

    if (count) {
      count.textContent = String(visibleCount);
    }
    if (empty) {
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', updateSearch);
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        filters.forEach(function (other) {
          other.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        updateSearch();
      });
    });
    updateSearch();
  }
})();
