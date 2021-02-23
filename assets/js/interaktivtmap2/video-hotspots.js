// A framework for showing time-encoded hotspots on multiple videos.
// Assumes either video.js or a parent <div> for the video that has the same dimensions as the video.

// ## SETTINGS START
const fps = 30; // ## adjust this to set the frames per second precision on the hotspot appearance (lower = less cpu used)
const debug = false; // ## set to true to get console.log output, use   video.log('text')
// ## SETTINGS END

const msInterval = Math.floor(1000 / fps); // calculate how many ms per loop to match desired FPS. Rounded down
let engine; // declare a variable that will be used for the interval loop

let video = {
    log: (message = 'Missing log text') => {
        if (debug) {
            console.log(message);
        }
    },
    hotspots: {
        running: false,
        init: () => {
            video.log('video hotspot engine: init');
            const elmsVideo = document.querySelectorAll('video'); // grab all videos on the page
            elmsVideo.forEach((elmVideo) => { // loop through the parents of the video elements
                elmVideo.parentElement.classList.add('videoHotspotsParent');
                elmVideo.addEventListener('play', (event) => { // add eventlistener play on videos
                    if (!video.hotspots.running) { // start engine, if it is not running already
                        video.hotspots.on();
                    }
                });
                elmVideo.addEventListener('seeked', (event) => { // add eventlistener play on videos
                    if (!video.hotspots.running) { // start engine, if it is not running already
                        video.hotspots.on(true);
                    }
                });
                elmVideo.addEventListener('pause', (event) => { // add eventlistener stop/pause on videos
                    if (video.hotspots.running) { // if engine is running
                        let videoPlaying = false; // check if all videos are stopped/paused
                        elmsVideo.forEach((elmVideo) => {
                            if (!elmVideo.paused) {
                                videoPlaying = true;
                            }
                        });
                        if (!videoPlaying) {
                            video.hotspots.off(); // if all videos are NOT playing we can turn off the loop engine
                        }
                    }
                });
            });
        },
        on: (isSeeked = false) => {
            // start the interval loop
            video.log('video hotspot engine: on');
            if (!video.hotspots.running) { // only start it if it isn't already running
                video.hotspots.running = true; // make sure to tell our boolean that we are turning on the engine
            }
            engine = setInterval(() => { // start the interval engine
                video.log('engine loop');
                video.hotspots.update(isSeeked);
            }, msInterval);
        },
        off: () => {
            // kill the interval var
            video.log('video hotspot engine: off');
            video.hotspots.running = false; // make sure to tell our boolean that the engine is being stopped
            clearInterval(engine); // stop the engine
        },
        update: () => {
            hotspots.forEach((hotspot, index) => {
                if (hotspot.active) {
                    // get video element for hotspot
                    const video = document.querySelector(`#${hotspot.videoId}>video`);
                    if (video) {
                        const now = video.currentTime;
                        const elmHotspotCheck = document.querySelector(`#hotspotId${index}`);

                        if (hotspot.markIn > now || hotspot.markOut <= now) {
                            // check to see if element with the current hotspot id exists
                            if (elmHotspotCheck) {
                                // remove hotspot element
                                const elmHotspot = document.querySelector(`#hotspotId${index}`);
                                elmHotspot.parentElement.removeChild(elmHotspot);
                                hotspot.onscreen = false; // clear on-screen flag for the current hotspot
                            }
                        } else if (hotspot.markIn <= now && hotspot.markOut > now) {
                            if (!elmHotspotCheck) { // only draw new hotspot if it isn't already drawn
                                let elmHotspot = document.createElement('a');
                                elmHotspot.id = `hotspotId${index}`;
                                elmHotspot.className = 'hotspot';
                                if (hotspot.ui.title) {
                                    elmHotspot.title = hotspot.ui.title;
                                }
                                if (hotspot.ui.text && hotspot.ui.text != "") {
                                    elmHotspot.innerHTML = hotspot.ui.text;
                                }
                                let css = "";
                                css += `width: ${hotspot.sizeX}%;`;
                                css += `height: ${hotspot.sizeY}%;`;
                                css += `left: ${hotspot.posX}%;`;
                                css += `top: ${hotspot.posY}%;`;
                                css += `${hotspot.ui.style};`;
                                if (hotspot.ui.type == 'image') {
                                    // insert image css
                                    css += `background-image: url(${hotspot.ui.image});`;
                                    elmHotspot.classList.add('image');
                                }
                                elmHotspot.style = css;
                                if (hotspot.hotspot.type == 'link') {
                                    // it's a link, set target and href
                                    elmHotspot.href = hotspot.hotspot.url;
                                    elmHotspot.target = hotspot.hotspot.target;
                                    elmHotspot.alt = hotspot.hotspot.alt;
                                } else {
                                    // it's a function, set an eventlistener for click
                                    elmHotspot.addEventListener('click', (event) => {
                                        event.preventDefault(); // prevent the normal action when clicking on an <a> tag
                                        hotspot.hotspot.func(); // run the function that the hotspot JSON contains for this hotspot
                                    });
                                }
                                video.parentElement.appendChild(elmHotspot);
                            }
                        }
                    }
                }
            });
        },
        remove: () => {
            // kill all hotspot related functions, json feed and DOM elements - use  video.hotspots.remove()  to do this
            video.log('video hotspot engine: cleanup');
            video.hotspots.off(); // turn off engine
            const elmsHotspots = document.querySelectorAll('a.hotspot'); // find all hotspot DOM elements
            elmsHotspots.forEach((elmHotspot) => { // loop through hotspots
                elmHotspot.parentElement.removeChild(elmHotspot); // remove current hotspot
            });
            delete video; // remove the variable from memory
            delete hotspots; // remove the variable from memory
        }

    }
}
// choice, choiceCircle og backToMap kan bruges som ui elementer til hotspots - se eksempler nedenunder
let choice = {
    type: "box",
    style: `position: absolute;`,
};

let choiceCircle = {
    type: "box",
    style: "border-radius: 50%; position: absolute;"
}
let backToMap = {
    type: "box",
    style: "border: solid 2px #004250; background-color: #fff; text-align:center; font-weight: bold; font-size: 26px; color: #004250; padding: 0.5%; background",
    text: "Tilbage til kortet",
    position: "absolute"
};


// hotspots
// markin = hvornår i videon skal hotspot indgå
// markout = hvornår i videoen skal hotspot forsvinde
// sizeX = % width
// sizeY = % height
// sizeX = % left positionering
// sizeY = % top positionering
// ui = styling af hotspot
// hotspot = hvornår skal dette punkt hoppe til i tiden (currentTime) og hvornår skal den pause videoen (pauseTime)
// se mere i bunden af dokumentet om hotspots
const hotspots = [
        {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 110,
        ui: {
           choice, 
            type: "box",
            text: "<span> <img class='circle1' src='../assets/images/circles/yellow1.svg' </span> Auditorium"
        },
        hotspot: {
            type: "function",
            func: () => {
                // nyt kort Auditorium
                videoPlayer.currentTime(153.2);
                videoPlayer.play();
                pauseTime = 167.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 52,
        posY: 110,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/yellow2.svg' </span> Bibliotek"
         },
        hotspot: {
            type: "function",
            func: () => {
                // / nyt kort Bibliotek
                videoPlayer.currentTime(171.5);
                videoPlayer.play();
                pauseTime = 208.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 130,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/blue1.svg' </span> Faglokale"
         },
        hotspot: {
            type: "function",
            func: () => {
                // / nyt kort Faglokale              
                videoPlayer.currentTime(93.8);
                videoPlayer.play();
                pauseTime = 129.6;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 52,
        posY: 130,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/blue2.svg' </span> Fredagsbar"
         },
        hotspot: {
            type: "function",
            func: () => {
                // / nyt kort fredagsbar
                videoPlayer.currentTime(244);
                videoPlayer.play();
                pauseTime = 297.7;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 150,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/lightblue.svg' </span> Gruppeområde <span>" 
         },
        hotspot: {
            type: "function",
            func: () => {
                // / nyt kort Gruppeområde
                videoPlayer.currentTime(132.7);
                videoPlayer.play();
                pauseTime = 150;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 52,
        posY: 150,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/red.svg' </span> Hovedindgang"
         },
        hotspot: {
            type: "function",
            func: () => {
                //  nyt kort hovedindgang
                videoPlayer.currentTime(7);
                videoPlayer.play();
                pauseTime = 11;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 170,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/pink2.svg' </span> International afdeling"
         },
        hotspot: {
            type: "function",
            func: () => {
                // / international afdeling
                videoPlayer.currentTime(301.4);
                videoPlayer.play();
                pauseTime = 331.7;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 52,
        posY: 170,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/pink1.svg' </span> Kantine og spiseområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                //  nyt kort Kantine og spiseområde
                videoPlayer.currentTime(211.4);
                videoPlayer.play();
                pauseTime = 240.5;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 190,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/greyish.svg' </span> Servicecenter"
         },
        hotspot: {
            type: "function",
            func: () => {
                // / nyt kort servicecenter
                videoPlayer.currentTime(15.3);
                videoPlayer.play();
                pauseTime = 36.4;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 52,
        posY: 190,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/black.svg' </span> Studieadministration"
         },
        hotspot: {
            type: "function",
            func: () => {
                // nyt kort Studieadministration
                videoPlayer.currentTime(40);
                videoPlayer.play();
                pauseTime = 56;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 500,
        sizeX: `auto`,
        sizeY: 11,
        posX: 3,
        posY: 210,
        ui: {
            choice, 
             type: "box",
             text: "<span> <img class='circle1' src='../assets/images/circles/darkblue.svg' </span> Studievejledning"
         },
        hotspot: {
            type: "function",
            func: () => {
                // nyt kort Studievejledning
                videoPlayer.currentTime(60.3);
                videoPlayer.play();
                pauseTime = 90.3;
                window.scrollTo(0, -100);
            }
        }
    },










    // map hotspots    
    //hotspots for small circles
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 62.1,
        posY: 58.5,
        ui:  {
           choiceCircle, 
            type: "box",
            style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
            // text: "Hovedindgang"
        },
        hotspot: {
            type: "function",
            func: () => {
                // Indgang circel
                videoPlayer.currentTime(7);
                videoPlayer.play();
                pauseTime = 11;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 44.2,
        posY: 56.9,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
            //  text: "Servicecenter"
         },
        hotspot: {
            type: "function",
            func: () => {
                // servicecenter circel
                videoPlayer.currentTime(15.3);
                videoPlayer.play();
                pauseTime = 36.4;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 58.2,
        posY: 19.9,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Studieadministration"
         },
        hotspot: {
            type: "function",
            func: () => {
                // studieadministration circel
                videoPlayer.currentTime(40);
                videoPlayer.play();
                pauseTime = 56;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 53.6,
        posY: 9.7,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Studievejledning"
         },
        hotspot: {
            type: "function",
            func: () => {
                // studievejledning 1 circel
                videoPlayer.currentTime(60.3);
                videoPlayer.play();
                pauseTime = 90.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 32.5,
        posY: 83.4,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Auditorium"
         },
        hotspot: {
            type: "function",
            func: () => {
                //  // auditorium 2
                videoPlayer.currentTime(153.2);
                videoPlayer.play();
                pauseTime = 167.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 64.1,
        posY: 84.1,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Bibliotek"
         },
        hotspot: {
            type: "function",
            func: () => {
                 // bibliotek
                videoPlayer.currentTime(171.5);
                videoPlayer.play();
                pauseTime = 208.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 54.5,
        posY: 83.5,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Bibliotek"
         },
        hotspot: {
            type: "function",
            func: () => {
                // bibliotek
                videoPlayer.currentTime(171.5);
                videoPlayer.play();
                pauseTime = 208.3;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 61,
        posY: 79.1,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "International afdeling"
         },
        hotspot: {
            type: "function",
            func: () => {
                // internationalt kontor circel 
                videoPlayer.currentTime(301.4);
                videoPlayer.play();
                pauseTime = 331.7;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 78.1,
        posY: 44.8,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Faglokale"
         },
        hotspot: {
            type: "function",
            func: () => {
                // faglokale 1 circel
                videoPlayer.currentTime(93.8);
                videoPlayer.play();
                pauseTime = 129.6;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 54.7,
        posY: 63.7,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Faglokale"
         },
        hotspot: {
            type: "function",
            func: () => {
                // faglokale 2 circel
                videoPlayer.currentTime(93.8);
                videoPlayer.play();
                pauseTime = 129.6;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 40.8,
        posY: 84,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Faglokale"
         },
        hotspot: {
            type: "function",
            func: () => {
                // faglokale 3 circel
                videoPlayer.currentTime(93.8);
                videoPlayer.play();
                pauseTime = 129.6;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 37.3,
        posY: 32,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Kantine og spiseområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // Kantine og spiseområde 1
                videoPlayer.currentTime(211.4);
                videoPlayer.play();
                pauseTime = 240.5;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 44.5,
        posY: 31.6,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Kantine og spiseområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // Kantine og spiseområde 2
                videoPlayer.currentTime(211.4);
                videoPlayer.play();
                pauseTime = 240.5;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 53.6,
        posY: 49.6,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Gruppeområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // gruppeområde 1 circel 
                videoPlayer.currentTime(132.7);
                videoPlayer.play();
                pauseTime = 150;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 41.2,
        posY: 65.3,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Gruppeområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // gruppeområde 2 circle
                videoPlayer.currentTime(132.7);
                videoPlayer.play();
                pauseTime = 150;
                window.scrollTo(0, -100);
            }
        }
    },

    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 56.2,
        posY: 69.8,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Gruppeområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // gruppeområde 3 circle
                videoPlayer.currentTime(132.7);
                videoPlayer.play();
                pauseTime = 150;
                window.scrollTo(0, -100);
            }
        }
    },

{
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 72.7,
        posY: 86.9,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
             // text: "Gruppeområde"
         },
        hotspot: {
            type: "function",
            func: () => {
                // gruppeområde 4 circle
                videoPlayer.currentTime(132.7);
                videoPlayer.play();
                pauseTime = 150;
                window.scrollTo(0, -100);
            }
        }
    },
    {
        active: true,
        videoId: "video1",
        markIn: 0,
        markOut: 4.1,
        sizeX: 4,
        sizeY: 6,
        posX: 22.5,
        posY: 44.5,
        ui:  {
            choiceCircle, 
             type: "box",
             style: `border-radius: 50%; position: absolute; color: rgba(0, 0, 0, 0); background-color: none`,
            //  // text: "Fredagsbar"
         },
        hotspot: {
            type: "function",
            func: () => {
                // gruppeområde 5 circle // fredagsbar cirkel
                videoPlayer.currentTime(244);
                videoPlayer.play();
                pauseTime = 297.7;
                window.scrollTo(0, -100);
            }
        }
    },


    // BACK TO MAP POINTS

// permanent point
 {
     
    active: true,
    videoId: "video1",
    markIn: 5,
    markOut: 501,
    sizeX: `auto`,
    sizeY: `auto`,
    ui: {
         type: "box",
         style: `border: none;
         font-size: 20px;
         color: #fff;
         text-align: center;
         background-color: rgb(0 66 80 / 60%);
         padding: 1vw; 
         border-radius: .5vw;
         position: absolute;`,
         text: "Se kortet"
     },
    hotspot: {
         type: "function",
         func: () => {
            // back to map (konstant box)
            videoPlayer.currentTime(0);
            videoPlayer.play();
            pauseTime = 3.4;
         }
    }
 },  

// forskellige points indsat efter bestemte tider
//  {
//         active: true,
//         videoId: "video1",
//         markIn: 10,
//         markOut: 11,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (indgang)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },  
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 18,
//         markOut: 19.4,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (servicecenter)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },  
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 25,
//         markOut: 27,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (studieadministration)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },  
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 34,
//         markOut: 37,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (studievejledning)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },  

//     {
//         active: true,
//         videoId: "video1",
//         markIn: 41,
//         markOut: 44,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (faglokale)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },  
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 55,
//         markOut: 57,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (gruppeområde)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 65,
//         markOut: 67,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (auditorium)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 77,
//         markOut: 78,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (bibliotek)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 88,
//         markOut: 90,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (internationalt kontor)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },
//     {
//         active: true,
//         videoId: "video1",
//         markIn: 99,
//         markOut: 101,
//         sizeX: 36,
//         sizeY: 38,
//         posX: 62,
//         posY: 16.4,
//         ui: backToMap,
//         hotspot: {
//             type: "function",
//             func: () => {
//                 // back to map (kantine og spiseområde)
//                 videoPlayer.currentTime(0);
//                 videoPlayer.play();
//                 pauseTime = 4;
//             }
//         }
//     },
];




    // {
    //     active: true,
    //     videoId: "video1",
    //     markIn: 0,
    //     markOut: 4.1,
    //     sizeX: 17,
    //     sizeY: 6,
    //     posX: 69,
    //     posY: 16.4,
    //     ui: choice,
    //     hotspot: {
    //         type: "function",
    //         func: () => {
    //             // Indgang
    //             videoPlayer.currentTime(5);
    //             videoPlayer.play();
    //             pauseTime = 11;
    //         }
    //     }
    // },




/*

// MIXED EXAMPLE WITH MORE KEY/VALUE PAIRS THAN YOU REALLY NEED

{
    active: true,           // you can set this to false if you don't want this hotspot to appear
    videoId: "video4",      // the id of the video tag you want to add a hotspot to
    markIn: 5,              // when to start (seconds)
    markOut: 6,             // when to end (seconds)
    sizeX: 50,              // width (in %, but don't write %)
    sizeY: 50,              // height (in %, but don't write %)
    posX: 0,                // left position (in %, but don't write %)
    posY: 50,               // top position (in %, but don't write %)
    ui: {                               // how should the hotspot look?
        type: "box",                                // type: "box" or "image"
        title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
        image: "",                                  // add url for image (if type=image)
        style: "",                                  // add styles, can be used for both image and box
    },
    hotspot: {                          // what should the hotspot do when clicked?
        type: "link",                               // type: "link" or "function"
        onHover: true,                              // trigger on hover (if type=function)
        url: "http://tv2.dk",                       // url (if type=link)
        target: "_blank",                           // target (if type=link)
        func: () => {             // (if type=function)
            // run any javascript you want done when clicking on the hotspot
            // Leave empty if you want nothing to happen
        }
    }
}



// BOX/LINK ONLY EXAMPLE ----------------------------------------------------
// All these keys are required for boxes/links

{
    active: true,
    videoId: "video4",
    markIn: 5,
    markOut: 6,
    sizeX: 50,
    sizeY: 50,
    posX: 0,
    posY: 50,
    ui: {
        type: "box",
        title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
        style: "border: 2px solid green; background-color: rgba(0,255,0,.5)"
    },
    hotspot: {
        type: "link",
        url: "http://tv2.dk",
        target: "_blank"
    }
}


// IMAGE/FUNCTION ONLY EXAMPLE ----------------------------------------------------
// All these keys are required for images/functions

const hotspots = [
    {
        active: true,
        videoId: "video1",
        markIn: 20.4,
        markOut: 21,
        sizeX: 30,
        sizeY: 32,
        posX: 52,
        posY: 6,
        ui: {
            type: "image",
            title: "Text when hovering the hotspot",    // optional: add a title attribute with the text
            image: "assets/images/speech-scream.png",
            style: "border: none"
        },
        hotspot: {
            type: "function",
            onHover: true,      // optional, will default to false (trigger function on click)
            func: () => {
                console.log("Internal screaming!");
            }
        }
    },


*/