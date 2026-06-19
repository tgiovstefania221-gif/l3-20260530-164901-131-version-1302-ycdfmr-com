(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initHeader() {
    var header = qs('[data-site-header]');
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');

    function onScroll() {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
        document.body.classList.toggle('is-menu-open', menu.classList.contains('is-open'));
        toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
      });
    }
  }

  function initGlobalSearch() {
    qsa('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var base = form.getAttribute('data-search-base') || '';
        var target = base + 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) return;

    var track = qs('[data-hero-track]', root);
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!track || !slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    qsa('[data-filter-root]').forEach(function (root) {
      var textInput = qs('[data-filter-input]', root);
      var typeSelect = qs('[data-type-filter]', root);
      var yearSelect = qs('[data-year-filter]', root);
      var regionSelect = qs('[data-region-filter]', root);
      var resetButton = qs('[data-filter-reset]', root);
      var countNode = qs('[data-filter-count]', root);
      var emptyState = qs('[data-empty-state]', root);
      var cards = qsa('[data-filter-card]', root);

      function applyFilter() {
        var text = normalize(textInput ? textInput.value : '');
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          var matchesText = !text || haystack.indexOf(text) !== -1;
          var matchesType = !type || card.getAttribute('data-type') === type;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var matchesRegion = !region || card.getAttribute('data-region') === region;
          var show = matchesText && matchesType && matchesYear && matchesRegion;
          card.hidden = !show;
          if (show) visible += 1;
        });

        if (countNode) {
          countNode.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
        }

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      [textInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
        if (control) control.addEventListener('input', applyFilter);
        if (control) control.addEventListener('change', applyFilter);
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (textInput) textInput.value = '';
          if (typeSelect) typeSelect.value = '';
          if (yearSelect) yearSelect.value = '';
          if (regionSelect) regionSelect.value = '';
          applyFilter();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && textInput && root.hasAttribute('data-search-page')) {
        textInput.value = q;
      }

      applyFilter();
    });
  }

  function initImageFallbacks() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('image-missing');
      }
    }, true);
  }

  function initPlayer() {
    var video = qs('[data-player]');
    if (!video) return;

    var shell = qs('[data-video-shell]');
    var overlay = qs('[data-play-overlay]');
    var status = qs('[data-player-status]');
    var sourceButtons = qsa('[data-source-select]');
    var hls = null;
    var currentSource = video.getAttribute('data-src') || '';

    function setStatus(message) {
      if (status) status.textContent = message;
    }

    function destroyHls() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function loadSource(source, autoplay) {
      if (!source) {
        setStatus('当前影片暂未绑定播放源。');
        return;
      }

      currentSource = source;
      destroyHls();
      video.pause();
      video.removeAttribute('src');
      video.load();

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，点击播放按钮开始观看。');
          if (autoplay) {
            video.play().catch(function () {
              setStatus('浏览器阻止了自动播放，请手动点击播放。');
            });
          }
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放源加载异常，可尝试切换备用播放源或刷新页面。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪，点击播放按钮开始观看。');
        if (autoplay) {
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请手动点击播放。');
          });
        }
      } else {
        setStatus('当前浏览器不支持 HLS 播放，请使用现代浏览器访问。');
      }
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (item) { item.classList.remove('is-active'); });
        button.classList.add('is-active');
        loadSource(button.getAttribute('data-src'), true);
      });
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        if (!video.currentSrc && currentSource) {
          loadSource(currentSource, true);
        } else {
          video.play().catch(function () {
            setStatus('请再次点击播放器控制栏开始播放。');
          });
        }
      });
    }

    video.addEventListener('play', function () {
      if (shell) shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (shell) shell.classList.remove('is-playing');
    });

    loadSource(currentSource, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initGlobalSearch();
    initHero();
    initFilters();
    initImageFallbacks();
    initPlayer();
  });
})();
