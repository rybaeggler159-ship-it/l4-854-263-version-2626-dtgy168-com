(function () {
  var loaderPromise = null;

  function loadLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (loaderPromise) {
      return loaderPromise;
    }
    loaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  function bindPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-cover");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;
    var state = "idle";

    function showVideo() {
      button.classList.add("is-hidden");
      video.controls = true;
    }

    function playVideo() {
      showVideo();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    function attachWithLibrary(Hls) {
      if (Hls && Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          lowLatencyMode: true
        });
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(stream);
        });
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          state = "ready";
          playVideo();
        });
      } else {
        video.src = stream;
        state = "ready";
        playVideo();
      }
    }

    function start() {
      if (!stream) {
        return;
      }
      if (state === "ready") {
        playVideo();
        return;
      }
      if (state === "loading") {
        return;
      }
      state = "loading";
      showVideo();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        state = "ready";
        playVideo();
        return;
      }
      loadLibrary().then(attachWithLibrary).catch(function () {
        video.src = stream;
        state = "ready";
        playVideo();
      });
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (state === "idle") {
        start();
      }
    });
    loadLibrary().catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(bindPlayer);
  });
})();
