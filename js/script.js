console.log('Lets write');

let currSong=new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(sec){
    if(isNaN(sec) || sec<0){
        return "00:00";
    }

    const min=Math.floor(sec/60);
    const remainingSec=Math.floor(sec%60);

    const formattedMin=String(min).padStart(2,'0');
    const formattedSec=String(remainingSec).padStart(2,'0');

    return `${formattedMin}:${formattedSec}`;
}
async function getSongs(folder){
    currFolder=folder;
    let a=await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response=await a.text();
    let div = document.createElement("div")
    div.innerHTML= response;
    let as = div.getElementsByTagName("a")
    songs = []
    for(let i=0;i<as.length;i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songul=document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML=""

    for (const i of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${i.replaceAll("%20"," ")}</div>
                <div>Dhruv</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })
    return songs
}

const playMusic=(track, pause=false)=>{
    //let audio=new Audio("/songs/"+track);
    currSong.src=`/${currFolder}/`+track;
    if(!pause){
        currSong.play();
        play.src="img/pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"

}

async function displayAlbums(){
    console.log("displaying albums")
    let a=await fetch(`http://127.0.0.1:3000/songs/`);
    let response=await a.text();
    let div = document.createElement("div")
    div.innerHTML= response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")

    let array=Array.from(anchors)
    for(let index=0; index<array.length;index++){
        const e=array[index];
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a=await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response=await a.json();
            console.log(response)
            cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15%" height="15%" fill="none">
                    <circle cx="12" cy="12" r="12" fill="green" />
                    <path d="M7.05 3.606 20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            console.log("Fetching Songs")
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
async function main(){
    
    // Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0],true)

    // Display all the albums on the page
    await displayAlbums()
    
    // Attach an event listener to play, next and previous
    play.addEventListener("click",()=>{
        if(currSong.paused){
            currSong.play();
            play.src="img/pause.svg";
        }
        else{
            currSong.pause();
            play.src="img/
            play.svg";
        }
    })
    // Listen for timeupdate event
    currSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left=(currSong.currentTime/currSong.duration)*100+"%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=percent+"%";
        currSong.currentTime = ((currSong.duration)*percent)/100;
    })

    // Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    // Add an event listner for close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    // Add an event listner to previous
    // previous.addEventListener("click",()=>{
    //     currSong.pause()
    //     console.log("Previous Clicked");

    //     let ind=songs.indexOf(currSong.src.split("/").slice(-1)[0])
    //     if((ind-1) >= 0){
    //         playMusic(songs[ind-1])
    //     }
    // })

    // Add an event listner to next
    next.addEventListener("click",()=>{
        currSong.pause()
        console.log("Next Clicked");

        let ind=songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if((ind+1) < songs.length){
            playMusic(songs[ind+1]);
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to",e.target.value,"/100")
        currSong.volume=parseInt(e.target.value)/100
    })

    // Add eventlistener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })

    
}
main()