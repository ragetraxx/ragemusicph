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
let currentPlayingIndex = null;

function playAudio(index) {
    if (!audioFiles[index]) return;

    let clickedItem = document.querySelectorAll(".audio-item")[index];

    // If the same button is clicked again, stop the audio and reset player
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        clickedItem.querySelector("img").classList.remove("spinning");
        resetMusicPlayer();
        currentPlayingIndex = null;
        return;
    }

    // Pause and reset previous audio
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Remove spin class from previous item
    if (currentPlayingIndex !== null) {
        let previousItem = document.querySelectorAll(".audio-item")[currentPlayingIndex];
        if (previousItem) {
            previousItem.querySelector("img").classList.remove("spinning");
        }
    }

    // Play new audio
    currentAudio.src = audioFiles[index];
    currentAudio.play();

    // Add spin class to clicked item
    clickedItem.querySelector("img").classList.add("spinning");

    // Update currently playing index
    currentPlayingIndex = index;

    // Fetch metadata
    updateMusicPlayer("Loading...", "Unknown Artist", "https://via.placeholder.com/150");
}

// Reset music player when stopping audio
function resetMusicPlayer() {
    updateMusicPlayer("Now Playing", "Artist", "https://via.placeholder.com/150");
}

// Update music player metadata
function updateMusicPlayer(title, artist, albumArt) {
    document.getElementById("song-title").innerText = title;
    document.getElementById("artist-name").innerText = artist;
    document.getElementById("album-art").src = albumArt;
}
