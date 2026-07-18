// =========================================
// YOUTUBE API VARIABLES
// =========================================

const players = new Map();

let currentPlayer = null;

let videoPlaying = false;
const previewPanel = document.getElementById("preview-panel");
const orb = document.querySelector(".energy-orb");


const videoCards = document.querySelectorAll(".video-card, .shorts-card");
let activeCard = null;


// -------------------------
// PANEL HOVER
// -------------------------

videoCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

    if(videoPlaying){

        previewPanel.classList.remove("active");

        return;

    }

        const rect = card.getBoundingClientRect();

        const panelWidth = 340;
        const gap = 40;

       let left;

// Prefer left side for cards on the left
if (rect.left < window.innerWidth / 2) {

    left = rect.left - panelWidth - gap;

} else {

    left = rect.right + gap;

}

// Keep panel inside screen
const padding = 20;

if (left < padding) {
    left = padding;
}

if (left + panelWidth > window.innerWidth - padding) {
    left = window.innerWidth - panelWidth - padding;
}
        const top = rect.top + rect.height / 2;

        previewPanel.style.left = left + "px";
        previewPanel.style.top = top + "px";

        // UPDATE PANEL CONTENT
       document.getElementById("preview-title").textContent =
    card.dataset.title || "";

document.getElementById("preview-client").textContent =
    card.dataset.client || "";

document.getElementById("preview-description").textContent =
    card.dataset.desc || "";

const previewGif = document.getElementById("preview-gif");

if (card.dataset.gif) {

    previewGif.src = card.dataset.gif;
    previewGif.style.display = "block";

} else {

    previewGif.style.display = "none";

}

        // TAGS
        const tags = document.getElementById("preview-tags");
        tags.innerHTML = "";

        if (card.dataset.tags) {

    card.dataset.tags.split(",").forEach(tag => {

        const span = document.createElement("span");
        span.textContent = tag.trim();
        tags.appendChild(span);

    });

}
// Remove glow from previous card
if(activeCard){

    activeCard.classList.remove("active-preview");

}

// Save current card
activeCard = card;

// Glow current card
activeCard.classList.add("active-preview");
previewPanel.classList.add("active");



    });

    card.addEventListener("mouseleave", () => {

       previewPanel.classList.remove("active");

card.classList.remove("active-preview");

    });

});
// -------------------------
// ORB ENGINE
// -------------------------

let t = 0;

function animateOrb() {

    // Get the panel's CURRENT size
    const w = previewPanel.offsetWidth;
    const h = previewPanel.offsetHeight;

    const margin = 18;

    const usableW = w - margin * 2;
    const usableH = h - margin * 2;

    const perimeter = usableW * 2 + usableH * 2;

    t += 1.2;

    if (t > perimeter) {
        t = 0;
    }

    let x, y;

    if (t < usableW) {

        x = margin + t;
        y = margin;

    } else if (t < usableW + usableH) {

        x = w - margin;
        y = margin + (t - usableW);

    } else if (t < usableW * 2 + usableH) {

        x = w - margin - (t - (usableW + usableH));
        y = h - margin;

    } else {

        x = margin;
        y = h - margin - (t - (usableW * 2 + usableH));

    }

    orb.style.left = x + "px";
    orb.style.top = y + "px";

    requestAnimationFrame(animateOrb);
}

animateOrb();


// =========================================
// YOUTUBE PLAYER API
// =========================================

function onYouTubeIframeAPIReady() {

    window.playVideo = playVideo;

}

function playVideo(card) {

    // Already playing?
    if (players.has(card)) {

        const player = players.get(card);

        player.playVideo();

        return;

    }

    const videoURL = card.dataset.video;

    const videoId = videoURL.split("/embed/")[1];

    // Save thumbnail
    const thumb = card.querySelector(".thumb");
    const playButton = card.querySelector(".play-button");

    if (thumb) thumb.style.display = "none";
    if (playButton) playButton.style.display = "none";

    // Container for API player
    const playerDiv = document.createElement("div");

    playerDiv.style.width = "100%";
    playerDiv.style.height = "100%";

    card.appendChild(playerDiv);

    const player = new YT.Player(playerDiv, {

        videoId: videoId,

        playerVars: {

            autoplay: 1,
            rel: 0,
            modestbranding: 1

        },

        events: {

    onReady: (event) => {

        event.target.playVideo();

    },

    onStateChange: (event) => {

        switch(event.data){

            // ▶ PLAYING
            case YT.PlayerState.PLAYING:

                videoPlaying = true;

                previewPanel.classList.remove("active");
                if(activeCard){

    activeCard.classList.remove("active-preview");

}

                break;


            // ⏸ PAUSED
            case YT.PlayerState.PAUSED:

                videoPlaying = false;

                break;


            // ⏹ ENDED
            case YT.PlayerState.ENDED:

                videoPlaying = false;

                break;

        }

    }

}

    });

    players.set(card, player);

}





