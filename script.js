console.log('Lets write JavaScript');
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

async function main(){
    let songs = await getSongs()
    console.log(songs)

    // Play the first song if available
    var audio = new Audio(songs[0]);
    audio.play();

    audio.addEventListener("loadeddata", () =>{
        console.log(audio.duration, audio.currentSrc, audio.currentTime)
    });
}
main()
