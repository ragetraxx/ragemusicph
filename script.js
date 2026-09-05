// ======================================================
// RAGE MEDIA GROUP
// DYNAMIC PROXY HLS ENGINE
// ======================================================

const ORIGINAL_STREAM_URL = "https://hls.cdn-surfline.com/east-au/ph-sabangbeach/playlist.m3u8";
const PROXY_PREFIX = "https://corsproxy.io/?";

// Helper to wrap URLs through CORS proxy
function getProxiedUrl(url) {
    if (url.startsWith(PROXY_PREFIX)) return url;
    return PROXY_PREFIX + encodeURIComponent(url);
}

let hlsPlayer = null;

function initializeBackgroundVideo() {
    const video = document.getElementById("bg-video");

    if (!video) {
        console.error("BACKGROUND VIDEO: #bg-video element missing.");
        return;
    }

    video.crossOrigin = "anonymous";
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    // 1. Chrome / Edge / Firefox / Android (HLS.js Engine with dynamic URL rewriter)
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
        console.log("BACKGROUND VIDEO: Initializing HLS.js with dynamic proxy loader...");

        if (hlsPlayer) {
            hlsPlayer.destroy();
        }

        // Custom Loader Class to route every manifest & .ts segment request through the proxy
        class CustomProxyLoader extends Hls.DefaultConfig.loader {
            constructor(config) {
                super(config);
                const load = this.load.bind(this);
                this.load = function (context, config, callbacks) {
                    if (context && context.url) {
                        context.url = getProxiedUrl(context.url);
                    }
                    load(context, config, callbacks);
                };
            }
        }

        hlsPlayer = new Hls({
            fLoader: CustomProxyLoader,
            pLoader: CustomProxyLoader,
            enableWorker: true,
            lowLatencyMode: true,
            manifestLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 5,
            fragLoadingMaxRetry: 5
        });

        hlsPlayer.attachMedia(video);

        hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, function () {
            hlsPlayer.loadSource(ORIGINAL_STREAM_URL);
        });

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            startPlayback(video);
        });

        hlsPlayer.on(Hls.Events.ERROR, function (event, data) {
            if (!data.fatal) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hlsPlayer.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hlsPlayer.recoverMediaError();
            } else {
                hlsPlayer.destroy();
                setTimeout(initializeBackgroundVideo, 2000);
            }
        });

        return;
    }

    // 2. Safari / iOS (Native HLS via proxied manifest)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("BACKGROUND VIDEO: Native Safari HLS detected.");
        video.src = getProxiedUrl(ORIGINAL_STREAM_URL);
        video.load();

        video.addEventListener("loadedmetadata", function () {
            startPlayback(video);
        }, { once: true });
        return;
    }

    console.error("BACKGROUND VIDEO: HLS is not supported on this browser.");
}

function startPlayback(video) {
    video.muted = true;
    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.catch(function (error) {
            console.warn("Autoplay blocked, waiting for user gesture...", error);
            const kickstart = function () {
                video.muted = true;
                video.play();
            };
            ["click", "touchstart", "scroll"].forEach(function (evt) {
                document.addEventListener(evt, kickstart, { once: true });
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initializeBackgroundVideo();
});
