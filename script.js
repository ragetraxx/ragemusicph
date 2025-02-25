const audioFiles = [
    "https://stream.zeno.fm/q1n2wyfs7x8uv",
    "https://stream.zeno.fm/d42hdvx96zhvv",
    "https://stream.zeno.fm/03v7z8edgphvv",
    "https://stream.zeno.fm/c3z135w8zxhvv",
    "https://stream.zeno.fm/4k8qf4raqy8uv",
    "https://stream.zeno.fm/qrhuqbnm208uv",
    "https://stream.zeno.fm/xnuifxjgpomvv"
];

const audioDetails = [
    {
        title: "Rage Music Philippines",
        artist: "Various Artists",
        albumArt: "https://i.imgur.com/a3iXI35.png"
    },
    {
        title: "Clubmix",
        artist: "DJ Clubmix",
        albumArt: "https://i.imgur.com/mtxns7R.png"
    },
    {
        title: "Emotions",
        artist: "Chill Vibes",
        albumArt: "https://i.imgur.com/nOBT9dU.png"
    },
    {
        title: "Scream Radio",
        artist: "Rock Legends",
        albumArt: "https://i.imgur.com/WhCxsNJ.png"
    },
    {
        title: "Vibe Radio",
        artist: "Vibe Masters",
        albumArt: "https://i.imgur.com/JbkwiBQ.png"
    },
    {
        title: "Hot Hiphop And RnB",
        artist: "HipHop Stars",
        albumArt: "https://i.imgur.com/nfFWyYR.png"
    },
    {
        title: "iMix Radio",
        artist: "Electronic Beats",
        albumArt: "https://i.imgur.com/CLD1X1t.png"
    }
];

let currentAudio = new Audio();

function playAudio(index) {
    if (!audioFiles[index]) return;

    // Stop and reset the current audio
    if (!currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Set new audio source and play
    currentAudio.src = audioFiles[index];
    currentAudio.play();

    // Update the info section
    document.getElementById("track-title").textContent = audioDetails[index].title;
    document.getElementById("artist-name").textContent = audioDetails[index].artist;
    document.getElementById("album-art").src = audioDetails[index].albumArt;
}
