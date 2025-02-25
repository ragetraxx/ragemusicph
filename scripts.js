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

    // Select audio element or create one if not existing
    let audioElement = document.getElementById(`audio${index}`);
    
    if (!audioElement) {
        audioElement = document.createElement("audio");
        audioElement.id = `audio${index}`;
        audioElement.src = audioFiles[index];
        document.body.appendChild(audioElement);
    }

    // Play new audio
    currentAudio = audioElement;
    currentAudio.play();
}
