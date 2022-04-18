const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const volumeRange = document.getElementById("volume");
const fullSceentBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullSceentBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout =null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume =volumeValue;



const handlePlayClick = (e)=>{
    // if hte video is playing , pasuse it
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtnIcon.classList= video.paused ? "fas fa-play" : "fas fa-pause";
};

const handlePause = () => (playBtn.innerText = "Play");
const handlePlay = () => (playBtn.innerText = "Pause");
const handleMute = (e)=>{
    if (video.muted){
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
    const {
        target:
        { value },
    } = event;
    if(video.muted){
        video.muted = false;
    }
    volumeValue = value;
    video.volume = volumeValue;
    if(video.volume === 0)
        muteBtnIcon.classList = "fas fa-volume-mute";
    else
        muteBtnIcon.classList = "fas fa-volume-up";
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14,5);

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const {
        target: {value},
        } = event;
    video.currentTime = value;
};

const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen){
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    }else{
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    } 
};
const hideControls = () => videoControls.classList.remove("showing");
const handleMouseMove = () => {
    if(controlsTimeout){
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if(controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout= null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls,3000);
};

const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
};

const handleVideoClickPlay = () => {
    if(video.paused)
        video.play();
    else
        video.pause();
    playBtnIcon.classList= video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleKeyEvent = (event) =>{
    keyPress = event.keyCode;
    fullScreen = document.fullscreenElement
    switch(keyPress){
        case 27:
            if(fullScreen){
                document.exitFullscreen();
                fullScreenIcon.classList = "fas fa-expand";
            }
        break;
        case 32:
            if(video.paused)
            {
                video.play();
            }
            else
            {
                video.pause();
            }
            playBtnIcon.classList= video.paused ? "fas fa-play" : "fas fa-pause";
        break;
    }
};

const handleEnded = () => {
    const {id} = videoContainer.dataset.videoid;
    fetch(`/api/videos/${id}/view`,{
    method:"POST"
    });
};
playBtn.addEventListener("click",handlePlayClick);
muteBtn.addEventListener("click",handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("canplay", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click",handleVideoClickPlay);
video.addEventListener("ended",handleEnded);
timeline.addEventListener("input",handleTimelineChange);
fullSceentBtn.addEventListener("click",handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown",handleKeyEvent);