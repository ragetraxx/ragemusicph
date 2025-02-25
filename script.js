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
    // Stop current audio
    if (!audioFiles[index]) {
        console.error("Invalid index:", index);
        return;
    }
    
    currentAudio.pause();
    currentAudio.src = audioFiles[index];
    
    // Play with user interaction
    currentAudio.play().catch(error => {
        console.error("Playback error:", error);
    });
}
