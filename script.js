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
    const albumArt = document.getElementById("album-art");

    // If the same button is clicked again, stop the audio
    if (currentPlayingIndex === index && !currentAudio.paused) {
        currentAudio.pause();
        clickedItem.classList.remove("pop-up");
        clickedItem.querySelector("img").classList.remove("spinning");
        document.body.classList.remove("dimmed");
        albumArt.classList.remove("spinning");
        currentPlayingIndex = null;
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
    document.body.classList.add("dimmed");

    // Extract album art from audio metadata
    currentAudio.addEventListener("loadedmetadata", function () {
        extractAlbumArt(currentAudio);
    });

    // Start spinning the album art
    albumArt.classList.add("spinning");

    currentPlayingIndex = index;
}

async function extractAlbumArt(audioElement) {
    const albumArt = document.getElementById("album-art");
    
    try {
        const response = await fetch(audioElement.src);
        const arrayBuffer = await response.arrayBuffer();
        const metadata = await import("https://cdn.jsdelivr.net/npm/music-metadata-browser");

        metadata.parseBlob(new Blob([arrayBuffer])).then((info) => {
            if (info.common.picture && info.common.picture.length > 0) {
                let base64String = `data:${info.common.picture[0].format};base64,${btoa(
                    String.fromCharCode(...new Uint8Array(info.common.picture[0].data))
                )}`;
                albumArt.src = base64String;
            } else {
                albumArt.src = "default-album.png"; // Default image if no album art is found
            }
        });
    } catch (error) {
        console.error("Error extracting album art:", error);
        albumArt.src = "default-album.png"; // Fallback if extraction fails
    }
}
