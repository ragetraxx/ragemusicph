// ======================================================
// RAGE MEDIA GROUP
// BACKGROUND VIDEO + AUDIO PLAYER ENGINE
// ======================================================


// ======================================================
// BACKGROUND VIDEO URL
// ======================================================

const VIDEO_URL =
    "https://s30.ipcamlive.com/streams/1ehj4y9puomgafnbi/stream.m3u8";


// Keep HLS instance globally available
let hlsPlayer = null;


// ======================================================
// BACKGROUND VIDEO
// ======================================================

function initializeBackgroundVideo() {

    const video =
        document.getElementById("bg-video");


    if (!video) {

        console.error(
            "BACKGROUND VIDEO: #bg-video not found."
        );

        return;
    }


    console.log(
        "BACKGROUND VIDEO: Initializing..."
    );


    // --------------------------------------------------
    // Basic video settings
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


    // ==================================================
    // NATIVE HLS
    // Safari / iPhone / iPad
    // ==================================================

    if (
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        console.log(
            "BACKGROUND VIDEO: Native HLS detected."
        );


        video.src = VIDEO_URL;


        video.load();


        video.addEventListener(
            "loadedmetadata",
            function () {

                console.log(
                    "BACKGROUND VIDEO: Metadata loaded."
                );


                startBackgroundVideo();

            },
            {
                once: true
            }
        );


        video.addEventListener(
            "canplay",
            function () {

                if (video.paused) {

                    startBackgroundVideo();

                }

            }
        );


        return;
    }


    // ==================================================
    // HLS.JS
    // Chrome / Firefox / Edge / Android
    // ==================================================

    if (
        typeof Hls !== "undefined" &&
        Hls.isSupported()
    ) {

        console.log(
            "BACKGROUND VIDEO: HLS.js detected."
        );


        hlsPlayer =
            new Hls({

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


        hlsPlayer.on(
            Hls.Events.MEDIA_ATTACHED,
            function () {

                console.log(
                    "BACKGROUND VIDEO: Media attached."
                );


                hlsPlayer.loadSource(
                    VIDEO_URL
                );

            }
        );


        hlsPlayer.on(
            Hls.Events.MANIFEST_PARSED,
            function (
                event,
                data
            ) {

                console.log(
                    "BACKGROUND VIDEO: Manifest loaded.",
                    data
                );


                startBackgroundVideo();

            }
        );


        hlsPlayer.on(
            Hls.Events.ERROR,
            function (
                event,
                data
            ) {

                console.error(
                    "BACKGROUND VIDEO: HLS ERROR:",
                    data
                );


                if (!data.fatal) {

                    return;

                }


                if (
                    data.type ===
                    Hls.ErrorTypes.NETWORK_ERROR
                ) {

                    console.warn(
                        "BACKGROUND VIDEO: Network error."
                    );


                    setTimeout(
                        function () {

                            if (hlsPlayer) {

                                console.log(
                                    "BACKGROUND VIDEO: Retrying..."
                                );


                                hlsPlayer.startLoad();

                            }

                        },
                        5000
                    );

                }

                else if (
                    data.type ===
                    Hls.ErrorTypes.MEDIA_ERROR
                ) {

                    console.warn(
                        "BACKGROUND VIDEO: Media error."
                    );


                    try {

                        hlsPlayer.recoverMediaError();

                    }
                    catch (error) {

                        console.error(
                            "BACKGROUND VIDEO: Recovery failed.",
                            error
                        );

                    }

                }

            }
        );


        return;
    }


    console.error(
        "BACKGROUND VIDEO: HLS is not supported by this browser."
    );

}


// ======================================================
// START BACKGROUND VIDEO
// ======================================================

function startBackgroundVideo() {

    const video =
        document.getElementById(
            "bg-video"
        );


    if (!video) {

        return;

    }


    video.muted = true;


    const playPromise =
        video.play();


    if (
        playPromise !== undefined
    ) {

        playPromise
            .then(
                function () {

                    console.log(
                        "BACKGROUND VIDEO: PLAYING"
                    );

                }
            )
            .catch(
                function (error) {

                    console.warn(
                        "BACKGROUND VIDEO: Autoplay prevented:",
                        error
                    );


                    const startAfterInteraction =
                        function () {

                            video.muted = true;


                            video.play()
                                .then(
                                    function () {

                                        console.log(
                                            "BACKGROUND VIDEO: Started after interaction."
                                        );

                                    }
                                )
                                .catch(
                                    function (err) {

                                        console.error(
                                            "BACKGROUND VIDEO: Could not start:",
                                            err
                                        );

                                    }
                                );


                            document.removeEventListener(
                                "click",
                                startAfterInteraction
                            );

                        };


                    document.addEventListener(
                        "click",
                        startAfterInteraction,
                        {
                            once: true
                        }
                    );

                }
            );

    }

}


// ======================================================
// VIDEO EVENT MONITORING
// ======================================================

function setupVideoEvents() {

    const video =
        document.getElementById(
            "bg-video"
        );


    if (!video) {

        return;

    }


    video.addEventListener(
        "playing",
        function () {

            console.log(
                "BACKGROUND VIDEO: PLAYING."
            );

        }
    );


    video.addEventListener(
        "waiting",
        function () {

            console.log(
                "BACKGROUND VIDEO: BUFFERING."
            );

        }
    );


    video.addEventListener(
        "error",
        function () {

            console.error(
                "BACKGROUND VIDEO HTML ERROR:",
                video.error
            );

        }
    );

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


let currentAudio =
    new Audio();


let currentPlayingIndex =
    null;


// ======================================================
// PLAY AUDIO
// ======================================================

function playAudio(index) {

    if (
        !audioFiles[index]
    ) {

        console.error(
            "AUDIO: Invalid index:",
            index
        );

        return;
    }


    const audioItems =
        document.querySelectorAll(
            ".audio-item"
        );


    const clickedItem =
        audioItems[index];


    if (!clickedItem) {

        console.error(
            "AUDIO: Audio item not found."
        );

        return;
    }


    const clickedImg =
        clickedItem.querySelector(
            "img"
        );


    // ==================================================
    // TURN CURRENT AUDIO OFF (TOGGLE PAUSE)
    // ==================================================

    if (
        currentPlayingIndex === index &&
        !currentAudio.paused
    ) {

        currentAudio.pause();

        currentAudio.currentTime = 0;


        resetAudioUI();


        return;
    }


    // ==================================================
    // STOP PREVIOUS AUDIO & RESET UI
    // ==================================================

    currentAudio.pause();

    currentAudio.currentTime = 0;


    resetAudioUI();


    // ==================================================
    // LOAD NEW STREAM
    // ==================================================

    currentAudio.src =
        audioFiles[index];


    currentAudio.load();


    console.log(
        "AUDIO: Loading stream:",
        audioFiles[index]
    );


    // ==================================================
    // PLAY STREAM
    // ==================================================

    currentAudio
        .play()
        .then(
            function () {

                console.log(
                    "AUDIO: Playing channel:",
                    index
                );


                // Set visual active state
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
        )
        .catch(
            function (error) {

                console.error(
                    "AUDIO: Playback error:",
                    error
                );


                resetAudioUI();

            }
        );

}


// ======================================================
// RESET AUDIO UI HELPER
// ======================================================

function resetAudioUI() {

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


// ======================================================
// AUDIO ERROR MONITORING
// ======================================================

currentAudio.addEventListener(
    "error",
    function () {

        console.error(
            "AUDIO ERROR:",
            currentAudio.error
        );


        resetAudioUI();

    }
);


// ======================================================
// AUDIO EVENTS
// ======================================================

currentAudio.addEventListener(
    "playing",
    function () {

        console.log(
            "AUDIO: Stream playing."
        );

    }
);


currentAudio.addEventListener(
    "waiting",
    function () {

        console.log(
            "AUDIO: Buffering..."
        );

    }
);


currentAudio.addEventListener(
    "ended",
    function () {

        resetAudioUI();

    }
);


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupVideoEvents();

        initializeBackgroundVideo();

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
