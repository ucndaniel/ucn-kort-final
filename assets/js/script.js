const content = {
    "controls": true,
    "preload": 'auto',
    "autoplay": 'muted',
    "muted": false,
    "responsive": true,
    "poster": "../assets/images/ucnlogo2.png"
}
var videoPlayer = videojs("video1", content);

// var videoPlayer = videojs("video1", content);

// // make a square video
// videoPlayer.aspectRatio('1:1');

videojs('video1').ready(function () {
    this.on('timeupdate', onVideoTimeupdate);
});
var player = videojs('video1', {
    responsive: true
  });

let loopStart = 0;
let loopEnd = 3;
let loopEnabled = false;
let pauseTime = 3;

function onVideoTimeupdate() {
    if (loopEnabled) {
        if (this.currentTime() < loopStart || this.currentTime() >= loopEnd) {
            this.currentTime(loopStart);
        }
    }
    if (this.currentTime() > pauseTime) {
        this.pause();
    }
}
video.hotspots.init();