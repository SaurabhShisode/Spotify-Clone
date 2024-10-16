console.log('Lets write JavaScript');
let currentSong = new Audio();
async function getSongs() {
    // Fetch from the "songs" subfolder
    let a = await fetch("http://127.0.0.1:5500/Spotify-Clone/songs/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // Include the "songs/" prefix to the file name
        if (element.href.endsWith(".mp3")) {
            songs.push("songs/" + element.href.split("/").pop()) // Adds "songs/" prefix
        }
    }
    return songs
}

const playMusic = (track) => {
    currentSong.src = "songs/" + track
    currentSong.play()
    play.src = "img/pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {


    //get the list of all the songs
    let songs = await getSongs()
    console.log(songs)

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        let songName = song.split("/").pop(); // Extract the song name without the "songs/" prefix
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${decodeURIComponent(songName)} </div>
                                <div>SmoKey</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;

    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    return songs

}


main()
