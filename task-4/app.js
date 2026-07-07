// Music Player Application Logic

// Track Library
const tracks = [
  {
    id: 1,
    title: "Stardust",
    artist: "Aether & Luna",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
    colors: ["#ff4e50", "#f9d423"],
    duration: "6:12"
  },
  {
    id: 2,
    title: "Midnight Drive",
    artist: "Neon Skyline",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
    colors: ["#8a2387", "#e94057"],
    duration: "7:05"
  },
  {
    id: 3,
    title: "Neon Dreams",
    artist: "Vaporwave Vibe",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
    colors: ["#00c6ff", "#0072ff"],
    duration: "5:44"
  },
  {
    id: 4,
    title: "Whispers in the Rain",
    artist: "Cozy Lofi Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    colors: ["#11998e", "#38ef7d"],
    duration: "5:02"
  },
  {
    id: 5,
    title: "Sunsets & Memories",
    artist: "Summer Breeze",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=60",
    colors: ["#fc00ff", "#00dbde"],
    duration: "6:03"
  }
];

// Audio Object
const audio = new Audio();

// State Variables
let isPlaying = false;
let currentTrackIndex = 0;
let isShuffle = false;
let repeatState = "all"; // "none" | "all" | "one"
let playbackSpeed = 1.0;
let previousVolume = 1.0;
let saveTimer = null;

// DOM Elements
const dashboard = document.getElementById("dashboard");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");

const trackTitle = document.getElementById("song-title");
const trackArtist = document.getElementById("song-artist");
const albumCover = document.getElementById("album-cover");
const albumVinyl = document.querySelector(".album-vinyl");

const progressSlider = document.getElementById("progress-slider");
const progressFilled = document.getElementById("progress-filled");
const currentTimeLabel = document.getElementById("current-time");
const totalDurationLabel = document.getElementById("total-duration");

const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");
const volumeFilled = document.getElementById("volume-filled");

const searchInput = document.getElementById("search-input");
const playlistContainer = document.getElementById("playlist-container");

const sidebar = document.getElementById("sidebar");
const menuToggleBtn = document.getElementById("menu-toggle-btn");
const closeSidebarBtn = document.getElementById("close-sidebar-btn");

const speedBadge = document.getElementById("speed-badge");
const speedVal = document.getElementById("speed-val");
const speedDropdown = document.getElementById("speed-dropdown-menu");

// Initialize Application
function init() {
  loadSavedState();
  renderPlaylist();
  setupEventListeners();
  updateUIForTrack();
}

// Load track at index
function loadTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  
  currentTrackIndex = index;
  const track = tracks[currentTrackIndex];
  
  audio.src = track.url;
  audio.playbackRate = playbackSpeed;
  
  // Save State
  localStorage.setItem("aura_currentTrackIndex", currentTrackIndex);
  
  updateUIForTrack();
  
  if (isPlaying) {
    playTrack();
  }
}

// Update UI elements for loaded track
function updateUIForTrack() {
  const track = tracks[currentTrackIndex];
  
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  albumCover.src = track.cover;
  
  // Set window title
  document.title = `${track.title} - ${track.artist} | Aura Player`;
  
  // Dynamic Background Gradient based on track colors
  document.documentElement.style.setProperty("--theme-glow-1", track.colors[0]);
  document.documentElement.style.setProperty("--theme-glow-2", track.colors[1]);
  
  // Sync playlist item active class
  const trackItems = document.querySelectorAll(".track-item");
  trackItems.forEach((item, index) => {
    if (index === currentTrackIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Reset progress labels
  currentTimeLabel.textContent = "0:00";
  totalDurationLabel.textContent = track.duration || "--:--";
  progressSlider.value = 0;
  progressFilled.style.width = "0%";
}

// Play / Pause controls
function playTrack() {
  isPlaying = true;
  dashboard.classList.add("playing");
  playPauseBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <rect x="6" y="4" width="4" height="16" rx="1"></rect>
      <rect x="14" y="4" width="4" height="16" rx="1"></rect>
    </svg>
  `;
  
  // Audio Playback
  audio.play().catch(error => {
    console.log("Audio playback failed or was interrupted:", error);
    // Auto toggle off if failed (e.g. browser block prior to interaction)
    pauseTrack();
  });
}

function pauseTrack() {
  isPlaying = false;
  dashboard.classList.remove("playing");
  playPauseBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  `;
  audio.pause();
}

function togglePlay() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

// Navigation Controls
function nextTrack() {
  if (isShuffle) {
    // Generate a random track index different from current if possible
    if (tracks.length > 1) {
      let randomIndex = currentTrackIndex;
      while (randomIndex === currentTrackIndex) {
        randomIndex = Math.floor(Math.random() * tracks.length);
      }
      loadTrack(randomIndex);
    } else {
      loadTrack(0);
    }
  } else {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) {
      if (repeatState === "all") {
        nextIndex = 0;
      } else {
        // End of playlist and no repeat-all
        pauseTrack();
        audio.currentTime = 0;
        return;
      }
    }
    loadTrack(nextIndex);
  }
  
  if (isPlaying) playTrack();
}

function prevTrack() {
  // If track is more than 3 seconds in, restart the track
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  
  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) {
    if (repeatState === "all") {
      prevIndex = tracks.length - 1;
    } else {
      prevIndex = 0;
    }
  }
  loadTrack(prevIndex);
  
  if (isPlaying) playTrack();
}

// Shuffle & Repeat logic
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active-state", isShuffle);
  localStorage.setItem("aura_isShuffle", isShuffle);
}

function toggleRepeat() {
  if (repeatState === "all") {
    repeatState = "one";
    repeatBtn.classList.add("active-state");
    // Change SVG indicator or style for repeat one
    repeatBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <polyline points="7 23 3 19 7 15"></polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        <text x="10" y="15" font-size="8" font-weight="bold" fill="currentColor" stroke="none">1</text>
      </svg>
    `;
  } else if (repeatState === "one") {
    repeatState = "none";
    repeatBtn.classList.remove("active-state");
    repeatBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <polyline points="7 23 3 19 7 15"></polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
      </svg>
    `;
  } else {
    repeatState = "all";
    repeatBtn.classList.add("active-state");
    repeatBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <polyline points="7 23 3 19 7 15"></polyline>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
      </svg>
    `;
  }
  localStorage.setItem("aura_repeatState", repeatState);
}

// Progress and Time management
function updateProgress() {
  if (!audio.duration) return;
  
  const percentage = (audio.currentTime / audio.duration) * 100;
  progressSlider.value = percentage;
  progressFilled.style.width = percentage + "%";
  
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  totalDurationLabel.textContent = formatTime(audio.duration);
  
  // Throttle saving current playback position (every 2 seconds)
  if (!saveTimer) {
    saveTimer = setTimeout(() => {
      localStorage.setItem("aura_currentTime", audio.currentTime);
      saveTimer = null;
    }, 2000);
  }
}

function seek(event) {
  const percentage = event.target.value;
  if (!audio.duration) return;
  audio.currentTime = (percentage / 100) * audio.duration;
  progressFilled.style.width = percentage + "%";
  currentTimeLabel.textContent = formatTime(audio.currentTime);
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Volume Controls
function setVolume(event) {
  const vol = event.target.value;
  audio.volume = vol;
  volumeFilled.style.width = (vol * 100) + "%";
  localStorage.setItem("aura_volume", vol);
  updateVolumeIcon(vol);
}

function toggleMute() {
  if (audio.volume > 0) {
    previousVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    volumeFilled.style.width = "0%";
    updateVolumeIcon(0);
  } else {
    audio.volume = previousVolume;
    volumeSlider.value = previousVolume;
    volumeFilled.style.width = (previousVolume * 100) + "%";
    updateVolumeIcon(previousVolume);
  }
}

function updateVolumeIcon(vol) {
  let iconMarkup = "";
  if (vol == 0) {
    // Mute
    iconMarkup = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
    `;
  } else if (vol < 0.4) {
    // Low
    iconMarkup = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;
  } else {
    // High
    iconMarkup = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;
  }
  volumeBtn.innerHTML = iconMarkup;
}

// Speed Control
function toggleSpeedDropdown() {
  speedDropdown.classList.toggle("show");
}

function changeSpeed(event) {
  if (event.target.classList.contains("speed-option-btn")) {
    const rate = parseFloat(event.target.dataset.speed);
    playbackSpeed = rate;
    audio.playbackRate = rate;
    speedVal.textContent = rate === 1.0 ? "1x" : rate + "x";
    
    // Update active class in speed options list
    document.querySelectorAll(".speed-option-btn").forEach(btn => {
      if (btn.dataset.speed == rate) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
    
    speedDropdown.classList.remove("show");
  }
}

// Render playlist dynamically
function renderPlaylist(filterQuery = "") {
  playlistContainer.innerHTML = "";
  const query = filterQuery.toLowerCase().trim();
  
  tracks.forEach((track, index) => {
    // Filter matching search
    const matchesTitle = track.title.toLowerCase().includes(query);
    const matchesArtist = track.artist.toLowerCase().includes(query);
    if (query && !matchesTitle && !matchesArtist) return;
    
    const trackItem = document.createElement("div");
    trackItem.className = `track-item ${index === currentTrackIndex ? "active" : ""}`;
    trackItem.dataset.index = index;
    
    trackItem.innerHTML = `
      <img src="${track.cover}" class="track-cover-mini" alt="${track.title} Cover">
      <div class="track-info-mini">
        <div class="track-title-mini">${track.title}</div>
        <div class="track-artist-mini">${track.artist}</div>
      </div>
      <div class="track-meta">
        <div class="mini-equalizer">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <div class="track-duration-mini">${track.duration}</div>
      </div>
    `;
    
    trackItem.addEventListener("click", () => {
      loadTrack(index);
      playTrack();
    });
    
    playlistContainer.appendChild(trackItem);
  });

  if (playlistContainer.children.length === 0) {
    playlistContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding-top: 40px; font-size: 0.9rem;">
        No songs match your search.
      </div>
    `;
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Playback Control Buttons
  playPauseBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextTrack);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);
  
  // Progress Audio Sync
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", () => {
    if (repeatState === "one") {
      audio.currentTime = 0;
      playTrack();
    } else {
      nextTrack();
    }
  });
  
  progressSlider.addEventListener("input", seek);
  
  // Volume Events
  volumeSlider.addEventListener("input", setVolume);
  volumeBtn.addEventListener("click", toggleMute);
  
  // Speed Dropdown
  speedBadge.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSpeedDropdown();
  });
  speedDropdown.addEventListener("click", changeSpeed);
  
  // Close speed dropdown if clicking outside
  document.addEventListener("click", () => {
    speedDropdown.classList.remove("show");
  });
  
  // Search bar input
  searchInput.addEventListener("input", (e) => {
    renderPlaylist(e.target.value);
  });
  
  // Responsive sidebar toggles
  menuToggleBtn.addEventListener("click", () => {
    sidebar.classList.add("show");
  });
  
  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("show");
  });
  
  // Keyboard Hotkeys
  document.addEventListener("keydown", (e) => {
    // Ignore keypresses inside inputs
    if (document.activeElement.tagName === "INPUT") return;
    
    switch(e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
        break;
      case "ArrowLeft":
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        const nextVolUp = Math.min(audio.volume + 0.1, 1.0);
        audio.volume = nextVolUp;
        volumeSlider.value = nextVolUp;
        volumeFilled.style.width = (nextVolUp * 100) + "%";
        updateVolumeIcon(nextVolUp);
        break;
      case "ArrowDown":
        e.preventDefault();
        const nextVolDown = Math.max(audio.volume - 0.1, 0.0);
        audio.volume = nextVolDown;
        volumeSlider.value = nextVolDown;
        volumeFilled.style.width = (nextVolDown * 100) + "%";
        updateVolumeIcon(nextVolDown);
        break;
      case "KeyM":
        toggleMute();
        break;
    }
  });
}

// Load configurations from local storage
function loadSavedState() {
  // Volume
  const savedVolume = localStorage.getItem("aura_volume");
  if (savedVolume !== null) {
    const vol = parseFloat(savedVolume);
    audio.volume = vol;
    volumeSlider.value = vol;
    volumeFilled.style.width = (vol * 100) + "%";
    updateVolumeIcon(vol);
  } else {
    audio.volume = 1.0;
    volumeSlider.value = 1.0;
    volumeFilled.style.width = "100%";
    updateVolumeIcon(1.0);
  }
  
  // Track Index
  const savedIndex = localStorage.getItem("aura_currentTrackIndex");
  if (savedIndex !== null) {
    currentTrackIndex = parseInt(savedIndex);
  }
  const track = tracks[currentTrackIndex];
  audio.src = track.url;
  
  // Playback position
  const savedTime = localStorage.getItem("aura_currentTime");
  if (savedTime !== null) {
    audio.currentTime = parseFloat(savedTime);
  }
  
  // Shuffle state
  const savedShuffle = localStorage.getItem("aura_isShuffle");
  if (savedShuffle === "true") {
    isShuffle = true;
    shuffleBtn.classList.add("active-state");
  }
  
  // Repeat state
  const savedRepeat = localStorage.getItem("aura_repeatState");
  if (savedRepeat !== null) {
    repeatState = savedRepeat;
    if (repeatState === "none") {
      repeatBtn.classList.remove("active-state");
    } else {
      repeatBtn.classList.add("active-state");
      if (repeatState === "one") {
        repeatBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            <text x="10" y="15" font-size="8" font-weight="bold" fill="currentColor" stroke="none">1</text>
          </svg>
        `;
      }
    }
  }
}

// Start player on load
window.addEventListener("DOMContentLoaded", init);
