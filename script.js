// ======================================================
// RAGE MEDIA GROUP - MEDIA ENGINE
// CONTINUOUS AUDIO STREAMS & BACKGROUND VIDEO
// ======================================================

// Public CORS-friendly HLS Video URL (Guaranteed Uptime)
const VIDEO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// Audio Stream Direct Links
const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv",
    "https://stream.zeno.fm/c3z135w8zxhvv",
    "https://stream.zeno.fm/4k8qf4raqy8uv",
    "https://stream.zeno.fm/qrhuqbnm208uv",
    "https://stream.zeno.fm/iiigesdzikuvv"
];

let activeAudio = null;
let currentPlayingIndex = null;
let hlsPlayer = null;

// ======================================================
// AUDIO PLAYER ENGINE
// ======================================================

function playAudio(index) {
    if (index < 0 || index >= audioFiles.length) {
        console.error("AUDIO ENGINE: Index out of range ->", index);
        return;
    }

    const audioItems = document.querySelectorAll(".audio-item");
    const targetItem = audioItems[index];

    if (!targetItem) {
        console.error("AUDIO ENGINE: Target .audio-item element missing.");
        return;
    }

    const targetImg = targetItem.querySelector("img");

    // 1. Toggle OFF if clicking the currently playing channel
    if (currentPlayingIndex === index && activeAudio && !activeAudio.paused) {
        stopCurrentAudio();
        return;
    }

    // 2. Stop previous audio playback cleanly
    stopCurrentAudio();

    // 3. Create fresh Audio Instance with proper attributes
    console.log("AUDIO ENGINE: Connecting to channel", index, "->", audioFiles[index]);
    
    activeAudio = new Audio();
    activeAudio.crossOrigin = "anonymous";
    activeAudio.preload = "none";
    activeAudio.src = audioFiles[index];

    // Attach stream error listeners
    activeAudio.onerror = function (e) {
        console.error("AUDIO ENGINE: Stream network error on channel", index, e);
        resetAudioUI();
    };

    activeAudio.onended = function () {
        resetAudioUI();
    };

    // 4. Trigger Playback
    activeAudio.play()
        .then(function () {
            console.log("AUDIO ENGINE: Playback successfully started for channel", index);
            
            // Update UI State
            targetItem.classList.add("pop-up");
            if (targetImg) {
                targetImg.classList.add("spinning");
            }
            document.body.classList.add("dimmed");
            currentPlayingIndex = index;
        })
        .catch(function (error) {
            console.error("AUDIO ENGINE: Browser prevented audio play call ->", error);
            resetAudioUI();
        });
}

function stopCurrentAudio() {
    if (activeAudio) {
        try {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio.src = "";
            activeAudio.load();
        } catch (err) {
            console.warn("AUDIO ENGINE: Error during stream teardown ->", err);
        }
        activeAudio = null;
    }
    resetAudioUI();
}

function resetAudioUI() {
    const audioItems = document.querySelectorAll(".audio-item");

    if (currentPlayingIndex !== null) {
        const item = audioItems[currentPlayingIndex];
        if (item) {
            const img = item.querySelector("img");
            item.classList.remove("pop-up");
            if (img) {
                img.classList.remove("spinning");
            }
        }
    }

    document.body.classList.remove("dimmed");
    currentPlayingIndex = null;
}

// ======================================================
// BACKGROUND VIDEO ENGINE (SAFE & ISOLATED)
// ======================================================

function initializeBackgroundVideo() {
    try {
        const video = document.getElementById("bg-video");
        if (!video) return;

        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.loop = true;

        video.setAttribute("muted", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");

        // 1. Native HLS (Safari / iOS)
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = VIDEO_URL;
            video.load();
            video.play().catch(function (e) {
                console.warn("VIDEO: Safari autoplay deferred ->", e);
            });
            return;
        }

        // 2. HLS.js (Chrome / Edge / Firefox)
        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            if (hlsPlayer) {
                hlsPlayer.destroy();
            }

            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                manifestLoadingMaxRetry: 3,
                levelLoadingMaxRetry: 3
            });

            hlsPlayer.attachMedia(video);

            hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, function () {
                hlsPlayer.loadSource(VIDEO_URL);
            });

            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
                video.muted = true;
                video.play().catch(function (err) {
                    console.warn("VIDEO: Autoplay waiting for gesture ->", err);
                });
            });

            hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsPlayer.startLoad();
                }
            });
        }
    } catch (err) {
        console.error("BACKGROUND VIDEO: Unexpected engine exception caught ->", err);
    }
}

// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", function () {
    // 1. Start background video
    initializeBackgroundVideo();

    // 2. Attach keyboard event handling for grid items
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;

        const activeElem = document.activeElement;
        if (activeElem && activeElem.classList.contains("audio-item")) {
            e.preventDefault();
            activeElem.click();
        }
    });
});
