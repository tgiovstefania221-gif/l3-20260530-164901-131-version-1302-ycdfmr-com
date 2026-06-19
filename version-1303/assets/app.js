(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var frame = qs('.hero-frame');
        if (!frame) {
            return;
        }
        var slides = qsa('.hero-slide', frame);
        var dots = qsa('.hero-dot', frame);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function activate(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                stop();
                activate(i);
                start();
            });
        });
        frame.addEventListener('mouseenter', stop);
        frame.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function setupLocalFilter() {
        var input = qs('[data-local-filter]');
        if (!input) {
            return;
        }
        var cards = qsa('[data-search]');
        var empty = qs('.no-results');
        function filter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var show = !value || text.indexOf(value) !== -1;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        input.addEventListener('input', filter);
        filter();
    }

    function setupSearchQuery() {
        var input = qs('[data-search-query]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;
        var cards = qsa('[data-search]');
        var title = qs('[data-query-title]');
        var empty = qs('.no-results');
        if (title) {
            title.textContent = q ? '“' + q + '”' : '全部视频';
        }
        function filter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var show = !value || text.indexOf(value) !== -1;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        input.addEventListener('input', filter);
        filter();
    }

    window.initMoviePlayer = function (url) {
        var video = document.getElementById('moviePlayer');
        var cover = document.getElementById('playCover');
        if (!video || !url) {
            return;
        }
        var ready = false;
        var hlsInstance = null;
        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchQuery();
    });
}());
