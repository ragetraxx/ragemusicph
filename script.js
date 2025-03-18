const m3u8VideoURL = "https://ssh101stream.ssh101.com/akamaissh101/ssh101/ragemusicph/playlist.m3u8"; // Replace with your actual M3U8 link

function loadM3U8Video() {
    const video = document.getElementById('bg-video');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8VideoURL);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8VideoURL;
        video.play();
    }
}

document.addEventListener("DOMContentLoaded", loadM3U8Video);

const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv",
    "https://stream.zeno.fm/c3z135w8zxhvv",
    "https://stream.zeno.fm/4k8qf4raqy8uv",
    "https://stream.zeno.fm/qrhuqbnm208uv",
    "https://stream.zeno.fm/xnuifxjgpomvv"
];

let currentAudio = new Audio();
let currentPlayingIndex = null; // Track the currently playing audio

function playAudio(index) {
    if (!audioFiles[index]) return;

    let clickedItem = document.querySelectorAll(".audio-item")[index];

    // If the same button is clicked again, return it to its original position and stop the audio
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        clickedItem.classList.remove("pop-up");
        clickedItem.querySelector("img").classList.remove("spinning");
        document.body.classList.remove("dimmed");
        currentPlayingIndex = null; // Reset playing index
        return;
    }

    // Pause and reset previous audio
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Remove pop-up and spin class from the previously playing item
    if (currentPlayingIndex !== null) {
        let previousItem = document.querySelectorAll(".audio-item")[currentPlayingIndex];
        if (previousItem) {
            previousItem.classList.remove("pop-up");
            previousItem.querySelector("img").classList.remove("spinning");
        }
    }

    // Play new audio
    currentAudio.src = audioFiles[index];
    currentAudio.play();

    // Add pop-up and spin class to the clicked item
    clickedItem.classList.add("pop-up");
    clickedItem.querySelector("img").classList.add("spinning");

    // Dim the background
    document.body.classList.add("dimmed");

    // Update currently playing index
    currentPlayingIndex = index;
}
