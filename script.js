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

function playAudio(index) {
    if (!audioFiles[index]) return; // Prevent errors if the index is out of bounds

    // Stop the current audio if playing
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Set the new source and play
    currentAudio.src = audioFiles[index];
    currentAudio.play();
}
