(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-play-trigger]');
    if (!video || !cover || typeof playerSource === 'undefined') {
      return;
    }
    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playerSource;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(playerSource);
        hls.attachMedia(video);
      } else {
        video.src = playerSource;
      }
      video.controls = true;
    }
    function play() {
      prepare();
      cover.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  });
})();
