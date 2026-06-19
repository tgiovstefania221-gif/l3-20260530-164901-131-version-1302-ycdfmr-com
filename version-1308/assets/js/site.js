(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('is-active', currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('is-active', currentIndex === index);
      });
    }

    dots.forEach(function (dot, currentIndex) {
      dot.addEventListener('click', function () {
        show(currentIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function collectOptions(cards, attribute) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attribute);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');

    fillSelect(regionSelect, collectOptions(cards, 'data-region'));
    fillSelect(typeSelect, collectOptions(cards, 'data-type'));
    fillSelect(yearSelect, collectOptions(cards, 'data-year'));

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
      });
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var status = player.querySelector('[data-player-status]');
      var src = player.getAttribute('data-src');
      var hlsInstance = null;
      var sourceReady = false;

      if (!video || !src) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function prepareSource() {
        if (sourceReady) {
          return;
        }

        sourceReady = true;
        setStatus('正在连接播放源');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('点击画面可暂停或继续播放');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请稍后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            setStatus('点击画面可暂停或继续播放');
          });
          video.addEventListener('error', function () {
            setStatus('视频加载失败，请稍后重试');
          });
        } else {
          video.src = src;
          setStatus('正在尝试使用浏览器原生播放');
        }
      }

      function togglePlay() {
        prepareSource();
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('请再次点击播放');
            });
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', togglePlay);
      }
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
        setStatus('已暂停');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-root]');
    if (!root || !window.SEARCH_INDEX) {
      return;
    }

    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('[data-search-input]');
    var result = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function createCard(item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.setAttribute('data-title', item.title);
      article.setAttribute('data-region', item.region);
      article.setAttribute('data-type', item.type);
      article.setAttribute('data-year', item.year);
      article.setAttribute('data-genre', item.genre);
      article.innerHTML = [
        '<a class="poster-link" href="' + item.url + '" title="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-type">' + escapeHtml(item.type) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '<p>' + escapeHtml(item.desc) + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
        '</div>'
      ].join('');
      return article;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[ch];
      });
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      var items = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return true;
        }
        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);

      result.innerHTML = '';
      items.forEach(function (item) {
        result.appendChild(createCard(item));
      });
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }

    render(initial);
  }

  setupHero();
  setupFilters();
  setupPlayers();
  setupSearchPage();
})();
