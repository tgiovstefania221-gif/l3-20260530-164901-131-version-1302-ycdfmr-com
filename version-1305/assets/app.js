(function () {
    function onReady(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", links.classList.contains("is-open"));
        });
        links.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                links.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            });
        });
    }

    function initHero() {
        var root = document.querySelector(".hero-frame");
        if (!root) {
            return;
        }
        var track = root.querySelector(".hero-track");
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        if (!track || slides.length < 2) {
            return;
        }
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            track.style.transform = "translateX(" + (-index * 100) + "%)";
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5600);
        show(0);
    }

    function initFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".js-filter"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        if (!cards.length) {
            return;
        }
        var activeFilter = "all";
        function currentQuery() {
            for (var i = 0; i < inputs.length; i += 1) {
                if (inputs[i].value) {
                    return normalize(inputs[i].value);
                }
            }
            return "";
        }
        function apply() {
            var query = currentQuery();
            var shown = 0;
            cards.forEach(function (card) {
                var searchable = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var filterMatch = activeFilter === "all" || searchable.indexOf(normalize(activeFilter)) >= 0;
                var queryMatch = !query || searchable.indexOf(query) >= 0;
                var visible = filterMatch && queryMatch;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function (event) {
                inputs.forEach(function (other) {
                    if (other !== event.target) {
                        other.value = event.target.value;
                    }
                });
                apply();
            });
        });
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;
        var prepared = false;
        if (!video || !button || !overlay || !streamUrl) {
            return;
        }
        function attach() {
            if (prepared) {
                return;
            }
            prepared = true;
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            attach();
            overlay.classList.add("is-hidden");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", start);
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    onReady(function () {
        initMenu();
        initHero();
        initFiltering();
    });
})();
