const m3u8VideoURL = "https://hls.cdn-surfline.com/ohio/sltv-global/playlist.m3u8";

// --- BACKGROUND VIDEO PLAYER ---
function loadM3U8Video() {
    const video = document.getElementById('bg-video');
    if (!video) return;

    // Enforce requirements for modern browser autoplay policies
    video.muted = true;
    video.playsInline = true;

    function playVideo() {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.warn("Autoplay prevented by browser policy:", error);
            });
        }
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            // Configure XHR setup for cross-origin HLS requests
            xhrSetup: function (xhr, url) {
                xhr.withCredentials = false;
            }
        });

        hls.loadSource(m3u8VideoURL);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
        });

        // Error handling & auto-recovery
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("HLS network error, recovering...", data);
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("HLS media error, recovering...", data);
                        hls.recoverMediaError();
                        break;
                    default:
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Apple Safari / iOS HLS implementation
        video.src = m3u8VideoURL;
        video.addEventListener('loadedmetadata', function () {
            playVideo();
        });
    }
}

document.addEventListener("DOMContentLoaded", loadM3U8Video);

// --- AUDIO STREAM PLAYER ---
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

    // Toggle off if clicking the currently playing track
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        clickedItem.classList.remove("pop-up");
        if (clickedImg) clickedImg.classList.remove("spinning");
        document.body.classList.remove("dimmed");
        currentPlayingIndex = null;
        return;
    }

    // Stop and reset existing track
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Reset previous item visual state
    if (currentPlayingIndex !== null && audioItems[currentPlayingIndex]) {
        const previousItem = audioItems[currentPlayingIndex];
        const previousImg = previousItem.querySelector("img");
        previousItem.classList.remove("pop-up");
        if (previousImg) previousImg.classList.remove("spinning");
    }

    // Play new track
    currentAudio.src = audioFiles[index];
    const audioPromise = currentAudio.play();
    if (audioPromise !== undefined) {
        audioPromise.catch((err) => console.error("Audio playback error:", err));
    }

    // Set active visual state
    clickedItem.classList.add("pop-up");
    if (clickedImg) clickedImg.classList.add("spinning");
    document.body.classList.add("dimmed");

    currentPlayingIndex = index;
}

// Add Keyboard Accessibility (Enter & Space activation)
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains("audio-item")) {
            e.preventDefault();
            activeElement.click();
        }
    }
});
