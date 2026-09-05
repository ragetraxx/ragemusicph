// ======================================================
// RAGE MEDIA GROUP
// BACKGROUND VIDEO (MUTED AUTOPLAY) + AUDIO PLAYER ENGINE
// ======================================================

const VIDEO_URL = "https://hls.cdn-surfline.com/east-au/ph-sabangbeach/playlist.m3u8";

let hlsPlayer = null;

// ======================================================
// BACKGROUND VIDEO INITIALIZATION
// ======================================================

function initializeBackgroundVideo() {
    const video = document.getElementById("bg-video");

    if (!video) {
        console.error("BACKGROUND VIDEO: #bg-video element not found.");
        return;
    }

    console.log("BACKGROUND VIDEO: Initializing muted autoplay stream...");

    // Strictly enforce muted state for unblocked autoplay policy compliance
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    // 1. Safari / iOS Native HLS Engine
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("BACKGROUND VIDEO: Native HLS detected.");
        video.src = VIDEO_URL;
        video.load();

        video.addEventListener("loadedmetadata", function () {
            startBackgroundVideo();
        }, { once: true });

        video.addEventListener("canplay", function () {
            if (video.paused) {
                startBackgroundVideo();
            }
        });

        return;
    }

    // 2. Chrome / Firefox / Edge / Android HLS.js Engine
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
        console.log("BACKGROUND VIDEO: HLS.js engine loading...");

        if (hlsPlayer) {
            hlsPlayer.destroy();
        }

        hlsPlayer = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
            manifestLoadingMaxRetry: 10,
            levelLoadingMaxRetry: 10,
            fragLoadingMaxRetry: 10,
            manifestLoadingRetryDelay: 1000,
            levelLoadingRetryDelay: 1000,
            fragLoadingRetryDelay: 1000
        });

        hlsPlayer.attachMedia(video);

        hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log("BACKGROUND VIDEO: Media attached.");
            hlsPlayer.loadSource(VIDEO_URL);
        });

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            console.log("BACKGROUND VIDEO: Manifest parsed, triggering autoplay.");
            startBackgroundVideo();
        });

        hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
            if (!data.fatal) return;

            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.warn("BACKGROUND VIDEO: Network disruption, reconnecting...");
                    setTimeout(function () {
                        if (hlsPlayer) hlsPlayer.startLoad();
                    }, 1000);
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.warn("BACKGROUND VIDEO: Media decoding glitch, recovering...");
                    hlsPlayer.recoverMediaError();
                    break;
                default:
                    console.error("BACKGROUND VIDEO: Unrecoverable error, re-initializing...");
                    hlsPlayer.destroy();
                    initializeBackgroundVideo();
                    break;
            }
        });

        return;
    }

    console.error("BACKGROUND VIDEO: HLS is not supported on this browser.");
}

// ======================================================
// MUTED AUTOPLAY ENGINE
// ======================================================

function startBackgroundVideo() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    // Enforce mute state before play call
    video.muted = true;

    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise
            .then(function () {
                console.log("BACKGROUND VIDEO: Muted autoplay running continuously.");
            })
            .catch(function (error) {
                console.warn("BACKGROUND VIDEO: Initial play call deferred, attaching fallbacks...", error);

                const unlockAutoplay = function () {
                    video.muted = true;
                    video.play().catch(function (err) {
                        console.error("BACKGROUND VIDEO: Play re-attempt failed:", err);
                    });
                };

                ["click", "touchstart", "scroll"].forEach(function (evt) {
                    document.addEventListener(evt, unlockAutoplay, { once: true });
                });
            });
    }
}

// ======================================================
// CONTINUOUS PLAYBACK GUARANTEE HOOKS
// ======================================================

function setupVideoEvents() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    // Keep muted at all times
    video.addEventListener("volumechange", function () {
        if (!video.muted) {
            video.muted = true;
        }
    });

    // Auto-resume if browser or OS forces a pause
    video.addEventListener("pause", function () {
        console.warn("BACKGROUND VIDEO: Pause detected, enforcing auto-resume...");
        video.play().catch(function (e) {
            console.error("BACKGROUND VIDEO: Resume error:", e);
        });
    });

    video.addEventListener("playing", function () {
        console.log("BACKGROUND VIDEO: Stream playing smoothly.");
    });

    video.addEventListener("waiting", function () {
        console.log("BACKGROUND VIDEO: Stream buffering...");
    });

    video.addEventListener("error", function () {
        console.error("BACKGROUND VIDEO: Video element error:", video.error);
    });
}

// ======================================================
// AUDIO STREAMS & ENGINE
// ======================================================

const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv",
    "https://stream.zeno.fm/c3z135w8zxhvv",
    "https://stream.zeno.fm/4k8qf4raqy8uv",
    "https://stream.zeno.fm/qrhuqbnm208uv",
    "https://stream.zeno.fm/iiigesdzikuvv"
];

let currentAudio = new Audio();
let currentPlayingIndex = null;

// ======================================================
// PLAY AUDIO
// ======================================================

function playAudio(index) {
    if (!audioFiles[index]) {
        console.error("AUDIO: Invalid audio stream index:", index);
        return;
    }

    const audioItems = document.querySelectorAll(".audio-item");
    const clickedItem = audioItems[index];

    if (!clickedItem) {
        console.error("AUDIO: Audio item element missing.");
        return;
    }

    const clickedImg = clickedItem.querySelector("img");

    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        resetAudioUI();
        return;
    }

    currentAudio.pause();
    currentAudio.currentTime = 0;
    resetAudioUI();

    currentAudio.src = audioFiles[index];
    currentAudio.load();

    console.log("AUDIO: Connecting to stream:", audioFiles[index]);

    currentAudio
        .play()
        .then(function () {
            console.log("AUDIO: Playback active for channel:", index);

            clickedItem.classList.add("pop-up");
            if (clickedImg) {
                clickedImg.classList.add("spinning");
            }

            document.body.classList.add("dimmed");
            currentPlayingIndex = index;
        })
        .catch(function (error) {
            console.error("AUDIO: Playback error:", error);
            resetAudioUI();
        });
}

// ======================================================
// RESET AUDIO UI HELPER
// ======================================================

function resetAudioUI() {
    const audioItems = document.querySelectorAll(".audio-item");

    if (currentPlayingIndex !== null) {
        const currentItem = audioItems[currentPlayingIndex];
        if (currentItem) {
            const img = currentItem.querySelector("img");
            currentItem.classList.remove("pop-up");
            if (img) {
                img.classList.remove("spinning");
            }
        }
    }

    document.body.classList.remove("dimmed");
    currentPlayingIndex = null;
}

// ======================================================
// AUDIO EVENT LISTENERS
// ======================================================

currentAudio.addEventListener("error", function () {
    console.error("AUDIO: Stream error occurred:", currentAudio.error);
    resetAudioUI();
});

currentAudio.addEventListener("ended", function () {
    resetAudioUI();
});

// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    setupVideoEvents();
    initializeBackgroundVideo();
});

// ======================================================
// KEYBOARD ACCESSIBILITY
// ======================================================

document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") {
        return;
    }

    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains("audio-item")) {
        e.preventDefault();
        activeElement.click();
    }
});
