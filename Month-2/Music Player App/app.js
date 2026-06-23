// Get DOM elements
const song = document.getElementById("song");
const progress = document.getElementById("progress");
const ctrlBtn = document.getElementById("ctrlBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const title = document.getElementById("songTitle");
const artist = document.getElementById("artistName");
const thumbnail = document.getElementById("coverArt");
const currentSong = document.getElementById("currentSong");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const playlist = document.getElementById("playlist");
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

let songIndex = 0;
let isPlaying = false;

// 🎵 SONG DATA - Start with online songs that work
const songs = [
    {
        name: "Midnight Dreams",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://picsum.photos/seed/1/300/300"
    },
    {
        name: "Neon Lights",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://picsum.photos/seed/2/300/300"
    },
    {
        name: "Ocean Waves",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://picsum.photos/seed/3/300/300"
    }
];

// Trigger file input when upload button is clicked
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// LOAD SONG
function loadSong(index) {
    if (index < 0 || index >= songs.length) return;
    const s = songs[index];
    if (!s) return;

    song.src = s.src;
    song.load();
    title.innerText = s.name || "Unknown Title";
    artist.innerText = s.artist || "Unknown Artist";
    thumbnail.src = s.cover || "https://picsum.photos/seed/music/300/300";
    currentSong.innerText = `Loading: ${s.name}...`;

    const items = playlist.querySelectorAll('li');
    items.forEach((item, i) => item.classList.toggle('active', i === index));
    progress.value = 0;

    song.onloadeddata = function() {
        console.log(`✅ Loaded: ${s.name}`);
        currentSong.innerText = `Now Playing: ${s.name}`;
        if (isPlaying) playSong();
    };

    song.onerror = function(e) {
        console.error(`❌ Error loading: ${s.name}`, e);
        currentSong.innerText = `⚠️ Cannot load: ${s.name}`;
        ctrlBtn.className = "fa-solid fa-play";
        isPlaying = false;
    };
}

// PLAY
function playSong() {
    if (!song.src) { 
        loadSong(songIndex); 
        setTimeout(() => playSong(), 300); 
        return; 
    }
    
    song.play()
        .then(() => {
            isPlaying = true;
            ctrlBtn.className = "fa-solid fa-pause";
            if (songs[songIndex]) {
                currentSong.innerText = `Now Playing: ${songs[songIndex].name}`;
            }
        })
        .catch(error => {
            console.error("Playback error:", error);
            currentSong.innerText = `⚠️ Cannot play: ${songs[songIndex].name}`;
            ctrlBtn.className = "fa-solid fa-play";
            isPlaying = false;
        });
}

function pauseSong() {
    song.pause();
    isPlaying = false;
    ctrlBtn.className = "fa-solid fa-play";
}

function nextSong() {
    if (songs.length === 0) return;
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex);
    if (isPlaying) setTimeout(() => playSong(), 300);
}

function prevSong() {
    if (songs.length === 0) return;
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex);
    if (isPlaying) setTimeout(() => playSong(), 300);
}

// Event Listeners
playBtn.addEventListener("click", () => {
    if (songs.length === 0) { 
        currentSong.innerText = "No songs available"; 
        return; 
    }
    if (!song.src) { 
        loadSong(songIndex); 
        setTimeout(() => playSong(), 300); 
        return; 
    }
    isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Progress
song.addEventListener("timeupdate", () => {
    if (song.duration && !isNaN(song.duration)) {
        progress.value = (song.currentTime / song.duration) * 100 || 0;
    }
});

progress.addEventListener("input", function() {
    if (song.duration && !isNaN(song.duration)) {
        song.currentTime = (this.value / 100) * song.duration;
    }
});

song.addEventListener("ended", nextSong);

// Menu
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
        menu.style.display = "none";
    }
});

// RENDER PLAYLIST
function renderPlaylist() {
    playlist.innerHTML = '';
    songs.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fa-regular fa-circle-play"></i> ${s.name}`;
        if (i === songIndex) li.classList.add("active");
        li.addEventListener("click", () => {
            songIndex = i;
            loadSong(songIndex);
            setTimeout(() => playSong(), 300);
            menu.style.display = "none";
        });
        playlist.appendChild(li);
    });
}

// FILE INPUT HANDLER - Add local MP3 files
fileInput.addEventListener('change', function(e) {
    const files = this.files;
    if (files.length === 0) return;
    
    let addedCount = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.mp3')) {
            const fileURL = URL.createObjectURL(file);
            const fileName = file.name.replace('.mp3', '').replace(/_/g, ' ');
            
            songs.push({
                name: fileName,
                artist: 'Local File',
                src: fileURL,
                cover: 'https://picsum.photos/seed/' + fileName + '/300/300'
            });
            addedCount++;
        }
    }
    
    if (addedCount > 0) {
        renderPlaylist();
        songIndex = songs.length - 1;
        loadSong(songIndex);
        currentSong.innerText = `✅ Added ${addedCount} song(s)!`;
        setTimeout(() => playSong(), 300);
    } else {
        currentSong.innerText = '⚠️ No valid MP3 files selected';
    }
    this.value = '';
});

// INIT
function initPlayer() {
    if (songs.length > 0) {
        loadSong(0);
        renderPlaylist();
        currentSong.innerText = `Ready: ${songs[0].name}`;
        console.log(`✅ Player ready with ${songs.length} songs`);
        console.log('📁 Click "Select MP3 Files" to add your own songs!');
    }
}

initPlayer();

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { 
        e.preventDefault(); 
        playBtn.click(); 
    }
    if (e.code === 'ArrowRight') { 
        e.preventDefault(); 
        nextBtn.click(); 
    }
    if (e.code === 'ArrowLeft') { 
        e.preventDefault(); 
        prevBtn.click(); 
    }
});

console.log('💡 How to add local songs:');
console.log('1️⃣ Click "Select MP3 Files" button');
console.log('2️⃣ Choose one or more MP3 files from your computer');
console.log('3️⃣ Your songs will be added and play automatically!');
console.log('🎵 Keyboard shortcuts: Space (play/pause), ← → (prev/next)');