(function () {
  window.initMoviePlayer = function (sourceUrl) {
    const video = document.getElementById("moviePlayer");
    const playOverlay = document.getElementById("playOverlay");
    let attached = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 900);
        });
      }

      video.src = sourceUrl;
      return Promise.resolve();
    }

    function startPlayback() {
      attach().then(function () {
        if (playOverlay) {
          playOverlay.classList.add("is-hidden");
        }
        video.play().catch(function () {});
      });
    }

    if (playOverlay) {
      playOverlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (playOverlay) {
        playOverlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (playOverlay) {
        playOverlay.classList.remove("is-hidden");
      }
    });
  };
})();
