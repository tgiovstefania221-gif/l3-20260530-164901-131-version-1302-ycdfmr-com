(function () {
  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || ready || !streamUrl) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }

      ready = true;
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }
      var request = video.play();
      if (request && typeof request.then === 'function') {
        request.then(function () {
          if (cover) {
            cover.hidden = true;
          }
        }).catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      } else if (cover) {
        cover.hidden = true;
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        prepare();
        if (cover) {
          cover.hidden = true;
        }
      });

      video.addEventListener('error', function () {
        if (cover && video.paused) {
          cover.hidden = false;
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
