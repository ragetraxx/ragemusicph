const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv"
];

let currentAudio = new Audio();
let currentPlayingIndex = null;

function playAudio(index) {
    if (!audioFiles[index]) return;

    let clickedItem = document.querySelectorAll(".audio-item")[index];

    // If clicking the same button, stop playback
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        clickedItem.querySelector("img").classList.remove("spinning");
        resetMusicPlayer();
        currentPlayingIndex = null;
        return;
    }

    // Stop previous audio
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Remove spin class from the previous item
    if (currentPlayingIndex !== null) {
        let previousItem = document.querySelectorAll(".audio-item")[currentPlayingIndex];
        if (previousItem) {
            previousItem.querySelector("img").classList.remove("spinning");
        }
    }

    // Play new audio
    currentAudio.src = audioFiles[index];
    currentAudio.play();

    // Add spinning class to clicked item
    clickedItem.querySelector("img").classList.add("spinning");

    // Update currently playing index
    currentPlayingIndex = index;

    // Fetch metadata
    fetchMetadata(index);
}

// Reset music player
function resetMusicPlayer() {
    updateMusicPlayer("Now Playing", "Unknown Artist", "https://via.placeholder.com/150");
}

// Fetch metadata
async function fetchMetadata(index) {
    try {
        const streamUrl = audioFiles[index];
        const response = await fetch(streamUrl, { method: "HEAD" });

        if (response.headers.get("icy-metaint")) {
            const metadata = await response.headers.get("icy-metaint");
            updateMusicPlayer(metadata, "Live Radio", "https://via.placeholder.com/150");
        } else {
            resetMusicPlayer();
        }
    } catch (error) {
        console.error("Metadata fetch error:", error);
        resetMusicPlayer();
    }
}

// Update the music player UI
function updateMusicPlayer(title, artist, albumArt) {
    document.getElementById("song-title").innerText = title;
    document.getElementById("artist-name").innerText = artist;
    document.getElementById("album-art").src = albumArt;
}
