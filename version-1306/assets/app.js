(function () {
  'use strict';

  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim() === '') {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      }
    });
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var track = hero.querySelector('[data-hero-track]');
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function go(nextIndex) {
      if (!track || slides.length === 0) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      track.scrollTo({
        left: track.clientWidth * index,
        behavior: 'smooth'
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        go(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        go(index + 1);
      }, 5600);
    }
  }

  function initInlineFilter() {
    var filter = document.querySelector('[data-inline-filter]');
    if (!filter) {
      return;
    }

    var input = filter.querySelector('[data-filter-text]');
    var typeSelect = filter.querySelector('[data-filter-type]');
    var yearSelect = filter.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var visible = matchesKeyword && matchesType && matchesYear;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown === 0 ? '' : 'none';
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root) {
      return;
    }

    var form = root.querySelector('[data-search-panel-form]');
    var keywordInput = root.querySelector('[data-search-keyword]');
    var typeSelect = root.querySelector('[data-search-type]');
    var regionSelect = root.querySelector('[data-search-region]');
    var results = root.querySelector('[data-search-results]');
    var count = root.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function renderCard(item) {
      return [
        '<article class="movie-list-card">',
        '  <a class="list-cover" href="movie/' + item.id + '.html">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
        '  </a>',
        '  <div class="list-copy">',
        '    <a class="list-title" href="movie/' + item.id + '.html">' + escapeHtml(item.title) + '</a>',
        '    <p>' + escapeHtml(item.one_line) + '</p>',
        '    <div class="meta-row">',
        '      <span>' + escapeHtml(item.year_text) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.type) + '</span>',
        '      <strong>' + escapeHtml(item.score) + ' 分</strong>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    fetch('data/search-index.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (items) {
        uniqueSorted(items.map(function (item) { return item.type; })).forEach(function (type) {
          var option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          typeSelect.appendChild(option);
        });

        uniqueSorted(items.map(function (item) { return item.region; })).forEach(function (region) {
          var option = document.createElement('option');
          option.value = region;
          option.textContent = region;
          regionSelect.appendChild(option);
        });

        function applySearch() {
          var keyword = keywordInput.value.trim().toLowerCase();
          var type = typeSelect.value;
          var region = regionSelect.value;
          var matched = items.filter(function (item) {
            var haystack = [item.title, item.region, item.type, item.year_text, item.genre_raw, item.tags, item.one_line]
              .join(' ')
              .toLowerCase();
            return (!keyword || haystack.indexOf(keyword) !== -1)
              && (!type || item.type === type)
              && (!region || item.region === region);
          });

          if (count) {
            count.textContent = '找到 ' + matched.length + ' 条结果';
          }

          if (matched.length === 0) {
            results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个关键词或筛选条件。</div>';
            return;
          }

          results.innerHTML = matched.slice(0, 120).map(renderCard).join('');
        }

        if (form) {
          form.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
          });
        }

        [keywordInput, typeSelect, regionSelect].forEach(function (control) {
          control.addEventListener('input', applySearch);
          control.addEventListener('change', applySearch);
        });

        applySearch();
      })
      .catch(function () {
        results.innerHTML = '<div class="empty-state">搜索索引加载失败，请直接通过分类或全部影片浏览。</div>';
      });
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var status = player.querySelector('[data-player-status]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-source-button]'));
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource(source) {
      if (!video || !source) {
        return;
      }

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      setStatus('正在初始化播放源');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，点击播放按钮开始播放');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('当前播放源暂时不可用，请切换备用源');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪，点击播放按钮开始播放');
        }, { once: true });
      } else {
        video.src = source;
        setStatus('浏览器正在尝试直接打开 HLS 播放源');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        if (!video) {
          return;
        }
        overlay.classList.add('is-hidden');
        video.play().catch(function () {
          overlay.classList.remove('is-hidden');
          setStatus('浏览器阻止了自动播放，请再点击一次播放器');
        });
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        loadSource(button.getAttribute('data-source-button'));
      });
    });

    var initialSource = player.getAttribute('data-source') || (buttons[0] && buttons[0].getAttribute('data-source-button'));
    loadSource(initialSource);
  }

  initHero();
  initInlineFilter();
  initSearchPage();
  initPlayer();
})();
