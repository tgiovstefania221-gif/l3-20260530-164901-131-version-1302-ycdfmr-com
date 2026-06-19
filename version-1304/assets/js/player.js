(function () {
  var video = document.querySelector('[data-hls-player]');
  var startButton = document.querySelector('[data-player-start]');
  var overlay = document.querySelector('[data-player-overlay]');
  var status = document.querySelector('[data-player-status]');

  if (!video || !startButton) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo() {
    if (!source) {
      setStatus('当前页面没有配置播放地址。');
      return;
    }

    if (overlay) {
      overlay.classList.add('hidden');
    }

    setStatus('正在连接播放源，请稍候…');

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已加载，可正常播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，点击播放器即可开始播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源连接失败，请刷新页面或稍后重试。');
          }
        });
      } else {
        video.play().catch(function () {
          setStatus('点击播放器即可开始播放。');
        });
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源已加载，可正常播放。');
        video.play().catch(function () {
          setStatus('播放源已加载，点击播放器即可开始播放。');
        });
      }, { once: true });
    } else {
      setStatus('当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器访问。');
    }
  }

  startButton.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });
})();
