(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                play();
            });
        });
        slider.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        slider.addEventListener("mouseleave", play);
        play();
    }

    function setupCards() {
        var input = document.querySelector("[data-card-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (q) {
            input.value = q;
        }
        function apply() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-card-text") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-hidden", Boolean(value) && text.indexOf(value) === -1);
            });
        }
        input.addEventListener("input", apply);
        apply();
    }

    function setupFilters() {
        var row = document.querySelector("[data-filter-row]");
        var input = document.querySelector("[data-card-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!row || !cards.length) {
            return;
        }
        var buttons = Array.prototype.slice.call(row.querySelectorAll("button"));
        var active = "";
        function apply() {
            var value = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-card-text") || card.textContent || "").toLowerCase();
                var matchedText = !value || text.indexOf(value) !== -1;
                var matchedFilter = !active || text.indexOf(active.toLowerCase()) !== -1;
                card.classList.toggle("is-hidden", !(matchedText && matchedFilter));
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        if (input) {
            input.addEventListener("input", apply);
        }
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-player-start]");
        if (!video || !button || !source) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function start() {
            attach();
            button.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCards();
        setupFilters();
    });
})();
