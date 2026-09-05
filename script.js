// ======================================================
// RAGE MEDIA GROUP
// BACKGROUND VIDEO + AUDIO PLAYER ENGINE
// ======================================================

// Primary Sabang Beach HLS Live Video Stream
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

    console.log("BACKGROUND VIDEO: Initializing Sabang Beach live stream...");

    // Attributes required for seamless autoplay policy compliance
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
            manifestLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 5,
            fragLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 2000,
            levelLoadingRetryDelay: 2000,
            fragLoadingRetryDelay: 2000
        });

        hlsPlayer.attachMedia(video);

        hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log("BACKGROUND VIDEO: Media attached successfully.");
            hlsPlayer.loadSource(VIDEO_URL);
        });

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            console.log("BACKGROUND VIDEO: Manifest parsed, starting video playback.", data);
            startBackgroundVideo();
        });

        hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
            console.error("BACKGROUND VIDEO: HLS Error encountered:", data);

            if (!data.fatal) {
                return;
            }

            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.warn("BACKGROUND VIDEO: Network error, retrying stream connection...");
                    setTimeout(function () {
                        if (hlsPlayer) {
                            hlsPlayer.startLoad();
                        }
                    }, 3000);
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.warn("BACKGROUND VIDEO: Decoding error, attempting media recovery...");
                    hlsPlayer.recoverMediaError();
                    break;
                default:
                    console.error("BACKGROUND VIDEO: Unrecoverable error, rebuilding player engine...");
                    hlsPlayer.destroy();
                    initializeBackgroundVideo();
                    break;
            }
        });

        return;
    }

    console.error("BACKGROUND VIDEO: HLS streaming is not supported on this browser.");
}

// ======================================================
// AUTOPLAY EXECUTION WITH USER INTERACTION FALLBACK
// ======================================================

function startBackgroundVideo() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    video.muted = true;

    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise
            .then(function () {
                console.log("BACKGROUND VIDEO: Sabang Beach stream playing actively.");
            })
            .catch(function (error) {
                console.warn("BACKGROUND VIDEO: Autoplay blocked. Waiting for first interaction...", error);

                const unlockVideoOnInteraction = function () {
                    video.muted = true;
                    video.play()
                        .then(function () {
                            console.log("BACKGROUND VIDEO: Playback started after interaction.");
                        })
                        .catch(function (err) {
                            console.error("BACKGROUND VIDEO: Playback failure:", err);
                        });

                    document.removeEventListener("click", unlockVideoOnInteraction);
                    document.removeEventListener("touchstart", unlockVideoOnInteraction);
                };

                document.addEventListener("click", unlockVideoOnInteraction, { once: true });
                document.addEventListener("touchstart", unlockVideoOnInteraction, { once: true });
            });
    }
}

// ======================================================
// VIDEO EVENT MONITORING
// ======================================================

function setupVideoEvents() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    video.addEventListener("playing", function () {
        console.log("BACKGROUND VIDEO: Playback established.");
    });

    video.addEventListener("waiting", function () {
        console.log("BACKGROUND VIDEO: Stream buffering...");
    });

    video.addEventListener("error", function () {
        console.error("BACKGROUND VIDEO: Native video error:", video.error);
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
        console.error("AUDIO: Selected channel element not found.");
        return;
    }

    const clickedImg = clickedItem.querySelector("img");

    // Toggle pause if active channel is selected again
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        resetAudioUI();
        return;
    }

    // Reset playback state
    currentAudio.pause();
    currentAudio.currentTime = 0;
    resetAudioUI();

    // Load and play selected stream
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
