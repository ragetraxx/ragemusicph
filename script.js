// ======================================================
// CONFIGURATION
// ======================================================

// IMPORTANT:
// Use the RAW URL only.
// Do NOT use Markdown format: [URL](URL)

const m3u8VideoURL =
    "https://hls.cdn-surfline.com/east-au/ph-sabangbeach/playlist.m3u8";


// ======================================================
// BACKGROUND M3U8 VIDEO PLAYER
// ======================================================

function loadM3U8Video() {

    const video = document.getElementById("bg-video");

    if (!video) {
        console.error(
            "Background video element with ID 'bg-video' was not found."
        );
        return;
    }

    // --------------------------------------------------
    // Video settings
    // --------------------------------------------------

    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    // Prevent unnecessary controls
    video.controls = false;

    // --------------------------------------------------
    // Play function
    // --------------------------------------------------

    function playVideo() {

        video.muted = true;

        const playPromise = video.play();

        if (playPromise !== undefined) {

            playPromise
                .then(() => {

                    console.log(
                        "Background HLS video is playing."
                    );

                })
                .catch((error) => {

                    console.warn(
                        "Background video autoplay was prevented:",
                        error
                    );

                });
        }
    }


    // ==================================================
    // HLS.JS
    // ==================================================

    if (
        typeof Hls !== "undefined" &&
        Hls.isSupported()
    ) {

        console.log("HLS.js is supported.");

        const hls = new Hls({

            enableWorker: true,

            lowLatencyMode: true,

            backBufferLength: 30,

            maxBufferLength: 30,

            maxMaxBufferLength: 60,

            liveSyncDurationCount: 3,

            liveMaxLatencyDurationCount: 6,

            fragLoadingMaxRetry: 6,

            manifestLoadingMaxRetry: 6,

            levelLoadingMaxRetry: 6,

            fragLoadingRetryDelay: 1000,

            manifestLoadingRetryDelay: 1000,

            levelLoadingRetryDelay: 1000

        });


        // --------------------------------------------------
        // Load HLS stream
        // --------------------------------------------------

        console.log(
            "Loading HLS stream:",
            m3u8VideoURL
        );

        hls.loadSource(m3u8VideoURL);

        hls.attachMedia(video);


        // --------------------------------------------------
        // Media attached
        // --------------------------------------------------

        hls.on(
            Hls.Events.MEDIA_ATTACHED,
            function () {

                console.log(
                    "HLS media attached."
                );

            }
        );


        // --------------------------------------------------
        // Manifest loaded
        // --------------------------------------------------

        hls.on(
            Hls.Events.MANIFEST_PARSED,
            function (
                event,
                data
            ) {

                console.log(
                    "HLS manifest loaded successfully.",
                    data
                );

                playVideo();

            }
        );


        // --------------------------------------------------
        // Fragment loaded
        // --------------------------------------------------

        hls.on(
            Hls.Events.FRAG_LOADED,
            function () {

                console.log(
                    "HLS video segment loaded."
                );

            }
        );


        // --------------------------------------------------
        // HLS errors
        // --------------------------------------------------

        hls.on(
            Hls.Events.ERROR,
            function (
                event,
                data
            ) {

                console.error(
                    "HLS error:",
                    data
                );


                if (!data.fatal) {
                    return;
                }


                switch (data.type) {


                    // --------------------------------------
                    // Network error
                    // --------------------------------------

                    case Hls.ErrorTypes.NETWORK_ERROR:

                        console.warn(
                            "Fatal HLS network error. Restarting stream..."
                        );

                        setTimeout(
                            function () {

                                try {

                                    hls.startLoad();

                                } catch (error) {

                                    console.error(
                                        "Unable to restart HLS:",
                                        error
                                    );

                                }

                            },
                            2000
                        );

                        break;


                    // --------------------------------------
                    // Media error
                    // --------------------------------------

                    case Hls.ErrorTypes.MEDIA_ERROR:

                        console.warn(
                            "Fatal HLS media error. Attempting recovery..."
                        );

                        try {

                            hls.recoverMediaError();

                        } catch (error) {

                            console.error(
                                "Media recovery failed:",
                                error
                            );

                            hls.destroy();

                        }

                        break;


                    // --------------------------------------
                    // Unknown fatal error
                    // --------------------------------------

                    default:

                        console.error(
                            "Fatal HLS error. Destroying player."
                        );

                        hls.destroy();

                        // Attempt to reload after a delay

                        setTimeout(
                            function () {

                                loadM3U8Video();

                            },
                            5000
                        );

                        break;
                }

            }
        );


        // --------------------------------------------------
        // Video errors
        // --------------------------------------------------

        video.addEventListener(
            "error",
            function () {

                console.error(
                    "HTML5 video error:",
                    video.error
                );

            }
        );


        // --------------------------------------------------
        // Video waiting/buffering
        // --------------------------------------------------

        video.addEventListener(
            "waiting",
            function () {

                console.log(
                    "Background video is buffering..."
                );

            }
        );


        // --------------------------------------------------
        // Video playing
        // --------------------------------------------------

        video.addEventListener(
            "playing",
            function () {

                console.log(
                    "Background video is now playing."
                );

            }
        );


        // --------------------------------------------------
        // Try playback when page becomes visible
        // --------------------------------------------------

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    document.visibilityState === "visible" &&
                    video.paused
                ) {

                    playVideo();

                }

            }
        );


    // ==================================================
    // NATIVE HLS
    // Safari / iPhone / iPad
    // ==================================================

    } else if (
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        console.log(
            "Browser supports native HLS."
        );


        video.src = m3u8VideoURL;


        video.addEventListener(
            "loadedmetadata",
            function () {

                console.log(
                    "Native HLS metadata loaded."
                );

                playVideo();

            }
        );


        video.addEventListener(
            "error",
            function () {

                console.error(
                    "Native HLS error:",
                    video.error
                );

            }
        );


    // ==================================================
    // HLS NOT SUPPORTED
    // ==================================================

    } else {

        console.error(
            "This browser does not support HLS playback."
        );

    }

}


// ======================================================
// START BACKGROUND VIDEO
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadM3U8Video
    );

} else {

    loadM3U8Video();

}


// ======================================================
// AUDIO STREAM PLAYER
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
// AUDIO PLAYER FUNCTION
// ======================================================

function playAudio(index) {

    // Check audio URL
    if (
        !audioFiles[index]
    ) {

        console.error(
            "Audio URL not found for index:",
            index
        );

        return;

    }


    // Get audio items
    const audioItems =
        document.querySelectorAll(
            ".audio-item"
        );


    const clickedItem =
        audioItems[index];


    if (!clickedItem) {

        console.error(
            "Audio item not found:",
            index
        );

        return;

    }


    const clickedImg =
        clickedItem.querySelector("img");


    // ==================================================
    // TOGGLE CURRENT TRACK OFF
    // ==================================================

    if (
        currentPlayingIndex === index &&
        !currentAudio.paused
    ) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        clickedItem.classList.remove(
            "pop-up"
        );


        if (clickedImg) {

            clickedImg.classList.remove(
                "spinning"
            );

        }


        document.body.classList.remove(
            "dimmed"
        );


        currentPlayingIndex = null;

        return;

    }


    // ==================================================
    // STOP PREVIOUS AUDIO
    // ==================================================

    if (
        !currentAudio.paused
    ) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

    }


    // ==================================================
    // RESET PREVIOUS VISUAL STATE
    // ==================================================

    if (
        currentPlayingIndex !== null
    ) {

        const previousItem =
            audioItems[
                currentPlayingIndex
            ];


        if (previousItem) {

            const previousImg =
                previousItem.querySelector(
                    "img"
                );


            previousItem.classList.remove(
                "pop-up"
            );


            if (previousImg) {

                previousImg.classList.remove(
                    "spinning"
                );

            }

        }

    }


    // ==================================================
    // LOAD NEW AUDIO
    // ==================================================

    currentAudio.src =
        audioFiles[index];


    currentAudio.load();


    console.log(
        "Playing audio:",
        audioFiles[index]
    );


    const audioPromise =
        currentAudio.play();


    if (
        audioPromise !== undefined
    ) {

        audioPromise
            .then(() => {

                console.log(
                    "Audio playback started."
                );

            })
            .catch((error) => {

                console.error(
                    "Audio playback error:",
                    error
                );

            });

    }


    // ==================================================
    // ACTIVE VISUAL STATE
    // ==================================================

    clickedItem.classList.add(
        "pop-up"
    );


    if (clickedImg) {

        clickedImg.classList.add(
            "spinning"
        );

    }


    document.body.classList.add(
        "dimmed"
    );


    currentPlayingIndex =
        index;

}


// ======================================================
// AUDIO ERROR HANDLING
// ======================================================

currentAudio.addEventListener(
    "error",
    function () {

        console.error(
            "Audio stream error:",
            currentAudio.error
        );

    }
);


// ======================================================
// AUDIO ENDED
// ======================================================

currentAudio.addEventListener(
    "ended",
    function () {

        if (
            currentPlayingIndex !== null
        ) {

            const audioItems =
                document.querySelectorAll(
                    ".audio-item"
                );


            const currentItem =
                audioItems[
                    currentPlayingIndex
                ];


            if (currentItem) {

                const img =
                    currentItem.querySelector(
                        "img"
                    );


                currentItem.classList.remove(
                    "pop-up"
                );


                if (img) {

                    img.classList.remove(
                        "spinning"
                    );

                }

            }

        }


        document.body.classList.remove(
            "dimmed"
        );


        currentPlayingIndex = null;

    }
);


// ======================================================
// KEYBOARD ACCESSIBILITY
// ======================================================

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key !== "Enter" &&
            e.key !== " "
        ) {

            return;

        }


        const activeElement =
            document.activeElement;


        if (
            activeElement &&
            activeElement.classList.contains(
                "audio-item"
            )
        ) {

            e.preventDefault();

            activeElement.click();

        }

    }
);
