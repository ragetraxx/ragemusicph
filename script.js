// ======================================================
// RAGE MEDIA GROUP
// CROSS-BROWSER BACKGROUND VIDEO + AUDIO ENGINE
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

    // Force crossOrigin attribute for stream CORS compatibility
    video.crossOrigin = "anonymous";

    // Standard video attributes
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    // 1. Safari & iOS (Native HLS Engine)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("BACKGROUND VIDEO: Using Native Safari HLS engine.");
        
        video.src = VIDEO_URL;

        // Try playing as soon as metadata or canplay triggers
        const handleNativePlay = function () {
            startBackgroundVideo();
        };

        video.addEventListener("loadedmetadata", handleNativePlay, { once: true });
        video.addEventListener("canplay", handleNativePlay, { once: true });

        // Fallback kickstart
        video.load();
        return;
    }

    // 2. Chrome, Edge, Firefox (HLS.js Engine via MSE)
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
        console.log("BACKGROUND VIDEO: Using HLS.js engine for Chromium/Firefox.");

        if (hlsPlayer) {
            hlsPlayer.destroy();
        }

        hlsPlayer = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: function (xhr) {
                // Helps bypass basic CORS/Referrer header drops on CDNs
                xhr.withCredentials = false;
            },
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            manifestLoadingMaxRetry: 10,
            levelLoadingMaxRetry: 10,
            fragLoadingMaxRetry: 10
        });

        hlsPlayer.attachMedia(video);

        hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log("BACKGROUND VIDEO: Media attached to HLS.js.");
            hlsPlayer.loadSource(VIDEO_URL);
        });

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            console.log("BACKGROUND VIDEO: Manifest parsed, starting video.");
            startBackgroundVideo();
        });

        hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
            if (!data.fatal) return;

            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.warn("BACKGROUND VIDEO: Network error encountered. Retrying...");
                    setTimeout(function () {
                        if (hlsPlayer) hlsPlayer.startLoad();
                    }, 1000);
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.warn("BACKGROUND VIDEO: Media decoding error. Recovering...");
                    hlsPlayer.recoverMediaError();
                    break;
                default:
                    console.error("BACKGROUND VIDEO: Fatal stream error. Re-initializing...");
                    hlsPlayer.destroy();
                    initializeBackgroundVideo();
                    break;
            }
        });

        return;
    }

    console.error("BACKGROUND VIDEO: Browser does not support HLS playback.");
}

// ======================================================
// RELIABLE MUTED AUTOPLAY ENGINE
// ======================================================

function startBackgroundVideo() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    video.muted = true;

    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise
            .then(function () {
                console.log("BACKGROUND VIDEO: Playing successfully.");
            })
            .catch(function (error) {
                console.warn("BACKGROUND VIDEO: Playback blocked by browser policy. Adding interaction triggers.", error);

                const forcePlay = function () {
                    video.muted = true;
                    video.play().catch(function (e) {
                        console.error("BACKGROUND VIDEO: Secondary play attempt failed:", e);
                    });
                };

                ["click", "touchstart", "scroll", "keydown"].forEach(function (evt) {
                    document.addEventListener(evt, forcePlay, { once: true });
                });
            });
    }
}

// ======================================================
// VIDEO MONITORING HOOKS
// ======================================================

function setupVideoEvents() {
    const video = document.getElementById("bg-video");
    if (!video) return;

    video.addEventListener("volumechange", function () {
        if (!video.muted) {
            video.muted = true;
        }
    });

    video.addEventListener("pause", function () {
        console.warn("BACKGROUND VIDEO: Paused unexpectedly. Attempting auto-resume...");
        video.play().catch(function () {});
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

function playAudio(index) {
    if (!audioFiles[index]) return;

    const audioItems = document.querySelectorAll(".audio-item");
    const clickedItem = audioItems[index];

    if (!clickedItem) return;

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

    currentAudio
        .play()
        .then(function () {
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

currentAudio.addEventListener("error", function () {
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

document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;

    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains("audio-item")) {
        e.preventDefault();
        activeElement.click();
    }
});
