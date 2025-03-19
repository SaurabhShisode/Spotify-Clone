let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`).pop());
        }
    }

    let currentPlayingElement = null;
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        let decodedSongName = decodeURIComponent(song.replace(".mp3", "").trim());
        let parts = decodedSongName.split(" - ");
        let songTitle = parts[0]?.trim() || decodedSongName;
        let artistName = parts[1]?.trim() || "Unknown Artist";

        songUL.innerHTML += `
        <li>
            <img class="album-cover" src="${folder}/${decodedSongName}.jpeg" alt="Album Cover">
            <div class="info">
                <div class="song-title">${songTitle}</div>
                <div class="artist-name">${artistName}</div>
            </div>
            <div class="playnow">
                <img class="invert play-icon" src="img/play.svg" alt="Play Icon">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".song-title").textContent.trim();
            const artistName = e.querySelector(".artist-name").textContent.trim();
            const fullSongName = `${songName} - ${artistName}.mp3`;

            playMusic(fullSongName);

            if (currentPlayingElement && currentPlayingElement !== e) {
                currentPlayingElement.querySelector(".play-icon").src = "img/play.svg";
            }

            e.querySelector(".play-icon").src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
            currentPlayingElement = e;
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    const filePath = `${currFolder}/${track}`;
    currentSong.src = filePath;

    if (!pause) {
        currentSong.play().catch(error => console.error("Error playing the song:", error));
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }

    document.querySelector(".songinfo").textContent = decodeURI(track.replace(".mp3", ""));
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        if (e.textContent !== "Parent Directory" && e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2, -1)[0];

            if (folder) {
                try {
                    let infoUrl = `songs/${folder}/info.json`;
                    let infoFetch = await fetch(infoUrl);
                    if (!infoFetch.ok) continue;

                    let metadata = await infoFetch.json();

                    cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="Album Cover">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.description}</p>
                    </div>`;
                } catch (error) {
                    console.error(`Failed to fetch metadata for folder ${folder}`, error);
                }
            }
        }
    }
}

async function main() {
    await getSongs("songs/indieindia");
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volume>img").src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.10;
        }
    });

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getSongs(`songs/${e.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

main();
