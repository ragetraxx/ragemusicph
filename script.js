// ======================================================
// RAGE MEDIA GROUP
// Background HLS Video + Audio Streams
// ======================================================


// ======================================================
// BACKGROUND VIDEO CONFIGURATION
// ======================================================

const m3u8VideoURL =
    "https://hls.cdn-surfline.com/east-au/ph-sabangbeach/playlist.m3u8";


// ======================================================
// BACKGROUND VIDEO PLAYER
// ======================================================

function loadM3U8Video() {

    const video =
        document.getElementById("bg-video");


    if (!video) {

        console.error(
            "ERROR: #bg-video was not found."
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

    video.setAttribute(
        "muted",
        ""
    );

    video.setAttribute(
        "autoplay",
        ""
    );

    video.setAttribute(
        "playsinline",
        ""
    );


    // --------------------------------------------------
    // Playback function
    // --------------------------------------------------

    function startVideo() {

        video.muted = true;


        const promise =
            video.play();


        if (promise !== undefined) {

            promise
                .then(() => {

                    console.log(
                        "BACKGROUND VIDEO: Playing"
                    );

                })
                .catch((error) => {

                    console.warn(
                        "BACKGROUND VIDEO: Autoplay failed",
                        error
                    );

                });

        }

    }


    // ==================================================
    // NATIVE HLS
    // Safari / iOS
    // ==================================================

    if (
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        console.log(
            "BACKGROUND VIDEO: Native HLS detected."
        );


        video.src =
            m3u8VideoURL;


        video.addEventListener(
            "loadedmetadata",
            function () {

                console.log(
                    "BACKGROUND VIDEO: Metadata loaded."
                );

                startVideo();

            },
            {
                once: true
            }
        );


        video.addEventListener(
            "canplay",
            function () {

                if (video.paused) {

                    startVideo();

                }

            }
        );


        video.addEventListener(
            "error",
            function () {

                console.error(
                    "BACKGROUND VIDEO: Native HLS error:",
                    video.error
                );

            }
        );


        return;
    }


    // ==================================================
    // HLS.JS
    // Chrome / Firefox / Edge
    // ==================================================

    if (
        typeof Hls !== "undefined" &&
        Hls.isSupported()
    ) {

        console.log(
            "BACKGROUND VIDEO: HLS.js detected."
        );


        const hls =
            new Hls({

                enableWorker: true,

                lowLatencyMode: true,

                backBufferLength: 30,

                maxBufferLength: 30,

                maxMaxBufferLength: 60,

                liveSyncDurationCount: 3,

                liveMaxLatencyDurationCount: 6

            });


        // --------------------------------------------------
        // Attach HLS to video
        // --------------------------------------------------

        hls.attachMedia(
            video
        );


        // --------------------------------------------------
        // Media attached
        // --------------------------------------------------

        hls.on(
            Hls.Events.MEDIA_ATTACHED,
            function () {

                console.log(
                    "BACKGROUND VIDEO: Media attached."
                );


                hls.loadSource(
                    m3u8VideoURL
                );

            }
        );


        // --------------------------------------------------
        // Manifest parsed
        // --------------------------------------------------

        hls.on(
            Hls.Events.MANIFEST_PARSED,
            function (
                event,
                data
            ) {

                console.log(
                    "BACKGROUND VIDEO: HLS manifest loaded.",
                    data
                );


                startVideo();

            }
        );


        // --------------------------------------------------
        // Video playing
        // --------------------------------------------------

        video.addEventListener(
            "playing",
            function () {

                console.log(
                    "BACKGROUND VIDEO: PLAYING"
                );

            }
        );


        // --------------------------------------------------
        // Buffering
        // --------------------------------------------------

        video.addEventListener(
            "waiting",
            function () {

                console.log(
                    "BACKGROUND VIDEO: Buffering..."
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
                    "BACKGROUND VIDEO: HLS ERROR",
                    data
                );


                if (!data.fatal) {

                    return;

                }


                // ------------------------------------------
                // Network error
                // ------------------------------------------

                if (
                    data.type ===
                    Hls.ErrorTypes.NETWORK_ERROR
                ) {

                    console.warn(
                        "BACKGROUND VIDEO: Network error. Retrying..."
                    );


                    setTimeout(
                        function () {

                            try {

                                hls.startLoad();

                            }
                            catch (error) {

                                console.error(
                                    "HLS restart failed:",
                                    error
                                );

                            }

                        },
                        2000
                    );

                }


                // ------------------------------------------
                // Media error
                // ------------------------------------------

                else if (
                    data.type ===
                    Hls.ErrorTypes.MEDIA_ERROR
                ) {

                    console.warn(
                        "BACKGROUND VIDEO: Media error. Recovering..."
                    );


                    try {

                        hls.recoverMediaError();

                    }
                    catch (error) {

                        console.error(
                            "Media recovery failed:",
                            error
                        );

                    }

                }


                // ------------------------------------------
                // Other fatal error
                // ------------------------------------------

                else {

                    console.error(
                        "BACKGROUND VIDEO: Fatal HLS error."
                    );

                }

            }
        );


        return;
    }


    // ==================================================
    // HLS NOT SUPPORTED
    // ==================================================

    console.error(
        "BACKGROUND VIDEO: HLS is not supported by this browser."
    );

}


// ======================================================
// START VIDEO AFTER PAGE LOAD
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadM3U8Video
    );

}
else {

    loadM3U8Video();

}


// ======================================================
// AUDIO STREAMS
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


let currentAudio =
    new Audio();

let currentPlayingIndex =
    null;


// ======================================================
// PLAY AUDIO
// ======================================================

function playAudio(index) {


    // --------------------------------------------------
    // Validate index
    // --------------------------------------------------

    if (
        !audioFiles[index]
    ) {

        console.error(
            "Invalid audio index:",
            index
        );

        return;
    }


    // --------------------------------------------------
    // Get audio items
    // --------------------------------------------------

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
        clickedItem.querySelector(
            "img"
        );


    // ==================================================
    // STOP CURRENT TRACK
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


        currentPlayingIndex =
            null;


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
    // RESET PREVIOUS ITEM
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
    // LOAD AUDIO
    // ==================================================

    currentAudio.src =
        audioFiles[index];


    currentAudio.load();


    console.log(
        "AUDIO: Loading",
        audioFiles[index]
    );


    // ==================================================
    // PLAY AUDIO
    // ==================================================

    const playPromise =
        currentAudio.play();


    if (
        playPromise !== undefined
    ) {

        playPromise
            .then(() => {

                console.log(
                    "AUDIO: Playing channel",
                    index
                );

            })
            .catch((error) => {

                console.error(
                    "AUDIO: Playback error:",
                    error
                );

            });

    }


    // ==================================================
    // VISUAL STATE
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
// AUDIO ERROR
// ======================================================

currentAudio.addEventListener(
    "error",
    function () {

        console.error(
            "AUDIO ERROR:",
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

        const audioItems =
            document.querySelectorAll(
                ".audio-item"
            );


        if (
            currentPlayingIndex !== null
        ) {

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


        currentPlayingIndex =
            null;

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
