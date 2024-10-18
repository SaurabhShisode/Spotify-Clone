console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    
    // Build the correct GitHub Pages URL
    let baseUrl = `https://saurabhshisode.github.io/Spotify-Clone/`;  // Base URL for your GitHub Pages site
    let a = await fetch(`${baseUrl}${folder}/`);  // Fetch from the correct folder
    
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // Include the "songs/" prefix to the file name
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = song.split("/").pop();  // Extract the song name
        songUL.innerHTML += `<li> 
                                <img class="invert" src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${decodeURIComponent(songName)}</div>
                                    <div>Artist</div>
                                </div>
                                <div class="playnow">
                                    <img class="invert" src="img/play.svg" alt="">
                                </div>
                            </li>`;
    }

    // Attach event listeners to the song list
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}


async function displayAlbums() {
    console.log("displaying albums");
    let baseUrl = `https://saurabhshisode.github.io/Spotify-Clone/`;  // Base URL for your GitHub Pages site
    let a = await fetch(`${baseUrl}songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // Extract folder name using pathname and splitting correctly
        let folderPath = new URL(e.href).pathname;
        let folderParts = folderPath.split("/");
        let folder = folderParts[folderParts.length - 2];  // Folder name

        if (folder && e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            try {
                let infoUrl = `${baseUrl}songs/${folder}/info.json`;  // Correct path for info.json
                console.log(`Fetching: ${infoUrl}`);
                let infoFetch = await fetch(infoUrl);
                let metadata = await infoFetch.json();

                // Append album card
                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>

                    <img src="${baseUrl}songs/${folder}/cover.jpg" alt="Album Cover">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
            } catch (error) {
                console.error(`Failed to fetch metadata for folder ${folder}`, error);
            }
        }
    }
}


async function main() {
    // Get the list of all the songs from a specific folder
    await getSongs("songs/hothits");
    console.log(songs);

    await displayAlbums();

    // Attach event listeners for play, next, and previous
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
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    let next = document.querySelector("#next");
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

main();
