const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv",
    "https://stream.zeno.fm/c3z135w8zxhvv",
    "https://stream.zeno.fm/4k8qf4raqy8uv",
    "https://stream.zeno.fm/qrhuqbnm208uv",
    "https://stream.zeno.fm/xnuifxjgpomvv"
];

let currentAudio = null;

function playAudio(index) {
    // Stop the current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Use only one global audio element
    if (!currentAudio) {
        currentAudio = document.createElement("audio");
        currentAudio.controls = true; // Add controls for debugging
        document.body.appendChild(currentAudio);
    }

    // Update audio source and play
    currentAudio.src = audioFiles[index];

    // Play the stream with error handling
    currentAudio.play().catch(error => {
        console.error("Playback failed:", error);
    });
}
